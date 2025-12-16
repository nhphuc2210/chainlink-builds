/**
 * Rate Limiting Configuration
 * 
 * Centralized rate limit settings for API endpoints.
 * Modify these values to adjust rate limiting behavior.
 */

export const RATE_LIMIT_CONFIG = {
  // Per-second rate limit (for protected API endpoints)
  perSecond: {
    windowMs: 1 * 1000,        // 1 second window
    max: 20,                    // Max 20 requests per IP per second
  },
  
  // Per-minute rate limit (for protected API endpoints)
  perMinute: {
    windowMs: 1 * 60 * 1000,   // 1 minute window
    max: 120,                   // Max 120 requests per IP per minute
  },
  
  // Penalty settings (applied when rate limit is exceeded)
  penalty: {
    durationMs: 60 * 1000,      // 60 seconds block after violation
    cleanupIntervalMs: 60 * 1000, // Clean up expired penalties every 60 seconds
  },
  
  // Paths to skip rate limiting entirely
  skipPaths: ['/health', '/assets/'],
  
  // Special rate limit for /api/init endpoint
  // Each protected API call needs 1 nonce from /api/init
  // Protected endpoints list: see config/shared/security.js (PROTECTED_ENDPOINTS)
  // Currently 3 endpoints: config, global-state, user-claim
  // /api/init needs 3x capacity of protected endpoints
  init: {
    perSecond: {
      windowMs: 1 * 1000,
      max: 60,                // 3x of protected endpoints (20 * 3)
    },
    perMinute: {
      windowMs: 1 * 60 * 1000,
      max: 360,               // 3x of protected endpoints (120 * 3)
    },
  },
};

