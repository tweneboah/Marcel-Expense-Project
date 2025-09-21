/**
 * Utility functions for formatting data in the application
 */

/**
 * Format a number as Swiss Francs (CHF) currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: CHF)
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount, currency = "CHF") => {
  if (amount === undefined || amount === null) {
    return `${currency} 0.00`;
  }

  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Safely formats a date string to a readable format
 * @param {string|Date} dateValue - Date string or Date object
 * @param {string} [format="default"] - Format option (default, short, long)
 * @returns {string} - Formatted date string or fallback text
 */
export const formatDate = (dateValue, format = "default") => {
  if (!dateValue) return "N/A";

  try {
    // Handle ISO string, timestamp, or date object
    let date;

    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === "string") {
      // Try parsing as ISO string
      date = new Date(dateValue);

      // If invalid, try DD-MM-YYYY format
      if (isNaN(date.getTime())) {
        const parts = dateValue.split(/[-\/\.]/);
        if (parts.length === 3) {
          // Try various date formats
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // DD-MM-YYYY

          // If still invalid, try MM-DD-YYYY
          if (isNaN(date.getTime())) {
            date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`); // MM-DD-YYYY
          }
        }
      }
    } else if (typeof dateValue === "number") {
      date = new Date(dateValue);
    } else {
      return "N/A";
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "N/A";
    }

    // Format based on preference
    const options = {
      default: { day: "numeric", month: "short", year: "numeric" },
      short: { day: "numeric", month: "numeric", year: "2-digit" },
      long: { day: "numeric", month: "long", year: "numeric" },
    };

    return date.toLocaleDateString(
      undefined,
      options[format] || options.default
    );
  } catch (error) {
    return "N/A";
  }
};

/**
 * Format a number with thousand separators
 * @param {number} value - The number to format
 * @param {number} digits - Number of decimal digits to include
 * @returns {string} The formatted number
 */
export const formatNumber = (value, digits = 0) => {
  return new Intl.NumberFormat("de-CH", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

/**
 * Format a decimal number as percentage
 * @param {number} value - The decimal value to format as percentage
 * @param {number} digits - Number of decimal digits to include
 * @returns {string} The formatted percentage string
 */
export const formatPercentage = (value, digits = 1) => {
  return new Intl.NumberFormat("de-CH", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};
