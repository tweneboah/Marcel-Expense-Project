import apiConfig from "./apiConfig";

/**
 * Fetch all expenses with optional filtering
 * @param {Object} filters - Optional filters for expenses (e.g., date range, category)
 * @returns {Promise<Array>} - Array of expense objects
 */
export const getExpenses = async (filters = {}) => {
  try {
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

    console.log("🔍 Fetching expenses with URL:", url);
    console.log(
      "📦 Query parameters:",
      Object.fromEntries(queryParams.entries())
    );

    const response = await apiConfig.get(url);
    console.log("✅ Expenses response:", response.data);

    // Return the entire response data to preserve pagination and count
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching expenses:", error);
    throw error;
  }
};

/**
 * Fetch a single expense by ID
 * @param {string} id - The expense ID
 * @returns {Promise<Object>} - The expense object
 */
export const getExpenseById = async (id) => {
  try {
    const response = await apiConfig.get(`/expenses/${id}`);
    console.log("Expense details response:", response.data);

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
  } catch (error) {
    console.error(`Error fetching expense with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new expense
 * @param {Object} expenseData - The expense data to create
 * @returns {Promise<Object>} - The created expense object
 */
export const createExpense = async (expenseData) => {
  try {
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

    console.log("Creating expense with data:", expenseData);
    const response = await apiConfig.post("/expenses", expenseData);
    console.log("Expense creation response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
};

/**
 * Update an existing expense
 * @param {string} id - The expense ID to update
 * @param {Object} expenseData - The expense data to update
 * @returns {Promise<Object>} - The updated expense object
 */
export const updateExpense = async (id, expenseData) => {
  try {
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
  } catch (error) {
    console.error(`Error updating expense with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an expense
 * @param {string} id - The expense ID to delete
 * @returns {Promise<Object>} - The response data
 */
export const deleteExpense = async (id) => {
  try {
    const response = await apiConfig.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting expense with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch all expense categories with advanced filtering, pagination, and sorting options
 * @param {Object} options - Query options for filtering, pagination, and sorting
 * @returns {Promise<Object>} - Object containing categories array and pagination metadata
 */
export const getExpenseCategories = async (options = {}) => {
  try {
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

    console.log("Fetching categories with URL:", url);
    const response = await apiConfig.get(url);
    console.log("Categories API response data:", response.data);

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
      // If response itself is an array
      categories = response.data;
    } else if (response.data && typeof response.data === "object") {
      // If response is a single object
      categories = [response.data];
    }

    const result = {
      categories: categories,
      pagination: response.data.pagination || null,
      summary: response.data.summary || null,
      totalCount: response.data.totalCount || categories.length,
    };

    return result;
  } catch (error) {
    console.error("Error fetching expense categories:", error);
    // Return empty data with valid structure instead of throwing
    return { categories: [], pagination: null, totalCount: 0, summary: null };
  }
};

/**
 * Create a new expense category
 * @param {Object} categoryData - The category data to create
 * @returns {Promise<Object>} - The created category object
 */
export const createCategory = async (categoryData) => {
  try {
    console.log("Creating category with data:", categoryData);
    const response = await apiConfig.post("/categories", categoryData);
    console.log("Category creation response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

/**
 * Update an existing category
 * @param {string} id - The category ID to update
 * @param {Object} categoryData - The category data to update
 * @returns {Promise<Object>} - The updated category object
 */
export const updateCategory = async (id, categoryData) => {
  try {
    console.log("Updating category with ID:", id, "and data:", categoryData);
    const response = await apiConfig.put(`/categories/${id}`, categoryData);
    console.log("Category update response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an expense category
 * @param {string} id - The category ID to delete
 * @returns {Promise<Object>} - The response data
 */
export const deleteCategory = async (id) => {
  try {
    console.log("Deleting category with ID:", id);
    const response = await apiConfig.delete(`/categories/${id}`);
    console.log("Category deletion response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch a single expense category by ID
 * @param {string} id - The category ID
 * @returns {Promise<Object>} - The category object
 */
export const getCategoryById = async (id) => {
  try {
    const response = await apiConfig.get(`/categories/${id}`);
    console.log("Category details response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch expenses for a specific category
 * @param {string} categoryId - The category ID to fetch expenses for
 * @returns {Promise<Array>} - Array of expenses for the category
 */
export const getExpensesByCategory = async (categoryId) => {
  try {
    // Use /api/v1/expenses endpoint with categoryId filter
    const response = await apiConfig.get("/expenses", {
      params: { categoryId },
    });

    // Log the entire response to debug
    console.log(`Raw API response for category ${categoryId}:`, response);

    // Get the data array from the response
    let expenses = [];
    if (response.data.success && Array.isArray(response.data.data)) {
      expenses = response.data.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      expenses = response.data.data;
    } else if (Array.isArray(response.data)) {
      expenses = response.data;
    }

    console.log(`Found ${expenses.length} expenses for category ${categoryId}`);

    // If we have expenses, log the first one to understand structure
    if (expenses.length > 0) {
      console.log("Sample expense structure:", expenses[0]);

      // Try to extract amount from all expenses
      const amounts = expenses.map((expense) => {
        const costValue =
          expense.totalCost ||
          expense.total ||
          (expense.cost ? expense.cost.amount : null) ||
          0;

        console.log(`Expense ${expense._id || "unknown"} cost: ${costValue}`);
        return costValue;
      });

      console.log("All expense amounts:", amounts);
    }

    return expenses;
  } catch (error) {
    console.error(`Error fetching expenses for category ${categoryId}:`, error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Status:", error.response.status);
    }
    return [];
  }
};

/**
 * Fetch all expenses without filtering
 * This can be used as a fallback if category-specific requests aren't working
 */
export const getAllExpenses = async () => {
  try {
    const response = await apiConfig.get("/expenses");
    console.log("All expenses response:", response);

    let expenses = [];
    if (response.data.success && Array.isArray(response.data.data)) {
      expenses = response.data.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      expenses = response.data.data;
    } else if (Array.isArray(response.data)) {
      expenses = response.data;
    }

    console.log(`Retrieved ${expenses.length} total expenses`);

    // If we have expenses, log the first one
    if (expenses.length > 0) {
      console.log("Sample expense structure:", expenses[0]);
    }

    return expenses;
  } catch (error) {
    console.error("Error fetching all expenses:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Status:", error.response.status);
    }
    return [];
  }
};

/**
 * Preview enhanced notes using AI
 * @param {Object} data - Object containing notes and expense context data
 * @returns {Promise<Object>} - Object containing original and enhanced notes
 */
export const previewEnhancedNotes = async (data) => {
  try {
    console.log("Requesting AI note enhancement:", data);
    const response = await apiConfig.post("/expenses/enhance-notes", data);
    console.log("AI enhancement response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error enhancing notes with AI:", error);
    throw error;
  }
};

/**
 * Get expenses with route data for visualization
 * @param {Object} filters - Optional filters for expenses with routes
 * @returns {Promise<Array>} - Array of expense objects with route data
 */
export const getExpensesWithRoutes = async (filters = {}) => {
  try {
    // Construct query string from filters
    const queryParams = new URLSearchParams();

    if (filters.startDate) {
      queryParams.append("startDate", filters.startDate);
    }

    if (filters.endDate) {
      queryParams.append("endDate", filters.endDate);
    }

    if (filters.limit) {
      queryParams.append("limit", filters.limit);
    }

    // Convert queryParams to string
    const queryString = queryParams.toString();
    const url = `/expenses/routes${queryString ? `?${queryString}` : ""}`;

    const response = await apiConfig.get(url);
    console.log("Expenses with routes response:", response.data);

    // Extract expenses data from the nested structure
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching expenses with routes:", error);
    throw error;
  }
};

/**
 * Store route snapshot for an expense
 * @param {string} expenseId - The expense ID
 * @param {Object} routeData - The route data to store
 * @returns {Promise<Object>} - Success response
 */
export const storeRouteSnapshot = async (expenseId, routeData) => {
  try {
    const response = await apiConfig.post(`/maps/route/snapshot/${expenseId}`, {
      routeData,
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error storing route snapshot for expense ID ${expenseId}:`,
      error
    );
    throw error;
  }
};

/**
 * Get route snapshot for an expense
 * @param {string} expenseId - The expense ID
 * @returns {Promise<Object>} - Route data
 */
export const getRouteSnapshot = async (expenseId) => {
  try {
    const response = await apiConfig.get(`/maps/route/snapshot/${expenseId}`);
    return response.data.data || null;
  } catch (error) {
    console.error(
      `Error getting route snapshot for expense ID ${expenseId}:`,
      error
    );
    return null;
  }
};

/**
 * Calculate route with waypoints
 * @param {Object} routeData - The route data with origin, destination, and waypoints
 * @returns {Promise<Object>} - Calculated route information
 */
export const calculateRouteWithWaypoints = async (routeData) => {
  try {
    const {
      originPlaceId,
      destinationPlaceId,
      waypoints = [],
      optimizeWaypoints = false,
      includeAlternatives = false,
    } = routeData;

    const response = await apiConfig.post("/maps/route/optimize", {
      originPlaceId,
      destinationPlaceId,
      waypoints,
      optimizeWaypoints,
      includeAlternatives,
    });

    return response.data.data || null;
  } catch (error) {
    console.error("Error calculating route with waypoints:", error);
    throw error;
  }
};
