/**
 * Nonce Extractor
 * 
 * Fetches server-issued nonce from obfuscated API endpoint.
 * 
 * Security Flow:
 * 1. Client requests from /api/init (looks like app config)
 * 2. Server returns base64 encoded response with obfuscated fields
 * 3. Client decodes and extracts nonce
 * 4. Client uses nonce in API request signatures
 * 5. Server validates nonce (sliding window)
 */

/**
 * Validate nonce format
 * @param {string} nonce - Nonce to validate
 * @returns {boolean} True if nonce appears valid
 */
export function validateNonceFormat(nonce) {
  if (!nonce || typeof nonce !== 'string') {
    return false;
  }
  
  // Nonce should be:
  // - At least 16 characters
  // - Alphanumeric (base64 or hex)
  // - No special characters except - and _
  
  if (nonce.length < 16) {
    console.warn('[Nonce] Nonce too short:', nonce.length);
    return false;
  }
  
  // Check format (base64 or hex)
  const isBase64 = /^[A-Za-z0-9+/=_-]+$/.test(nonce);
  const isHex = /^[0-9a-fA-F]+$/.test(nonce);
  
  if (!isBase64 && !isHex) {
    console.warn('[Nonce] Invalid nonce format');
    return false;
  }
  
  return true;
}

// No caching - each request fetches a fresh nonce from server

/**
 * Decode base64 response from server
 * @param {string} encoded - Base64 encoded string
 * @returns {Object|null} Decoded object or null if failed
 */
function decodeResponse(encoded) {
  try {
    const decoded = atob(encoded);
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

/**
 * Fetch nonce from obfuscated init endpoint
 * @returns {Promise<string|null>} Nonce value or null if failed
 */
async function fetchNonceFromAPI() {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const url = `${baseUrl}/api/init`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    if (!result.data) {
      return null;
    }
    
    // Decode base64 response
    const decoded = decodeResponse(result.data);
    if (!decoded || !decoded._x) {
      return null;
    }
    
    // Extract nonce from obfuscated field (_x)
    return decoded._x;
  } catch (error) {
    return null;
  }
}

// REMOVED: getCachedNonce() - no longer used, replaced by fetchFreshNonce()

/**
 * Fetch fresh nonce from server without any caching or deduplication
 * Use this when you need a unique nonce for each request (e.g., API signatures)
 * Each call to this function makes a new HTTP request to /api/init
 * @returns {Promise<string|null>} Fresh nonce value or null if failed
 */
export async function fetchFreshNonce() {
  return await fetchNonceFromAPI();
}
