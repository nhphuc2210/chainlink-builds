/**
 * Runtime Secret Decryption Module
 * 
 * This module decrypts secrets that were encrypted at build time.
 * The encryption is simple (XOR + Base64) but when combined with obfuscation,
 * it makes extracting secrets significantly harder.
 * 
 * Security Note:
 * - This is NOT cryptographically secure encryption
 * - A determined attacker can still extract secrets by debugging
 * - The goal is to make casual extraction 10x harder
 * - Similar approach to how DeBank and other DeFi apps protect client secrets
 */

// Encrypted secrets are injected at build time via vite.config.js
// Format: { HMAC_SECRET: 'base64_encrypted', API_KEY: 'base64_encrypted' }
const ENCRYPTED_SECRETS = typeof window !== 'undefined' && window.__ENCRYPTED_SECRETS__ 
  ? window.__ENCRYPTED_SECRETS__ 
  : {};

/**
 * Generate decryption key from browser environment
 * This makes the key less obvious in the bundle
 * @returns {string} Decryption key
 */
function generateDecryptionKey() {
  // Use multiple browser properties to generate key
  // This is intentionally simple - complex key derivation would be obvious
  const parts = [
    'build',
    'reward',
    'calc',
    typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 5) : 'node',
    '2024'
  ];
  
  return parts.join('-');
}

/**
 * Simple XOR cipher for string decryption
 * @param {string} encoded - Base64 encoded encrypted string
 * @param {string} key - Decryption key
 * @returns {string} Decrypted string
 */
function xorDecrypt(encoded, key) {
  try {
    // Decode from base64
    const encrypted = atob(encoded);
    let decrypted = '';
    
    // XOR each character with key (cycling through key)
    for (let i = 0; i < encrypted.length; i++) {
      const encryptedChar = encrypted.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(encryptedChar ^ keyChar);
    }
    
    return decrypted;
  } catch (error) {
    console.error('[SecretDecryptor] Failed to decrypt:', error);
    return '';
  }
}

/**
 * Cache for decrypted secrets to avoid repeated decryption
 */
const decryptedCache = {};

/**
 * Get a decrypted secret by key name
 * @param {string} secretName - Name of the secret ('HMAC_SECRET' or 'API_KEY')
 * @returns {string} Decrypted secret value
 */
export function getSecret(secretName) {
  // Return from cache if already decrypted
  if (decryptedCache[secretName]) {
    return decryptedCache[secretName];
  }
  
  // Get encrypted value
  const encrypted = ENCRYPTED_SECRETS[secretName];
  
  if (!encrypted) {
    console.warn(`[SecretDecryptor] Secret "${secretName}" not found in encrypted store`);
    return '';
  }
  
  // Decrypt and cache
  const decryptionKey = generateDecryptionKey();
  const decrypted = xorDecrypt(encrypted, decryptionKey);
  decryptedCache[secretName] = decrypted;
  
  return decrypted;
}

/**
 * Check if a secret is available
 * @param {string} secretName - Name of the secret to check
 * @returns {boolean} True if secret exists
 */
export function hasSecret(secretName) {
  return !!ENCRYPTED_SECRETS[secretName];
}

/**
 * Get all available secret names (for debugging)
 * @returns {string[]} Array of secret names
 */
export function getAvailableSecrets() {
  return Object.keys(ENCRYPTED_SECRETS);
}

// Note: We cannot freeze the cache because we need to add decrypted secrets to it dynamically
// The cache is module-scoped and not exposed to window, which provides sufficient protection

