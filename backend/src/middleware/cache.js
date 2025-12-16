import crypto from 'crypto';

/**
 * HTTP Cache Middleware
 * 
 * =============================================================================
 * MULTI-LAYER CACHING ARCHITECTURE (5 LAYERS)
 * =============================================================================
 * 
 * This middleware is part of Layer 2 (Browser HTTP Cache) in our caching system:
 * 
 * Layer 1: SWR (React)          - In-memory dedupe (2s)
 * Layer 2: HTTP Cache (Browser) - Disk cache with eTag validation ← THIS FILE
 * Layer 3: Redis (Server)       - Server-side cache (1h-24h TTL)
 * Layer 4: Infura (Blockchain)  - Smart contract calls
 * 
 * =============================================================================
 * HOW HTTP CACHE + eTag WORKS
 * =============================================================================
 * 
 * 1. FRESH CACHE (age < max-age):
 *    - Browser returns data from disk cache
 *    - NO network request sent
 *    - DevTools shows: "200 OK (from disk cache)"
 * 
 * 2. STALE CACHE (age > max-age, within stale-while-revalidate):
 *    - Browser AUTOMATICALLY sends If-None-Match header with old eTag
 *    - Server compares eTag with current data
 *    - If match: 304 Not Modified (no body, saves bandwidth)
 *    - If mismatch: 200 OK with new data + new eTag
 * 
 * 3. EXPIRED CACHE:
 *    - Normal request, no If-None-Match header
 *    - Server returns 200 OK with data + eTag
 * 
 * =============================================================================
 * eTag GENERATION
 * =============================================================================
 * 
 * - Strong eTag (no W/ prefix) = byte-for-byte identical
 * - SHA256 hash of blockchain data ONLY (excludes metadata)
 * - Metadata (timestamp, cacheStatus, ttl) changes don't affect eTag
 * - This means client can reuse cache even if metadata differs
 * 
 * Example:
 *   Response 1: { data: {...}, metadata: { timestamp: 1000 } }
 *   Response 2: { data: {...}, metadata: { timestamp: 2000 } }
 *   → Same eTag because blockchain data is identical
 * 
 * =============================================================================
 */

import { CACHE_PRESETS } from '../../../config/backend/cache.js';

/**
 * Generate strong ETag from response data
 * 
 * =============================================================================
 * STRONG eTag vs WEAK eTag
 * =============================================================================
 * 
 * Strong eTag (what we use):
 *   Format: "a1b2c3d4..."
 *   Meaning: Data is byte-for-byte identical
 *   Use case: When any change in data should invalidate cache
 * 
 * Weak eTag (alternative):
 *   Format: W/"a1b2c3d4..."
 *   Meaning: Data is semantically equivalent but may have minor differences
 *   Use case: When minor formatting changes shouldn't invalidate cache
 * 
 * =============================================================================
 * WHY SHA256?
 * =============================================================================
 * 
 * - Cryptographically secure hash (no collisions in practice)
 * - Fast computation (~1ms for typical JSON response)
 * - Deterministic (same input → same hash)
 * - 32 chars (truncated from 64) provides sufficient uniqueness
 * 
 * =============================================================================
 * WHAT DATA IS HASHED?
 * =============================================================================
 * 
 * ONLY blockchain data (res.locals.etagData), NOT including:
 *   ✗ timestamp (changes on every Redis hit)
 *   ✗ cacheStatus (HIT/MISS/STALE)
 *   ✗ ttl (time-to-live config)
 *   ✗ contractInfo (static metadata)
 * 
 * This is set in backend/src/utils/apiResponse.js:
 *   res.locals.etagData = response.data
 * 
 * @param {any} data - Response data to hash (blockchain data only)
 * @returns {string} Strong ETag (format: "hash")
 */
export function generateETag(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  const hash = crypto
    .createHash('sha256')
    .update(content)
    .digest('hex')
    .substring(0, 32); // Use first 32 chars for shorter ETag
  
  return `"${hash}"`;
}

