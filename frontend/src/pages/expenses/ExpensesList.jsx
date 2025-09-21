import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getExpenses } from "../../api/expenseApi";
import { getExpenseCategories } from "../../api/expenseApi";
import { useApiCall } from "../../hooks/useApiCall";
import { useError } from "../../context/ErrorContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ExpenseFilters from "../../components/expenses/ExpenseFilters";
import { formatDistance } from "../../utils/googleMaps";
import { useExpenseRoutes } from "../../utils/routeHelpers";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiMapPin,
  FiCalendar,
  FiTrendingUp,
  FiChevronRight,
  FiRefreshCw,
  FiFileText,
  FiNavigation,
  FiMapPin as FiMapMarker,
  FiInfo,
  FiList,
  FiDollarSign,
  FiClock,
  FiSearch,
  FiFilter,
  FiArrowUpRight,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";
import {
  FaCar,
  FaRoute,
  FaMapMarkerAlt,
  FaRegClock,
  FaMoneyBillWave,
} from "react-icons/fa";

const ExpensesList = () => {
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const routes = useExpenseRoutes();

  // Use unified error handling for fetching categories
  const { execute: fetchCategories } = useApiCall({
    onSuccess: (data) => {
      setCategories(data.categories || []);
    }
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories(() => getExpenseCategories(), {
      context: { component: 'ExpensesList', action: 'fetchCategories' }
    });
  }, [fetchCategories]);

  // Use unified error handling for fetching expenses
  const { execute: fetchExpenses, loading, error } = useApiCall({
    onSuccess: (data) => {
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
    },
    onError: () => {
      setExpenses([]);
      setTotalItems(0);
      setPagination(null);
    }
  });

  // Fetch expenses with filters and pagination
  useEffect(() => {
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
    fetchExpenses(() => getExpenses(queryParams), {
      context: { component: 'ExpensesList', action: 'fetchExpenses' }
    });
  }, [filters, currentPage, itemsPerPage, fetchExpenses]);

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
    // You can implement client-side filtering or send to server
    // For now, we'll just filter client-side for the search term
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

  // Filter expenses by search term (client-side filtering)
  const filteredExpenses = expenses.filter((expense) => {
    if (!searchTerm) return true;
    const startPoint = expense.startingPoint || expense.startLocation || "";
    const endPoint = expense.destinationPoint || expense.endLocation || "";
    const category = expense.category?.name || "";
    const date = formatDate(expense.journeyDate || expense.expenseDate || "");

    const searchLower = searchTerm.toLowerCase();
    return (
      startPoint.toLowerCase().includes(searchLower) ||
      endPoint.toLowerCase().includes(searchLower) ||
      category.toLowerCase().includes(searchLower) ||
      date.toLowerCase().includes(searchLower)
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

  // Helper function to check if an expense has route instructions
  const hasRouteInstructions = (expense) => {
    return (
      expense.routeSnapshot?.route?.legs &&
      expense.routeSnapshot.route.legs.length > 0 &&
      expense.routeSnapshot.route.legs.some(
        (leg) => leg.steps && leg.steps.length > 0
      )
    );
  };

  // Get status icon based on expense status
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <FiCheckCircle className="mr-1" />;
      case "rejected":
        return <FiXCircle className="mr-1" />;
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

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
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
                <FaMoneyBillWave className="mr-3" /> My Expenses
              </h1>
              <p className="text-white/80 max-w-md">
                Track and manage your travel expenses efficiently
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <Link to={routes.newPath}>
                <Button
                  variant="secondary"
                  icon={<FiPlus />}
                  className="bg-[#f7b801] hover:bg-[#f7b801]/90 text-[#3d348b] border-none"
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
                  filteredExpenses.length
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
              <FiDollarSign className="h-6 w-6" />
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

      {loading ? (
        <motion.div
          className="flex justify-center items-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
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
        </motion.div>
      ) : error ? (
        <motion.div variants={itemVariants}>
          <Card className="border-red-300 shadow-lg">
            <div className="text-center p-8 text-red-600">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <FiXCircle className="h-8 w-8" />
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
          </Card>
        </motion.div>
      ) : filteredExpenses.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="border-[#7678ed]/20 shadow-lg">
            <div className="text-center p-12">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-[#7678ed]/10 rounded-full">
                  <FaRoute className="h-10 w-10 text-[#7678ed]" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-[#3d348b] mb-2">
                {searchTerm || Object.keys(filters).length > 0
                  ? "No matching expenses found"
                  : "No expenses yet"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || Object.keys(filters).length > 0
                  ? "Try adjusting your search or filter criteria to find what you're looking for."
                  : "You haven't created any expenses yet. Start tracking your travel expenses now!"}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
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
                {!searchTerm && Object.keys(filters).length === 0 && (
                  <Link to={routes.createPath}>
                    <Button className="bg-[#f35b04] hover:bg-[#f35b04]/90 text-white">
                      <FiPlus className="mr-2" /> Create Your First Expense
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div className="grid gap-5" variants={containerVariants}>
          {filteredExpenses.map((expense, index) => (
            <motion.div
              key={expense._id}
              variants={itemVariants}
              whileHover={{
                scale: 1.01,
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-[#7678ed] hover:border-l-[#f35b04] transition-all duration-300"
            >
              <Link to={routes.detailPath(expense._id)} className="block p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-full p-3 ${
                          hasWaypoints(expense)
                            ? "bg-[#f7b801]/10 text-[#f7b801]"
                            : "bg-[#3d348b]/10 text-[#3d348b]"
                        }`}
                      >
                        {hasWaypoints(expense) ? (
                          <FaRoute className="h-6 w-6" />
                        ) : (
                          <FaCar className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#3d348b] mb-1 line-clamp-1 flex items-center">
                          {expense.startingPoint || expense.startLocation}
                          <FiArrowUpRight className="mx-1" />
                          {expense.destinationPoint || expense.endLocation}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                            <FiCalendar className="h-3.5 w-3.5" />
                            {formatDate(
                              expense.journeyDate || expense.expenseDate
                            )}
                          </span>

                          {expense.status && (
                            <span
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColors(
                                expense.status
                              )}`}
                            >
                              {getStatusIcon(expense.status)}
                              {expense.status.charAt(0).toUpperCase() +
                                expense.status.slice(1)}
                            </span>
                          )}

                          {expense.category && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-[#7678ed]/10 text-[#7678ed] rounded-full">
                              {expense.category.name}
                            </span>
                          )}

                          {hasWaypoints(expense) && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-[#f7b801]/10 text-[#f7b801] rounded-full text-xs">
                              <FaMapMarkerAlt className="h-3 w-3" />
                              {expense.waypoints.length} waypoint
                              {expense.waypoints.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1 text-[#3d348b]">
                            <FiTrendingUp className="h-4 w-4" />
                            {formatDistance(
                              expense.distance || expense.distanceInKm || 0
                            )}
                          </span>
                          {expense.routeSnapshot?.route?.legs &&
                            expense.routeSnapshot.route.legs[0]
                              ?.duration_text && (
                              <span className="flex items-center gap-1 text-[#7678ed]">
                                <FaRegClock className="h-4 w-4" />
                                {
                                  expense.routeSnapshot.route.legs[0]
                                    .duration_text
                                }
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 flex items-center md:border-l md:border-gray-200 md:pl-4">
                    <div className="text-right flex flex-col items-end">
                      <span className="text-xs text-gray-500 mb-1">
                        Total Cost
                      </span>
                      <p className="text-xl font-semibold text-[#f35b04]">
                        {Number(expense.totalCost || 0).toFixed(2)} CHF
                      </p>
                      <motion.div
                        className="text-[#f35b04] flex items-center text-sm font-medium mt-1"
                        whileHover={{ x: 3 }}
                      >
                        View Details <FiChevronRight className="ml-1" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Summary Card at the bottom */}
          <motion.div
            variants={itemVariants}
            className="mt-4 bg-gradient-to-r from-[#3d348b] to-[#7678ed] rounded-lg shadow-lg p-5 text-white"
          >
            <div className="flex flex-col sm:flex-row justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <FiInfo className="mr-2" /> Summary
                </h3>
                <p className="text-white/80">
                  {paginationInfo
                    ? `Showing ${paginationInfo.startItem}-${paginationInfo.endItem} of ${totalItems} expenses`
                    : `Total expenses: ${filteredExpenses.length}`}
                </p>
                {Object.keys(filters).length > 0 && (
                  <div className="mt-2 text-xs text-white/80 max-w-md">
                    <p className="font-semibold mb-1">Active filters:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {filters.startDate && (
                        <li>
                          From:{" "}
                          {new Date(filters.startDate).toLocaleDateString()}
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
                      .reduce(
                        (sum, expense) => sum + (expense.totalCost || 0),
                        0
                      )
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
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ExpensesList;
