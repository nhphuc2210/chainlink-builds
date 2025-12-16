import crypto from 'crypto';
import { SECURITY_CONFIG } from '../../../config/backend/security.js';

/**
 * CSP Nonce Middleware
 * 
 * Generates cryptographically secure nonces for Content Security Policy (CSP)
 * to prevent XSS attacks by ensuring only scripts/styles with matching nonces can execute.
 * 
 * Flow:
 * 1. generateCspNonce() creates random nonce and stores in res.locals
 * 2. setCspHeaders() builds CSP header with the nonce (imports base directives from config)
 * 3. EJS template injects nonce into <script> and <style> tags
 * 
 * Security:
 * - Nonce is 16 random bytes (128-bit entropy)
 * - New nonce generated per request (prevents replay)
 * - Base64 encoded for HTTP header compatibility
 * 
 * Design:
 * - Uses SECURITY_CONFIG.csp.directives as single source of truth
 * - Dynamically injects nonce into script-src directive
 * - No duplication between dev and production CSP configs
 */

/**
 * Generate CSP nonce for each request
 * Nonce format: base64-encoded random 16 bytes
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function generateCspNonce(req, res, next) {
  // Generate cryptographically secure random nonce
  // 16 bytes = 128 bits of entropy (sufficient for CSP nonce)
  const nonce = crypto.randomBytes(16).toString('base64');
  
  // Store in res.locals for use in EJS template and CSP header
  res.locals.cspNonce = nonce;
  
  console.log(`[CSP] Generated nonce for ${req.method} ${req.path}: ${nonce.substring(0, 12)}...`);
  
  next();
}

/**
 * Set CSP headers with nonce
 * Must be called AFTER generateCspNonce
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function setCspHeaders(req, res, next) {
  const nonce = res.locals.cspNonce;
  
  if (!nonce) {
    console.warn('[CSP] No nonce found in res.locals - skipping CSP headers');
    return next();
  }
  
  // Clone CSP directives from config (single source of truth)
  const cspDirectives = [...SECURITY_CONFIG.csp.directives];
  
  // Find and modify script-src to inject nonce
  const scriptSrcIndex = cspDirectives.findIndex(d => d.startsWith('script-src'));
  
  if (scriptSrcIndex !== -1) {
    // Get original script-src directive
    const originalScriptSrc = cspDirectives[scriptSrcIndex];
    
    // Inject nonce after 'self' in script-src
    // Example: "script-src 'self' https://..." → "script-src 'self' 'nonce-abc123' https://..."
    const modifiedScriptSrc = originalScriptSrc.replace(
      "script-src 'self'",
      `script-src 'self' 'nonce-${nonce}'`
    );
    
    // Replace with modified version
    cspDirectives[scriptSrcIndex] = modifiedScriptSrc;
    
    console.log(`[CSP] Injected nonce into script-src: ${nonce.substring(0, 12)}...`);
  } else {
    console.warn('[CSP] Warning: script-src directive not found in config');
  }
  
  // Set CSP header
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  
  console.log(`[CSP] Set CSP headers with nonce for ${req.path}`);
  
  next();
}

/**
 * Combined middleware for convenience
 * Generates nonce and sets CSP headers in one call
 * 
 * Usage:
 *   app.use(cspNonceMiddleware);
 */
export function cspNonceMiddleware(req, res, next) {
  generateCspNonce(req, res, () => {
    setCspHeaders(req, res, next);
  });
}

export default {
  generateCspNonce,
  setCspHeaders,
  cspNonceMiddleware
};

