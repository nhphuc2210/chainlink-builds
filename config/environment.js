/**
 * Centralized Environment Configuration
 * 
 * This file contains all environment-specific configurations for development and production.
 * Package.json scripts only need to pass NODE_ENV, and all other configs are handled here.
 * 
 * Secrets (API_KEY, HMAC_SECRET, INFURA_KEYS) should still be stored in .env file.
 */

// =============================================================================
// Environment Configurations
// =============================================================================
// Three environments:
// 1. development: Local development with hot reload (pnpm run local:dev)
// 2. local-production: Production build running locally WITHOUT Redis (pnpm run local:prod)
// 3. production: Full production deployment WITH Redis (deployed to server)

const environments = {
  development: {
    // Node environment
    NODE_ENV: 'development',
    
    // Server configuration
    PORT: '7000',
    HOST: 'localhost',
    
    // Cache configuration
    // Redis service: server-side cache + nonce storage (infrastructure)
    ENABLE_REDIS: 'false',
    // Cache Layer 1: SWR in-memory deduplication (2s)
    ENABLE_CACHE_SWR: 'true',
    // Cache Layer 2: HTTP Cache-Control headers + eTag validation (browser/CDN)
    ENABLE_CACHE_HTTP: 'true',
    // Cache Layer 3: Redis cache (depends on ENABLE_REDIS, fallback to in-memory Map)
    ENABLE_CACHE_REDIS: 'false',
    
    // Build configuration
    ENABLE_OBFUSCATION: 'false',
    ENABLE_CHUNKS: 'false',
    ENABLE_SOURCEMAP: 'false',
    
    // Security configuration
    FORCE_SECURITY: 'false',
    CORS_ALLOW_ALL: 'true',
    
    // Security feature flags (performance optimization)
    ENABLE_FINGERPRINT_AUDIO: 'false',
    ENABLE_FONT_DETECTION: 'false',
    ENABLE_CANVAS_FINGERPRINT: 'false',
    ENABLE_WEBGL_FINGERPRINT: 'false',
    ENABLE_BROWSER_INTEGRITY: 'false',
    ENABLE_POISONING_DETECTION: 'false',
    ENABLE_BEHAVIOR_TRACKING: 'false',
    
    // Frontend development URL
    DEV_FRONTEND_URL: 'http://localhost:5173',
    
    // Redis configuration
    REDIS_URL: 'redis://localhost:6379',
  },
  
  'local-production': {
    // Node environment (production mode but running locally)
    NODE_ENV: 'production',
    
    // Server configuration
    PORT: '7000',
    HOST: 'localhost',
    
    // Cache configuration
    // Redis service: DISABLED for local testing (no Redis setup required)
    ENABLE_REDIS: 'false',
    // Cache Layer 1: SWR in-memory deduplication (2s)
    ENABLE_CACHE_SWR: 'true',
    // Cache Layer 2: HTTP Cache-Control headers + eTag validation (browser/CDN)
    ENABLE_CACHE_HTTP: 'true',
    // Cache Layer 3: Redis cache (depends on ENABLE_REDIS, fallback to in-memory Map)
    ENABLE_CACHE_REDIS: 'false',
    
    // Build configuration
    ENABLE_OBFUSCATION: 'true',
    ENABLE_CHUNKS: 'true',
    ENABLE_SOURCEMAP: 'false',
    
    // Security configuration
    FORCE_SECURITY: 'false',
    CORS_ALLOW_ALL: 'false',
    
    // Security feature flags (performance optimization)
    ENABLE_FINGERPRINT_AUDIO: 'false',
    ENABLE_FONT_DETECTION: 'false',
    ENABLE_CANVAS_FINGERPRINT: 'false',
    ENABLE_WEBGL_FINGERPRINT: 'false',
    ENABLE_BROWSER_INTEGRITY: 'false',
    ENABLE_POISONING_DETECTION: 'false',
    ENABLE_BEHAVIOR_TRACKING: 'false',
    
    // Redis configuration (not used since ENABLE_REDIS=false)
    REDIS_URL: 'redis://localhost:6379',
  },
  
  production: {
    // Node environment
    NODE_ENV: 'production',
    
    // Server configuration
    PORT: '7000',
    HOST: '0.0.0.0',
    
    // Cache configuration
    // Redis service: server-side cache + nonce storage (infrastructure)
    ENABLE_REDIS: 'true',
    // Cache Layer 1: SWR in-memory deduplication (2s)
    ENABLE_CACHE_SWR: 'true',
    // Cache Layer 2: HTTP Cache-Control headers + eTag validation (browser/CDN)
    ENABLE_CACHE_HTTP: 'true',
    // Cache Layer 3: Redis cache (uses Redis service when available)
    ENABLE_CACHE_REDIS: 'true',
    
    // Build configuration
    ENABLE_OBFUSCATION: 'true',
    ENABLE_CHUNKS: 'true',
    ENABLE_SOURCEMAP: 'false',
    
    // Security configuration
    FORCE_SECURITY: 'false', // Security is enabled by default in production
    CORS_ALLOW_ALL: 'false',
    
    // Security feature flags (performance optimization)
    ENABLE_FINGERPRINT_AUDIO: 'false',
    ENABLE_FONT_DETECTION: 'false',
    ENABLE_CANVAS_FINGERPRINT: 'false',
    ENABLE_WEBGL_FINGERPRINT: 'false',
    ENABLE_BROWSER_INTEGRITY: 'false',
    ENABLE_POISONING_DETECTION: 'false',
    ENABLE_BEHAVIOR_TRACKING: 'false',
    
    // Redis configuration
    REDIS_URL: 'redis://localhost:6379',
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get environment configuration based on NODE_ENV
 * @param {string} env - Environment name ('development', 'local-production', or 'production')
 * @returns {Object} Environment configuration object
 */
export function getEnvironmentConfig(env = 'development') {
  const normalizedEnv = env?.toLowerCase() || 'development';
  
  // Return the matching environment or fallback to development
  return environments[normalizedEnv] || environments.development;
}

/**
 * Get a flattened object of all environment variables
 * Useful for setting process.env in bulk
 * @param {string} env - Environment name
 * @returns {Object} Flattened environment variables
 */
export function getFlattenedConfig(env = 'development') {
  const config = getEnvironmentConfig(env);
  return config;
}

/**
 * Apply environment config to process.env
 * Does NOT override existing values (secrets from .env are preserved)
 * @param {string} env - Environment name
 */
export function applyEnvironmentConfig(env = 'development') {
  const config = getFlattenedConfig(env);
  
  Object.entries(config).forEach(([key, value]) => {
    // Only set if not already defined (preserve .env secrets)
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

// =============================================================================
// Typed Helpers (for better developer experience)
// =============================================================================

/**
 * Check if Redis is enabled (server-side cache + nonce storage)
 * @returns {boolean}
 */
export function isRedisEnabled() {
  return process.env.ENABLE_REDIS === 'true';
}

/**
 * Check if SWR cache is enabled (Layer 1: in-memory deduplication)
 * @returns {boolean}
 */
export function isCacheSWREnabled() {
  return process.env.ENABLE_CACHE_SWR === 'true';
}

/**
 * Check if HTTP cache headers are enabled (Layer 2: Cache-Control + eTag)
 * @returns {boolean}
 */
export function isCacheHTTPEnabled() {
  return process.env.ENABLE_CACHE_HTTP === 'true';
}

/**
 * Check if Redis cache is enabled (Layer 3: server-side cache)
 * @returns {boolean}
 */
export function isCacheRedisEnabled() {
  return process.env.ENABLE_CACHE_REDIS === 'true';
}

/**
 * Check if obfuscation is enabled
 * @returns {boolean}
 */
export function isObfuscationEnabled() {
  return process.env.ENABLE_OBFUSCATION === 'true';
}

/**
 * Check if code chunking is enabled
 * @returns {boolean}
 */
export function isChunkingEnabled() {
  return process.env.ENABLE_CHUNKS === 'true';
}

/**
 * Check if in production mode
 * @returns {boolean}
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if in development mode
 * @returns {boolean}
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

// Default export
export default {
  getEnvironmentConfig,
  getFlattenedConfig,
  applyEnvironmentConfig,
  isRedisEnabled,
  isCacheSWREnabled,
  isCacheHTTPEnabled,
  isCacheRedisEnabled,
  isObfuscationEnabled,
  isChunkingEnabled,
  isProduction,
  isDevelopment,
};