/**
 * Build Cache-Control header string from configuration
 * 
 * @param {Object} config - Cache configuration
 * @returns {string} Cache-Control header value
 */
function buildCacheControlHeader(config) {
  const directives = [];
  
  // Public vs Private
  directives.push(config.isPublic ? 'public' : 'private');
  
  // Max-Age
  if (config.maxAge !== undefined) {
    directives.push(`max-age=${config.maxAge}`);
  }
  
  // Stale-While-Revalidate
  if (config.staleWhileRevalidate && config.staleWhileRevalidate > 0) {
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }
  
  // Immutable (for static assets)
  if (config.immutable) {
    directives.push('immutable');
  }
  
  // Must-Revalidate
  if (config.mustRevalidate) {
    directives.push('must-revalidate');
  }
  
  return directives.join(', ');
}

/**
 * Middleware factory: Set Cache-Control headers based on preset
 * 
 * @param {string} presetName - Name of cache preset (e.g., 'projectConfig')
 * @returns {Function} Express middleware
 */
export function cacheControl(presetName) {
  const config = CACHE_PRESETS[presetName];
  
  if (!config) {
    throw new Error(`Unknown cache preset: ${presetName}`);
  }
  
  const cacheControlHeader = buildCacheControlHeader(config);
  
  return (req, res, next) => {
    // Store cache config for later use
    res.locals.cacheConfig = config;
    res.locals.cacheControlHeader = cacheControlHeader;
    
    next();
  };
}

/**
 * Middleware: Add ETag and Cache-Control headers to response
 * 
 * =============================================================================
 * REQUEST/RESPONSE FLOW
 * =============================================================================
 * 
 * SCENARIO 1: First request (no cache)
 *   Client → GET /api/v1/project/config
 *   Server → 200 OK
 *            Cache-Control: public, max-age=86400, stale-while-revalidate=172800
 *            ETag: "abc123..."
 *            { data: {...} }
 * 
 * SCENARIO 2: Cache fresh (age < max-age = 24h)
 *   Client → (no network request)
 *   Browser → 200 OK (from disk cache)
 * 
 * SCENARIO 3: Cache stale (age > 24h, < 48h), data unchanged
 *   Client → GET /api/v1/project/config
 *            If-None-Match: "abc123..."
 *   Server → (data hash still "abc123...")
 *            304 Not Modified
 *            ETag: "abc123..."
 *            (no body - saves bandwidth)
 * 
 * SCENARIO 4: Cache stale, data changed
 *   Client → GET /api/v1/project/config
 *            If-None-Match: "abc123..."
 *   Server → (data hash now "xyz789...")
 *            200 OK
 *            Cache-Control: public, max-age=86400, stale-while-revalidate=172800
 *            ETag: "xyz789..."
 *            { data: {...new data...} }
 * 
 * =============================================================================
 * WHY res.locals.etagData?
 * =============================================================================
 * 
 * API response structure:
 * {
 *   blockchainData: { ... },           ← THIS is hashed for eTag
 *   metadata: { timestamp, ttl, ... }, ← NOT hashed
 *   contractInfo: { ... }              ← NOT hashed
 * }
 * 
 * Set in backend/src/utils/apiResponse.js:
 *   res.locals.etagData = response.data
 * 
 * This ensures:
 *   - eTag only changes when blockchain data changes
 *   - Metadata changes (timestamp) don't invalidate cache
 *   - Better cache hit rate
 * 
 * =============================================================================
 * 
 * Usage:
 *   router.get('/endpoint', cacheControl('projectConfig'), addCacheHeaders, handler)
 */
