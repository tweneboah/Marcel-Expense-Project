import apiConfig from "./apiConfig";

/**
 * Get time period summary for expenses
 * @param {Object} params - Query parameters
 * @param {string} params.periodType - Period type (month, quarter, year)
 * @param {number} params.year - Year in YYYY format
 * @param {string} params.userId - Optional user ID for admin filtering
 * @returns {Promise<Object>} - Time period summary data
 */
export const getTimePeriodSummary = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.periodType) {
      queryParams.append("periodType", params.periodType);
    }

    if (params.year) {
      queryParams.append("year", params.year);
    }

    if (params.userId) {
      queryParams.append("userId", params.userId);
    }

    const queryString = queryParams.toString();
    const url = `/analytics/expenses/time-summary${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiConfig.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching time period summary:", error);
    throw error;
  }
};

/**
 * Get period detail for expenses
 * @param {Object} params - Query parameters
 * @param {string} params.periodType - Period type (month, quarter, year)
 * @param {number} params.periodValue - Period value (month: 1-12, quarter: 1-4, year: YYYY)
 * @param {number} params.year - Year in YYYY format
 * @param {string} params.userId - Optional user ID for admin filtering
 * @returns {Promise<Object>} - Period detail data
 */
export const getPeriodDetail = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.periodType) {
      queryParams.append("periodType", params.periodType);
    }

    if (params.periodValue) {
      queryParams.append("periodValue", params.periodValue);
    }

    if (params.year) {
      queryParams.append("year", params.year);
    }

    if (params.userId) {
      queryParams.append("userId", params.userId);
    }

    const queryString = queryParams.toString();
    const url = `/analytics/expenses/period-detail${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiConfig.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching period detail:", error);
    throw error;
  }
};

/**
 * Get category breakdown for expenses
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date in YYYY-MM-DD format
 * @param {string} params.endDate - End date in YYYY-MM-DD format
 * @param {string} params.userId - Optional user ID for admin filtering
 * @returns {Promise<Object>} - Category breakdown data
 */
export const getCategoryBreakdown = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.startDate) {
      queryParams.append("startDate", params.startDate);
    }

    if (params.endDate) {
      queryParams.append("endDate", params.endDate);
    }

    if (params.userId) {
      queryParams.append("userId", params.userId);
    }

    const queryString = queryParams.toString();
    const url = `/analytics/expenses/category-breakdown${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiConfig.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching category breakdown:", error);
    throw error;
  }
};

/**
 * Get expense trends
 * @param {Object} params - Query parameters
 * @param {string} params.periodType - Period type (day, week, month)
 * @param {number} params.months - Number of months to look back
 * @param {number} params.targetYear - Target year for analysis (defaults to current year if not specified)
 * @param {string} params.userId - Optional user ID for admin filtering
 * @returns {Promise<Object>} - Expense trends data
 */
export const getExpenseTrends = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.periodType) {
      queryParams.append("periodType", params.periodType);
    }

    if (params.months) {
      queryParams.append("months", params.months);
    }

    if (params.targetYear) {
      queryParams.append("targetYear", params.targetYear);
    }

    if (params.userId) {
      queryParams.append("userId", params.userId);
    }

    const queryString = queryParams.toString();
    const url = `/analytics/expenses/trends${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiConfig.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching expense trends:", error);
    throw error;
  }
};

/**
 * Get yearly comparison
 * @param {Object} params - Query parameters
 * @param {number} params.year1 - First year in YYYY format
 * @param {number} params.year2 - Second year in YYYY format
 * @param {string} params.userId - Optional user ID for admin filtering
 * @returns {Promise<Object>} - Yearly comparison data
 */
export const getYearlyComparison = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.year1) {
      queryParams.append("year1", params.year1);
    }

    if (params.year2) {
      queryParams.append("year2", params.year2);
    }

    if (params.userId) {
      queryParams.append("userId", params.userId);
    }

    const queryString = queryParams.toString();
    const url = `/analytics/expenses/yearly-comparison${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiConfig.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching yearly comparison:", error);
    throw error;
  }
};
