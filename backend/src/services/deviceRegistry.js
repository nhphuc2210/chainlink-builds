/**
 * Device Registry Service
 * 
 * Manages device fingerprints and tracks device behavior over time.
 * Stores device information in Redis (with memory fallback).
 * 
 * Features:
 * - Register new devices
 * - Validate device fingerprints
 * - Track device trust scores
 * - Detect suspicious device changes
 * - Block malicious devices
 * - Device analytics
 */

import crypto from 'crypto';
import { getRedisClient, isRedisAvailable } from '../utils/redis.js'; // Shared Redis client

const DEVICE_PREFIX = 'device:';
const DEVICE_IP_PREFIX = 'device_ip:';
const BLOCKED_DEVICE_PREFIX = 'blocked_device:';
const DEVICE_TTL = 30 * 24 * 60 * 60; // 30 days

// Use shared Redis client
const redis = getRedisClient();

// In-memory fallback
const memoryDevices = new Map();
const memoryDevicesByIP = new Map();
const blockedDevices = new Set();

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
}

/**
 * Register a new device or update existing device
 * @param {string} fingerprintHash - Device fingerprint hash
 * @param {Object} fingerprint - Full fingerprint data
 * @param {string} ip - Client IP address
 * @param {number} initialTrustScore - Initial trust score (0-100)
 * @returns {Promise<Object>} Device registration result
 */
export async function registerDevice(fingerprintHash, fingerprint, ip, initialTrustScore = 50) {
  const now = Date.now();
  const deviceKey = `${DEVICE_PREFIX}${fingerprintHash}`;
  
  try {
    // Check if device already exists
    const existingDevice = await getDevice(fingerprintHash);
    
    if (existingDevice) {
      // Update existing device
      const updatedDevice = {
        ...existingDevice,
        fingerprint,
        lastSeenAt: now,
        lastSeenIP: ip,
        requestCount: existingDevice.requestCount + 1,
        ipHistory: [...new Set([...existingDevice.ipHistory, ip])].slice(-10), // Keep last 10 IPs
      };
      
      // Store updated device
      if (isRedisAvailable() && redis) {
        await redis.setex(deviceKey, DEVICE_TTL, JSON.stringify(updatedDevice));
        
        // Track device by IP
        const ipKey = `${DEVICE_IP_PREFIX}${ip}`;
        await redis.sadd(ipKey, fingerprintHash);
        await redis.expire(ipKey, DEVICE_TTL);
      } else {
        memoryDevices.set(fingerprintHash, updatedDevice);
        
        if (!memoryDevicesByIP.has(ip)) {
          memoryDevicesByIP.set(ip, new Set());
        }
        memoryDevicesByIP.get(ip).add(fingerprintHash);
      }
      
      return {
        isNew: false,
        device: updatedDevice,
      };
    }
    
    // Create new device
    const newDevice = {
      fingerprintHash,
      fingerprint,
      firstSeenAt: now,
      lastSeenAt: now,
      firstSeenIP: ip,
      lastSeenIP: ip,
      ipHistory: [ip],
      requestCount: 1,
      trustScore: initialTrustScore,
      isBlocked: false,
      blockReason: null,
      suspiciousActivityCount: 0,
      lastActivity: {
        timestamp: now,
        type: 'registration',
      },
    };
    
    // Store new device
    if (isRedisAvailable() && redis) {
      await redis.setex(deviceKey, DEVICE_TTL, JSON.stringify(newDevice));
      
      // Track device by IP
      const ipKey = `${DEVICE_IP_PREFIX}${ip}`;
      await redis.sadd(ipKey, fingerprintHash);
      await redis.expire(ipKey, DEVICE_TTL);
    } else {
      memoryDevices.set(fingerprintHash, newDevice);
      
      if (!memoryDevicesByIP.has(ip)) {
        memoryDevicesByIP.set(ip, new Set());
      }
      memoryDevicesByIP.get(ip).add(fingerprintHash);
    }
    
    console.log('[DeviceRegistry] Registered new device:', fingerprintHash.substring(0, 16) + '...');
    
    return {
      isNew: true,
      device: newDevice,
    };
  } catch (error) {
    console.error('[DeviceRegistry] Error registering device:', error);
    throw error;
  }
}

/**
 * Get device by fingerprint hash
 * @param {string} fingerprintHash - Device fingerprint hash
 * @returns {Promise<Object|null>} Device data or null if not found
 */
export async function getDevice(fingerprintHash) {
  const deviceKey = `${DEVICE_PREFIX}${fingerprintHash}`;
  
  try {
    if (isRedisAvailable() && redis) {
      const dataStr = await redis.get(deviceKey);
      if (dataStr) {
        return JSON.parse(dataStr);
      }
    } else {
      return memoryDevices.get(fingerprintHash) || null;
    }
  } catch (error) {
    console.error('[DeviceRegistry] Error getting device:', error);
  }
  
  return null;
}

/**
 * Get all devices for a given IP address
 * @param {string} ip - IP address
 * @returns {Promise<Array>} Array of device hashes
 */
