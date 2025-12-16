import { ethers } from 'ethers';
import { pack, unpack } from 'msgpackr';
import { BUILD_FACTORY_ADDRESS, BUILD_FACTORY_ABI, BUILD_CLAIM_ABI, PROJECTS_MAP } from '../../../config/shared/contracts.js';
import { CACHE_CONFIG } from '../../../config/backend/cache.js';
import { BLOCKCHAIN_CONSTANTS, API_DEFAULTS } from '../../../config/backend/constants.js'; // Import API_DEFAULTS
import { validateProjectAndGet } from '../utils/blockchainUtils.js'; // Import new helper
import { getRedisClient, isRedisAvailable, incrementFallbackUsage } from '../utils/redis.js'; // Shared Redis client

// =============================================================================
// LAYER 3: REDIS SERVER-SIDE CACHE
// =============================================================================
// 
// PURPOSE:
//   - Reduce Infura RPC calls (expensive, rate-limited)
//   - Provide fast response for repeated requests across all clients
//   - Fallback to stale cache when Infura fails
// 
// CACHE STRATEGY: Dual TTL (Primary + Stale)
//   Primary cache: TTL = 24h (projectConfig) or 1h (globalState, userClaim)
//   Stale cache:   TTL = 48h (projectConfig) or 2h (globalState, userClaim)
// 
// FLOW:
//   1. Check primary cache (app:blockchain:project:0x...)
//   2. If HIT → return immediately (X-Cache-Status: HIT)
//   3. If MISS → check stale cache (app:blockchain:project:0x...:stale)
//   4. If stale HIT → return with warning (X-Cache-Status: STALE)
//   5. If stale MISS → fetch from Infura (X-Cache-Status: MISS)
//   6. Cache result in both primary and stale
// 
// WHY STALE CACHE?
//   - Infura outage: serve stale data instead of error
//   - Rate limiting: avoid hitting Infura rate limits
//   - Reliability: 2x longer TTL = more resilient
// 
// CACHE DATA STRUCTURE:
//   Key: app:blockchain:project:0xtoken:seasonId
//   Value: msgpack({ data: {...}, timestamp: 1234567890 })
//   TTL: 86400s (primary), 172800s (stale)
// 
// =============================================================================
const isDevelopment = process.env.NODE_ENV === 'development';

// Cache TTL Constants (in seconds) - from centralized config
const TTL = {
  PROJECT_CONFIG: CACHE_CONFIG.ttl.projectConfig,
  PROJECT_CONFIG_STALE: CACHE_CONFIG.ttl.projectConfigStale,
  GLOBAL_STATE: CACHE_CONFIG.ttl.globalState,
  GLOBAL_STATE_STALE: CACHE_CONFIG.ttl.globalStateStale,
  USER_CLAIM: CACHE_CONFIG.ttl.userClaim,
  USER_CLAIM_STALE: CACHE_CONFIG.ttl.userClaimStale,
};

// Use shared Redis client
const redis = getRedisClient();

// In-memory cache fallback (when Redis is disabled or unavailable)
// Structure: Map<key, {data, timestamp, ttl, staleTtl}>
const memoryCache = new Map();

// In-flight request tracking (promise deduplication)
const inFlightRequests = new Map();

// =============================================================================
// Infura Key Management
// =============================================================================

// Load Infura API keys from environment
function getInfuraKeys() {
  const keys = process.env.INFURA_API_KEYS?.split(',') || [];
  if (keys.length === 0) {
    console.error('[blockchain] INFURA_API_KEYS is required!');
    throw new Error('Missing INFURA_API_KEYS environment variable');
  }
  return keys;
}

/**
 * Get a random Infura URL (for load balancing and retry with different key)
 * @param {string[]} excludeKeys - Keys to exclude from selection
 */
