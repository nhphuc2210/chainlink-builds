/**
 * Shared Security Configuration
 * 
 * Configuration for protected endpoints that require signature verification.
 * Used by both frontend (to determine when to add signatures) and backend (for validation).
 */

/**
 * Protected API endpoints that require HMAC signature verification
 * Each endpoint requires a fresh server-generated nonce from /api/init
 * 
 * When adding a new protected endpoint:
 * 1. Add the path to this array
 * 2. Add verifyClientSignature() middleware in backend/src/routes/api.js
 * 3. Update /api/init rate limit multiplier in config/backend/rateLimiting.js
 *    (set to: number_of_endpoints * 20 for perSecond.max)
 */
export const PROTECTED_ENDPOINTS = [
  '/api/v1/project/config',
  '/api/v1/project/global-state',
  '/api/v1/project/user-claim'
];

/**
 * Check if an endpoint path requires signature verification
 * @param {string} path - Request path to check
 * @returns {boolean} True if path requires signature
 */
export function requiresSignature(path) {
  return PROTECTED_ENDPOINTS.some(endpoint => path.includes(endpoint));
}

/**
 * Get the number of protected endpoints (useful for rate limit calculations)
 * @returns {number} Count of protected endpoints
 */
export function getProtectedEndpointCount() {
  return PROTECTED_ENDPOINTS.length;
}

