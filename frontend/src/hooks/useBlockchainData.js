import useSWR from 'swr';
import { generateAuthHeaders } from "../utils/signature.js";
import { getSecret } from "../utils/secretDecryptor.js";
import { handleApiResponse } from "../utils/rateLimitHandler.js";
import { API_CONFIG } from "../../../config/frontend/api.js";
import { requiresSignature } from "../../../config/shared/security.js";

/**
 * Get API request headers with optional signature and API key
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - Request path
 * @param {Object|null} body - Request body (for POST/PUT/PATCH requests)
 * @returns {Promise<Object>} headers
 */
export async function getApiHeaders(method, path, body = null) {
  let headers = {
    'Content-Type': 'application/json',
  };
  
  // Only generate signature for protected endpoints
  if (requiresSignature(path)) {
    try {
      const authHeaders = await generateAuthHeaders(method, path, body);
      headers = { ...headers, ...authHeaders };
    } catch (err) {
      console.warn('Failed to generate signature for protected endpoint:', err.message);
    }
  }
  
  // Add API key if configured (decrypted from encrypted store)
  const apiKey = getSecret('API_KEY');
  if (apiKey) {
    headers = { ...headers, 'x-api-key': apiKey };
  }
  
  return headers;
}

/**
 * Fetcher function with authentication headers
 * @param {string} url - Full URL to fetch
 * @param {string} method - HTTP method
 * @param {Function} onRateLimit - Callback for rate limit errors
 * @returns {Promise<Object>} Parsed response data
 */
async function fetchWithAuth(url, method, onRateLimit) {
  const startTime = performance.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`[Fetch ${requestId}] 🔵 START`, { url, method });
  
  try {
    const headers = await getApiHeaders(method, url);
    const headerTime = performance.now();
    console.log(`[Fetch ${requestId}] 📝 Headers generated`, { 
      duration: `${(headerTime - startTime).toFixed(2)}ms` 
    });
    
    const res = await fetch(url, { headers });
    const fetchTime = performance.now();
    console.log(`[Fetch ${requestId}] 🌐 Fetch complete`, { 
      status: res.status,
      ok: res.ok,
      duration: `${(fetchTime - headerTime).toFixed(2)}ms`,
      totalDuration: `${(fetchTime - startTime).toFixed(2)}ms`
    });
    
    const response = await handleApiResponse(res, onRateLimit);
    const endTime = performance.now();
    console.log(`[Fetch ${requestId}] ✅ SUCCESS`, { 
      totalDuration: `${(endTime - startTime).toFixed(2)}ms` 
    });
    
    return response;
  } catch (error) {
    const endTime = performance.now();
    console.error(`[Fetch ${requestId}] ❌ FAILED`, {
      error: error.message,
      totalDuration: `${(endTime - startTime).toFixed(2)}ms`,
      url,
      method
    });
    throw error;
  }
}

/**
 * Hook to fetch project config
 * @param {Object} project - The selected project object
 * @param {Object} options - Optional configuration
 * @returns {Object} - { config, loading, error, refetch }
 */
export function useProjectConfig(project, options = {}) {
  const { onRateLimit } = options;
  
      const apiUrl = import.meta.env.VITE_API_URL || '';
  const configPath = project 
    ? `${API_CONFIG.getEndpointPath('projectConfig')}?tokenAddress=${project.tokenAddress}&seasonId=${project.seasonId || API_CONFIG.defaultSeasonId}`
    : null;
  
  const { data, error, isLoading, mutate } = useSWR(
    project ? ['projectConfig', project.tokenAddress, project.seasonId || API_CONFIG.defaultSeasonId] : null,
    async () => {
      const response = await fetchWithAuth(`${apiUrl}${configPath}`, 'GET', onRateLimit);

      // Validate response structure
      if (!response?.blockchainData) {
        throw new Error('Invalid config response: missing blockchainData field');
      }

      // Extract and flatten data from v1 structure
      const getProjectConfig = response.blockchainData.get_project_season_config || {};
      const getTokenAmounts = response.blockchainData.get_token_amounts || {};
      
      return {
        ...getProjectConfig,
        ...getTokenAmounts
      };
    },
    {
      dedupingInterval: 2000,
      onError: (err) => {
        console.error('[useProjectConfig] ❌ onError', { error: err.message });
        if (err.rateLimited) {
          onRateLimit?.(err.retryAfter);
        }
      },
      onSuccess: (data) => {
        console.log('[useProjectConfig] ✅ onSuccess', { hasData: !!data });
      },
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        console.warn('[useProjectConfig] 🔄 onErrorRetry', { 
          retryCount, 
          error: error.message,
          willRetry: retryCount < 3
        });
      }
    }
  );
  
  return {
    config: data,
    loading: isLoading,
    error,
    refetch: mutate
  };
}

/**
 * Hook to fetch global state
 * @param {Object} project - The selected project object
 * @param {Object} options - Optional configuration
 * @returns {Object} - { globalState, loading, error, refetch }
 */
