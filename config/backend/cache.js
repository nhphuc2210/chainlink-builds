// Redis Cache Configuration (TTL values in seconds)
export const CACHE_CONFIG = {
  ttl: {
    projectConfig: 86400,        // 24 hours
    projectConfigStale: 172800,  // 48 hours (stale-while-revalidate)
    globalState: 3600,           // 1 hour
    globalStateStale: 7200,      // 2 hours (stale-while-revalidate)
    userClaim: 3600,             // 1 hour
    userClaimStale: 7200         // 2 hours (stale-while-revalidate)
  },
  keyPrefixes: {
    projectConfig: 'app:blockchain:project:',
    globalState: 'app:blockchain:global:',
    userClaim: 'app:blockchain:user:'
  },
  redis: {
    maxRetriesPerRequest: 3,
    retryDelayMs: 200,
    maxRetryDelayMs: 1000
  }
};

// HTTP Cache Presets (for Cache-Control headers and ETag)
export const CACHE_PRESETS = {
  // Project configuration (rarely changes)
  projectConfig: {
    maxAge: 86400,              // 24 hours in seconds
    staleWhileRevalidate: 172800, // 48 hours in seconds
    isPublic: true
  },
  
  // Global state (changes frequently)
  globalState: {
    maxAge: 3600,               // 1 hour in seconds
    staleWhileRevalidate: 7200, // 2 hours in seconds
    isPublic: true
  },
  
  // User claim data (private per-user)
  userClaim: {
    maxAge: 3600,               // 1 hour in seconds
    staleWhileRevalidate: 0,    // No stale serving for private data
    isPublic: false
  },
  
  // Static assets with hash in filename (immutable)
  immutable: {
    maxAge: 31536000,           // 1 year in seconds
    immutable: true,
    isPublic: true
  },
  
  // HTML files (always revalidate)
  noCache: {
    maxAge: 0,
    mustRevalidate: true,
    isPublic: true
  }
};