export function getRandomInfuraUrl(excludeKeys = []) {
  const allKeys = getInfuraKeys();
  const availableKeys = allKeys.filter(key => !excludeKeys.includes(key));
  
  if (availableKeys.length === 0) {
    // No keys left, use any key
    const key = allKeys[Math.floor(Math.random() * allKeys.length)];
    return { url: `${BLOCKCHAIN_CONSTANTS.INFURA_MAINNET_BASE_URL}${key}`, key };
  }
  
  const key = availableKeys[Math.floor(Math.random() * availableKeys.length)];
  return { url: `${BLOCKCHAIN_CONSTANTS.INFURA_MAINNET_BASE_URL}${key}`, key };
}

export function getProject(tokenAddress) {
  return PROJECTS_MAP[tokenAddress.toLowerCase()];
}

// =============================================================================
// Cache Helper Functions
// =============================================================================

/**
 * Get cached data from in-memory Map (checks both primary and stale cache)
 * @param {string} key - Cache key
 * @returns {{data: any, isStale: boolean, timestamp: number} | null}
 */
function getCachedDataFromMemory(key) {
  incrementFallbackUsage(); // Track fallback usage
  
  const cached = memoryCache.get(key);
  if (!cached) {
    // Try stale cache
    const staleKey = `${key}:stale`;
    const staleCached = memoryCache.get(staleKey);
    if (!staleCached) {
      console.log(`[MemCache] ✗ MISS - ${key} (fallback mode)`);
      return null;
    }
    
    const now = Date.now();
    const age = (now - staleCached.timestamp) / 1000;
    
    if (age < staleCached.staleTtl) {
      console.log(`[MemCache] ⚠ STALE - ${key} (fallback mode)`);
      return {
        data: staleCached.data,
        isStale: true,
        timestamp: staleCached.timestamp
      };
    }
    
    // Expired
    memoryCache.delete(staleKey);
    console.log(`[MemCache] ✗ MISS - ${key} (fallback mode)`);
    return null;
  }
  
  const now = Date.now();
  const age = (now - cached.timestamp) / 1000;
  
  if (age < cached.ttl) {
    console.log(`[MemCache] ✓ HIT - ${key} (fallback mode)`);
    return {
      data: cached.data,
      isStale: false,
      timestamp: cached.timestamp
    };
  }
  
  // Primary expired, try stale
  const staleKey = `${key}:stale`;
  const staleCached = memoryCache.get(staleKey);
  if (staleCached && (now - staleCached.timestamp) / 1000 < staleCached.staleTtl) {
    console.log(`[MemCache] ⚠ STALE - ${key} (fallback mode)`);
    // Delete expired primary
    memoryCache.delete(key);
    return {
      data: staleCached.data,
      isStale: true,
      timestamp: staleCached.timestamp
    };
  }
  
  // Both expired
  memoryCache.delete(key);
  memoryCache.delete(staleKey);
  console.log(`[MemCache] ✗ MISS - ${key} (fallback mode)`);
  return null;
}

/**
 * Set cached data in in-memory Map with dual TTL (primary + stale)
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Primary TTL in seconds
 * @param {number} staleTtl - Stale TTL in seconds
 * @param {number} timestamp - Timestamp when data was fetched (milliseconds)
 */
function setCachedDataToMemory(key, data, ttl, staleTtl, timestamp = Date.now()) {
  // Set primary cache
  memoryCache.set(key, { data, timestamp, ttl, staleTtl });
  
  // Set stale cache (backup)
  const staleKey = `${key}:stale`;
  memoryCache.set(staleKey, { data, timestamp, ttl, staleTtl });
}

/**
 * Get cached data from Redis (checks both primary and stale cache)
 * Falls back to in-memory cache if Redis is unavailable
 * @param {string} key - Cache key
 * @returns {Promise<{data: any, isStale: boolean, timestamp: number} | null>}
 */
