/**
 * Client-side signature utilities (Enhanced Paranoid-Level Security)
 * 
 * Flow:
 * 1. Extract CSP nonce from page (server-generated)
 * 2. Generate client nonce (UUID)
 * 3. Collect device fingerprint
 * 4. Run browser integrity checks
 * 5. Get behavioral analysis score
 * 6. Compute HMAC-SHA256 signature with all security components
 * 7. Send request with comprehensive security headers
 * 
 * Security Layers:
 * - CSP nonce (server-generated, single-use)
 * - Device fingerprinting (unique device identification)
 * - Browser integrity (detects tampering/automation)
 * - Behavioral analysis (distinguishes humans from bots)
 * - HMAC signature (binds all components together)
 * - Timestamp window (prevents old requests)
 * - Rate limiting (still active)
 * - Code obfuscation (production builds)
 */

import { getSecret, hasSecret } from './secretDecryptor.js';
import { generateDeviceFingerprint, calculateTrustScore } from './deviceFingerprint.js';
import { checkBrowserIntegrity, quickIntegrityCheck } from './integrityChecker.js';
import { behaviorTracker } from './behaviorTracker.js';
import { fetchFreshNonce } from './nonceExtractor.js';

/**
 * Generate a cryptographically secure nonce (UUID v4)
 * @returns {string} UUID nonce
 */
export function generateNonce() {
  return crypto.randomUUID();
}

/**
 * Cache for device fingerprint (avoid regenerating on every request)
 */
let cachedDeviceFingerprint = null;
let fingerprintGeneratedAt = null;
const FINGERPRINT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Get cached device fingerprint or generate new one
 * @returns {Promise<Object>} Device fingerprint object
 */
async function getDeviceFingerprint() {
  const now = Date.now();
  
  // Check if cache is valid
  if (cachedDeviceFingerprint && fingerprintGeneratedAt) {
    const cacheAge = now - fingerprintGeneratedAt;
    if (cacheAge < FINGERPRINT_CACHE_TTL) {
      return cachedDeviceFingerprint;
    }
  }
  
  // Generate new fingerprint
  const fingerprint = await generateDeviceFingerprint();
  cachedDeviceFingerprint = fingerprint;
  fingerprintGeneratedAt = now;
  
  return fingerprint;
}

/**
 * DEPRECATED: Enhanced signature not currently used
 * 
 * Compute enhanced HMAC-SHA256 signature with all security components
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - Request path (e.g., /api/project/link/config)
 * @param {string} clientNonce - Client-generated UUID nonce
 * @param {string} timestamp - Unix timestamp in seconds
 * @param {string} cspNonce - Server-generated CSP nonce from page
 * @param {string} fingerprintHash - Device fingerprint hash
 * @param {string} integrityHash - Browser integrity hash
 * @param {number} behaviorScore - Behavioral analysis score
 * @returns {Promise<string>} Hex-encoded signature
 */
/* DEPRECATED - NOT USED
export async function computeEnhancedSignature(
  method,
  path,
  clientNonce,
  timestamp,
  cspNonce = '',
  fingerprintHash = '',
  integrityHash = '',
  behaviorScore = 0
) {
  // Get decrypted secret from encrypted store
  const secret = getSecret('HMAC_SECRET');
  
  if (!secret) {
    console.warn('[Signature] HMAC_SECRET not configured, signature will be empty');
    return '';
  }
  
  // Enhanced payload format (delimiter: |)
  // timestamp | cspNonce | clientNonce | method | path | fingerprintHash | integrityHash | behaviorScore
  const payload = [
    timestamp,
    cspNonce || 'no-csp-nonce',
    clientNonce,
    method,
    path,
    fingerprintHash || 'no-fingerprint',
    integrityHash || 'no-integrity',
    behaviorScore.toString(),
  ].join('|');
  
  // Use Web Crypto API for HMAC-SHA256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);
  
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('[Signature] Error computing enhanced signature:', error);
    throw error;
  }
}
*/

/**
 * Legacy compute signature (for backward compatibility)
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - Request path (e.g., /api/project/link/config)
 * @param {string} nonce - Unique nonce for this request
 * @param {string} timestamp - Unix timestamp in seconds
 * @param {Object|null} body - Request body (for POST/PUT/PATCH requests)
 * @returns {Promise<string>} Hex-encoded signature
 */
export async function computeSignature(method, path, nonce, timestamp, body = null) {
  // Get decrypted secret from encrypted store
  const secret = getSecret('HMAC_SECRET');
  
  if (!secret) {
    console.warn('[Signature] HMAC_SECRET not configured, signature will be empty');
    return '';
  }
  
  // Compute body hash for POST/PUT/PATCH requests
  let bodyHash = '';
  if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    const encoder = new TextEncoder();
    const bodyData = encoder.encode(bodyString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', bodyData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    bodyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log('[Signature] Body hash computed:', bodyHash.substring(0, 16) + '...');
  }
  
  // Payload format: timestamp + nonce + method + path + bodyHash
  const payload = `${timestamp}${nonce}${method}${path}${bodyHash}`;
  
  // Use Web Crypto API for HMAC-SHA256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);
  
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('[Signature] Error computing signature:', error);
    throw error;
  }
}

/**
 * DEPRECATED: Enhanced auth headers not currently used
 * 
 * Generate enhanced signed request headers with all security components
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - Request path (e.g., /api/project/link/config)
 * @param {Object} options - Optional configuration
 * @param {boolean} options.includeFingerprint - Include device fingerprint (default: true)
 * @param {boolean} options.includeIntegrity - Include integrity check (default: true)
 * @param {boolean} options.includeBehavior - Include behavioral score (default: true)
 * @param {boolean} options.quick - Use quick checks for performance (default: false)
 * @returns {Promise<Object>} Headers object with all security headers
 */
