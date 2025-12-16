import crypto from 'crypto';
import { SECURITY_CONFIG } from '../../../config/backend/security.js';
import { getRedisClient, isRedisAvailable, incrementFallbackUsage } from '../utils/redis.js'; // Shared Redis client
import { memoryNoncesGenerated, memoryNoncesUsed } from './nonce.js'; // Shared memory fallback

/**
 * HMAC Signature verification middleware with Nonce support (Redis-backed)
 * 
 * Client must send:
 * - x-timestamp: Unix timestamp (seconds)
 * - x-nonce: Unique identifier for each request (UUID)
 * - x-signature: HMAC-SHA256(timestamp + nonce + method + path + bodyHash, secret)
 * 
 * Security features:
 * - Prevents replay attacks (timestamp must be within configured window)
 * - Prevents replay within window (nonce can only be used once)
 * - Prevents tampering (signature validates request including body for POST/PUT/PATCH)
 * - Prevents payload manipulation (body hash included in signature)
 * - Redis-backed for distributed systems
 * - Falls back to in-memory if Redis unavailable
 */

const SIGNATURE_WINDOW_MS = SECURITY_CONFIG.signature.windowMs;
const GENERATION_WINDOW_SECONDS = SECURITY_CONFIG.nonce.generationWindowSeconds;
const USED_TTL_SECONDS = SECURITY_CONFIG.nonce.usedTtlSeconds;
const GENERATED_PREFIX = SECURITY_CONFIG.nonce.generatedPrefix;
const USED_PREFIX = SECURITY_CONFIG.nonce.usedPrefix;

// Use shared Redis client
const redis = getRedisClient();

// Note: Memory fallback stores (memoryNoncesGenerated, memoryNoncesUsed) are imported from nonce.js
// They are shared between nonce generation and signature verification for consistency

/**
 * Check if nonce is valid (two-set verification)
 * @param {string} nonce - The nonce to check
 * @returns {Promise<{valid: boolean, reason: string}>} - Validation result with reason
 */
async function isNonceValid(nonce) {
  const generatedKey = `${GENERATED_PREFIX}${nonce}`;
  const usedKey = `${USED_PREFIX}${nonce}`;
  
  if (isRedisAvailable() && redis) {
    try {
      // Check both keys in parallel
      const [existsInGenerated, existsInUsed] = await Promise.all([
        redis.exists(generatedKey),
        redis.exists(usedKey)
      ]);
      
      // Nonce must exist in "generated" AND not exist in "used"
      // If nonce doesn't exist in "generated:", it means either:
      // 1. Not issued by server (attacker created it)
      // 2. Expired (> 30 seconds old) - Redis auto-deleted it
      if (existsInGenerated !== 1) {
        return { valid: false, reason: 'NONCE_NOT_FROM_SERVER_OR_EXPIRED' };
      }
      if (existsInUsed === 1) {
        return { valid: false, reason: 'NONCE_ALREADY_USED' };
      }
      return { valid: true, reason: 'OK' };
      
    } catch (err) {
      console.warn('[Signature] Redis check failed, falling back to memory:', err.message);
      incrementFallbackUsage();
      // Memory fallback: two-set check with time validation
      if (!memoryNoncesGenerated.has(nonce)) {
        return { valid: false, reason: 'NONCE_NOT_FROM_SERVER_OR_EXPIRED' };
      }
      
      // Check if nonce expired (> 30s old)
      const generatedAt = memoryNoncesGenerated.get(nonce);
      if (Date.now() - generatedAt > GENERATION_WINDOW_SECONDS * 1000) {
        return { valid: false, reason: 'NONCE_NOT_FROM_SERVER_OR_EXPIRED' };
      }
      
      if (memoryNoncesUsed.has(nonce)) {
        return { valid: false, reason: 'NONCE_ALREADY_USED' };
      }
      return { valid: true, reason: 'OK' };
    }
  }
  
  // Memory-only mode
  incrementFallbackUsage();
  if (!memoryNoncesGenerated.has(nonce)) {
    return { valid: false, reason: 'NONCE_NOT_FROM_SERVER_OR_EXPIRED' };
  }
  
  // Check if nonce expired (> 30s old)
  const generatedAt = memoryNoncesGenerated.get(nonce);
  if (Date.now() - generatedAt > GENERATION_WINDOW_SECONDS * 1000) {
    return { valid: false, reason: 'NONCE_NOT_FROM_SERVER_OR_EXPIRED' };
  }
  
  if (memoryNoncesUsed.has(nonce)) {
    return { valid: false, reason: 'NONCE_ALREADY_USED' };
  }
  return { valid: true, reason: 'OK' };
}