export function useGlobalState(project, options = {}) {
  const { onRateLimit } = options;
  
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const globalStatePath = project
    ? `${API_CONFIG.getEndpointPath('projectGlobalState')}?tokenAddress=${project.tokenAddress}&seasonId=${project.seasonId || API_CONFIG.defaultSeasonId}`
    : null;
  
  const { data, error, isLoading, mutate } = useSWR(
    project ? ['projectGlobalState', project.tokenAddress, project.seasonId || API_CONFIG.defaultSeasonId] : null,
    async () => {
      const response = await fetchWithAuth(`${apiUrl}${globalStatePath}`, 'GET', onRateLimit);
      
      // Validate response structure
      if (!response?.blockchainData) {
        throw new Error('Invalid global state response: missing blockchainData field');
      }
      
      // Extract data from v1 structure
      return response.blockchainData.get_global_state || {};
    },
    {
      dedupingInterval: 2000,
      onError: (err) => {
        console.error('[useGlobalState] ❌ onError', { error: err.message });
        if (err.rateLimited) {
          onRateLimit?.(err.retryAfter);
        }
      },
      onSuccess: (data) => {
        console.log('[useGlobalState] ✅ onSuccess', { hasData: !!data });
      },
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        console.warn('[useGlobalState] 🔄 onErrorRetry', { 
          retryCount, 
          error: error.message,
          willRetry: retryCount < 3
        });
      }
    }
  );
  
  return {
    globalState: data,
    loading: isLoading,
    error,
    refetch: mutate
  };
}

/**
 * Combined hook to fetch both config and global state (backward compatible)
 * @param {Object} project - The selected project object
 * @param {Object} options - Optional configuration
 * @returns {Object} - { config, globalState, loading, error, refetch }
 */
export function useBlockchainData(project, options = {}) {
  const { config, loading: configLoading, error: configError, refetch: refetchConfig } = useProjectConfig(project, options);
  const { globalState, loading: stateLoading, error: stateError, refetch: refetchState } = useGlobalState(project, options);

  return {
    config,
    globalState,
    loading: configLoading || stateLoading,
    error: configError || stateError,
    refetch: () => {
      refetchConfig();
      refetchState();
    }
  };
}

/**
 * Calculate vesting metrics for a given day
 * Based on BUILDClaim.sol logic
 * NOTE: This is kept for currentMetrics calculation in App.jsx
 * Timeline generation is now handled by Web Worker (vesting.worker.js)
 */
export function calculateVestingMetrics({
  maxTokenAmount,
  baseTokenClaimBps,
  unlockDurationDays,
  earlyVestRatioMinBps,
  earlyVestRatioMaxBps,
  dayT,
  totalLoyalty,
  totalLoyaltyIneligible,
  tokenAmount,
}) {
  const BPS_DENOMINATOR = 10000;

  // Base calculation
  const base = (maxTokenAmount * baseTokenClaimBps) / BPS_DENOMINATOR;
  const bonus = maxTokenAmount - base;

  // Check if unlock is complete (matches smart contract isUnlocking logic)
  const isUnlockComplete = dayT >= unlockDurationDays;

  // Vested calculation at day t - cap at bonus (can't vest more than 100%)
  const vestedRaw = unlockDurationDays > 0 ? (bonus * dayT) / unlockDurationDays : bonus;
  const vested = Math.min(vestedRaw, bonus);

  const unlocked = base + vested;
  const locked = Math.max(0, maxTokenAmount - unlocked); // Can't be negative

  // Loyalty bonus estimate (share of pool if wait till end)
  // Formula: maxTokenAmount * totalLoyalty / (tokenAmount - totalLoyaltyIneligible)
  const eligiblePool = tokenAmount - totalLoyaltyIneligible;
  const loyaltyBonus = eligiblePool > 0 ? (maxTokenAmount * totalLoyalty) / eligiblePool : 0;

  // Early vest only applies during unlock period (matches smart contract)
  let earlyVestRatio = 0;
  let earlyVestableBonus = 0;
  let forfeited = 0;

  if (!isUnlockComplete && locked > 0) {
    // Early vest ratio at day t (scales linearly from min to max)
    const earlyVestRatioMin = earlyVestRatioMinBps / BPS_DENOMINATOR;
    const earlyVestRatioMax = earlyVestRatioMaxBps / BPS_DENOMINATOR;
    earlyVestRatio = earlyVestRatioMin + ((earlyVestRatioMax - earlyVestRatioMin) * dayT) / unlockDurationDays;

    // Early vestable bonus (what you can claim early from locked portion)
    earlyVestableBonus = locked * earlyVestRatio;

    // Forfeited to loyalty pool (what you give up if early claim)
    forfeited = locked - earlyVestableBonus;
  }

  // Total if early claim (only valid during unlock period)
  // After unlock complete, early claim = same as waiting (full amount + loyalty)
  const totalIfEarlyClaim = isUnlockComplete
    ? maxTokenAmount + loyaltyBonus
    : unlocked + earlyVestableBonus;

  // Total if wait till end
  const totalIfWait = maxTokenAmount + loyaltyBonus;

  return {
    base,
    bonus,
    vested,
    unlocked,
    locked,
    earlyVestRatio,
    earlyVestRatioPercent: earlyVestRatio * 100,
    earlyVestableBonus,
    totalIfEarlyClaim,
    forfeited,
    loyaltyBonus,
    totalIfWait,
    isUnlockComplete,
  };
}
