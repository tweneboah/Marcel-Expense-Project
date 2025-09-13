import apiConfig from "./apiConfig";

/**
 * Fetch all budgets with optional filtering
 * @param {Object} filters - Optional filters for budgets (e.g., year, month, category)
 * @returns {Promise<Object>} - Object containing budget data and pagination info
 */
export const getBudgets = async (filters = {}) => {
  try {
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

    console.log("🔍 Fetching budgets with URL:", url);
    console.log(
      "📦 Query parameters:",
      Object.fromEntries(queryParams.entries())
    );

    const response = await apiConfig.get(url);
    console.log("✅ Budgets response:", response.data);

    // Return the entire response data to preserve pagination and count
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching budgets:", error);
    throw error;
  }
};

/**
 * Fetch a single budget by ID
 * @param {string} id - The budget ID
 * @returns {Promise<Object>} - The budget object
 */
export const getBudgetById = async (id) => {
  try {
    console.log(`Fetching budget with ID: ${id}`);
    const response = await apiConfig.get(`/budgets/${id}`);
    console.log("Budget details response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching budget with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new budget
 * @param {Object} budgetData - The budget data to create
 * @returns {Promise<Object>} - The created budget object
 */
export const createBudget = async (budgetData) => {
  try {
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

    console.log(
      "Creating budget with transformed data:",
      JSON.stringify(transformedData, null, 2)
    );

    // Validate required fields
    if (!transformedData.categoryId) {
      throw new Error("Category is required");
    }

    if (transformedData.amount === undefined || isNaN(transformedData.amount)) {
      throw new Error("Budget amount is required and must be a number");
    }

    const response = await apiConfig.post("/budgets", transformedData);

    // Log the raw response
    console.log("Budget creation raw response:", response);
    console.log("Budget creation response data:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error creating budget:", error);
    // Log additional error details if available
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error(
        "Full error response:",
        JSON.stringify(error.response, null, 2)
      );
    }
    throw error;
  }
};

/**
 * Update an existing budget
 * @param {string} id - The budget ID to update
 * @param {Object} budgetData - The budget data to update
 * @returns {Promise<Object>} - The updated budget object
 */
export const updateBudget = async (id, budgetData) => {
  try {
    console.log(`Updating budget with ID: ${id}`, budgetData);
    const response = await apiConfig.put(`/budgets/${id}`, budgetData);
    console.log("Budget update response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating budget with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a budget
 * @param {string} id - The budget ID to delete
 * @returns {Promise<Object>} - The response data
 */
export const deleteBudget = async (id) => {
  try {
    console.log(`Deleting budget with ID: ${id}`);
    const response = await apiConfig.delete(`/budgets/${id}`);
    console.log("Budget deletion response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting budget with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get budget summary with usage statistics
 * @param {Object} filters - Optional filters for the summary (e.g., year, month)
 * @returns {Promise<Object>} - Budget summary data
 */
export const getBudgetSummary = async (filters = {}) => {
  try {
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
    console.log("Budget summary response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching budget summary:", error);
    throw error;
  }
};