/**
 * Mark nonce as used (move from "generated" to "used")
 * @param {string} nonce - The nonce to mark
 */
async function markNonceUsed(nonce) {
  const generatedKey = `${GENERATED_PREFIX}${nonce}`;
  const usedKey = `${USED_PREFIX}${nonce}`;
  
  if (isRedisAvailable() && redis) {
    try {
      // Move nonce from "generated" to "used" (atomic operations)
      // "used" has longer TTL (7 days) to prevent replay attack for extended period
      await Promise.all([
        redis.del(generatedKey),           // Remove from whitelist
        redis.setex(usedKey, USED_TTL_SECONDS, '1')  // Add to blacklist (7 days = 604800s)
      ]);
      return;
    } catch (err) {
      console.warn('[Signature] Redis operations failed, falling back to memory:', err.message);
      incrementFallbackUsage();
    }
  }
  
  // Memory fallback: move from generated to used
  if (!isRedisAvailable() || !redis) {
    incrementFallbackUsage();
  }
  memoryNoncesGenerated.delete(nonce);
  memoryNoncesUsed.set(nonce, Date.now());
}

/**
 * Verify client-side signature (for public API routes)
 * Uses VITE_HMAC_SECRET (shared with frontend)
 * @param {boolean} required - If true, reject requests without signature
 */