async function getCachedData(key) {
  // Check if cache is enabled
  const cacheEnabled = process.env.ENABLE_CACHE_REDIS === 'true';
  if (!cacheEnabled) {
    // Use in-memory cache when Redis cache is disabled
    return getCachedDataFromMemory(key);
  }
  
  // Try Redis first if available
  if (!isRedisAvailable() || !redis) {
    // Fallback to in-memory cache
    return getCachedDataFromMemory(key);
  }

  try {
    // Try primary cache first
    const primaryData = await redis.getBuffer(key);
    if (primaryData) {
      const unpacked = unpack(primaryData);
      console.log(`[Cache] ✓ HIT - ${key}`);
      return { 
        data: unpacked.data, 
        isStale: false,
        timestamp: unpacked.timestamp || Date.now()
      };
    }

    // Try stale cache
    const staleKey = `${key}:stale`;
    const staleData = await redis.getBuffer(staleKey);
    if (staleData) {
      const unpacked = unpack(staleData);
      console.log(`[Cache] ⚠ STALE - ${key}`);
      return { 
        data: unpacked.data, 
        isStale: true,
        timestamp: unpacked.timestamp || Date.now()
      };
    }

    console.log(`[Cache] ✗ MISS - ${key}`);
    return null;
  } catch (err) {
    console.warn('[Cache] Get failed:', err.message);
    return null;
  }
}

/**
 * Set cached data in Redis with dual TTL (primary + stale) and timestamp
 * Falls back to in-memory cache if Redis is unavailable
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Primary TTL in seconds
 * @param {number} staleTtl - Stale TTL in seconds
 * @param {number} timestamp - Timestamp when data was fetched (milliseconds)
 */
async function setCachedData(key, data, ttl, staleTtl, timestamp = Date.now()) {
  // Check if cache is enabled
  const cacheEnabled = process.env.ENABLE_CACHE_REDIS === 'true';
  if (!cacheEnabled) {
    // Use in-memory cache when Redis cache is disabled
    setCachedDataToMemory(key, data, ttl, staleTtl, timestamp);
    return;
  }
  
  // Try Redis first if available
  if (!isRedisAvailable() || !redis) {
    // Fallback to in-memory cache
    setCachedDataToMemory(key, data, ttl, staleTtl, timestamp);
    return;
  }

  try {
    // Pack data with timestamp for cache metadata
    const dataWithTimestamp = { data, timestamp };
    const packed = pack(dataWithTimestamp);
    
    // Set primary cache
    await redis.setex(key, ttl, packed);
    
    // Set stale cache (backup)
    const staleKey = `${key}:stale`;
    await redis.setex(staleKey, staleTtl, packed);
  } catch (err) {
    console.warn('[Cache] Set failed:', err.message);
  }
}

/**
 * Main caching wrapper with promise deduplication and retry logic
 * 
 * =============================================================================
 * CACHE FLOW DIAGRAM
 * =============================================================================
 * 
 * Request 1 (cold cache):
 *   withCache(key) → Redis GET (miss) → fetchFn() → Infura RPC
 *   → Redis SET (primary + stale) → return { data, cacheStatus: 'MISS' }
 * 
 * Request 2 (within TTL):
 *   withCache(key) → Redis GET (hit) → return { data, cacheStatus: 'HIT' }
 *   (no Infura call)
 * 
 * Request 3 (primary expired, stale valid):
 *   withCache(key) → Redis GET (miss) → Redis GET :stale (hit)
 *   → return { data, cacheStatus: 'STALE' }
 *   (no Infura call, but data is old)
 * 
 * Request 4 (Infura down, fallback to stale):
 *   withCache(key) → Redis GET (miss) → fetchFn() → Infura RPC (ERROR)
 *   → Redis GET :stale (hit) → return { data, cacheStatus: 'STALE' }
 * 
 * =============================================================================
 * PROMISE DEDUPLICATION (Thundering Herd Prevention)
 * =============================================================================
 * 
 * Problem: Multiple requests arrive simultaneously for same uncached key
 *   Request A → cache miss → fetch Infura
 *   Request B → cache miss → fetch Infura  ← DUPLICATE!
 *   Request C → cache miss → fetch Infura  ← DUPLICATE!
 * 
 * Solution: Track in-flight requests in memory Map
 *   Request A → cache miss → start fetch → save promise in Map
 *   Request B → cache miss → find promise in Map → wait for A
 *   Request C → cache miss → find promise in Map → wait for A
 *   → Only 1 Infura call for all 3 requests
 * 
 * =============================================================================
 * 
 * @param {string} key - Cache key
 * @param {number} ttl - Primary TTL in seconds
 * @param {number} staleTtl - Stale TTL in seconds
 * @param {Function} fetchFn - Function to fetch fresh data
 * @returns {Promise<{data: any, cacheStatus: 'HIT'|'MISS'|'STALE', timestamp: number}>}
 */
