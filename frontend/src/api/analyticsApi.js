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
};

/**
 * Get category breakdown for expenses
 * @param {Object} params - Query parameters
 * @param {string} params.periodType - Period type (month, quarter, year)
 * @param {number} params.periodValue - Period value (month: 1-12, quarter: 1-4, year: YYYY)
 * @param {number} params.year - Year in YYYY format
 * @param {string} params.userId - Optional user ID for admin filtering
 * @returns {Promise<Object>} - Category breakdown data
 */
export const getCategoryBreakdown = async (params = {}) => {
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
  const url = `/analytics/expenses/category-breakdown${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await apiConfig.get(url);
  return response.data;
};

/**
 * Get expense trends
 * @param {Object} params - Query parameters
 * @param {string} params.periodType - Period type (month, quarter, year)
 * @param {number} params.year - Year in YYYY format
 * @param {string} params.userId - Optional user ID for admin filtering
 * @returns {Promise<Object>} - Expense trends data
 */
export const getExpenseTrends = async (params = {}) => {
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
  const url = `/analytics/expenses/trends${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await apiConfig.get(url);
  return response.data;
};

/**
 * Get yearly comparison
 * @param {Object} params - Query parameters
 * @param {number} params.currentYear - Current year in YYYY format
 * @param {number} params.previousYear - Previous year in YYYY format
 * @param {string} params.userId - Optional user ID for admin filtering
 * @returns {Promise<Object>} - Yearly comparison data
 */
export const getYearlyComparison = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.currentYear) {
    queryParams.append("currentYear", params.currentYear);
  }

  if (params.previousYear) {
    queryParams.append("previousYear", params.previousYear);
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
};
