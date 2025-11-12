/**
 * Congress.gov API Service
 * UI helper functions for displaying congressional data
 */

/**
 * Gets color based on state control
 * @param {string} control - 'Republican' | 'Democrat' | 'Split'
 * @returns {string} hex color
 */
export function getControlColor(control) {
  switch (control) {
    case "Republican":
      return "#DC143C"; // Crimson red
    case "Democrat":
      return "#1E90FF"; // Dodger blue
    case "Split":
      return "#9370DB"; // Medium purple
    default:
      return "#E0E1DD"; // Light gray
  }
}
