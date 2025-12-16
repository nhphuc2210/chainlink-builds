// Load .env first (before any imports that use env vars)
import './env.js';

import express from 'express';
import compression from 'compression';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFile, readFile, unlink } from 'fs/promises';
import { readdirSync } from 'fs';
import apiRoutes from './routes/api.js';
import { apiLimiter, initLimiter } from './middleware/rateLimiter.js';
import { validateApiKey } from './middleware/apiKey.js';
import { verifySignature, verifyClientSignature } from './middleware/signature.js';
import { staticFileCaching } from './middleware/cache.js';
import { generateCspNonce, setCspHeaders } from './middleware/cspNonce.js';
import { SERVER_CONFIG } from '../../config/backend/server.js';
import { SECURITY_CONFIG } from '../../config/backend/security.js';
import { API_CONSTANTS } from '../../config/backend/api.js'; // Import API_CONSTANTS
import { APP_CONSTANTS } from '../../config/backend/constants.js'; // Import APP_CONSTANTS
import { RATE_LIMIT_CONFIG } from '../../config/backend/rateLimiting.js'; // Import RATE_LIMIT_CONFIG

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// Process Lock - Prevent multiple instances on Windows restarts
// =============================================================================
// Uses PID file to track running instance - more robust than exclusive file locks on Windows
const LOCK_FILE = join(__dirname, '../../.server.lock');

const checkProcessExists = (pid) => {
  try {
    // Signal 0 tests if process exists without actually sending a signal
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return false; // Process doesn't exist
  }
};

// Check if another instance is running
let shouldExit = false;
try {
  const existingPid = await readFile(LOCK_FILE, 'utf-8');
  const pid = parseInt(existingPid.trim(), 10);
  
  if (checkProcessExists(pid)) {
    // Another instance is actually running
    console.log(`[reward-preview] Another instance is already running (PID ${pid}). Current PID ${process.pid} exiting.`);
    shouldExit = true;
  } else {
    // Stale lock file - old process is dead, clean it up
    await unlink(LOCK_FILE);
  }
} catch (err) {
  // No lock file exists - first instance
}

if (shouldExit) {
  process.exit(0);
}

// Write our PID to lock file
await writeFile(LOCK_FILE, process.pid.toString());

const app = express();
const PORT = process.env.PORT || SERVER_CONFIG.port;
const HOST = process.env.HOST || SERVER_CONFIG.host;

// =============================================================================
// Security Mode Detection
// - Production: always enforce security
// - Development: only enforce if FORCE_SECURITY=true (for testing)
// =============================================================================
const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'local-production';
const forceSecurity = process.env.FORCE_SECURITY === 'true';
const enforceSecurityMode = isProduction || forceSecurity;

// =============================================================================
// CORS Configuration - Whitelist allowed origins
// =============================================================================
const allowedOrigins = [
  ...new Set([
    ...SECURITY_CONFIG.cors.allowedOrigins,
    process.env.ALLOWED_ORIGIN,        // Additional origin from env (optional)
  ].filter(Boolean))
];

if (enforceSecurityMode) {
  // Strict CORS - only allow whitelisted origins
  app.use(cors({
    origin: (origin, callback) => {
      // No Origin header: allow request
      // This happens for:
      // 1. Same-origin requests (browser doesn't send Origin for same-site)
      // 2. Non-browser requests (curl, server-to-server, mobile apps)
      // 3. Proxy requests (like Vite dev server)
      if (!origin) {
        return callback(null, true);
      }
      
      // Origin present: validate against whitelist
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // CORS VIOLATION - Log the blocked request
        console.warn(`[CORS] ❌ BLOCKED: ${origin} is NOT in whitelist`);
        console.warn(`[CORS] Expected one of: [${allowedOrigins.join(', ')}]`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
} else {
  // Relaxed CORS for development
  app.use(cors({ origin: true, credentials: true }));
}

// =============================================================================
// Basic Middlewares
// =============================================================================
app.use(express.json());
app.use(compression());

// =============================================================================
// Content Security Policy (CSP) with Nonce (Production Only)
// =============================================================================
// In production, use EJS template with CSP nonce for XSS protection
// In development, use static CSP headers (no nonce needed for Vite dev server)

if (!isProduction) {
  // Development mode: Static CSP headers (no nonce)
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', SECURITY_CONFIG.csp.directives.join('; '));
    next();
  });
}

// =============================================================================
// Health check endpoint (no auth required)
// =============================================================================
import { getRedisMetrics } from './utils/redis.js';

app.get('/health', (req, res) => {
  const redisMetrics = getRedisMetrics();
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: PORT,
      host: HOST
    },
    redis: redisMetrics
  });
});

