/**
 * Add days to a date
 */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date) {
  return date.toISOString().split("T")[0];
}

/**
 * Format number with dot thousand separator (e.g., 10000 -> 10.000)
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  const rounded = Math.round(num);
  return rounded.toLocaleString('de-DE');
}

/**
 * Format number with decimals
 */
export function formatNumberDecimal(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return num.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * Format percentage
 */
export function formatPercent(num) {
  if (num === null || num === undefined || isNaN(num)) return "0%";
  return num.toFixed(0) + "%";
}

/**
 * Format percentage with decimals
 */
export function formatPercentDecimal(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return "0%";
  return num.toFixed(decimals) + "%";
}

