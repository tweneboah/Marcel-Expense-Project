import apiConfig from "./apiConfig";

/**
 * Fetch all budgets with optional filtering
 * @param {Object} filters - Optional filters for budgets (e.g., year, month, category)
 * @returns {Promise<Object>} - Object containing budget data and pagination info
 */
export const getBudgets = async (filters = {}) => {
  // Construct query string from filters
  const queryParams = new URLSearchParams();

  // Always add debug parameter
  queryParams.append("debug", "true");

  // Filter by year
  if (filters.year) {
    queryParams.append("year", filters.year);
  }

  // Filter by month
  if (filters.month !== undefined) {
    queryParams.append("month", filters.month);
  }

  // Filter by category
  if (filters.category) {
    queryParams.append("category", filters.category);
  }

  // Filter by active status
  if (filters.isActive !== undefined) {
    queryParams.append("isActive", filters.isActive);
  }

  // Pagination
  if (filters.page) {
    queryParams.append("page", filters.page);
  }

  if (filters.limit) {
    queryParams.append("limit", filters.limit);
  }

  // Sorting
  if (filters.sort) {
    queryParams.append("sort", filters.sort);
  } else {
    // Default sort by year and month
    queryParams.append("sort", "-year,-month");
  }

  // Select specific fields
  if (filters.select) {
    queryParams.append("select", filters.select);
  }

  // Convert queryParams to string
  const queryString = queryParams.toString();
  const url = `/budgets${queryString ? `?${queryString}` : ""}`;

  const response = await API.get(url);

  // Return the entire response data to preserve pagination and count
  return response.data;
};

/**
 * Fetch a single budget by ID
 * @param {string} id - The budget ID
 * @returns {Promise<Object>} - The budget object
 */
export const getBudgetById = async (id) => {
  const response = await API.get(`/budgets/${id}`);
  return response.data;
};

/**
 * Create a new budget
 * @param {Object} budgetData - The budget data to create
 * @returns {Promise<Object>} - The created budget object
 */
export const createBudget = async (budgetData) => {
  // Transform data to match API expectations
  const transformedData = {
    ...budgetData,
    // Convert string values to proper types if needed
    year: Number(budgetData.year),
    month: Number(budgetData.month),
    amount: Number(budgetData.amount),
    warningThreshold: Number(budgetData.warningThreshold),
    criticalThreshold: Number(budgetData.criticalThreshold),
    categoryId: budgetData.category, // Backend might expect categoryId instead of category
  };

  // Remove empty or undefined values
  Object.keys(transformedData).forEach((key) => {
    if (transformedData[key] === undefined || transformedData[key] === "") {
      delete transformedData[key];
    }
  });

  // Validate required fields
  if (!transformedData.categoryId) {
    throw new Error("Category is required");
  }

  if (transformedData.amount === undefined || isNaN(transformedData.amount)) {
    throw new Error("Budget amount is required and must be a number");
  }

  const response = await apiConfig.post("/budgets", transformedData);

  return response.data;
};

/**
 * Update an existing budget
 * @param {string} id - The budget ID to update
 * @param {Object} budgetData - The budget data to update
 * @returns {Promise<Object>} - The updated budget object
 */
export const updateBudget = async (id, budgetData) => {
  const response = await apiConfig.put(`/budgets/${id}`, budgetData);
  return response.data;
};

/**
 * Delete a budget
 * @param {string} id - The budget ID to delete
 * @returns {Promise<Object>} - The response data
 */
export const deleteBudget = async (id) => {
  const response = await apiConfig.delete(`/budgets/${id}`);
  return response.data;
};

/**
 * Get budget summary with usage statistics
 * @param {Object} filters - Optional filters for the summary (e.g., year, month)
 * @returns {Promise<Object>} - Budget summary data
 */
export const getBudgetSummary = async (filters = {}) => {
  // Construct query string from filters
  const queryParams = new URLSearchParams();

  if (filters.year) {
    queryParams.append("year", filters.year);
  }

  if (filters.month !== undefined) {
    queryParams.append("month", filters.month);
  }

  // Convert queryParams to string
  const queryString = queryParams.toString();
  const url = `/budgets/summary${queryString ? `?${queryString}` : ""}`;

  const response = await apiConfig.get(url);
  return response.data;
};
