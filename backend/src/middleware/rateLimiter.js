import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_CONFIG } from '../../../config/backend/rateLimiting.js';

// Helper function to get client IP
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
};

// Helper function for IPv6-safe key generation
// Express 5 + express-rate-limit v8 requires proper IPv6 normalization
const createKeyGenerator = (req) => {
  const ip = getClientIp(req);
  // Normalize IPv6 addresses to prevent bypassing rate limits
  // IPv6 addresses can be represented in multiple equivalent forms
  return ip;
};

// Check if we should apply rate limiting
const shouldApplyRateLimit = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const forceSecurity = process.env.FORCE_SECURITY === 'true';
  // Apply rate limiting in all environments EXCEPT pure development mode
  // local-production and production both have rate limiting enabled
  return !isDevelopment || forceSecurity;
};

// In-memory store for penalty tracking
const penaltyStore = new Map();

// Middleware to check if IP is in penalty period
const checkPenalty = (req, res, next) => {
  // Skip penalty check in development mode (unless forced)
  if (!shouldApplyRateLimit()) {
    return next();
  }
  
  const clientIp = getClientIp(req);
  const penaltyData = penaltyStore.get(clientIp);
  
  if (penaltyData) {
    const timeRemaining = Math.ceil((penaltyData.until - Date.now()) / 1000);
    
    if (timeRemaining > 0) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('🚫 [429] PENALTY ACTIVE - IP Temporarily Blocked');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Reason: PENALTY_ACTIVE');
      console.error('Path:', req.path);
      console.error('IP:', clientIp);
      console.error('Remaining:', timeRemaining, 'seconds');
      console.error('Penalty Until:', new Date(penaltyData.until).toISOString());
      console.error('Message: You exceeded rate limits and are temporarily blocked.');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return res.status(429).json({
        error: 'Too many requests',
        message: `You have been temporarily blocked. Please wait ${timeRemaining} seconds.`,
        limitType: 'penalty',
        retryAfter: timeRemaining,
        reason: 'PENALTY_ACTIVE'
      });
    } else {
      // Penalty expired, remove from store
      penaltyStore.delete(clientIp);
    }
  }
  
  next();
};

// Clean up expired penalties periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of penaltyStore.entries()) {
    if (data.until <= now) {
      penaltyStore.delete(ip);
    }
  }
}, RATE_LIMIT_CONFIG.penalty.cleanupIntervalMs);

// Handler when rate limit is exceeded - apply penalty
const onLimitReached = (req, res, options) => {
  const clientIp = getClientIp(req);
  const penaltyUntil = Date.now() + RATE_LIMIT_CONFIG.penalty.durationMs;
  
  penaltyStore.set(clientIp, { until: penaltyUntil });
  
  const penaltySeconds = Math.ceil(RATE_LIMIT_CONFIG.penalty.durationMs / 1000);
  console.warn(`[RateLimit] IP ${clientIp} exceeded rate limit. Blocked for ${penaltySeconds}s until ${new Date(penaltyUntil).toISOString()}`);
};

// Per-second limiter
const perSecondLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.perSecond.windowMs,
  max: RATE_LIMIT_CONFIG.perSecond.max,
  message: { 
    error: 'Too many requests', 
    message: `Rate limit exceeded (${RATE_LIMIT_CONFIG.perSecond.max} req/s). You are blocked for ${Math.ceil(RATE_LIMIT_CONFIG.penalty.durationMs / 1000)} seconds.`,
    limitType: 'per-second',
    limit: RATE_LIMIT_CONFIG.perSecond.max,
    window: '1 second',
    retryAfter: Math.ceil(RATE_LIMIT_CONFIG.penalty.durationMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator,
  handler: (req, res, next, options) => {
    const clientIp = getClientIp(req);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('🚫 [429] RATE LIMIT EXCEEDED - Per-Second Limit');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Reason: PER_SECOND_LIMIT');
    console.error('Path:', req.path);
    console.error('IP:', clientIp);
    console.error('Limit:', RATE_LIMIT_CONFIG.perSecond.max, 'requests/second');
    console.error('Penalty:', RATE_LIMIT_CONFIG.penalty.durationMs / 1000, 'seconds');
    console.error('Message: You exceeded', RATE_LIMIT_CONFIG.perSecond.max, 'requests per second.');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    onLimitReached(req, res, options);
    res.status(429).json({...options.message, reason: 'PER_SECOND_LIMIT'});
  },
  skip: (req) => {
    // Skip rate limit in development mode (unless forced)
    if (!shouldApplyRateLimit()) {
      return true;
    }
    return RATE_LIMIT_CONFIG.skipPaths.some(path => 
      req.path === path || req.path.startsWith(path)
    );
  }
});