/* DEPRECATED - NOT USED
export async function generateEnhancedAuthHeaders(method, path, options = {}) {
  const startTime = performance.now();
  const {
    includeFingerprint = true,
    includeIntegrity = true,
    includeBehavior = true,
    quick = false,
  } = options;
  
  console.log('[Signature] 🔵 START generateEnhancedAuthHeaders', { method, path, options });
  
  try {
    // Generate timestamp and client nonce
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const clientNonce = generateNonce();
    
    // Get server nonce (obfuscated)
    const cspNonce = await getCachedNonce() || '';
    
    // Collect security components in parallel for performance
    const securityChecks = await Promise.allSettled([
      includeFingerprint ? getDeviceFingerprint() : Promise.resolve(null),
      includeIntegrity && !quick ? checkBrowserIntegrity() : Promise.resolve(null),
      includeBehavior ? Promise.resolve(behaviorTracker.getBehaviorData()) : Promise.resolve(null),
    ]);
    
    // Extract results
    const fingerprintResult = securityChecks[0].status === 'fulfilled' ? securityChecks[0].value : null;
    const integrityResult = securityChecks[1].status === 'fulfilled' ? securityChecks[1].value : null;
    const behaviorResult = securityChecks[2].status === 'fulfilled' ? securityChecks[2].value : null;
    
    // Get values
    const fingerprintHash = fingerprintResult?.hash || '';
    const integrityHash = integrityResult?.integrityHash || '';
    const integrityScore = integrityResult?.score || 0;
    const behaviorScore = behaviorResult?.score || 0;
    
    // Quick integrity check if full check was skipped
    if (quick && includeIntegrity) {
      const quickCheck = quickIntegrityCheck();
      if (!quickCheck) {
        console.warn('[Signature] Quick integrity check failed');
      }
    }
    
    // Compute enhanced signature
    const signature = await computeEnhancedSignature(
      method,
      path,
      clientNonce,
      timestamp,
      cspNonce,
      fingerprintHash,
      integrityHash,
      behaviorScore
    );
    
    // Build headers object
    const headers = {
      // Core authentication
      'x-timestamp': timestamp,
      'x-client-nonce': clientNonce,
      'x-signature': signature,
      
      // CSP nonce (server-generated)
      ...(cspNonce && { 'x-csp-nonce': cspNonce }),
      
      // Device fingerprint
      ...(fingerprintHash && { 'x-fingerprint': fingerprintHash }),
      
      // Browser integrity
      ...(integrityHash && { 'x-integrity': integrityHash }),
      ...(integrityScore > 0 && { 'x-integrity-score': integrityScore.toString() }),
      
      // Behavioral analysis
      ...(behaviorScore > 0 && { 'x-behavior-score': behaviorScore.toString() }),
    };
    
    const endTime = performance.now();
    console.log('[Signature] ✅ SUCCESS generateEnhancedAuthHeaders:', {
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      hasCspNonce: !!cspNonce,
      hasFingerprint: !!fingerprintHash,
      hasIntegrity: !!integrityHash,
      integrityScore,
      behaviorScore,
      method,
      path
    });
    
    return headers;
  } catch (error) {
    const endTime = performance.now();
    console.error('[Signature] ❌ FAILED generateEnhancedAuthHeaders:', {
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      error: error.message,
      method,
      path
    });
    
    // Fallback to basic authentication
    return generateAuthHeaders(method, path);
  }
}
*/

/**
 * Generate signed request headers (legacy, backward compatible)
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - Request path (e.g., /api/project/link/config)
 * @param {Object|null} body - Request body (for POST/PUT/PATCH requests)
 * @returns {Promise<Object>} Headers object with x-timestamp, x-nonce, x-signature
 */
export async function generateAuthHeaders(method, path, body = null) {
  const startTime = performance.now();
  console.log('[Signature] 🔵 START generateAuthHeaders', { method, path, hasBody: !!body });
  
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Fetch fresh nonce from server for EACH request (no cache, no deduplication)
    // Each request gets a unique server-generated nonce to prevent replay attacks
    // This means /api/init is called before EVERY protected API request
    let nonce = await fetchFreshNonce();
    
    // Fallback to client-generated nonce if server fetch fails
    if (!nonce) {
      console.warn('[Signature] Server nonce fetch failed, using client-generated nonce');
      nonce = generateNonce();
    }
    
    const signature = await computeSignature(method, path, nonce, timestamp, body);
    
    const headers = {
      'x-timestamp': timestamp,
      'x-nonce': nonce,
      'x-signature': signature
    };
    
    const endTime = performance.now();
    console.log('[Signature] ✅ SUCCESS generateAuthHeaders', { 
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      method, 
      path,
      hasBody: !!body
    });
    
    return headers;
  } catch (error) {
    const endTime = performance.now();
    console.error('[Signature] ❌ FAILED generateAuthHeaders', {
      duration: `${(endTime - startTime).toFixed(2)}ms`,
      error: error.message,
      method,
      path
    });
    throw error;
  }
}

/**
 * Check if signature authentication is configured
 * @returns {boolean} True if HMAC_SECRET is available
 */
export function isSignatureEnabled() {
  return hasSecret('HMAC_SECRET');
}

/**
 * Clear all security caches (call on logout or security event)
 */
export function clearSecurityCaches() {
  cachedDeviceFingerprint = null;
  fingerprintGeneratedAt = null;
  console.log('[Signature] Security caches cleared');
}