export function addCacheHeaders(req, res, next) {
  // Check if HTTP cache is enabled
  const httpCacheEnabled = process.env.ENABLE_CACHE_HTTP === 'true';
  
  // Intercept res.json() to add headers before sending
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    // Add Cache-Control header only if HTTP cache is enabled
    if (httpCacheEnabled && res.locals.cacheControlHeader) {
      res.setHeader('Cache-Control', res.locals.cacheControlHeader);
      console.log(`[HTTP Cache] ✓ Cache-Control set: ${res.locals.cacheControlHeader}`);
    } else if (!httpCacheEnabled) {
      // If HTTP cache is disabled, set no-cache headers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      console.log(`[HTTP Cache] ✗ DISABLED - no-cache headers set`);
    }
    
    // Only generate and check ETag if HTTP cache is enabled
    if (httpCacheEnabled) {
      // Use res.locals.etagData if available (only blockchain data), otherwise use full response
      const dataForEtag = res.locals.etagData || data;
      
      // Generate and add ETag (only from blockchain data, not metadata)
      const etag = generateETag(dataForEtag);
      res.setHeader('ETag', etag);
      
      // Add Vary header for proper caching with compression
      res.setHeader('Vary', 'Accept-Encoding');
      
      // Check if client's ETag matches (conditional request)
      // Browser automatically sends If-None-Match when cache is stale
      const clientETag = req.headers['if-none-match'];
      if (clientETag && clientETag === etag) {
        // Data hasn't changed, return 304 Not Modified
        // Browser will reuse stale cache (saves bandwidth + faster response)
        console.log(`[HTTP Cache] ✓ 304 Not Modified - eTag match: ${etag.substring(1, 17)}... (${req.path})`);
        return res.status(304).end();
      }
      
      // eTag generated but no match (or no client eTag)
      if (clientETag) {
        console.log(`[HTTP Cache] ✗ eTag mismatch - Client: ${clientETag.substring(1, 17)}... Server: ${etag.substring(1, 17)}... (${req.path})`);
      } else {
        console.log(`[HTTP Cache] ✓ eTag generated: ${etag.substring(1, 17)}... (${req.path})`);
      }
      
      // Add cache status headers for debugging
      // X-Cache-Status comes from Redis cache (if present)
      if (!res.getHeader('X-Cache-Status')) {
        res.setHeader('X-Cache-Status', 'FRESH');
      }
    }
    
    // Send response with data
    return originalJson(data);
  };
  
  next();
}

/**
 * Combined middleware: Cache control + ETag support
 * Convenience function for common use case
 * 
 * @param {string} presetName - Cache preset name
 * @returns {Array} Array of middleware functions
 */
export function withCache(presetName) {
  return [cacheControl(presetName), addCacheHeaders];
}

/**
 * Middleware: Configure static file caching based on file type
 * Use with express.static()
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function staticFileCaching(req, res, next) {
  const httpCacheEnabled = process.env.ENABLE_CACHE_HTTP === 'true';
  
  // If HTTP cache is disabled, set no-cache for all files
  if (!httpCacheEnabled) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    console.log(`[HTTP Cache] Static file no-cache: ${req.path}`);
    return next();
  }
  
  const path = req.path.toLowerCase();
  
  // index.html - Always revalidate
  if (path.endsWith('index.html') || path === '/') {
    const cacheControl = buildCacheControlHeader(CACHE_PRESETS.noCache);
    res.setHeader('Cache-Control', cacheControl);
    console.log(`[HTTP Cache] Static HTML (no-cache): ${req.path}`);
  }
  // JS/CSS with hash in filename - Immutable (e.g., index-Wk3PCjkn.js)
  else if (path.match(/\.(js|css)$/) && path.match(/-[a-zA-Z0-9]{8,}\.(js|css)$/)) {
    const cacheControl = buildCacheControlHeader(CACHE_PRESETS.immutable);
    res.setHeader('Cache-Control', cacheControl);
    console.log(`[HTTP Cache] Static asset (immutable): ${req.path}`);
  }
  // Other static assets - 30 days
  else if (path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
    console.log(`[HTTP Cache] Static asset (30d): ${req.path}`);
  }
  
  next();
}

export default {
  CACHE_PRESETS,
  generateETag,
  cacheControl,
  addCacheHeaders,
  withCache,
  staticFileCaching
};

