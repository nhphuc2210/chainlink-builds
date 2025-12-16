/**
 * Shared Redis Client (Singleton)
 * 
 * This module provides a single Redis connection instance shared across all modules.
 * Benefits:
 * - Single connection instead of multiple duplicate connections
 * - Centralized configuration
 * - No "already connecting" warnings
 * - Better resource management
 * 
 * Usage:
 * ```javascript
 * import { getRedisClient, isRedisAvailable } from '../utils/redis.js';
 * 
 * const redis = getRedisClient();
 * if (isRedisAvailable()) {
 *   await redis.set('key', 'value');
 * }
 * ```
 */

import Redis from 'ioredis';

// Singleton instance
let redisClient = null;
let redisAvailable = false;
let initializationPromise = null;

// Metrics tracking
let metrics = {
  totalConnections: 0,
  totalDisconnections: 0,
  totalErrors: 0,
  totalReconnects: 0,
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  lastErrorAt: null,
  fallbackUsageCount: 0
};

// Health check interval
let healthCheckInterval = null;

/**
 * Initialize Redis connection (called once)
 * @returns {Promise<Redis|null>}
 */
async function initializeRedis() {
  // Check if Redis is enabled
  const redisEnabled = process.env.ENABLE_REDIS === 'true';
  
  if (!redisEnabled) {
    console.log('[Redis] DISABLED (ENABLE_REDIS=false)');
    return null;
  }
  
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return Math.min(times * 100, 1000); // Exponential backoff: 100ms, 200ms, 300ms
      },
      enableOfflineQueue: true,
      enableReadyCheck: true,
    });
    
    // Event handlers with metrics tracking
    redisClient.on('connect', () => {
      console.log('[Redis] ✅ Connected successfully');
      redisAvailable = true;
      metrics.totalConnections++;
      metrics.lastConnectedAt = new Date().toISOString();
    });
    
    redisClient.on('ready', () => {
      console.log('[Redis] ✅ Ready to accept commands');
      redisAvailable = true;
    });
    
    redisClient.on('error', (err) => {
      console.warn('[Redis] ⚠️ Error:', err.message);
      redisAvailable = false;
      metrics.totalErrors++;
      metrics.lastErrorAt = new Date().toISOString();
    });
    
    redisClient.on('close', () => {
      console.warn('[Redis] Connection closed');
      redisAvailable = false;
      metrics.totalDisconnections++;
      metrics.lastDisconnectedAt = new Date().toISOString();
    });
    
    redisClient.on('reconnecting', () => {
      console.log('[Redis] Reconnecting...');
      redisAvailable = false;
      metrics.totalReconnects++;
    });
    
    // Attempt to connect
    await redisClient.connect();
    
    return redisClient;
  } catch (err) {
    console.warn('[Redis] ❌ Connection failed:', err.message);
    console.warn('[Redis] Falling back to in-memory storage');
    redisAvailable = false;
    redisClient = null;
    return null;
  }
}

/**
 * Get Redis client instance (creates connection on first call)
 * @returns {Redis|null} Redis client or null if disabled/failed
 */
export function getRedisClient() {
  // Return existing client if already initialized
  if (redisClient !== null || initializationPromise !== null) {
    return redisClient;
  }
  
  // Initialize on first call (but don't await - return null for now)
  if (!initializationPromise) {
    initializationPromise = initializeRedis();
  }
  
  return redisClient;
}

/**
 * Check if Redis is available and connected
 * @returns {boolean} True if Redis is ready to use
 */
export function isRedisAvailable() {
  return redisAvailable && redisClient !== null && redisClient.status === 'ready';
}

/**
 * Wait for Redis initialization to complete
 * @returns {Promise<Redis|null>}
 */
export async function waitForRedis() {
  if (initializationPromise) {
    await initializationPromise;
  }
  return redisClient;
}

/**
 * Close Redis connection gracefully
 * @returns {Promise<void>}
 */
export async function closeRedis() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
  
  if (redisClient) {
    console.log('[Redis] Closing connection...');
    await redisClient.quit();
    redisClient = null;
    redisAvailable = false;
    initializationPromise = null;
  }
}

/**
 * Get Redis metrics for monitoring
 * @returns {Object} Metrics object
 */
export function getRedisMetrics() {
  return {
    ...metrics,
    currentStatus: {
      enabled: process.env.ENABLE_REDIS === 'true',
      available: isRedisAvailable(),
      clientStatus: redisClient?.status || 'not_initialized',
      usingFallback: !isRedisAvailable()
    }
  };
}

/**
 * Increment fallback usage counter (called by services when using memory fallback)
 */
export function incrementFallbackUsage() {
  metrics.fallbackUsageCount++;
}

/**
 * Start periodic health check and auto-reconnect
 */
function startHealthCheck() {
  // Only start health check if Redis is enabled
  const redisEnabled = process.env.ENABLE_REDIS === 'true';
  if (!redisEnabled) {
    return;
  }
  
  // Check every 60 seconds
  healthCheckInterval = setInterval(async () => {
    // Only try to reconnect if:
    // 1. Redis is enabled
    // 2. Not currently available
    // 3. Not already connecting
    // 4. Client is null (connection was lost)
    if (!isRedisAvailable() && redisClient === null && !initializationPromise) {
      console.log('[Redis] Health check: Attempting auto-reconnect...');
      initializationPromise = initializeRedis();
      
      try {
        await initializationPromise;
        if (isRedisAvailable()) {
          console.log('[Redis] ✅ Auto-reconnect successful');
        }
      } catch (err) {
        console.warn('[Redis] ⚠️ Auto-reconnect failed:', err.message);
      } finally {
        initializationPromise = null;
      }
    }
  }, 60000); // 60 seconds
  
  console.log('[Redis] Health check started (interval: 60s)');
}

// Initialize Redis on module load
initializeRedis()
  .then(() => {
    // Start health check after initialization
    startHealthCheck();
  })
  .catch((err) => {
    console.warn('[Redis] Initialization failed:', err.message);
    // Still start health check to attempt reconnect
    startHealthCheck();
  });

// Graceful shutdown on process termination
process.on('SIGTERM', async () => {
  await closeRedis();
});

process.on('SIGINT', async () => {
  await closeRedis();
});