// =============================================================================
// CSP Violation Reporting Endpoint
// =============================================================================
app.post('/api/csp-report', express.json({ type: ['application/json', 'application/csp-report'] }), (req, res) => {
  console.error('[CSP Violation Report]', JSON.stringify(req.body, null, 2));
  // Log the violation for monitoring
  // In production, you might want to send this to a logging service
  res.status(204).end();
});

// =============================================================================
// App Initialization Endpoint (includes obfuscated nonce)
// =============================================================================
import { generateNonce as generateServerNonce } from './middleware/nonce.js';

/**
 * /api/init - Returns app config + obfuscated nonce
 * Response is base64 encoded to hide nonce generation
 * Field names are obfuscated:
 *   _x = nonce
 *   _e = expiresIn
 *   _v = version
 *   _t = timestamp
 * 
 * Rate limit: 60 req/sec, 360 req/min (3x of protected endpoints)
 * Each protected API call needs 1 nonce from this endpoint
 */
app.get('/api/init', initLimiter, async (req, res) => {
  try {
    // Generate nonce
    const { nonce, expiresIn } = await generateServerNonce();
    
    // Build obfuscated response
    const payload = {
      _v: '1.0.0',           // version
      _x: nonce,             // nonce (obfuscated)
      _e: expiresIn,         // expiresIn (obfuscated)
      _t: Date.now(),        // timestamp
      _c: {                  // config (obfuscated)
        _api: API_CONSTANTS.BASE_API_PATH,
      }
    };
    
    // Base64 encode to hide structure
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
    
    // Return encoded data
    res.json({ data: encoded });
  } catch (error) {
    console.error('[Init] Error generating init data:', error);
    res.status(500).json({ error: 'Failed to initialize' });
  }
});

// =============================================================================
// API Routes with Security Middlewares
// =============================================================================
// Security layers (in order):
// 1. Rate Limiting - General rate limit for all API routes (20 req/sec, 120 req/min)
// 2. Client Signature - Only for specific sensitive endpoints (applied in routes/api.js)
// 3. API Key - Required in production if API_KEY is set
//
// Note: blockchainLimiter removed for /project/* endpoints because:
// - Protected endpoints have signature verification (can't spam)
// - apiLimiter (20/sec, 120/min) is sufficient
// - blockchainLimiter penalty was too aggressive for legitimate traffic

// General rate limit for API routes
app.use(API_CONSTANTS.BASE_API_PATH, apiLimiter);

// API Key validation
app.use(API_CONSTANTS.BASE_API_PATH, validateApiKey);

// API routes (signature verification applied per-route in routes/api.js)
app.use(API_CONSTANTS.BASE_API_PATH, apiRoutes);

// =============================================================================
// Internal API Routes (for workers, cron, webhooks, service-to-service)
// =============================================================================
// These routes require HMAC signature for authentication
// HMAC secret is never exposed to frontend - only used by internal services
if (process.env.HMAC_SECRET) {
  app.use(API_CONSTANTS.INTERNAL_API_PATH, verifySignature(true));
  app.use(API_CONSTANTS.INTERNAL_API_PATH, apiRoutes);
  console.log('[reward-preview] Internal API routes enabled at /internal/api (HMAC required)');
}

