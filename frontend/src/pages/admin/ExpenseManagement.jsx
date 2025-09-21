import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getExpenses,
  getExpenseCategories,
  deleteExpense,
} from "../../api/expenseApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ExpenseFilters from "../../components/expenses/ExpenseFilters";
import { formatDistance } from "../../utils/googleMaps";
import { useExpenseRoutes } from "../../utils/routeHelpers";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCalendar,
  FiTrendingUp,
  FiChevronRight,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiDownload,
  FiRefreshCw,
  FiInfo,
  FiArrowUpRight,
  FiFileText,
} from "react-icons/fi";
import {
  FaCar,
  FaRoute,
  FaMapMarkerAlt,
  FaRegClock,
  FaMoneyBillWave,
  FaUserAlt,
} from "react-icons/fa";
import { Alert } from "../../components/ui/Alert";

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const routes = useExpenseRoutes();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getExpenseCategories();
        setCategories(data.categories || []);
      } catch (err) {
        // Error handled by error context
      }
    };

    fetchCategories();
  }, []);

  // Fetch expenses with filters and pagination
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);

        // Prepare query parameters for the API
        const queryParams = {};

        // Add pagination parameters
        queryParams.page = currentPage;
        queryParams.limit = itemsPerPage;

        // Add date range filters
        if (filters.startDate) {
          queryParams.startDate = filters.startDate;
        }

        if (filters.endDate) {
          queryParams.endDate = filters.endDate;
        }

        // Add status filter
        if (filters.filterStatus) {
          queryParams.status = filters.filterStatus;
        }

        // Add category filter
        if (filters.categoryId) {
          queryParams.category = filters.categoryId;
        }

        // Fetching expenses with filters
        const data = await getExpenses(queryParams);

        // Handle the response data
        if (data.data) {
          setExpenses(data.data);
        } else {
          setExpenses(data);
        }

        // Set pagination data
        if (data.pagination) {
          setPagination(data.pagination);
        }

        // Set total count
        if (data.count !== undefined) {
          setTotalItems(data.count);
        } else if (Array.isArray(data.data)) {
          setTotalItems(data.data.length);
        } else if (Array.isArray(data)) {
          setTotalItems(data.length);
        }
      } catch (err) {
          // Error handled by error context
          setError("Failed to load expenses. Please try again later.");
        } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [filters, currentPage, itemsPerPage]);

  // Format date to display in a user-friendly format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle filter changes from ExpenseFilters component
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search term changes
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle items per page change
  const handleLimitChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when limit changes
  };

  // Export expenses as CSV
  const handleExportCSV = () => {
    try {
      // Show loading indicator during export
      setLoading(true);

      // If no expenses to export, show notification
      if (filteredExpenses.length === 0) {
        setNotification({
          type: "warning",
          message:
            "No expenses to export. Please adjust your filters or add expenses.",
        });
        setTimeout(() => setNotification(null), 5000);
        setLoading(false);
        return;
      }

      // Define CSV headers
      const headers = [
        "ID",
        "Employee",
        "Email",
        "Date",
        "Starting Point",
        "Destination Point",
        "Distance (km)",
        "Category",
        "Amount (CHF)",
        "Status",
        "Notes",
      ];

      // Transform expenses data into CSV rows
      const csvData = filteredExpenses.map((expense) => [
        expense._id,
        expense.user?.name || "Unknown User",
        expense.user?.email || "",
        formatDate(expense.journeyDate || expense.expenseDate),
        expense.startingPoint || expense.startLocation || "",
        expense.destinationPoint || expense.endLocation || "",
        (expense.distance || expense.distanceInKm || 0).toFixed(2),
        expense.category?.name || "Uncategorized",
        (expense.totalCost || 0).toFixed(2),
        expense.status
          ? expense.status.charAt(0).toUpperCase() + expense.status.slice(1)
          : "Pending",
        expense.notes || "",
      ]);

      // Add headers to the beginning of the data array
      csvData.unshift(headers);

      // Convert data to CSV format
      const csvContent = csvData
        .map((row) =>
          row
            .map((cell) => {
              // Handle fields with commas, quotes, or newlines by enclosing in quotes
              const cellStr = String(cell).replace(/"/g, '""');
              return /[,"\n\r]/.test(cellStr) ? `"${cellStr}"` : cellStr;
            })
            .join(",")
        )
        .join("\n");

      // Create a Blob with the CSV data
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      // Create a download link
      const link = document.createElement("a");

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);

      // Generate a filename with date and time
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");
      const filename = `expenses-export-${dateStr}-${timeStr}.csv`;

      // Set the link's properties
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";

      // Add the link to the document
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success notification
      setNotification({
        type: "success",
        message: `${filteredExpenses.length} expenses exported successfully`,
      });

      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      // Error handled by error context

      // Show error notification
      setNotification({
        type: "error",
        message:
          "Failed to export expenses: " +
          (error.message || "Unknown error occurred"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter expenses by search term (client-side filtering)
  const filteredExpenses = expenses.filter((expense) => {
    if (!searchTerm) return true;

    const startPoint = expense.startingPoint || expense.startLocation || "";
    const endPoint = expense.destinationPoint || expense.endLocation || "";
    const category = expense.category?.name || "";
    const date = formatDate(expense.journeyDate || expense.expenseDate || "");
    const userName = expense.user?.name || "";

    const searchLower = searchTerm.toLowerCase();
    return (
      startPoint.toLowerCase().includes(searchLower) ||
      endPoint.toLowerCase().includes(searchLower) ||
      category.toLowerCase().includes(searchLower) ||
      date.toLowerCase().includes(searchLower) ||
      userName.toLowerCase().includes(searchLower)
    );
  });

  // Calculate pagination information for display
  const paginationInfo = pagination
    ? {
        ...pagination,
        startItem: (currentPage - 1) * itemsPerPage + 1,
        endItem: Math.min(currentPage * itemsPerPage, totalItems),
      }
    : null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  // Helper function to determine if an expense has waypoints
  const hasWaypoints = (expense) => {
    return (
      expense.waypoints &&
      Array.isArray(expense.waypoints) &&
      expense.waypoints.length > 0
    );
  };

  // Get status icon based on expense status
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <FiCheck className="mr-1" />;
      case "rejected":
        return <FiX className="mr-1" />;
      default:
        return <FiAlertCircle className="mr-1" />;
    }
  };

  // Get status color based on expense status
  const getStatusColors = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-yellow-400 text-[#3d348b]";
    }
  };

  // Prepare expense deletion
  const confirmDeleteExpense = (id) => {
    setExpenseToDelete(id);
    setShowDeleteConfirm(true);
    setDeleteError(null);
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setExpenseToDelete(null);
  };

  // Handle expense deletion
  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;

    try {
      setLoading(true);
      await deleteExpense(expenseToDelete);

      // Remove the deleted expense from the state
      setExpenses(
        expenses.filter((expense) => expense._id !== expenseToDelete)
      );

      // Update total items count
      setTotalItems((prev) => prev - 1);

      // Show success notification
      setNotification({
        type: "success",
        message: "Expense deleted successfully",
      });

      // Close the confirmation modal
      setShowDeleteConfirm(false);
      setExpenseToDelete(null);

      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (error) {
      // Error handled by error context
      setDeleteError("Failed to delete expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Show notification if exists */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert
            variant={notification.type}
            onClose={() => setNotification(null)}
          >
            {notification.message}
          </Alert>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-[#3d348b] mb-4">
              Confirm Deletion
            </h3>
            <p className="mb-6">
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </p>

            {deleteError && (
              <div className="mb-4 p-2 border border-red-300 bg-red-50 text-red-800 rounded">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteExpense}
                className="bg-[#f35b04] hover:bg-[#f35b04]/90 text-white"
              >
                Delete Expense
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Header Section */}
      <motion.div
        className="relative mb-8 bg-gradient-to-r from-[#3d348b] to-[#7678ed] rounded-xl shadow-lg overflow-hidden"
        variants={itemVariants}
      >
        <div className="absolute right-0 top-0 h-full w-1/3 overflow-hidden">
          <svg
            className="absolute right-0 top-0 h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 L100,0 Q50,50 100,100 L0,100 Z"
              fill="url(#headerGradient)"
              opacity="0.15"
            />
            <defs>
              <linearGradient
                id="headerGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#f7b801" />
                <stop offset="100%" stopColor="#f35b04" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="p-6 text-white relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <FaMoneyBillWave className="mr-3" /> Expense Management
              </h1>
              <p className="text-white/80 max-w-md">
                Manage and review all employee expenses
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex gap-2">
              <Button
                variant="secondary"
                icon={<FiDownload />}
                onClick={handleExportCSV}
                className="bg-[#f7b801] hover:bg-[#f7b801]/90 text-[#3d348b] border-none"
              >
                Export CSV
              </Button>
              <Link to={routes.createPath}>
                <Button
                  variant="secondary"
                  icon={<FiPlus />}
                  className="bg-white text-[#3d348b] border-none"
                >
                  Create Expense
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards Section */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        {/* Total Expenses Card */}
        <motion.div
          className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#3d348b]"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {loading ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  totalItems
                )}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#3d348b]/10 flex items-center justify-center text-[#3d348b]">
              <FiFileText className="h-6 w-6" />
            </div>
          </div>
        </motion.div>

        {/* Total Amount Card */}
        <motion.div
          className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#f35b04]"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-[#f35b04]">
                {loading ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  `${filteredExpenses
                    .reduce((sum, expense) => sum + (expense.totalCost || 0), 0)
                    .toFixed(2)} CHF`
                )}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#f35b04]/10 flex items-center justify-center text-[#f35b04]">
              <FaMoneyBillWave className="h-6 w-6" />
            </div>
          </div>
        </motion.div>

        {/* Total Distance Card */}
        <motion.div
          className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#7678ed]"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Total Distance
              </p>
              <p className="text-2xl font-bold text-[#7678ed]">
                {loading ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  `${filteredExpenses
                    .reduce(
                      (sum, expense) =>
                        sum + (expense.distance || expense.distanceInKm || 0),
                      0
                    )
                    .toFixed(0)} km`
                )}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#7678ed]/10 flex items-center justify-center text-[#7678ed]">
              <FiTrendingUp className="h-6 w-6" />
            </div>
          </div>
        </motion.div>

        {/* Average Per Expense Card */}
        <motion.div
          className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#f7b801]"
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Average Amount
              </p>
              <p className="text-2xl font-bold text-[#f7b801]">
                {loading || filteredExpenses.length === 0 ? (
                  <span className="text-gray-400">...</span>
                ) : (
                  `${(
                    filteredExpenses.reduce(
                      (sum, expense) => sum + (expense.totalCost || 0),
                      0
                    ) / filteredExpenses.length
                  ).toFixed(2)} CHF`
                )}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-[#f7b801]/10 flex items-center justify-center text-[#f7b801]">
              <FiTrendingUp className="h-6 w-6" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Advanced Filters */}
      <ExpenseFilters
        onFilter={handleFilterChange}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        pagination={paginationInfo}
        loading={loading}
        totalItems={totalItems}
      />

      {/* Expense List Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="animate-spin h-10 w-10 text-[#7678ed]"
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
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-600">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <FiX className="h-8 w-8" />
              </div>
            </div>
            <p className="text-lg mb-4">{error}</p>
            <Button
              variant="primary"
              className="bg-[#7678ed] hover:bg-[#7678ed]/90 focus:ring-[#7678ed]/50"
              onClick={() => window.location.reload()}
            >
              <FiRefreshCw className="mr-2" /> Try Again
            </Button>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center p-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-[#7678ed]/10 rounded-full">
                <FaRoute className="h-10 w-10 text-[#7678ed]" />
              </div>
            </div>
            <h3 className="text-xl font-medium text-[#3d348b] mb-2">
              {searchTerm || Object.keys(filters).length > 0
                ? "No matching expenses found"
                : "No expenses recorded yet"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || Object.keys(filters).length > 0
                ? "Try adjusting your search or filter criteria to find what you're looking for."
                : "There are no expenses recorded in the system yet."}
            </p>
            {(searchTerm || Object.keys(filters).length > 0) && (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setFilters({});
                }}
                className="bg-[#7678ed] hover:bg-[#7678ed]/90 text-white"
              >
                <FiRefreshCw className="mr-2" /> Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Employee
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Route
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Distance
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-[#3d348b]/10 flex items-center justify-center text-[#3d348b]">
                          <FaUserAlt size={12} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {expense.user?.name || "Unknown User"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {expense.user?.email || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(expense.journeyDate || expense.expenseDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <span className="truncate max-w-[120px]">
                          {expense.startingPoint || expense.startLocation}
                        </span>
                        <FiArrowUpRight className="mx-1 flex-shrink-0" />
                        <span className="truncate max-w-[120px]">
                          {expense.destinationPoint || expense.endLocation}
                        </span>
                      </div>
                      {hasWaypoints(expense) && (
                        <div className="text-xs text-[#f7b801] mt-1">
                          {expense.waypoints.length} waypoint
                          {expense.waypoints.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDistance(
                          expense.distance || expense.distanceInKm || 0
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {expense.category?.name || "Uncategorized"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#f35b04]">
                        {Number(expense.totalCost || 0).toFixed(2)} CHF
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColors(
                          expense.status
                        )}`}
                      >
                        {getStatusIcon(expense.status)}
                        {expense.status.charAt(0).toUpperCase() +
                          expense.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={routes.detailPath(expense._id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View details"
                        >
                          <FiEye />
                        </Link>
                        <Link
                          to={routes.editPath(expense._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit expense"
                        >
                          <FiEdit />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Delete expense"
                          onClick={() => confirmDeleteExpense(expense._id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Summary Section */}
      {!loading && !error && filteredExpenses.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="mt-6 bg-gradient-to-r from-[#3d348b] to-[#7678ed] rounded-lg shadow-lg p-5 text-white"
        >
          <div className="flex flex-col sm:flex-row justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <FiInfo className="mr-2" /> Summary
              </h3>
              <p className="text-white/80">
                {Math.ceil(totalItems / itemsPerPage) > 0 ? currentPage : 1} of{" "}
                {Math.ceil(totalItems / itemsPerPage) || 1} expenses
              </p>
              {Object.keys(filters).length > 0 && (
                <div className="mt-2 text-xs text-white/80 max-w-md">
                  <p className="font-semibold mb-1">Active filters:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {filters.startDate && (
                      <li>
                        From: {new Date(filters.startDate).toLocaleDateString()}
                      </li>
                    )}
                    {filters.endDate && (
                      <li>
                        To: {new Date(filters.endDate).toLocaleDateString()}
                      </li>
                    )}
                    {filters.filterStatus && (
                      <li>Status: {filters.filterStatus}</li>
                    )}
                    {filters.categoryId && (
                      <li>
                        Category:{" "}
                        {categories.find((c) => c._id === filters.categoryId)
                          ?.name || "Selected category"}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="p-3 bg-white/10 rounded-lg">
                <p className="text-sm text-white/80">Total Amount</p>
                <p className="text-2xl font-bold">
                  {filteredExpenses
                    .reduce((sum, expense) => sum + (expense.totalCost || 0), 0)
                    .toFixed(2)}{" "}
                  CHF
                </p>
                {filteredExpenses.length > 0 && (
                  <p className="text-xs text-white/80 mt-1">
                    Avg:{" "}
                    {(
                      filteredExpenses.reduce(
                        (sum, expense) => sum + (expense.totalCost || 0),
                        0
                      ) / filteredExpenses.length
                    ).toFixed(2)}{" "}
                    CHF
                  </p>
                )}
              </div>
              <div className="mt-2 p-3 bg-white/10 rounded-lg">
                <p className="text-sm text-white/80">Distance</p>
                <p className="text-xl font-bold">
                  {filteredExpenses
                    .reduce(
                      (sum, expense) =>
                        sum + (expense.distance || expense.distanceInKm || 0),
                      0
                    )
                    .toFixed(0)}{" "}
                  km
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ExpenseManagement;
