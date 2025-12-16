import { SWRConfig } from 'swr';

/**
 * SWR Provider with environment-aware configuration
 * 
 * =============================================================================
 * LAYER 1: SWR CLIENT-SIDE CACHE (IN-MEMORY DEDUPLICATION)
 * =============================================================================
 * 
 * SWR is NOT a traditional cache - it's a request deduplication layer
 * 
 * PURPOSE:
 *   - Prevent duplicate API calls within same component lifecycle
 *   - Dedupe parallel requests with same key
 *   - Share loading state across components
 * 
 * NOT A CACHE BECAUSE:
 *   ✗ Data stored in memory only (lost on page reload)
 *   ✗ Short deduplication window (2s)
 *   ✗ No persistence across sessions
 *   ✗ No disk storage
 * 
 * =============================================================================
 * HOW IT WORKS
 * =============================================================================
 * 
 * Example: Two components call useProjectConfig() simultaneously
 * 
 * WITHOUT SWR:
 *   Component A → fetch() → API request 1
 *   Component B → fetch() → API request 2
 *   Result: 2 identical API calls
 * 
 * WITH SWR (dedupingInterval: 2000):
 *   Component A → useSWR(key) → fetch() → API request
 *   Component B → useSWR(key) → (within 2s, same key) → reuse promise from A
 *   Result: 1 API call, shared by both components
 * 
 * =============================================================================
 * INTERACTION WITH HTTP CACHE (Layer 2)
 * =============================================================================
 * 
 * Flow when SWR misses (after 2s):
 *   1. SWR → fetch() call
 *   2. Browser checks HTTP cache
 *   3. If fresh → return from disk cache (no network)
 *   4. If stale → send If-None-Match header
 *   5. Server responds 304 or 200
 * 
 * This means:
 *   - SWR dedupe (2s) = ultra-fast (in-memory)
 *   - HTTP cache (24h) = fast (disk cache)
 *   - Redis cache (24h) = medium (server-side)
 *   - Infura RPC = slow (blockchain query)
 * 
 * =============================================================================
 * CONFIGURATION
 * =============================================================================
 * 
 * dedupingInterval: 2000
 *   - Reuse data if same key requested within 2s
 *   - Prevents thundering herd on component mount
 * 
 * revalidateOnFocus: false
 *   - Don't refetch when user switches back to tab
 *   - Rely on HTTP cache instead
 * 
 * revalidateOnReconnect: true
 *   - Refetch when network reconnects
 *   - Ensures fresh data after offline period
 * 
 * =============================================================================
 */
export function SWRProvider({ children }) {
  // Read SWR cache config from environment (injected at build time)
  const swrCacheEnabled = import.meta.env.VITE_ENABLE_CACHE_SWR === 'true';
  
  // If SWR cache is disabled, set dedupingInterval to 0 and disable revalidation
  const swrConfig = swrCacheEnabled ? {
    // Cache enabled: normal SWR behavior
    dedupingInterval: 2000,        // Dedupe requests within 2s
    revalidateOnFocus: false,      // Don't refetch when tab focus (optional)
    revalidateOnReconnect: true,   // Refetch when network reconnects
    shouldRetryOnError: true,      // Auto retry on error
    errorRetryCount: 3,            // Retry 3 times max
    errorRetryInterval: 1000,      // 1s between retries
    keepPreviousData: true,
    onError: (error) => {
      console.error('[SWR] Error:', error);
    }
  } : {
    // Cache disabled: always fetch fresh data
    dedupingInterval: 0,           // No deduplication
    revalidateOnFocus: false,      // Don't refetch on focus
    revalidateOnReconnect: false,  // Don't refetch on reconnect
    shouldRetryOnError: true,      // Still retry on error
    errorRetryCount: 3,
    errorRetryInterval: 1000,
    keepPreviousData: true,
    provider: () => new Map(),     // Disable cache persistence
    onError: (error) => {
      console.error('[SWR] Error:', error);
    }
  };
  
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}