// =============================================================================
// Static Files & SPA Fallback
// =============================================================================
if (isProduction) {
  // Production mode: EJS template with CSP nonce
  console.log('[Server] Production mode: Using EJS template with CSP nonce');
  
  // Setup EJS template engine
  app.set('view engine', 'ejs');
  app.set('views', join(__dirname, '..', 'views')); // backend/views (not backend/src/views)
  
  // Serve static assets (JS/CSS/images) from public folder
  // Vite builds to backend/public, __dirname is backend/src
  app.use(express.static(join(__dirname, '..', 'public'), {
    maxAge: SERVER_CONFIG.staticFiles.maxAge,
    etag: SERVER_CONFIG.staticFiles.etag,
    index: false, // Don't serve index.html automatically
  }));
  
  // Apply cache headers to static files
  app.use(staticFileCaching);
  
  // Generate CSP nonce for each HTML request
  app.use(generateCspNonce);
  
  // Set CSP headers with nonce
  app.use(setCspHeaders);
  
  // Serve index.html via EJS (all non-API/asset routes)
  // Express 5: Use named wildcard '*path' for catch-all routes (path-to-regexp v8 requirement)
  app.get('*path', async (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    
    // Skip static assets
    if (
      req.path.endsWith('.js') ||
      req.path.endsWith('.css') ||
      req.path.endsWith('.map') ||
      req.path.endsWith('.json') ||
      req.path.endsWith('.ico') ||
      req.path.endsWith('.png') ||
      req.path.endsWith('.jpg') ||
      req.path.endsWith('.svg') ||
      req.path.endsWith('.woff') ||
      req.path.endsWith('.woff2') ||
      req.path.endsWith('.ttf') ||
      req.path.endsWith('.eot') ||
      req.path.endsWith('.br') ||
      req.path.endsWith('.gz')
    ) {
      return next(); // Let it 404 naturally
    }
    
    try {
      // Read Vite manifest.json to find entry point
      // Vite builds to backend/public, __dirname is backend/src
      const manifestPath = join(__dirname, '..', 'public', '.vite', 'manifest.json');
      const manifestData = await readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestData);
      
      // Find the "app" chunk (main entry point from manual chunks)
      // When using manualChunks, Vite generates chunks with name property
      const entryKey = Object.keys(manifest).find(key => manifest[key].name === 'app');
      
      if (!entryKey) {
        console.error('[Server] Build error: No "app" chunk found in manifest.json');
        console.error('[Server] Manifest path:', manifestPath);
        console.error('[Server] Manifest entries:', JSON.stringify(manifest, null, 2));
        return res.status(500).send('Build error: No app chunk found');
      }
      
      const entryFile = manifest[entryKey].file;
      
      // Render EJS template with nonce and script path
      res.render('index', {
        cspNonce: res.locals.cspNonce,
        scriptSrc: `/${entryFile}`
      });
    } catch (error) {
      console.error('[Server] Error rendering EJS template:', error);
      console.error('[Server] Error details:', error.message);
      console.error('[Server] Stack:', error.stack);
      res.status(500).send('Internal Server Error: ' + error.message);
    }
  });
} else {
  // Development mode: Serve static files normally (no EJS, no nonce)
  console.log('[Server] Development mode: Serving static files without CSP nonce');
  
  // Apply cache headers to static files
  app.use(staticFileCaching);
  
  // Serve static assets (JS, CSS, images)
  app.use(express.static(join(__dirname, SERVER_CONFIG.distPath), {
    maxAge: SERVER_CONFIG.staticFiles.maxAge,
    etag: SERVER_CONFIG.staticFiles.etag,
    index: false, // Don't serve index.html automatically
  }));
  
  // Explicitly handle root path
  app.get('/', async (req, res) => {
    try {
      const htmlPath = join(__dirname, SERVER_CONFIG.distPath, 'index.html');
      const html = await readFile(htmlPath, 'utf-8');
      res.type('html').send(html);
    } catch (error) {
      console.error('[Server] Error reading index.html:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // SPA fallback - serve index.html for HTML routes only
  // Don't intercept JS/CSS/asset requests - let them 404 if missing
  // Express 5: Use named wildcard '*path' for catch-all routes (path-to-regexp v8 requirement)
  app.get('*path', async (req, res, next) => {
    // Skip SPA fallback for static assets
    if (
      req.path.endsWith('.js') ||
      req.path.endsWith('.css') ||
      req.path.endsWith('.map') ||
      req.path.endsWith('.json') ||
      req.path.endsWith('.ico') ||
      req.path.endsWith('.png') ||
      req.path.endsWith('.jpg') ||
      req.path.endsWith('.svg') ||
      req.path.endsWith('.woff') ||
      req.path.endsWith('.woff2') ||
      req.path.endsWith('.ttf') ||
      req.path.endsWith('.eot')
    ) {
      return next(); // Let it 404 naturally
    }
  
    // Read and send index.html to trigger nonce injection middleware
    // Using res.send() instead of res.sendFile() to allow middleware interception
    try {
      const htmlPath = join(__dirname, SERVER_CONFIG.distPath, 'index.html');
      const html = await readFile(htmlPath, 'utf-8');
      res.type('html').send(html);
    } catch (error) {
      console.error('[Server] Error reading index.html:', error);
      res.status(500).send('Internal Server Error');
    }
  });
}

// =============================================================================
// Error Handler
// =============================================================================
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  
  // CORS error
  if (err.message === 'Not allowed by CORS' || err.message === 'Origin required') {
    return res.status(403).json({ error: 'Forbidden', message: err.message });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// =============================================================================
// Start Server
// =============================================================================
const server = app.listen(PORT, HOST, () => {
  
  console.log(`[reward-preview] Server running on http://${HOST}:${PORT}`);
  console.log(`[reward-preview] Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  
  // API Version Info
  console.log('\n[reward-preview] ============== API INFO ==============');
  console.log(`[reward-preview] API v1: ${API_CONSTANTS.BASE_API_PATH}/project/* (query-based parameters)`);
  console.log('[reward-preview] ======================================\n');
  
  // CORS Configuration Details
  console.log('[reward-preview] ============== CORS CONFIGURATION ==============');
  console.log(`[reward-preview] ALLOWED_ORIGIN env: ${process.env.ALLOWED_ORIGIN || '(not set)'}`);
  console.log(`[reward-preview] Allowed origins list: [${allowedOrigins.join(', ')}]`);
  console.log(`[reward-preview] Security enforcement: ${enforceSecurityMode ? 'STRICT' : 'RELAXED'}`);
  console.log('[reward-preview] ================================================\n');
  
  if (enforceSecurityMode) {
    console.log(`[reward-preview] Security Mode: ENABLED ${forceSecurity ? '(FORCE_SECURITY=true)' : ''}`);
    console.log(`[reward-preview] Rate limiting (Protected APIs): ${RATE_LIMIT_CONFIG.perSecond.max} req/sec, ${RATE_LIMIT_CONFIG.perMinute.max} req/min`);
    console.log(`[reward-preview] Rate limiting (/api/init): ${RATE_LIMIT_CONFIG.init.perSecond.max} req/sec, ${RATE_LIMIT_CONFIG.init.perMinute.max} req/min (3x capacity)`);
    console.log(`[reward-preview] Rate limit penalty: ${RATE_LIMIT_CONFIG.penalty.durationMs / 1000}s block after violation`);
    console.log(`[reward-preview] Client Signature: REQUIRED for /api/project/* (HMAC-SHA256, DeBank-style)`);
    console.log(`[reward-preview] API Key: ${process.env.API_KEY ? 'REQUIRED' : 'DISABLED (no API_KEY set)'}`);
    console.log(`[reward-preview] Internal API (/internal/api): ${process.env.HMAC_SECRET ? 'ENABLED (HMAC required)' : 'DISABLED (no HMAC_SECRET set)'}`);
  } else {
    console.log(`[reward-preview] Security Mode: DISABLED (dev mode, set FORCE_SECURITY=true to test)`);
    console.log(`[reward-preview] CORS: Allow all origins`);
    console.log(`[reward-preview] Rate limiting: DISABLED (dev mode)`);
    console.log(`[reward-preview] Client Signature: Not required (dev mode)`);
    console.log(`[reward-preview] API Key: Not required`);
  }
  
  if (!isProduction) {
    console.log(`[reward-preview] Dev frontend: ${APP_CONSTANTS.DEV_FRONTEND_URL}`);
  }
});

// =============================================================================
// Error Handler & Graceful Shutdown
// =============================================================================
server.on('error', (err) => {
  console.error('[Server Error]', err);
});

// Graceful shutdown handler - cleanup lock file
const cleanupAndExit = async (signal) => {
  console.log(`[reward-preview] ${signal} received, shutting down gracefully...`);
  
  server.close(async () => {
    try {
      await unlink(LOCK_FILE);
    } catch (err) {
      // Lock file may already be deleted
    }
    process.exit(0);
  });
};

process.on('SIGINT', () => cleanupAndExit('SIGINT'));
process.on('SIGTERM', () => cleanupAndExit('SIGTERM'));
process.on('exit', async () => {
  // Cleanup lock file on any exit
  try {
    await unlink(LOCK_FILE);
  } catch (err) {
    // Ignore errors on exit
  }
});