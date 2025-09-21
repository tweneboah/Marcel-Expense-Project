import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaPlus,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaList,
  FaSync,
  FaInfoCircle,
  FaMoneyBillWave,
  FaRuler,
  FaPercentage,
  FaStickyNote,
  FaChartLine,
  FaCheck,
  FaHistory,
} from "react-icons/fa";
import { createBudget, getBudgets } from "../../api/budgetApi";
import { getExpenseCategories } from "../../api/expenseApi";
import { useAuth } from "../../context/AuthContext";
import { tokenStorage } from "../../utils/secureStorage";

const CreateBudget = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [existingBudgets, setExistingBudgets] = useState([]);
  const [loadingBudgets, setLoadingBudgets] = useState(false);
  const [budgetError, setBudgetError] = useState(null);

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    category: "",
    amount: "",
    maxDistance: "",
    notes: "",
    warningThreshold: 75,
    criticalThreshold: 90,
    isActive: true,
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Only admin users can create budgets
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Fetch categories function
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await getExpenseCategories();
      // Categories loaded successfully

      // Handle different response structures
      if (response && response.categories) {
        setCategories(response.categories);
      } else if (response && Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (
        response &&
        response.data &&
        Array.isArray(response.data.data)
      ) {
        setCategories(response.data.data);
      } else {
          // Unexpected response structure, using empty array
          setCategories([]);
        }
      } catch (err) {
        // Error handled by error context
      setError("Failed to load categories. Please try again later.");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      // Fetch existing budgets when component mounts
      fetchExistingBudgets();
    }
  }, [isAuthenticated]);

  // Function to fetch existing budgets using the debug endpoint
  const fetchExistingBudgets = async () => {
    try {
      setBudgetError(null);
      setLoadingBudgets(true);

      // Check if categories are loaded, and if not, load them first
      if (categories.length === 0 && !loadingCategories) {
        await fetchCategories();
      }

      // Use direct API call to /api/v1/budgets instead of utility function
      const token = tokenStorage.getToken();
      if (!token) {
        setBudgetError("Authentication token not found. Please log in again.");
        setLoadingBudgets(false);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/v1/budgets?limit=5",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch budgets: ${response.statusText}`);
      }

      const responseData = await response.json();

      // Handle different response structures
      let budgetsData = [];
      if (
        responseData &&
        responseData.data &&
        Array.isArray(responseData.data)
      ) {
        budgetsData = responseData.data;
      } else if (responseData && Array.isArray(responseData.data)) {
        budgetsData = responseData.data;
      } else if (Array.isArray(responseData)) {
        budgetsData = responseData;
      } else {
        // Unexpected response structure
        setBudgetError(
          "Failed to load existing budgets. Unexpected data format."
        );
        setExistingBudgets([]);
        return;
      }

      // Process budgets data
      const processedBudgets = budgetsData.map((budget) => {
        return budget;
      });

      setExistingBudgets(processedBudgets);
    } catch (err) {
      // Error handled by error context
      setBudgetError(
        "Failed to load existing budgets. Please try again later."
      );
      setExistingBudgets([]);
    } finally {
      setLoadingBudgets(false);
    }
  };

  // Helper function to get category name for a budget
  const getCategoryNameForBudget = (budget) => {
    if (!budget) return "Unknown";

    // If category is already populated with name
    if (budget.category && budget.category.name) {
      return budget.category.name;
    }

    // If category is a string ID
    if (budget.category && typeof budget.category === "string") {
      const categoryObj = categories.find((c) => c._id === budget.category);
      return categoryObj?.name || "Unknown";
    }

    // If there's a specific categoryId field
    if (budget.categoryId) {
      const categoryObj = categories.find((c) => c._id === budget.categoryId);
      return categoryObj?.name || "Unknown";
    }

    // If category is an object with _id
    if (budget.category && budget.category._id) {
      const categoryObj = categories.find((c) => c._id === budget.category._id);
      return categoryObj?.name || "Unknown";
    }

    return "Unknown";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Client-side validation
    if (!formData.category) {
      setError("Please select a category");
      setIsLoading(false);
      return;
    }

    if (!formData.amount) {
      setError("Please enter a budget amount");
      setIsLoading(false);
      return;
    }

    try {
      // Convert numeric string values to numbers
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        maxDistance: formData.maxDistance
          ? parseFloat(formData.maxDistance)
          : undefined,
        warningThreshold: parseFloat(formData.warningThreshold) || 75,
        criticalThreshold: parseFloat(formData.criticalThreshold) || 90,
      };

      const response = await createBudget(budgetData);

      if (response && (response.success || response.data || response._id)) {
        // Get the created budget ID
        const budgetId = response.data?._id || response._id;

        // Instead of redirecting, show success message and reset form
        const categoryName =
          categories.find((c) => c._id === formData.category)?.name ||
          "Selected category";
        setSuccessMessage(
          `Budget for ${categoryName} created successfully${
            budgetId ? ` (ID: ${budgetId})` : ""
          }`
        );

        // Reset form to create another budget
        setFormData({
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          category: "",
          amount: "",
          maxDistance: "",
          notes: "",
          warningThreshold: 75,
          criticalThreshold: 90,
          isActive: true,
        });

        // Refresh the list of existing budgets
        fetchExistingBudgets();

        // Scroll to top to see the success message
        window.scrollTo(0, 0);
      } else {
        const errorMessage =
          response?.message || "Failed to create budget. Please try again.";
        setError(errorMessage);
      }
    } catch (err) {
      // Error handled by error context

      // Handle different types of errors
      if (err.message && typeof err.message === "string") {
        // Client-side validation error or other error with message
        setError(err.message);
      } else if (err.response?.data?.message) {
        // Server returned an error message
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        // Alternative error field
        setError(err.response.data.error);
      } else if (err.response?.statusText) {
        // Server returned a status text
        setError(`Server error: ${err.response.statusText}`);
      } else {
        // Fallback error message
        setError("Failed to create budget. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Direct API test function
  const testDirectApiCall = async () => {
    try {
      setError(null);

      // Get token from secure storage
      const token = tokenStorage.getToken();
      if (!token) {
        setError("No authentication token found. Please log in again.");
        return;
      }

      // Basic test data
      const testData = {
        year: 2023,
        month: 1,
        categoryId: formData.category || categories[0]?._id,
        amount: 500,
        notes: "API test budget",
      };

      // Make direct fetch call to API
      const response = await fetch("http://localhost:5000/api/v1/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Direct API call succeeded!");
      } else {
        setError(
          `Direct API test failed: ${
            data.message || data.error || response.statusText
          }`
        );
      }
    } catch (err) {
      // Error handled by error context
      setError(`Direct API test error: ${err.message}`);
    }
  };

  const generateMonthOptions = () => {
    const months = [
      { value: 1, label: "January" },
      { value: 2, label: "February" },
      { value: 3, label: "March" },
      { value: 4, label: "April" },
      { value: 5, label: "May" },
      { value: 6, label: "June" },
      { value: 7, label: "July" },
      { value: 8, label: "August" },
      { value: 9, label: "September" },
      { value: 10, label: "October" },
      { value: 11, label: "November" },
      { value: 12, label: "December" },
      { value: 0, label: "Annual Budget" },
    ];

    return months.map((month) => (
      <option key={month.value} value={month.value}>
        {month.label}
      </option>
    ));
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let i = currentYear - 1; i <= currentYear + 2; i++) {
      years.push(i);
    }

    return years.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ));
  };

  // Helper function to get badge color
  const getBadgeColor = (isActive) => {
    return isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-6 md:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center">
          <Link
            to="/admin/budgets"
            className="flex items-center mr-4 text-[#3d348b] hover:text-[#7678ed] transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-bold">Create New Budget</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Form Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
          >
            <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] p-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FaMoneyBillWave className="mr-2" />
                Budget Details
              </h2>
              <p className="text-white/80 mt-1">
                Fill in the information below to create a new budget
              </p>
            </div>

            {/* Alert Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-l-4 border-red-500 p-4 m-4 flex items-start"
              >
                <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-700">Error</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border-l-4 border-green-500 p-4 m-4 flex items-start"
              >
                <FaCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-700">Success</p>
                  <p className="text-sm text-green-600">{successMessage}</p>
                  <div className="mt-3 flex gap-3">
                    <Link
                      to="/admin/budgets"
                      className="px-3 py-1.5 bg-[#3d348b] text-white text-sm rounded-md hover:bg-[#7678ed] transition-colors flex items-center"
                    >
                      <FaList className="mr-1.5" /> View All Budgets
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSuccessMessage(null)}
                      className="px-3 py-1.5 bg-[#f7b801] text-white text-sm rounded-md hover:bg-opacity-90 transition-colors flex items-center"
                    >
                      <FaPlus className="mr-1.5" /> Create Another
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {!isAuthenticated ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 m-4">
                <div className="flex">
                  <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-yellow-700">
                    You need to be logged in to create budgets. Please log in
                    first.
                  </p>
                </div>
              </div>
            ) : !isAdmin ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 m-4">
                <div className="flex">
                  <FaExclamationTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-yellow-700">
                    Only administrators can create and manage budgets.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
                  >
                    {/* Period Selection */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaCalendarAlt className="inline mr-2 text-[#3d348b]" />
                        Year
                      </label>
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed] transition-colors"
                        required
                      >
                        {generateYearOptions()}
                      </select>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaCalendarAlt className="inline mr-2 text-[#3d348b]" />
                        Month
                      </label>
                      <select
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed] transition-colors"
                        required
                      >
                        {generateMonthOptions()}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Select "Annual Budget" for a yearly budget instead of
                        monthly
                      </p>
                    </motion.div>

                    {/* Category & Amount */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaList className="inline mr-2 text-[#3d348b]" />
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed] transition-colors"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {loadingCategories && (
                        <p className="text-xs text-gray-500 mt-1">
                          Loading categories...
                        </p>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaMoneyBillWave className="inline mr-2 text-[#3d348b]" />
                        Budget Amount (CHF)
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="e.g. 500.00"
                        min="0"
                        step="0.01"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed] transition-colors"
                        required
                      />
                    </motion.div>

                    {/* Max Distance & Warning Threshold */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaRuler className="inline mr-2 text-[#3d348b]" />
                        Maximum Distance (km)
                      </label>
                      <input
                        type="number"
                        name="maxDistance"
                        value={formData.maxDistance}
                        onChange={handleChange}
                        placeholder="e.g. 750"
                        min="0"
                        step="0.1"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed] transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Optional: Set a maximum allowed distance for this budget
                      </p>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaPercentage className="inline mr-2 text-[#f7b801]" />
                        Warning Threshold (%)
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          name="warningThreshold"
                          value={formData.warningThreshold}
                          onChange={handleChange}
                          min="1"
                          max="100"
                          className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#f7b801]"
                        />
                        <span className="ml-3 w-14 p-1 bg-[#f7b801] text-white text-center text-sm rounded-md">
                          {formData.warningThreshold}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        When budget usage reaches this percentage, a warning
                        will be shown
                      </p>
                    </motion.div>

                    {/* Critical Threshold */}
                    <motion.div variants={itemVariants}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaPercentage className="inline mr-2 text-[#f35b04]" />
                        Critical Threshold (%)
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          name="criticalThreshold"
                          value={formData.criticalThreshold}
                          onChange={handleChange}
                          min="1"
                          max="100"
                          className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#f35b04]"
                        />
                        <span className="ml-3 w-14 p-1 bg-[#f35b04] text-white text-center text-sm rounded-md">
                          {formData.criticalThreshold}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        When budget usage reaches this percentage, a critical
                        alert will be shown
                      </p>
                    </motion.div>

                    {/* Notes (full width) */}
                    <motion.div
                      variants={itemVariants}
                      className="md:col-span-2"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaStickyNote className="inline mr-2 text-[#3d348b]" />
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Additional notes or comments about this budget"
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed] transition-colors"
                      />
                    </motion.div>
                  </motion.div>

                  {/* Button Group */}
                  <motion.div
                    variants={itemVariants}
                    className="mt-6 flex justify-end space-x-4"
                  >
                    <Link
                      to="/admin/budgets"
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <FaTimes className="mr-2" />
                      Cancel
                    </Link>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className={`px-4 py-2 bg-gradient-to-r from-[#3d348b] to-[#7678ed] text-white rounded-md hover:opacity-90 transition-colors flex items-center ${
                        isLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                      whileHover={{ scale: isLoading ? 1 : 1.03 }}
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Create Budget
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            )}
          </motion.div>
        </div>

        {/* Side Panel */}
        <div>
          {/* Recent Budgets Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#f7b801] to-[#f35b04] p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <FaHistory className="mr-2" />
                Recent Budgets
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchExistingBudgets}
                disabled={loadingBudgets}
                className="p-1.5 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all"
              >
                <FaSync className={loadingBudgets ? "animate-spin" : ""} />
              </motion.button>
            </div>

            <div className="p-4">
              {budgetError && (
                <div className="mb-4 text-sm p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                  <FaExclamationTriangle className="inline mr-2" />
                  {budgetError}
                </div>
              )}

              {loadingBudgets && existingBudgets.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-gray-500">
                  <svg
                    className="animate-spin h-8 w-8 text-[#7678ed] mb-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p>Loading budgets...</p>
                </div>
              ) : existingBudgets.length === 0 ? (
                <div className="py-6 text-center">
                  <FaInfoCircle className="mx-auto mb-2 text-gray-400 text-xl" />
                  <p className="text-gray-500">
                    No budgets found. Create your first budget using the form.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {existingBudgets.map((budget) => {
                      // Format the period (month/year)
                      let period = "Unknown";
                      if (budget.month === 0) {
                        period = `Annual ${budget.year}`;
                      } else {
                        const date = new Date(budget.year, budget.month - 1);
                        period = date.toLocaleDateString(undefined, {
                          month: "long",
                          year: "numeric",
                        });
                      }

                      // Get category name
                      const categoryName = getCategoryNameForBudget(budget);

                      return (
                        <li key={budget._id} className="py-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{categoryName}</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <FaCalendarAlt className="mr-1 text-xs" />
                                <span>{period}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#3d348b]">
                                CHF {Number(budget.amount).toFixed(2)}
                              </p>
                              <span
                                className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${getBadgeColor(
                                  budget.isActive
                                )}`}
                              >
                                {budget.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 flex space-x-2">
                            <Link
                              to={`/admin/budgets/${budget._id}`}
                              className="text-xs px-2 py-1 bg-[#3d348b] text-white rounded hover:bg-[#7678ed] transition-colors"
                            >
                              View
                            </Link>
                            <Link
                              to={`/admin/budgets/edit/${budget._id}`}
                              className="text-xs px-2 py-1 bg-[#f7b801] text-white rounded hover:bg-opacity-90 transition-colors"
                            >
                              Edit
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-4 text-center flex justify-center space-x-3">
                    <Link
                      to="/admin/budgets"
                      className="inline-block px-4 py-2 text-sm bg-[#3d348b] text-white rounded-md hover:bg-[#7678ed] transition-colors"
                    >
                      View All Budgets
                    </Link>
                    <Link
                      to="/admin/reports/all-budgets"
                      className="inline-block px-4 py-2 text-sm bg-[#f7b801] text-white rounded-md hover:bg-[#f35b04] transition-colors"
                    >
                      Budget Reports
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Help Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden mt-6"
          >
            <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] p-4">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <FaInfoCircle className="mr-2" />
                Budget Information
              </h2>
            </div>
            <div className="p-4">
              <ul className="space-y-3 text-sm">
                <li className="flex">
                  <FaCalendarAlt className="text-[#3d348b] mt-1 mr-3 flex-shrink-0" />
                  <p>
                    <span className="font-medium">Period:</span> Select month
                    and year for your budget. Choose "Annual Budget" for a
                    yearly allocation.
                  </p>
                </li>
                <li className="flex">
                  <FaMoneyBillWave className="text-[#f35b04] mt-1 mr-3 flex-shrink-0" />
                  <p>
                    <span className="font-medium">Amount:</span> Total budget
                    allocation in Swiss Francs (CHF) for the selected period and
                    category.
                  </p>
                </li>
                <li className="flex">
                  <FaChartLine className="text-[#f7b801] mt-1 mr-3 flex-shrink-0" />
                  <p>
                    <span className="font-medium">Thresholds:</span> Set warning
                    (yellow) and critical (red) levels for budget usage alerts.
                  </p>
                </li>
              </ul>

              <div className="mt-4 text-xs text-gray-500">
                <div className="flex items-center justify-between mb-1">
                  <span>Budget Usage:</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: "60%" }}
                    ></div>
                    <div
                      className="h-full bg-[#f7b801]"
                      style={{ width: "20%" }}
                    ></div>
                    <div
                      className="h-full bg-[#f35b04]"
                      style={{ width: "20%" }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-green-500">Under Budget</span>
                  <span className="text-[#f7b801]">Warning</span>
                  <span className="text-[#f35b04]">Critical</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateBudget;