export function verifyClientSignature(required = true) {
  return async (req, res, next) => {
    const secret = process.env.VITE_HMAC_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';
    const forceSecurity = process.env.FORCE_SECURITY === 'true';
    
    // Skip if not configured or not in production mode (unless FORCE_SECURITY is set)
    if (!secret || (!isProduction && !forceSecurity)) {
      if (!secret && required) {
        console.warn('[ClientSignature] VITE_HMAC_SECRET not configured, skipping verification');
      }
      console.log('[ClientSignature] SKIPPED for path:', req.path, 'isProduction:', isProduction, 'forceSecurity:', forceSecurity);
      return next();
    }
    
    const timestamp = req.headers['x-timestamp'];
    const nonce = req.headers['x-nonce'];
    const signature = req.headers['x-signature'];
    
    console.log('[ClientSignature] CHECKING path:', req.path, 'nonce:', nonce, 'timestamp:', timestamp);
    
    // Check if all required headers present
    if (!timestamp || !nonce || !signature) {
      if (required) {
        return res.status(401).json({
          error: 'Signature required',
          message: 'Request must include x-timestamp, x-nonce, and x-signature headers'
        });
      }
      return next();
    }
    
    // Validate timestamp (prevent replay attacks after window)
    const requestTime = parseInt(timestamp, 10) * 1000;
    const now = Date.now();
    
    if (isNaN(requestTime) || Math.abs(now - requestTime) > SIGNATURE_WINDOW_MS) {
      return res.status(401).json({
        error: 'Invalid timestamp',
        message: 'Request timestamp is too old or invalid'
      });
    }
    
    // Check nonce validity (two-set verification: must be from server + not used yet)
    try {
      const validation = await isNonceValid(nonce);
      
      if (!validation.valid) {
        const errorMessages = {
          'NONCE_NOT_FROM_SERVER_OR_EXPIRED': 'Nonce was not issued by server or expired (must be used within 30 seconds). Please fetch a fresh nonce from /api/init.',
          'NONCE_ALREADY_USED': 'Each nonce can only be used once. This nonce was already consumed.'
        };
        
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(`🚫 [429] NONCE INVALID - ${validation.reason}`);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Reason:', validation.reason);
        console.error('Path:', req.path);
        console.error('Nonce:', nonce);
        console.error('IP:', req.headers['x-forwarded-for'] || req.ip);
        console.error('Timestamp:', timestamp);
        console.error('Message:', errorMessages[validation.reason]);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Please wait before making another request.',
          reason: validation.reason
        });
      }
      console.log('[ClientSignature] Nonce valid (from server, not used yet):', nonce);
    } catch (err) {
      console.error('[ClientSignature] Error validating nonce:', err);
      return res.status(500).json({
        error: 'Internal error',
        message: 'Server error. Please try again later.'
      });
    }
    
    // Compute body hash for POST/PUT/PATCH requests
    let bodyHash = '';
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      bodyHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(req.body))
        .digest('hex');
      console.log('[ClientSignature] Body hash computed:', bodyHash.substring(0, 16) + '...');
    }
    
    // Generate expected signature (includes nonce + body hash)
    const payload = `${timestamp}${nonce}${req.method}${req.originalUrl}${bodyHash}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    // Constant-time comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (signatureBuffer.length !== expectedBuffer.length || 
        !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('🚫 [401] SIGNATURE VERIFICATION FAILED');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Reason: INVALID_SIGNATURE');
      console.error('Path:', req.path);
      console.error('Method:', req.method);
      console.error('Message: HMAC signature does not match.');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return res.status(401).json({
        error: 'Invalid signature',
        message: 'Request signature verification failed',
        reason: 'INVALID_SIGNATURE'
      });
    }
    
    // Mark nonce as used (after signature verified)
    try {
      await markNonceUsed(nonce);
      console.log('[ClientSignature] Nonce marked as used:', nonce);
    } catch (err) {
      console.error('[ClientSignature] Error marking nonce:', err);
      // Continue anyway - signature was valid
    }
    
    // Signature valid
    console.log('[ClientSignature] ✅ VERIFIED path:', req.path, 'nonce:', nonce);
    next();
  };
}

/**
 * Verify request signature with nonce (for internal API routes)
 * Uses HMAC_SECRET (server-side only)
 * @param {boolean} required - If true, reject requests without signature
 */
export function verifySignature(required = true) {
  return async (req, res, next) => {
    const secret = process.env.HMAC_SECRET;
    
    // Skip if HMAC_SECRET not configured
    if (!secret) {
      if (required) {
        console.warn('[Signature] HMAC_SECRET not configured, skipping verification');
      }
      return next();
    }
    
    const timestamp = req.headers['x-timestamp'];
    const nonce = req.headers['x-nonce'];
    const signature = req.headers['x-signature'];
    
    // Check if all required headers present
    if (!timestamp || !nonce || !signature) {
      if (required) {
        return res.status(401).json({
          error: 'Signature required',
          message: 'Request must include x-timestamp, x-nonce, and x-signature headers'
        });
      }
      return next();
    }
    
    // Validate timestamp (prevent replay attacks after window)
    const requestTime = parseInt(timestamp, 10) * 1000;
    const now = Date.now();
    
    if (isNaN(requestTime) || Math.abs(now - requestTime) > SIGNATURE_WINDOW_MS) {
      return res.status(401).json({
        error: 'Invalid timestamp',
        message: 'Request timestamp is too old or invalid'
      });
    }
    
    // Check nonce hasn't been used (prevent replay within window)
    try {
      const used = await isNonceUsed(nonce);
      if (used) {
        return res.status(401).json({
          error: 'Nonce already used',
          message: 'This request has already been processed. Each request must have a unique nonce.'
        });
      }
    } catch (err) {
      console.error('[Signature] Error checking nonce:', err);
      return res.status(500).json({
        error: 'Internal error',
        message: 'Failed to verify request nonce'
      });
    }
    
    // Compute body hash for POST/PUT/PATCH requests
    let bodyHashInternal = '';
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      bodyHashInternal = crypto
        .createHash('sha256')
        .update(JSON.stringify(req.body))
        .digest('hex');
      console.log('[Signature] Body hash computed:', bodyHashInternal.substring(0, 16) + '...');
    }
    
    // Generate expected signature (includes nonce + body hash)
    const payload = `${timestamp}${nonce}${req.method}${req.originalUrl}${bodyHashInternal}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    // Constant-time comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (signatureBuffer.length !== expectedBuffer.length || 
        !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('🚫 [401] SIGNATURE VERIFICATION FAILED');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Reason: INVALID_SIGNATURE');
      console.error('Path:', req.path);
      console.error('Method:', req.method);
      console.error('Message: HMAC signature does not match.');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return res.status(401).json({
        error: 'Invalid signature',
        message: 'Request signature verification failed',
        reason: 'INVALID_SIGNATURE'
      });
    }
    
    // Mark nonce as used (after signature verified)
    try {
      await markNonceUsed(nonce);
    } catch (err) {
      console.error('[Signature] Error marking nonce:', err);
      // Continue anyway - signature was valid
    }
    
    // Signature valid
    next();
  };
}

/**
 * Generate signature with nonce for testing/debugging
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - Request path with query string
 * @param {string} secret - HMAC secret
 * @returns {{ timestamp: string, nonce: string, signature: string }}
 */