export async function getDevicesByIP(ip) {
  const ipKey = `${DEVICE_IP_PREFIX}${ip}`;
  
  try {
    if (isRedisAvailable() && redis) {
      const devices = await redis.smembers(ipKey);
      return devices || [];
    } else {
      const devices = memoryDevicesByIP.get(ip);
      return devices ? Array.from(devices) : [];
    }
  } catch (error) {
    console.error('[DeviceRegistry] Error getting devices by IP:', error);
    return [];
  }
}

/**
 * Update device trust score
 * @param {string} fingerprintHash - Device fingerprint hash
 * @param {number} newScore - New trust score (0-100)
 * @param {string} reason - Reason for score update
 * @returns {Promise<boolean>} Success status
 */
export async function updateTrustScore(fingerprintHash, newScore, reason) {
  const device = await getDevice(fingerprintHash);
  if (!device) return false;
  
  const oldScore = device.trustScore;
  device.trustScore = Math.max(0, Math.min(100, newScore));
  device.lastScoreUpdate = {
    timestamp: Date.now(),
    oldScore,
    newScore: device.trustScore,
    reason,
  };
  
  const deviceKey = `${DEVICE_PREFIX}${fingerprintHash}`;
  
  try {
    if (isRedisAvailable() && redis) {
      await redis.setex(deviceKey, DEVICE_TTL, JSON.stringify(device));
    } else {
      memoryDevices.set(fingerprintHash, device);
    }
    
    console.log(`[DeviceRegistry] Updated trust score for ${fingerprintHash.substring(0, 16)}... from ${oldScore} to ${device.trustScore} (${reason})`);
    return true;
  } catch (error) {
    console.error('[DeviceRegistry] Error updating trust score:', error);
    return false;
  }
}

/**
 * Block a device
 * @param {string} fingerprintHash - Device fingerprint hash
 * @param {string} reason - Reason for blocking
 * @param {number} durationSeconds - Block duration in seconds (0 = permanent)
 * @returns {Promise<boolean>} Success status
 */
export async function blockDevice(fingerprintHash, reason, durationSeconds = 0) {
  const device = await getDevice(fingerprintHash);
  if (!device) return false;
  
  device.isBlocked = true;
  device.blockReason = reason;
  device.blockedAt = Date.now();
  device.blockDuration = durationSeconds;
  
  const deviceKey = `${DEVICE_PREFIX}${fingerprintHash}`;
  const blockedKey = `${BLOCKED_DEVICE_PREFIX}${fingerprintHash}`;
  
  try {
    // Update device record
    if (isRedisAvailable() && redis) {
      await redis.setex(deviceKey, DEVICE_TTL, JSON.stringify(device));
      
      // Add to blocked list
      const ttl = durationSeconds || DEVICE_TTL;
      await redis.setex(blockedKey, ttl, JSON.stringify({
        reason,
        blockedAt: device.blockedAt,
        expiresAt: durationSeconds ? device.blockedAt + (durationSeconds * 1000) : null,
      }));
    } else {
      memoryDevices.set(fingerprintHash, device);
      blockedDevices.add(fingerprintHash);
    }
    
    console.log(`[DeviceRegistry] Blocked device ${fingerprintHash.substring(0, 16)}... for ${reason}`);
    return true;
  } catch (error) {
    console.error('[DeviceRegistry] Error blocking device:', error);
    return false;
  }
}

/**
 * Unblock a device
 * @param {string} fingerprintHash - Device fingerprint hash
 * @returns {Promise<boolean>} Success status
 */
export async function unblockDevice(fingerprintHash) {
  const device = await getDevice(fingerprintHash);
  if (!device) return false;
  
  device.isBlocked = false;
  device.blockReason = null;
  device.unblockedAt = Date.now();
  
  const deviceKey = `${DEVICE_PREFIX}${fingerprintHash}`;
  const blockedKey = `${BLOCKED_DEVICE_PREFIX}${fingerprintHash}`;
  
  try {
    if (isRedisAvailable() && redis) {
      await redis.setex(deviceKey, DEVICE_TTL, JSON.stringify(device));
      await redis.del(blockedKey);
    } else {
      memoryDevices.set(fingerprintHash, device);
      blockedDevices.delete(fingerprintHash);
    }
    
    console.log(`[DeviceRegistry] Unblocked device ${fingerprintHash.substring(0, 16)}...`);
    return true;
  } catch (error) {
    console.error('[DeviceRegistry] Error unblocking device:', error);
    return false;
  }
}

/**
 * Check if device is blocked
 * @param {string} fingerprintHash - Device fingerprint hash
 * @returns {Promise<Object>} Block status
 */
