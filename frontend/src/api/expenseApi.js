import apiConfig from "./apiConfig";

/**
 * Fetch all expenses with optional filtering
 * @param {Object} filters - Optional filters for expenses (e.g., date range, category)
 * @returns {Promise<Array>} - Array of expense objects
 */
export const getExpenses = async (filters = {}) => {
  // Construct query string from filters
  const queryParams = new URLSearchParams();

  // Date range filters
  if (filters.startDate) {
    queryParams.append("startDate", filters.startDate);
  }

  if (filters.endDate) {
    queryParams.append("endDate", filters.endDate);
  }

  // Category filter
  if (filters.categoryId) {
    queryParams.append("category", filters.categoryId);
  }

  if (filters.category) {
    queryParams.append("category", filters.category);
  }

  // Status filter
  if (filters.status) {
    queryParams.append("status", filters.status);
  }

  if (filters.filterStatus) {
    queryParams.append("status", filters.filterStatus);
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
    // Default sort by latest
    queryParams.append("sort", "-createdAt");
  }

  // Select specific fields
  if (filters.select) {
    queryParams.append("select", filters.select);
  }

  // Convert queryParams to string
  const queryString = queryParams.toString();
  const url = `/expenses${queryString ? `?${queryString}` : ""}`;

  const response = await apiConfig.get(url);

  // Return the entire response data to preserve pagination and count
  return response.data;
};

/**
 * Fetch a single expense by ID
 * @param {string} id - The expense ID
 * @returns {Promise<Object>} - The expense object
 */
export const getExpenseById = async (id) => {
  const response = await apiConfig.get(`/expenses/${id}`);

  // Extract expense data from nested data structure
  const expenseData = response.data.data;

  // Map backend field names to frontend expected names if needed
  if (expenseData) {
    return {
      ...expenseData,
      // Add mapping for distance if it doesn't match frontend field name
      distanceInKm: expenseData.distance,
      // Ensure any other field mappings are handled
      startLocation: expenseData.startingPoint || expenseData.startLocation,
      endLocation: expenseData.destinationPoint || expenseData.endLocation,
      categoryId: expenseData.category?._id || expenseData.categoryId,
      expenseDate: expenseData.journeyDate || expenseData.expenseDate,
    };
  }

  return response.data;
};

/**
 * Create a new expense
 * @param {Object} expenseData - The expense data to create
 * @returns {Promise<Object>} - The created expense object
 */
export const createExpense = async (expenseData) => {
  // Format waypoints data if provided
  if (expenseData.waypoints && Array.isArray(expenseData.waypoints)) {
    // Ensure waypoints are properly formatted for the backend
    expenseData.waypoints = expenseData.waypoints.map((waypoint) => {
      // If waypoint is already formatted correctly, return it
      if (typeof waypoint === "object" && waypoint.placeId) {
        return waypoint;
      }
      // If waypoint is just a string (placeId), format it
      if (typeof waypoint === "string") {
        return { placeId: waypoint };
      }
      return waypoint;
    });
  }

  const response = await apiConfig.post("/expenses", expenseData);
  return response.data;
};

/**
 * Update an existing expense
 * @param {string} id - The expense ID to update
 * @param {Object} expenseData - The expense data to update
 * @returns {Promise<Object>} - The updated expense object
 */
export const updateExpense = async (id, expenseData) => {
  // Format waypoints data if provided
  if (expenseData.waypoints && Array.isArray(expenseData.waypoints)) {
    // Ensure waypoints are properly formatted for the backend
    expenseData.waypoints = expenseData.waypoints.map((waypoint) => {
      // If waypoint is already formatted correctly, return it
      if (typeof waypoint === "object" && waypoint.placeId) {
        return waypoint;
      }
      // If waypoint is just a string (placeId), format it
      if (typeof waypoint === "string") {
        return { placeId: waypoint };
      }
      return waypoint;
    });
  }

  const response = await apiConfig.put(`/expenses/${id}`, expenseData);
  return response.data;
};

/**
 * Delete an expense
 * @param {string} id - The expense ID to delete
 * @returns {Promise<Object>} - The response data
 */
export const deleteExpense = async (id) => {
  const response = await apiConfig.delete(`/expenses/${id}`);
  return response.data;
};

/**
 * Fetch all expense categories with advanced filtering, pagination, and sorting options
 * @param {Object} options - Query options for filtering, pagination, and sorting
 * @returns {Promise<Object>} - Object containing categories array and pagination metadata
 */