export function generateSignature(method, path, secret) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID();
  const payload = `${timestamp}${nonce}${method}${path}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return { timestamp, nonce, signature };
}

/**
 * Get nonce store stats (for monitoring)
 * @returns {Promise<{ storage: string, size: number, redisConnected: boolean }>}
 */
export async function getNonceStats() {
  if (isRedisAvailable() && redis) {
    try {
      const keys = await redis.keys(`${NONCE_PREFIX}*`);
      return {
        storage: 'redis',
        size: keys.length,
        redisConnected: true
      };
    } catch (err) {
      // Fall through to memory stats
    }
  }
  
  return {
    storage: 'memory',
    size: memoryNonces.size,
    redisConnected: isRedisAvailable()
  };
}

/**
 * DEPRECATED: Enhanced signature verification not currently used
 * 
 * Enhanced signature verification middleware (Paranoid Level)
 * Validates all security components: CSP nonce, client nonce, fingerprint, integrity, behavior
 * @param {boolean} required - If true, reject requests without signature
 * @returns {Function} Express middleware
 */
/* DEPRECATED - NOT USED
export function verifyEnhancedSignature(required = true) {
  return async (req, res, next) => {
    const secret = process.env.VITE_HMAC_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';
    const forceSecurity = process.env.FORCE_SECURITY === 'true';
    
    // Skip if not configured or not in production mode (unless FORCE_SECURITY is set)
    if (!secret || (!isProduction && !forceSecurity)) {
      if (!secret && required) {
        console.warn('[EnhancedSignature] VITE_HMAC_SECRET not configured, skipping verification');
      }
      return next();
    }
    
    // Extract headers
    const timestamp = req.headers['x-timestamp'];
    const cspNonce = req.headers['x-csp-nonce'];
    const clientNonce = req.headers['x-client-nonce'];
    const signature = req.headers['x-signature'];
    const fingerprintHash = req.headers['x-fingerprint'];
    const integrityHash = req.headers['x-integrity'];
    const behaviorScore = req.headers['x-behavior-score'];
    
    // Check required headers
    if (!timestamp || !clientNonce || !signature) {
      if (required) {
        return res.status(401).json({
          error: 'Enhanced signature required',
          message: 'Request must include x-timestamp, x-client-nonce, and x-signature headers'
        });
      }
      return next();
    }
    
    // Validate timestamp
    const requestTime = parseInt(timestamp, 10) * 1000;
    const now = Date.now();
    
    if (isNaN(requestTime) || Math.abs(now - requestTime) > SIGNATURE_WINDOW_MS) {
      return res.status(401).json({
        error: 'Invalid timestamp',
        message: 'Request timestamp is too old or invalid'
      });
    }
    
    // Check client nonce hasn't been used
    try {
      const used = await isNonceUsed(clientNonce);
      if (used) {
        return res.status(429).json({
          error: 'Nonce already used',
          message: 'This request has already been processed.'
        });
      }
    } catch (err) {
      console.error('[EnhancedSignature] Error checking client nonce:', err);
      return res.status(500).json({
        error: 'Internal error',
        message: 'Failed to verify request nonce'
      });
    }
    
    // Generate expected signature with all components
    // Payload: timestamp | cspNonce | clientNonce | method | path | fingerprint | integrity | behaviorScore
    const payload = [
      timestamp,
      cspNonce || 'no-csp-nonce',
      clientNonce,
      req.method,
      req.originalUrl,
      fingerprintHash || 'no-fingerprint',
      integrityHash || 'no-integrity',
      behaviorScore || '0',
    ].join('|');
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    // Constant-time comparison
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (signatureBuffer.length !== expectedBuffer.length || 
        !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      console.warn('[EnhancedSignature] Signature mismatch:', {
        method: req.method,
        path: req.originalUrl,
        hasFingerprint: !!fingerprintHash,
        hasIntegrity: !!integrityHash,
        hasBehavior: !!behaviorScore,
      });
      
      return res.status(401).json({
        error: 'Invalid signature',
        message: 'Enhanced signature verification failed'
      });
    }
    
    // Mark client nonce as used
    try {
      await markNonceUsed(clientNonce);
    } catch (err) {
      console.error('[EnhancedSignature] Error marking nonce:', err);
    }
    
    // Signature valid
    console.log('[EnhancedSignature] Verified:', {
      hasCSPNonce: !!cspNonce,
      hasFingerprint: !!fingerprintHash,
      hasIntegrity: !!integrityHash,
      behaviorScore: behaviorScore || 'N/A',
    });
    
    next();
  };
}
*/