export async function isDeviceBlocked(fingerprintHash) {
  const blockedKey = `${BLOCKED_DEVICE_PREFIX}${fingerprintHash}`;
  
  try {
    if (isRedisAvailable() && redis) {
      const blockDataStr = await redis.get(blockedKey);
      if (!blockDataStr) {
        return { blocked: false };
      }
      
      const blockData = JSON.parse(blockDataStr);
      
      // Check if temporary block has expired
      if (blockData.expiresAt && Date.now() > blockData.expiresAt) {
        await unblockDevice(fingerprintHash);
        return { blocked: false };
      }
      
      return {
        blocked: true,
        reason: blockData.reason,
        blockedAt: blockData.blockedAt,
        expiresAt: blockData.expiresAt,
      };
    } else {
      if (blockedDevices.has(fingerprintHash)) {
        const device = memoryDevices.get(fingerprintHash);
        return {
          blocked: true,
          reason: device?.blockReason || 'unknown',
          blockedAt: device?.blockedAt || Date.now(),
        };
      }
      return { blocked: false };
    }
  } catch (error) {
    console.error('[DeviceRegistry] Error checking if device blocked:', error);
    return { blocked: false };
  }
}

/**
 * Record suspicious activity
 * @param {string} fingerprintHash - Device fingerprint hash
 * @param {string} activityType - Type of suspicious activity
 * @param {Object} details - Activity details
 * @returns {Promise<number>} Total suspicious activity count
 */
export async function recordSuspiciousActivity(fingerprintHash, activityType, details) {
  const device = await getDevice(fingerprintHash);
  if (!device) return 0;
  
  device.suspiciousActivityCount = (device.suspiciousActivityCount || 0) + 1;
  device.lastActivity = {
    timestamp: Date.now(),
    type: 'suspicious',
    activityType,
    details,
  };
  
  // Deduct trust score
  const scorePenalty = 10;
  device.trustScore = Math.max(0, device.trustScore - scorePenalty);
  
  const deviceKey = `${DEVICE_PREFIX}${fingerprintHash}`;
  
  try {
    if (isRedisAvailable() && redis) {
      await redis.setex(deviceKey, DEVICE_TTL, JSON.stringify(device));
    } else {
      memoryDevices.set(fingerprintHash, device);
    }
    
    console.log(`[DeviceRegistry] Recorded suspicious activity for ${fingerprintHash.substring(0, 16)}... (${activityType}), count: ${device.suspiciousActivityCount}`);
    
    // Auto-block if too many suspicious activities
    if (device.suspiciousActivityCount >= 5) {
      await blockDevice(fingerprintHash, `Too many suspicious activities (${device.suspiciousActivityCount})`, 3600); // 1 hour
    }
    
    return device.suspiciousActivityCount;
  } catch (error) {
    console.error('[DeviceRegistry] Error recording suspicious activity:', error);
    return 0;
  }
}

/**
 * Validate device fingerprint consistency
 * @param {string} fingerprintHash - Current fingerprint hash
 * @param {Object} fingerprint - Current fingerprint data
 * @returns {Promise<Object>} Validation result
 */
export async function validateDeviceFingerprint(fingerprintHash, fingerprint) {
  const device = await getDevice(fingerprintHash);
  
  if (!device) {
    return {
      valid: true,
      isNew: true,
      message: 'New device',
    };
  }
  
  // Check for suspicious fingerprint changes
  const oldFingerprint = device.fingerprint;
  const changes = [];
  
  // Check critical properties
  const criticalProps = [
    'canvas',
    'webgl.vendor',
    'webgl.renderer',
    'screen.width',
    'screen.height',
    'navigator.platform',
  ];
  
  criticalProps.forEach(prop => {
    const parts = prop.split('.');
    let oldValue = oldFingerprint;
    let newValue = fingerprint;
    
    parts.forEach(part => {
      oldValue = oldValue?.[part];
      newValue = newValue?.[part];
    });
    
    if (oldValue !== newValue && oldValue !== undefined && newValue !== undefined) {
      changes.push({ property: prop, changed: true });
    }
  });
  
  const suspicious = changes.length >= 2;
  
  if (suspicious) {
    await recordSuspiciousActivity(fingerprintHash, 'fingerprint-mismatch', { changes });
  }
  
  return {
    valid: !suspicious,
    isNew: false,
    suspicious,
    changes,
    message: suspicious ? 'Fingerprint has suspicious changes' : 'Fingerprint consistent',
  };
}

/**
 * Get device registry statistics
 * @returns {Promise<Object>} Statistics
 */
export async function getDeviceStats() {
  try {
    if (isRedisAvailable() && redis) {
      const deviceKeys = await redis.keys(`${DEVICE_PREFIX}*`);
      const blockedKeys = await redis.keys(`${BLOCKED_DEVICE_PREFIX}*`);
      
      return {
        totalDevices: deviceKeys.length,
        blockedDevices: blockedKeys.length,
        storage: 'redis',
      };
    } else {
      return {
        totalDevices: memoryDevices.size,
        blockedDevices: blockedDevices.size,
        storage: 'memory',
      };
    }
  } catch (error) {
    console.error('[DeviceRegistry] Error getting stats:', error);
    return {
      totalDevices: 0,
      blockedDevices: 0,
      storage: 'error',
    };
  }
}

