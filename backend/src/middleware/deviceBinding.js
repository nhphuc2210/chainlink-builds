/**
 * Device Binding Middleware
 * 
 * Validates device fingerprints and enforces device-based security policies.
 * Works in conjunction with device registry service.
 * 
 * Features:
 * - Validate device fingerprint
 * - Check device block status
 * - Track device activity
 * - Device-aware rate limiting
 * - Detect suspicious device changes
 */

import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import {
  registerDevice,
  getDevice,
  getDevicesByIP,
  isDeviceBlocked,
  validateDeviceFingerprint,
  recordSuspiciousActivity,
  updateTrustScore,
} from '../services/deviceRegistry.js';

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
}

/**
 * Device fingerprint validation middleware
 * @param {Object} options - Configuration options
 * @param {boolean} options.required - If true, reject requests without fingerprint
 * @param {boolean} options.enforceBinding - If true, validate fingerprint consistency
 * @param {boolean} options.checkBlocked - If true, reject blocked devices
 * @param {number} options.minTrustScore - Minimum trust score required (0-100)
 * @returns {Function} Express middleware
 */
export function validateDeviceMiddleware(options = {}) {
  const {
    required = true,
    enforceBinding = true,
    checkBlocked = true,
    minTrustScore = 0,
  } = options;
  
  return async (req, res, next) => {
    const fingerprintHash = req.headers['x-fingerprint'];
    const clientIP = getClientIP(req);
    
    // Check if fingerprint is required
    if (!fingerprintHash) {
      if (required) {
        return res.status(403).json({
          error: 'Device fingerprint required',
          message: 'Request must include x-fingerprint header',
        });
      }
      return next();
    }
    
    try {
      // Check if device is blocked
      if (checkBlocked) {
        const blockStatus = await isDeviceBlocked(fingerprintHash);
        if (blockStatus.blocked) {
          return res.status(403).json({
            error: 'Device blocked',
            message: `Your device has been blocked: ${blockStatus.reason}`,
            blockedAt: blockStatus.blockedAt,
            expiresAt: blockStatus.expiresAt,
          });
        }
      }
      
      // Get or register device
      let device = await getDevice(fingerprintHash);
      
      if (!device) {
        // New device - register it
        const result = await registerDevice(fingerprintHash, {}, clientIP, 50);
        device = result.device;
        
        console.log('[DeviceBinding] New device registered:', fingerprintHash.substring(0, 16) + '...');
      } else {
        // Existing device - update last seen
        await registerDevice(fingerprintHash, device.fingerprint, clientIP);
      }
      
      // Check trust score
      if (minTrustScore > 0 && device.trustScore < minTrustScore) {
        return res.status(403).json({
          error: 'Low trust score',
          message: 'Your device trust score is too low. Please complete additional verification.',
          trustScore: device.trustScore,
          required: minTrustScore,
        });
      }
      
      // Check if too many devices from same IP
      const devicesFromIP = await getDevicesByIP(clientIP);
      if (devicesFromIP.length > 10) {
        await recordSuspiciousActivity(fingerprintHash, 'too-many-devices-per-ip', {
          ip: clientIP,
          deviceCount: devicesFromIP.length,
        });
        
        console.warn(`[DeviceBinding] Suspicious: ${devicesFromIP.length} devices from IP ${clientIP}`);
      }
      
      // Store device info in request for use by other middlewares
      req.device = device;
      req.deviceFingerprint = fingerprintHash;
      
      next();
    } catch (error) {
      console.error('[DeviceBinding] Error validating device:', error);
      
      if (required) {
        return res.status(500).json({
          error: 'Device validation error',
          message: 'Failed to validate device fingerprint',
        });
      }
      
      next();
    }
  };
}

/**
 * Device-aware rate limiter
 * Combines IP and device fingerprint for more accurate rate limiting
 * @param {Object} config - Rate limit configuration
 * @returns {Function} Express middleware
 */