async function withCache(key, ttl, staleTtl, fetchFn) {
  // Check cache first
  const cached = await getCachedData(key);
  if (cached) {
    return {
      data: cached.data,
      cacheStatus: cached.isStale ? 'STALE' : 'HIT',
      timestamp: cached.timestamp
    };
  }

  // Check if request is already in-flight (promise deduplication)
  if (inFlightRequests.has(key)) {
    console.log(`[Cache] ⏳ WAITING for in-flight - ${key}`);
    const result = await inFlightRequests.get(key);
    return result;
  }

  // Create new request promise
  const requestPromise = (async () => {
    console.log(`[Cache] 🔄 FETCHING from Infura - ${key}`);
    const fetchTime = Date.now();
    
    try {
      // Fetch fresh data with retry logic
      const data = await fetchWithRetry(fetchFn);
      
      // Cache the result with timestamp
      await setCachedData(key, data, ttl, staleTtl, fetchTime);
      
      return {
        data,
        cacheStatus: 'MISS',
        timestamp: fetchTime
      };
    } catch (error) {
      // On error, try to use stale cache
      const staleKey = `${key}:stale`;
      const staleData = await redis?.getBuffer(staleKey).catch(() => null);
      
      if (staleData) {
        console.warn(`[Cache] Infura error, returning stale cache for: ${key}`);
        const unpacked = unpack(staleData);
        return {
          data: unpacked.data,
          cacheStatus: 'STALE',
          timestamp: unpacked.timestamp || Date.now()
        };
      }
      
      // No stale cache available, throw error
      throw error;
    } finally {
      // Remove from in-flight tracking
      inFlightRequests.delete(key);
    }
  })();

  // Track in-flight request
  inFlightRequests.set(key, requestPromise);

  return requestPromise;
}

/**
 * Fetch data with retry using different Infura keys
 * @param {Function} fetchFn - Function that accepts Infura URL
 * @returns {Promise<any>}
 */
async function fetchWithRetry(fetchFn) {
  const usedKeys = [];
  let lastError;

  // First attempt
  try {
    const { url: url1, key: key1 } = getRandomInfuraUrl();
    usedKeys.push(key1);
    console.log(`[Infura] Attempt 1 with key: ${key1.substring(0, 8)}...`);
    return await fetchFn(url1);
  } catch (error) {
    console.warn(`[Infura] ✗ Attempt 1 failed: ${error.message}`);
    lastError = error;
  }

  // Second attempt with different key
  try {
    const { url: url2, key: key2 } = getRandomInfuraUrl(usedKeys);
    console.log(`[Infura] Attempt 2 with key: ${key2.substring(0, 8)}...`);
    return await fetchFn(url2);
  } catch (error) {
    console.error(`[Infura] ✗ Attempt 2 failed: ${error.message}`);
    lastError = error;
  }

  // Both attempts failed
  throw lastError;
}

// =============================================================================
// Blockchain Data Fetchers (Cached)
// =============================================================================

/**
 * Fetch project configuration with caching
 * Cache: 24h primary, 48h stale
 */
