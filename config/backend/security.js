/**
 * Security Configuration
 * 
 * Centralized security settings for HMAC signatures, nonces, CORS, and CSP.
 * Modify these values to adjust security behavior.
 */

export const SECURITY_CONFIG = {
  // HMAC Signature settings
  signature: {
    windowMs: 5 * 60 * 1000,    // 5 minutes - request timestamp validity window
    ttlSeconds: 5 * 60,          // 5 minutes - nonce TTL in seconds
  },
  
  // Nonce settings (one-time use tokens)
  // Two-set approach for security:
  // 1. "generated:" prefix - Whitelist of server-issued nonces (proves nonce came from server)
  //    - Short TTL (30s) - nonce must be used within 30 seconds of generation
  // 2. "used:" prefix - Blacklist of consumed nonces (prevents replay)
  //    - Long TTL (7 days) - prevent replay attack for extended period
  nonce: {
    generationWindowSeconds: 30,      // 30 seconds - nonce must be used within this window
    usedTtlSeconds: 7 * 24 * 60 * 60, // 7 days (604800s) - how long to remember used nonces (prevent replay)
    cleanupIntervalMs: 60 * 1000,     // Clean up expired nonces every 60 seconds (memory fallback only)
    generatedPrefix: 'chainlink:buildSeason1:nonce:generated:',  // Whitelist
    usedPrefix: 'chainlink:buildSeason1:nonce:used:',            // Blacklist
  },
  
  // CORS allowed origins
  cors: {
    allowedOrigins: [
      'http://localhost:5173',           // Dev frontend
      'http://localhost:7000',           // Dev backend serving frontend
      'https://tunai.world',             // Production domain (HTTPS)
      // process.env.ALLOWED_ORIGIN will be added dynamically
    ],
  },
  
  // Content Security Policy (CSP) directives
  // These directives control what resources can be loaded by the browser
  // 
  // ✅ SINGLE SOURCE OF TRUTH for both Development and Production
  // 
  // Development mode:
  //   - Uses these directives directly (static CSP)
  //   - No nonce injection needed
  // 
  // Production mode:
  //   - cspNonce.js imports these directives
  //   - Dynamically injects 'nonce-{random}' into script-src
  //   - Example: "script-src 'self'" → "script-src 'self' 'nonce-abc123'"
  // 
  // To add/modify CSP rules: Update here only (no duplication)
  csp: {
    directives: [
      "default-src 'self'",
      // Script: Only allow scripts from self and Cloudflare Insights
      // Production: 'nonce-{DYNAMIC}' is added by cspNonce.js middleware
      "script-src 'self' https://static.cloudflareinsights.com",
      // Style: Allow inline styles for React inline styling + Google Fonts
      // Note: 'unsafe-inline' kept for React compatibility (style={{...}})
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Font: Only Google Fonts CDN
      "font-src 'self' https://fonts.gstatic.com",
      // Images: Only self, data URIs, and specific Chainlink CDN for favicons
      "img-src 'self' data: https://blog.chain.link",
      // Connect: Only self, Infura for blockchain calls, and Cloudflare
      // Note: Removed debug endpoint (http://127.0.0.1:7242) for production security
      "connect-src 'self' https://mainnet.infura.io https://cloudflareinsights.com",
      // Worker: Allow Web Workers from same origin and blob URLs (for vesting calculations)
      "worker-src 'self' blob:",
      // Frame: Disallow embedding in iframes
      "frame-ancestors 'none'",
      // Base URI: Restrict base tag to same origin
      "base-uri 'self'",
      // Form action: Only allow form submissions to same origin
      "form-action 'self'",
      // CSP Reporting: Send violation reports to this endpoint
      "report-uri /api/csp-report",
    ],
    description: "CSP with nonce for scripts (production), unsafe-inline for styles (React compatibility)"
  },
  
  // Paranoid-Level Security Settings
  paranoid: {
    // Device Fingerprinting
    device: {
      fingerprintRequired: true,
      minTrustScore: 50,              // 0-100
      maxDevicesPerIP: 10,
      blockSuspiciousChanges: true,
    },
    
    // Browser Integrity
    integrity: {
      required: true,
      minScore: 50,                   // 0-100
      blockAutomation: true,
    },
    
    // Behavioral Analysis
    behavior: {
      required: true,
      minScore: 30,                   // 0-100
      trackingDuration: 60000,        // 1 minute
      triggerChallengeOnLowScore: true,
    },
    
    // Challenge System
    challenge: {
      enabled: true,
      types: ['math', 'time', 'interactive'],
      maxAttempts: 3,
      triggerOnNewDevice: false,      // Set to true for maximum security
      triggerOnLowScore: true,
    },
    
    // CSP Nonce
    cspNonce: {
      enabled: true,
      required: false,                // Set to true for maximum security
      length: 32,                     // bytes
    },
    
    // Enhanced Signature
    enhancedSignature: {
      enabled: true,
      required: true,
      includeAllComponents: true,     // fingerprint, integrity, behavior, CSP nonce
    },
  },
};