export function deviceRateLimiter(config = {}) {
  const {
    windowMs = 60000, // 1 minute
    max = 100, // max requests per window
    message = 'Too many requests',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config;
  
  return rateLimit({
    windowMs,
    max,
    message: { error: message, retryAfter: Math.ceil(windowMs / 1000) },
    standardHeaders: true,
    legacyHeaders: false,
    // Generate key from IP + device fingerprint
    keyGenerator: (req) => {
      const ip = getClientIP(req);
      const fingerprint = req.headers['x-fingerprint'] || 'no-fingerprint';
      
      // Hash the combination for privacy
      const combined = `${ip}:${fingerprint}`;
      return crypto.createHash('sha256').update(combined).digest('hex');
    },
    skip: (req) => {
      // Skip if not in security mode
      const isProduction = process.env.NODE_ENV === 'production';
      const forceSecurity = process.env.FORCE_SECURITY === 'true';
      return !(isProduction || forceSecurity);
    },
    skipSuccessfulRequests,
    skipFailedRequests,
    handler: async (req, res, options) => {
      // Record suspicious activity when rate limit hit
      const fingerprint = req.headers['x-fingerprint'];
      if (fingerprint) {
        await recordSuspiciousActivity(fingerprint, 'rate-limit-exceeded', {
          ip: getClientIP(req),
          path: req.path,
          timestamp: Date.now(),
        });
      }
      
      res.status(429).json(options.message);
    },
  });
}

/**
 * Check fingerprint consistency middleware
 * Validates that device fingerprint hasn't changed suspiciously
 * @returns {Function} Express middleware
 */
export function checkFingerprintConsistency() {
  return async (req, res, next) => {
    const fingerprintHash = req.headers['x-fingerprint'];
    
    if (!fingerprintHash) {
      return next();
    }
    
    try {
      // Get fingerprint data from request body (if provided)
      const fingerprintData = req.body?.fingerprint || {};
      
      // Validate fingerprint consistency
      const validation = await validateDeviceFingerprint(fingerprintHash, fingerprintData);
      
      if (!validation.valid && validation.suspicious) {
        console.warn(`[DeviceBinding] Suspicious fingerprint change detected for ${fingerprintHash.substring(0, 16)}...`);
        
        return res.status(403).json({
          error: 'Suspicious device changes detected',
          message: 'Your device fingerprint has changed in a suspicious way. Please verify your identity.',
          changes: validation.changes,
        });
      }
      
      req.fingerprintValidation = validation;
      next();
    } catch (error) {
      console.error('[DeviceBinding] Error checking fingerprint consistency:', error);
      next();
    }
  };
}

/**
 * Adaptive rate limiter based on device trust score
 * Higher trust = higher limits
 * @returns {Function} Express middleware
 */
export function adaptiveDeviceRateLimiter() {
  return async (req, res, next) => {
    const device = req.device;
    
    if (!device) {
      return next();
    }
    
    // Calculate max requests based on trust score
    // Trust 100 = 200 req/min
    // Trust 50 = 100 req/min  
    // Trust 0 = 20 req/min
    const baseMax = 20;
    const maxBonus = 180;
    const trustMultiplier = device.trustScore / 100;
    const maxRequests = Math.floor(baseMax + (maxBonus * trustMultiplier));
    
    // Store calculated limit in request for logging
    req.rateLimit = {
      max: maxRequests,
      trustScore: device.trustScore,
    };
    
    next();
  };
}

/**
 * Get device rate limit info (for debugging/monitoring)
 * @returns {Function} Express route handler
 */
export function getDeviceRateLimitInfo(req, res) {
  const fingerprint = req.headers['x-fingerprint'];
  const ip = getClientIP(req);
  
  if (!fingerprint) {
    return res.status(400).json({
      error: 'Missing fingerprint',
      message: 'x-fingerprint header required',
    });
  }
  
  const device = req.device;
  const rateLimit = req.rateLimit;
  
  res.json({
    fingerprint: fingerprint.substring(0, 16) + '...',
    ip,
    trustScore: device?.trustScore || 0,
    rateLimit: rateLimit || { max: 100, trustScore: 50 },
    isBlocked: device?.isBlocked || false,
    requestCount: device?.requestCount || 0,
  });
}