export async function fetchProjectConfig(tokenAddress, seasonId = API_DEFAULTS.DEFAULT_SEASON_ID) {
  const project = validateProjectAndGet(tokenAddress);

  const cacheKey = `${CACHE_CONFIG.keyPrefixes.projectConfig}${tokenAddress.toLowerCase()}:${seasonId}`;

  const fetchFn = async (infuraUrl) => {
    const provider = new ethers.JsonRpcProvider(infuraUrl);
    const factoryContract = new ethers.Contract(BUILD_FACTORY_ADDRESS, BUILD_FACTORY_ABI, provider);

    const [projectSeasonConfig, unlockStartTime] = await factoryContract.getProjectSeasonConfig(tokenAddress, seasonId);
    const tokenAmounts = await factoryContract.getTokenAmounts(tokenAddress);

    // Structure data by function names
    return {
      get_project_season_config: {
        tokenAmount: Number(ethers.formatUnits(projectSeasonConfig.tokenAmount, project.decimals)),
        tokenAmountRaw: projectSeasonConfig.tokenAmount.toString(),
        merkleRoot: projectSeasonConfig.merkleRoot,
        unlockDelay: Number(projectSeasonConfig.unlockDelay),
        unlockDuration: Number(projectSeasonConfig.unlockDuration),
        unlockDurationDays: Math.round(Number(projectSeasonConfig.unlockDuration) / 86400),
        earlyVestRatioMinBps: Number(projectSeasonConfig.earlyVestRatioMinBps),
        earlyVestRatioMaxBps: Number(projectSeasonConfig.earlyVestRatioMaxBps),
        baseTokenClaimBps: Number(projectSeasonConfig.baseTokenClaimBps),
        isRefunding: projectSeasonConfig.isRefunding,
        seasonUnlockStartTime: Number(unlockStartTime),
        seasonUnlockStartTimeFormatted: unlockStartTime > 0
          ? new Date(Number(unlockStartTime) * 1000).toISOString().split("T")[0]
          : null,
      },
      get_token_amounts: {
        totalDeposited: Number(ethers.formatUnits(tokenAmounts.totalDeposited, project.decimals)),
        totalDepositedRaw: tokenAmounts.totalDeposited.toString(),
        totalWithdrawn: Number(ethers.formatUnits(tokenAmounts.totalWithdrawn, project.decimals)),
        totalWithdrawnRaw: tokenAmounts.totalWithdrawn.toString(),
        totalAllocatedToAllSeasons: Number(ethers.formatUnits(tokenAmounts.totalAllocatedToAllSeasons, project.decimals)),
        totalAllocatedToAllSeasonsRaw: tokenAmounts.totalAllocatedToAllSeasons.toString(),
        totalRefunded: Number(ethers.formatUnits(tokenAmounts.totalRefunded, project.decimals)),
        totalRefundedRaw: tokenAmounts.totalRefunded.toString(),
      }
    };
  };

  const result = await withCache(
    cacheKey,
    TTL.PROJECT_CONFIG,
    TTL.PROJECT_CONFIG_STALE,
    fetchFn
  );

  // Return structured result with cache metadata
  return {
    data: result.data,
    cacheStatus: result.cacheStatus,
    timestamp: result.timestamp,
    ttl: TTL.PROJECT_CONFIG
  };
}

/**
 * Fetch global state with caching
 * Cache: 1h primary, 2h stale
 */
export async function fetchGlobalState(tokenAddress, seasonId = API_DEFAULTS.DEFAULT_SEASON_ID) {
  const project = validateProjectAndGet(tokenAddress);

  const cacheKey = `${CACHE_CONFIG.keyPrefixes.globalState}${tokenAddress.toLowerCase()}:${seasonId}`;

  const fetchFn = async (infuraUrl) => {
    const provider = new ethers.JsonRpcProvider(infuraUrl);
    const claimContract = new ethers.Contract(project.claimAddress, BUILD_CLAIM_ABI, provider);

    const globalStates = await claimContract.getGlobalState([seasonId]);
    const globalStateData = globalStates[0];

    // Structure data by function name
    return {
      get_global_state: {
        totalLoyalty: Number(ethers.formatUnits(globalStateData.totalLoyalty, project.decimals)),
        totalLoyaltyRaw: globalStateData.totalLoyalty.toString(),
        totalLoyaltyIneligible: Number(ethers.formatUnits(globalStateData.totalLoyaltyIneligible, project.decimals)),
        totalLoyaltyIneligibleRaw: globalStateData.totalLoyaltyIneligible.toString(),
        totalClaimed: Number(ethers.formatUnits(globalStateData.totalClaimed, project.decimals)),
        totalClaimedRaw: globalStateData.totalClaimed.toString(),
      }
    };
  };

  const result = await withCache(
    cacheKey,
    TTL.GLOBAL_STATE,
    TTL.GLOBAL_STATE_STALE,
    fetchFn
  );

  // Return structured result with cache metadata
  return {
    data: result.data,
    cacheStatus: result.cacheStatus,
    timestamp: result.timestamp,
    ttl: TTL.GLOBAL_STATE
  };
}