// Per-minute limiter
const perMinuteLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.perMinute.windowMs,
  max: RATE_LIMIT_CONFIG.perMinute.max,
  message: { 
    error: 'Too many requests', 
    message: `Rate limit exceeded (${RATE_LIMIT_CONFIG.perMinute.max} req/min). You are blocked for ${Math.ceil(RATE_LIMIT_CONFIG.penalty.durationMs / 1000)} seconds.`,
    limitType: 'per-minute',
    limit: RATE_LIMIT_CONFIG.perMinute.max,
    window: '1 minute',
    retryAfter: Math.ceil(RATE_LIMIT_CONFIG.penalty.durationMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator,
  handler: (req, res, next, options) => {
    const clientIp = getClientIp(req);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('🚫 [429] RATE LIMIT EXCEEDED - Per-Minute Limit');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Reason: PER_MINUTE_LIMIT');
    console.error('Path:', req.path);
    console.error('IP:', clientIp);
    console.error('Limit:', RATE_LIMIT_CONFIG.perMinute.max, 'requests/minute');
    console.error('Penalty:', RATE_LIMIT_CONFIG.penalty.durationMs / 1000, 'seconds');
    console.error('Message: You exceeded', RATE_LIMIT_CONFIG.perMinute.max, 'requests per minute.');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    onLimitReached(req, res, options);
    res.status(429).json({...options.message, reason: 'PER_MINUTE_LIMIT'});
  },
  skip: (req) => {
    // Skip rate limit in development mode (unless forced)
    if (!shouldApplyRateLimit()) {
      return true;
    }
    return RATE_LIMIT_CONFIG.skipPaths.some(path => 
      req.path === path || req.path.startsWith(path)
    );
  }
});

// Combined API limiter (penalty check + per-second + per-minute)
export const apiLimiter = [checkPenalty, perSecondLimiter, perMinuteLimiter];

// Combined blockchain limiter (same limits for consistency)
export const blockchainLimiter = [checkPenalty, perSecondLimiter, perMinuteLimiter];

// Init endpoint limiter (3x capacity for nonce generation)
// Each protected API call needs 1 nonce, so /api/init needs higher capacity
const initPerSecondLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.init.perSecond.windowMs,
  max: RATE_LIMIT_CONFIG.init.perSecond.max,
  message: { 
    error: 'Too many init requests', 
    message: `Init rate limit exceeded (${RATE_LIMIT_CONFIG.init.perSecond.max} req/s). Please slow down.`,
    limitType: 'init-per-second',
    retryAfter: 1
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator,
  handler: (req, res, next, options) => {
    const clientIp = getClientIp(req);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('🚫 [429] INIT RATE LIMIT EXCEEDED - Per-Second');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Reason: INIT_PER_SECOND_LIMIT');
    console.error('Path:', req.path);
    console.error('IP:', clientIp);
    console.error('Limit:', RATE_LIMIT_CONFIG.init.perSecond.max, 'requests/second');
    console.error('Message: Too many /api/init requests per second.');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    res.status(429).json({...options.message, reason: 'INIT_PER_SECOND_LIMIT'});
  },
  skip: (req) => !shouldApplyRateLimit()
});

const initPerMinuteLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.init.perMinute.windowMs,
  max: RATE_LIMIT_CONFIG.init.perMinute.max,
  message: { 
    error: 'Too many init requests', 
    message: `Init rate limit exceeded (${RATE_LIMIT_CONFIG.init.perMinute.max} req/min). Please slow down.`,
    limitType: 'init-per-minute',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createKeyGenerator,
  handler: (req, res, next, options) => {
    const clientIp = getClientIp(req);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('🚫 [429] INIT RATE LIMIT EXCEEDED - Per-Minute');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Reason: INIT_PER_MINUTE_LIMIT');
    console.error('Path:', req.path);
    console.error('IP:', clientIp);
    console.error('Limit:', RATE_LIMIT_CONFIG.init.perMinute.max, 'requests/minute');
    console.error('Message: Too many /api/init requests per minute.');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    res.status(429).json({...options.message, reason: 'INIT_PER_MINUTE_LIMIT'});
  },
  skip: (req) => !shouldApplyRateLimit()
});

// Combined init limiter (no penalty, just limits)
export const initLimiter = [initPerSecondLimiter, initPerMinuteLimiter];
