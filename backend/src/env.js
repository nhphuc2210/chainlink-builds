import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { applyEnvironmentConfig } from '../../config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// Environment Configuration Loading
// =============================================================================
// 1. First load secrets from .env file (API_KEY, HMAC_SECRET, INFURA_KEYS)
// 2. Then apply environment-specific configs from config/environment.js
// 3. Secrets from .env take precedence and won't be overridden

// Load secrets from .env file
dotenv.config({ path: join(__dirname, '../../.env') });

// Apply environment-specific configuration
// This sets all non-secret env vars based on NODE_ENV (development/production)
const env = process.env.NODE_ENV || 'development';
applyEnvironmentConfig(env);

// Log loaded configuration (excluding secrets)
console.log(`[env] Environment: ${env}`);
console.log(`[env] Redis Service (infrastructure): ${process.env.ENABLE_REDIS === 'true' ? 'ENABLED' : 'DISABLED'}`);
console.log(`[env] Cache Layer 1 - SWR: ${process.env.ENABLE_CACHE_SWR === 'true' ? 'ENABLED' : 'DISABLED'}`);
console.log(`[env] Cache Layer 2 - HTTP (eTag): ${process.env.ENABLE_CACHE_HTTP === 'true' ? 'ENABLED' : 'DISABLED'}`);
console.log(`[env] Cache Layer 3 - Redis: ${process.env.ENABLE_CACHE_REDIS === 'true' ? 'ENABLED (Redis)' : 'DISABLED (In-Memory)'}`);
console.log(`[env] Server: ${process.env.HOST}:${process.env.PORT}`);