/**
 * Fetch user claim values with caching
 * Cache: 1h primary, 2h stale
 */
export async function fetchUserClaimValues(userAddress, tokenAddress, seasonId = API_DEFAULTS.DEFAULT_SEASON_ID, maxTokenAmount = 0) {
  const project = validateProjectAndGet(tokenAddress);

  // Validate and convert user address to checksum format
  let userChecksum;
  try {
    userChecksum = ethers.getAddress(userAddress);
  } catch (error) {
    throw new Error('Invalid Ethereum address format');
  }

  const cacheKey = `${CACHE_CONFIG.keyPrefixes.userClaim}${userChecksum.toLowerCase()}:${tokenAddress.toLowerCase()}:${seasonId}`;

  const fetchFn = async (infuraUrl) => {
    const provider = new ethers.JsonRpcProvider(infuraUrl);
    const claimContract = new ethers.Contract(project.claimAddress, BUILD_CLAIM_ABI, provider);

    // Convert maxTokenAmount to BigInt (raw format with decimals)
    const maxTokenAmountRaw = ethers.parseUnits(maxTokenAmount.toString(), project.decimals);

    // Build the seasonIdsAndMaxTokenAmounts array
    const seasonIdsAndMaxTokenAmounts = [[seasonId, maxTokenAmountRaw]];

    const result = await claimContract.getCurrentClaimValues(userChecksum, seasonIdsAndMaxTokenAmounts);

    // Also fetch user state to get hasEarlyClaimed
    const usersAndSeasonIds = [[userChecksum, seasonId]];
    const userStateResult = await claimContract.getUserState(usersAndSeasonIds);

    // Result is an array of ClaimableState tuples
    if (result && result.length > 0) {
      const state = result[0];
      
      // Extract user state
      let userState = null;
      if (userStateResult && userStateResult.length > 0) {
        userState = userStateResult[0];
      }
      
      // Structure data by function name
      return {
        get_current_claim_values: {
          base: Number(ethers.formatUnits(state[0], project.decimals)),
          baseRaw: state[0].toString(),
          bonus: Number(ethers.formatUnits(state[1], project.decimals)),
          bonusRaw: state[1].toString(),
          vested: Number(ethers.formatUnits(state[2], project.decimals)),
          vestedRaw: state[2].toString(),
          claimable: Number(ethers.formatUnits(state[3], project.decimals)),
          claimableRaw: state[3].toString(),
          earlyVestableBonus: Number(ethers.formatUnits(state[4], project.decimals)),
          earlyVestableBonusRaw: state[4].toString(),
          loyaltyBonus: Number(ethers.formatUnits(state[5], project.decimals)),
          loyaltyBonusRaw: state[5].toString(),
          claimed: Number(ethers.formatUnits(state[6], project.decimals)),
          claimedRaw: state[6].toString(),
        },
        get_user_state: userState ? {
          claimed: Number(ethers.formatUnits(userState[0], project.decimals)),
          claimedRaw: userState[0].toString(),
          hasEarlyClaimed: userState[1],
        } : {
          claimed: 0,
          claimedRaw: '0',
          hasEarlyClaimed: false,
        }
      };
    }

    throw new Error('No claim data returned from contract');
  };

  const result = await withCache(
    cacheKey,
    TTL.USER_CLAIM,
    TTL.USER_CLAIM_STALE,
    fetchFn
  );

  // Return structured result with cache metadata
  return {
    data: result.data,
    cacheStatus: result.cacheStatus,
    timestamp: result.timestamp,
    ttl: TTL.USER_CLAIM
  };
}
