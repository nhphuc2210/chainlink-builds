import { formatApiResponse } from './responseFormatter.js';

/**
 * Send API response with proper cache headers and eTag
 * 
 * =============================================================================
 * WHY res.locals.etagData?
 * =============================================================================
 * 
 * API Response Structure:
 * {
 *   blockchainData: {               ← THIS gets hashed for eTag
 *     get_project_season_config: {
 *       tokenAmount: 1000000,
 *       merkleRoot: "0x...",
 *       ...
 *     },
 *     get_token_amounts: {...}
 *   },
 *   metadata: {                     ← NOT hashed (changes frequently)
 *     timestamp: 1734567890,        ← Changes every Redis hit
 *     cacheStatus: "HIT",           ← Changes (HIT/MISS/STALE)
 *     ttl: 86400                    ← Static config
 *   },
 *   contractInfo: {                 ← NOT hashed (static)
 *     name: "BuildFactory",
 *     address: "0x...",
 *     network: "mainnet"
 *   }
 * }
 * 
 * =============================================================================
 * PROBLEM: If we hash the full response
 * =============================================================================
 * 
 * Request 1 (t=1000):
 *   Response: { data: {...}, metadata: { timestamp: 1000 } }
 *   eTag: "abc123"
 * 
 * Request 2 (t=2000), same blockchain data:
 *   Response: { data: {...}, metadata: { timestamp: 2000 } }
 *   eTag: "xyz789"  ← DIFFERENT! Even though blockchain data is identical
 * 
 * Result: Client can't reuse cache (304 never returned)
 * 
 * =============================================================================
 * SOLUTION: Hash only blockchain data
 * =============================================================================
 * 
 * We store ONLY response.data in res.locals.etagData
 * This is read by backend/src/middleware/cache.js:
 * 
 *   const dataForEtag = res.locals.etagData || data;
 *   const etag = generateETag(dataForEtag);
 * 
 * Now:
 *   Request 1: eTag = hash(blockchainData) = "abc123"
 *   Request 2: eTag = hash(blockchainData) = "abc123"  ← SAME!
 * 
 * Result: Client receives 304 Not Modified (saves bandwidth)
 * 
 * =============================================================================
 */
export const sendApiResponse = (res, data, metadata, contractInfo) => {
  const response = formatApiResponse(
    data,
    metadata,
    contractInfo
  );
  
  // Attach the actual data to res.locals for ETag generation
  // This ensures ETag is only based on blockchain data, not metadata
  res.locals.etagData = response.data;
  
  res.json(response);
};