export const getExpenseCategories = async (options = {}) => {
  // Build query parameters from options
  const queryParams = new URLSearchParams();

  // Pagination
  if (options.page) queryParams.append("page", options.page);
  if (options.limit) queryParams.append("limit", options.limit);

  // Sorting
  if (options.sort) queryParams.append("sort", options.sort);

  // Field selection
  if (options.select) queryParams.append("select", options.select);

  // Filtering
  if (options.isActive !== undefined)
    queryParams.append("isActive", options.isActive);
  if (options.search) queryParams.append("search", options.search);
  if (options.hasBudget !== undefined)
    queryParams.append("hasBudget", options.hasBudget);

  // Include additional data
  if (options.includeUsage !== undefined)
    queryParams.append("includeUsage", options.includeUsage);
  if (options.includeBudgetAlerts !== undefined)
    queryParams.append("includeBudgetAlerts", options.includeBudgetAlerts);
  if (options.includeRecentExpenses)
    queryParams.append(
      "includeRecentExpenses",
      options.includeRecentExpenses
    );
  if (options.includeExpenseCounts !== undefined)
    queryParams.append("includeExpenseCounts", options.includeExpenseCounts);

  // Period options
  if (options.period) queryParams.append("period", options.period);

  // User-specific data
  if (options.withUserUsage !== undefined)
    queryParams.append("withUserUsage", options.withUserUsage);
  if (options.sortByUserUsage !== undefined)
    queryParams.append("sortByUserUsage", options.sortByUserUsage);

  // Create the URL with query string
  const queryString = queryParams.toString();
  const url = `/categories${queryString ? `?${queryString}` : ""}`;

  const response = await apiConfig.get(url);

  // If for a single category request with ID
  if (options.id) {
    // If the server returns a single category object instead of an array
    const category = response.data.data || response.data;
    if (!Array.isArray(category)) {
      return {
        categories: [category], // Wrap single category in array
        pagination: null,
        totalCount: 1,
        summary: response.data.summary || null,
      };
    }
  }

  // Extract data and ensure categories is always an array
  let categories = [];
  if (response.data.data) {
    // If response has a data property, use it
    categories = Array.isArray(response.data.data)
      ? response.data.data
      : [response.data.data];
  } else if (Array.isArray(response.data)) {
    // If response.data is directly an array
    categories = response.data;
  } else {
    // Fallback: wrap single object in array
    categories = [response.data];
  }

  return {
    categories,
    pagination: response.data.pagination || null,
    totalCount: response.data.totalCount || categories.length,
    summary: response.data.summary || null,
  };
};

/**
 * Create a new expense category
 * @param {Object} categoryData - The category data to create
 * @returns {Promise<Object>} - The created category object
 */
export const createCategory = async (categoryData) => {
  const response = await apiConfig.post("/categories", categoryData);
  return response.data;
};

/**
 * Update an existing category
 * @param {string} id - The category ID to update
 * @param {Object} categoryData - The category data to update
 * @returns {Promise<Object>} - The updated category object
 */
export const updateCategory = async (id, categoryData) => {
  const response = await apiConfig.put(`/categories/${id}`, categoryData);
  return response.data;
};

/**
 * Delete an expense category
 * @param {string} id - The category ID to delete
 * @returns {Promise<Object>} - The response data
 */
export const deleteCategory = async (id) => {
  const response = await apiConfig.delete(`/categories/${id}`);
  return response.data;
};

/**
 * Fetch a single expense category by ID
 * @param {string} id - The category ID
 * @returns {Promise<Object>} - The category object
 */
export const getCategoryById = async (id) => {
  const response = await apiConfig.get(`/categories/${id}`);
  return response.data;
};

/**
 * Fetch expenses for a specific category
 * @param {string} categoryId - The category ID to fetch expenses for
 * @returns {Promise<Array>} - Array of expenses for the category
 */
export const getExpensesByCategory = async (categoryId) => {
  const response = await apiConfig.get(`/expenses?category=${categoryId}`);
  return response.data;
};

/**
 * Fetch all expenses without filtering
 * This can be used as a fallback if category-specific requests aren't working
 */
export const getAllExpenses = async () => {
  const response = await apiConfig.get("/expenses");
  return response.data;
};

/**
 * Preview enhanced notes using AI
 * @param {Object} data - Object containing notes and expense context data
 * @returns {Promise<Object>} - Object containing original and enhanced notes
 */
export const previewEnhancedNotes = async (data) => {
  const response = await apiConfig.post("/expenses/preview-notes", data);
  return response.data;
};

/**
 * Get expenses with route data for visualization
 * @param {Object} filters - Optional filters for expenses with routes
 * @returns {Promise<Array>} - Array of expense objects with route data
 */
export const getExpensesWithRoutes = async (filters = {}) => {
  const queryParams = new URLSearchParams();

  if (filters.startDate) queryParams.append("startDate", filters.startDate);
  if (filters.endDate) queryParams.append("endDate", filters.endDate);
  if (filters.category) queryParams.append("category", filters.category);
  if (filters.includeRoutes) queryParams.append("includeRoutes", "true");

  const queryString = queryParams.toString();
  const url = `/expenses${queryString ? `?${queryString}` : ""}`;

  const response = await apiConfig.get(url);
  return response.data;
};

/**
 * Store route snapshot for an expense
 * @param {string} expenseId - The expense ID
 * @param {Object} routeData - The route data to store
 * @returns {Promise<Object>} - Success response
 */
export const storeRouteSnapshot = async (expenseId, routeData) => {
  const response = await apiConfig.post(`/expenses/${expenseId}/route-snapshot`, routeData);
  return response.data;
};

/**
 * Get route snapshot for an expense
 * @param {string} expenseId - The expense ID
 * @returns {Promise<Object>} - Route data
 */
export const getRouteSnapshot = async (expenseId) => {
  const response = await apiConfig.get(`/expenses/${expenseId}/route-snapshot`);
  return response.data;
};

/**
 * Calculate route with waypoints
 * @param {Object} routeData - The route data with origin, destination, and waypoints
 * @returns {Promise<Object>} - Calculated route information
 */
export const calculateRouteWithWaypoints = async (routeData) => {
  const response = await apiConfig.post("/expenses/calculate-route", routeData);
  return response.data;
};
