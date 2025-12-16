/**
 * API Response formatter utilities
 */

import { getVietnamTime, getTTLHours } from './timezone.js';
import { BUILD_FACTORY_ADDRESS } from '../../../config/shared/contracts.js';

/**
 * Contract information constants
 */
export const CONTRACT_INFO = {
  buildFactory: {
    name: 'buildFactory',
    address: BUILD_FACTORY_ADDRESS
  },
  claimContract: (claimAddress) => ({
    name: 'claimContract',
    address: claimAddress
  })
};

/**
 * Format API response with contract info, data, and cache metadata
 * 
 * @param {Object} data - Response data object
 * @param {Object} cacheInfo - Cache information
 * @param {string} cacheInfo.cacheStatus - Cache status: 'HIT' | 'MISS' | 'STALE'
 * @param {number} cacheInfo.timestamp - Timestamp when data was cached/fetched
 * @param {number} cacheInfo.ttl - TTL in seconds (e.g., 3600 for 1 hour, 86400 for 24 hours)
 * @param {Object} contractInfo - Contract information
 * @param {string} contractInfo.name - Contract name (buildFactory | claimContract)
 * @param {string} contractInfo.address - Contract address
 * @returns {Object} Formatted response with blockchainData and metaData
 * 
 * @example
 * formatApiResponse(
 *   { tokenAmount: 1000000, ... },
 *   { cacheStatus: 'HIT', timestamp: 1702468245000, ttl: 86400 },
 *   { name: 'buildFactory', address: '0x...' }
 * )
 * // Returns:
 * // {
 * //   blockchainData: {
 * //     contractName: 'buildFactory',
 * //     contractAddress: '0x...',
 * //     tokenAmount: 1000000,
 * //     ...
 * //   },
 * //   metaData: {
 * //     isCache: true,
 * //     cacheTime: '2025-12-13 17:30:45',
 * //     cacheStatus: 'HIT',
 * //     ttl_hour: 24,
 * //     caching: {
 * //       redis: 'HIT',
 * //       http: 'enabled',
 * //       edgeTTL: 86400
 * //     }
 * //   }
 * // }
 */
export function formatApiResponse(data, cacheInfo, contractInfo) {
  return {
    blockchainData: {
      contractName: contractInfo.name,
      contractAddress: contractInfo.address,
      ...data
    },
    metaData: {
      isCache: cacheInfo.cacheStatus !== 'MISS',
      cacheTime: getVietnamTime(cacheInfo.timestamp),
      cacheStatus: cacheInfo.cacheStatus,
      ttl_hour: getTTLHours(cacheInfo.ttl),
      caching: {
        redis: cacheInfo.cacheStatus, // Backend Redis cache status
        http: 'enabled', // HTTP cache headers enabled
        edgeTTL: cacheInfo.ttl // TTL for Cloudflare edge cache
      }
    }
  };
}

/**
 * Format error response
 * @param {string} error - Error type/category
 * @param {string} message - Detailed error message
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(error, message) {
  return {
    error,
    message,
    meta: {
      timestamp: getVietnamTime()
    }
  };
}

