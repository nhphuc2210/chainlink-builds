/**
 * Utility to handle API response and check for rate limit errors
 * @param {Response} response - Fetch API response object
 * @param {Function} onRateLimit - Callback when rate limit is hit (receives retryAfter seconds)
 * @returns {Promise<Object>} - Parsed JSON data
 * @throws {Error} - Throws error if response is not ok
 */
export async function handleApiResponse(response, onRateLimit = null) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Check for rate limit error (429)
    if (response.status === 429) {
      const retryAfter = errorData.retryAfter || 60;
      
      // Call the rate limit callback if provided
      if (onRateLimit && typeof onRateLimit === 'function') {
        onRateLimit(retryAfter);
      }
      
      throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds.`);
    }
    
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Create a rate-limit-aware fetch wrapper
 * @param {Function} triggerRateLimit - Function to trigger rate limit banner
 * @returns {Function} - Wrapped fetch function
 */
export function createRateLimitAwareFetch(triggerRateLimit) {
  return async (url, options = {}) => {
    const response = await fetch(url, options);
    return await handleApiResponse(response, triggerRateLimit);
  };
}

