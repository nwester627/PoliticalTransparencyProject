/**
 * Congress.gov API Helper Functions
 * Shared utility functions for working with Congress data
 */

/**
 * Normalizes party name to standard format
 * @param {string} partyName - Party name from API
 * @returns {string} Normalized party name
 */
export function normalizePartyName(partyName) {
  if (!partyName) return "Unknown";

  const normalized = partyName.toLowerCase();

  if (normalized.includes("democrat")) return "Democrat";
  if (normalized.includes("republican")) return "Republican";
  if (normalized.includes("independent")) return "Independent";

  return partyName;
}

/**
 * Calculates the current Congress number based on date
 * Congress starts January 3 of odd years
 * @param {Date} [date] - Date to calculate for (defaults to now)
 * @returns {number} Congress number
 */
export function getCurrentCongressNumber(date = new Date()) {
  const y = date.getUTCFullYear();
  // Congress increments every odd year starting 1789
  let congress = Math.floor((y - 1789) / 2) + 1;
  // If we're in early January before the 3rd of an odd year, still previous congress
  const month = date.getUTCMonth(); // 0=Jan
  const day = date.getUTCDate();
  if (y % 2 === 1 && month === 0 && day < 3) {
    congress -= 1;
  }
  return congress;
}
