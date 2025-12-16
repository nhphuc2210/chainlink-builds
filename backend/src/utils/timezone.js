/**
 * Timezone utility for Vietnam (UTC+7) conversion
 */

/**
 * Convert timestamp to Vietnam timezone (UTC+7)
 * @param {number} timestamp - Unix timestamp in milliseconds (default: current time)
 * @returns {string} Formatted date string in YYYY-MM-DD HH:mm:ss format
 * 
 * @example
 * getVietnamTime(1702468245000) // "2025-12-13 17:30:45"
 * getVietnamTime() // Current time in Vietnam timezone
 */
export function getVietnamTime(timestamp = Date.now()) {
  const date = new Date(timestamp);
  
  // Use sv-SE locale for YYYY-MM-DD format, with Asia/Ho_Chi_Minh timezone
  const formatted = date.toLocaleString('sv-SE', { 
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Replace 'T' with space and ensure format is YYYY-MM-DD HH:mm:ss
  return formatted.replace('T', ' ').slice(0, 19);
}

/**
 * Get current timestamp in milliseconds
 * @returns {number} Current Unix timestamp in milliseconds
 */
export function getCurrentTimestamp() {
  return Date.now();
}

/**
 * Convert TTL from seconds to hours
 * @param {number} ttlSeconds - TTL in seconds
 * @returns {number} TTL in hours (float)
 * 
 * @example
 * getTTLHours(3600) // 1 (1 hour)
 * getTTLHours(86400) // 24 (1 day = 24 hours)
 * getTTLHours(7200) // 2 (2 hours)
 * getTTLHours(90000) // 25 (25 hours)
 */
export function getTTLHours(ttlSeconds) {
  return ttlSeconds / 3600;
}

