import useSWR from 'swr';
import { getApiHeaders } from './useBlockchainData.js';
import { handleApiResponse } from '../utils/rateLimitHandler.js';
import { API_CONFIG } from '../../../config/frontend/api.js';

/**
 * Hook to fetch wallet claim data for a specific user address
 * @param {string} walletAddress - User's wallet address (0x...)
 * @param {Object} selectedProject - The selected project object
 * @param {Object} options - Optional configuration
 * @returns {Object} - { claimData, loading, error }
 */
export function useWalletClaimData(walletAddress, selectedProject, options = {}) {
  const { onRateLimit } = options;
  
  // Only fetch if wallet is valid Ethereum address
  const isValidAddress = walletAddress && /^0x[a-fA-F0-9]{40}$/.test(walletAddress);
  
  const { data, error, isLoading, mutate } = useSWR(
    isValidAddress && selectedProject 
      ? ['walletClaim', walletAddress, selectedProject.tokenAddress, selectedProject.seasonId] 
      : null,
    async () => {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const seasonId = selectedProject.seasonId || API_CONFIG.defaultSeasonId;
      
      // Build paths for user claim API (we only need claim data, config/state come from useBlockchainData)
      const userClaimPath = `${API_CONFIG.getEndpointPath('projectUserClaimValues')}?tokenAddress=${selectedProject.tokenAddress}`;
      
      // Prepare request body
      const requestBody = {
        userAddress: walletAddress,
        maxTokenAmount: 0, // Will be calculated from on-chain data
        seasonId: seasonId,
      };
      
      // Get headers with signature (include body for signature computation)
      const claimHeaders = await getApiHeaders('POST', userClaimPath, requestBody);
      
      // Fetch user claim data
      const claimRes = await fetch(`${apiUrl}${userClaimPath}`, {
        method: 'POST',
        headers: claimHeaders,
        body: JSON.stringify(requestBody),
      });

      // Handle response with rate limit support
      const claimResponse = await handleApiResponse(claimRes, onRateLimit);
      
      // Validate claim response structure
      if (!claimResponse?.blockchainData) {
        throw new Error('Invalid user claim response: missing blockchainData field');
      }
      
      if (!claimResponse.blockchainData.get_current_claim_values) {
        throw new Error('Invalid user claim response: missing get_current_claim_values field');
      }
      
      // Extract data from v1 structure - merge claim values and user state
      return {
        ...claimResponse.blockchainData.get_current_claim_values,
        hasEarlyClaimed: claimResponse.blockchainData.get_user_state?.hasEarlyClaimed || false
      };
    },
    {
      dedupingInterval: 2000,
      revalidateOnFocus: false, // Don't auto-refetch when tab gains focus
      onError: (err) => {
        console.error('[useWalletClaimData] Error:', err);
        if (err.rateLimited) {
          onRateLimit?.(err.retryAfter);
        }
      }
    }
  );
  
  return {
    claimData: data,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate
  };
}

