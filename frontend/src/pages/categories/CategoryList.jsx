import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getExpenseCategories } from "../../api/expenseApi";
import Button from "../../components/ui/Button";
import CategorySummary from "./CategorySummary";
import {
  FiPlusCircle,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiSliders,
  FiX,
  FiBarChart2,
  FiEye,
  FiTag,
  FiGrid,
  FiList,
  FiSettings,
  FiInfo,
  FiCalendar,
} from "react-icons/fi";

// Redesigned category card with modern styling and animations
const CategoryCard = ({ category }) => {
  if (!category) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
      whileHover={{ y: -5 }}
    >
      <div className="px-6 py-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-[#3d348b] truncate">
            {category.name}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              category.isActive
                ? "bg-[#7678ed]/10 text-[#7678ed]"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {category.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {category.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {category.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          {category.expenseCount !== undefined && (
            <div className="bg-[#f7b801]/10 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500 mb-1">Expenses</p>
              <p className="font-bold text-[#f7b801]">
                {category.expenseCount}
              </p>
            </div>
          )}

          {category.budgetAmount !== undefined && (
            <div className="bg-[#f35b04]/10 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-500 mb-1">Budget</p>
              <p className="font-bold text-[#f35b04]">
                {category.budgetAmount
                  ? `${category.budgetAmount} CHF`
                  : "No Budget"}
              </p>
            </div>
          )}
        </div>

        <Link to={`/admin/categories/${category._id}`}>
          <Button
            variant="secondary"
            className="w-full flex justify-center items-center"
            icon={<FiEye />}
          >
            View Details
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

// Notification component with animation
const Notification = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-50 border-green-200 text-[#3d348b]"
      : "bg-red-50 border-red-200 text-red-700";
  const Icon = type === "success" ? FiCheckCircle : FiAlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 p-4 rounded-lg border ${bgColor} shadow-lg max-w-sm flex items-start z-50`}
    >
      <Icon className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">{message}</div>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-600"
      >
        <FiXCircle className="h-5 w-5" />
      </button>
    </motion.div>
  );
};

// Redesigned filter component
const CategoryFilter = ({
  filters,
  setFilters,
  applyFilters,
  resetFilters,
  className = "",
}) => {
  const periods = [
    { value: "", label: "All Time" },
    { value: "current-month", label: "Current Month" },
    { value: "current-quarter", label: "Current Quarter" },
    { value: "current-year", label: "Current Year" },
    { value: "last-month", label: "Last Month" },
    { value: "last-quarter", label: "Last Quarter" },
    { value: "last-year", label: "Last Year" },
  ];

  const sortOptions = [
    { value: "name", label: "Name (A-Z)" },
    { value: "-name", label: "Name (Z-A)" },
    { value: "createdAt", label: "Created (Oldest)" },
    { value: "-createdAt", label: "Created (Newest)" },
    { value: "-expenseCount", label: "Most Used" },
    { value: "expenseCount", label: "Least Used" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6 ${className}`}
    >
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold text-[#3d348b] flex items-center">
          <FiFilter className="mr-2 h-5 w-5 text-[#7678ed]" />
          Filter Categories
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetFilters}
          className="text-sm text-[#7678ed] flex items-center hover:text-[#3d348b]"
        >
          <FiRefreshCw className="mr-1 h-4 w-4" />
          Reset
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-5">
        {/* Search input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="Category name..."
              className="pl-10 pr-3 py-2.5 w-full border border-gray-200 rounded-lg focus:ring-[#7678ed] focus:border-[#7678ed] transition-all duration-200"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        {/* Status filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.isActive === undefined ? "" : filters.isActive}
            onChange={(e) => {
              const value = e.target.value;
              setFilters({
                ...filters,
                isActive: value === "" ? undefined : value === "true",
              });
            }}
            className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-[#7678ed] focus:border-[#7678ed] transition-all duration-200"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Period filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Period
          </label>
          <select
            value={filters.period || ""}
            onChange={(e) =>
              setFilters({ ...filters, period: e.target.value || undefined })
            }
            className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-[#7678ed] focus:border-[#7678ed] transition-all duration-200"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sort || "name"}
            onChange={(e) =>
              setFilters({ ...filters, sort: e.target.value || undefined })
            }
            className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-[#7678ed] focus:border-[#7678ed] transition-all duration-200"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-5">
        {/* Has Budget filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget
          </label>
          <select
            value={filters.hasBudget === undefined ? "" : filters.hasBudget}
            onChange={(e) => {
              const value = e.target.value;
              setFilters({
                ...filters,
                hasBudget: value === "" ? undefined : value === "true",
              });
            }}
            className="w-full border border-gray-200 rounded-lg py-2.5 px-3 focus:ring-[#7678ed] focus:border-[#7678ed] transition-all duration-200"
          >
            <option value="">All</option>
            <option value="true">Has Budget</option>
            <option value="false">No Budget</option>
          </select>
        </div>

        {/* Additional options (checkboxes) */}
        <div className="flex flex-col justify-center space-y-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={filters.includeExpenseCounts === true}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  includeExpenseCounts: e.target.checked,
                })
              }
              className="rounded border-gray-300 text-[#3d348b] focus:ring-[#7678ed]"
            />
            <span className="ml-2 text-sm text-gray-700">
              Show expense counts
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={applyFilters} variant="accent" icon={<FiFilter />}>
          Apply Filters
        </Button>
      </div>
    </motion.div>
  );
};

// Redesigned pagination component
const Pagination = ({ pagination, onPageChange, page }) => {
  const { totalPages, totalCount } = pagination || {
    totalPages: 1,
    totalCount: 0,
  };
  const currentPage = Number(page) || 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-4 sm:px-6 rounded-xl shadow-sm mt-6"
    >
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span> (
            <span className="font-medium">{totalCount}</span> total categories)
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-[#3d348b]/5 focus:z-20 focus:outline-offset-0 ${
                currentPage <= 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="sr-only">Previous</span>
              <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
            </motion.button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Logic to show 5 pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <motion.button
                  key={pageNum}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    pageNum === currentPage
                      ? "z-10 bg-[#3d348b] text-white focus-visible:outline-[#7678ed]"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-[#3d348b]/5 focus:z-20 focus:outline-offset-0"
                  }`}
                >
                  {pageNum}
                </motion.button>
              );
            })}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-[#3d348b]/5 focus:z-20 focus:outline-offset-0 ${
                currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="sr-only">Next</span>
              <FiChevronRight className="h-5 w-5" aria-hidden="true" />
            </motion.button>
          </nav>
        </div>
      </div>
    </motion.div>
  );
};

// Toggle button for display mode
const ViewToggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex bg-gray-100 p-1 rounded-md">
      <motion.button
        whileHover={{
          backgroundColor: viewMode === "grid" ? "" : "rgba(61, 52, 139, 0.05)",
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setViewMode("grid")}
        className={`flex items-center justify-center px-3 py-1.5 rounded ${
          viewMode === "grid"
            ? "bg-white text-[#3d348b] shadow-sm"
            : "text-gray-500"
        }`}
      >
        <FiGrid className="h-4 w-4" />
      </motion.button>

      <motion.button
        whileHover={{
          backgroundColor: viewMode === "list" ? "" : "rgba(61, 52, 139, 0.05)",
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setViewMode("list")}
        className={`flex items-center justify-center px-3 py-1.5 rounded ${
          viewMode === "list"
            ? "bg-white text-[#3d348b] shadow-sm"
            : "text-gray-500"
        }`}
      >
        <FiList className="h-4 w-4" />
      </motion.button>
    </div>
  );
};

// List view category item
const CategoryListItem = ({ category }) => {
  if (!category) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300"
    >
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-[#7678ed]/10 p-2 rounded-full mr-3">
              <FiTag className="h-5 w-5 text-[#7678ed]" />
            </div>
            <div>
              <h3 className="font-medium text-[#3d348b]">{category.name}</h3>
              {category.description && (
                <p className="text-gray-500 text-sm line-clamp-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                category.isActive
                  ? "bg-[#7678ed]/10 text-[#7678ed]"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {category.isActive ? "Active" : "Inactive"}
            </span>

            {category.expenseCount !== undefined && (
              <span className="text-sm text-gray-500">
                <span className="font-medium text-[#f7b801]">
                  {category.expenseCount}
                </span>{" "}
                expenses
              </span>
            )}

            <Link to={`/admin/categories/${category._id}`}>
              <Button
                variant="secondary"
                size="sm"
                icon={<FiEye className="h-4 w-4" />}
              >
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CategoryList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [showSummary, setShowSummary] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  // Filter state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sort: "name",
    search: "",
    isActive: undefined,
    hasBudget: undefined,
    period: "",
    includeExpenseCounts: true,
  });

  // Applied filters state (only update when apply button is clicked)
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });

  useEffect(() => {
    // Check if there's a notification from navigation state
    if (location.state?.notification) {
      setNotification(location.state.notification);
      // Clear the state to prevent showing notification on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Call the API with filters
        const result = await getExpenseCategories(appliedFilters);

        // Set categories and pagination info
        setCategories(result.categories || []);
        setPagination({
          totalPages: result.pagination?.totalPages || 1,
          totalCount: result.totalCount || 0,
          currentPage: appliedFilters.page || 1,
        });
      } catch (err) {
        // Error handled by error context
        setError("Failed to load categories. Please try again later.");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [appliedFilters]);

  const handlePageChange = (newPage) => {
    const updatedFilters = { ...appliedFilters, page: newPage };
    setAppliedFilters(updatedFilters);
    setFilters(updatedFilters);
  };

  const applyFilters = () => {
    // Reset to page 1 when applying new filters
    setAppliedFilters({ ...filters, page: 1 });
  };

  const resetFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: 10,
      sort: "name",
      search: "",
      isActive: undefined,
      hasBudget: undefined,
      period: "",
      includeExpenseCounts: true,
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  // Container variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <AnimatePresence>
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3d348b] mb-1 flex items-center">
              <FiTag className="mr-2 h-6 w-6 text-[#7678ed]" />
              Expense Categories
            </h1>
            <p className="text-gray-600">
              Manage your expense categories and budget limits
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

            <Button
              onClick={() => setShowSummary(!showSummary)}
              variant="secondary"
              className="flex items-center"
              icon={showSummary ? <FiX /> : <FiBarChart2 />}
            >
              {showSummary ? "Hide Summary" : "Show Summary"}
            </Button>

            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              className="flex items-center"
              icon={showFilters ? <FiX /> : <FiSliders />}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>

            <Link to="/admin/categories/create">
              <Button
                variant="primary"
                className="flex items-center"
                icon={<FiPlusCircle />}
              >
                Create Category
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>{showSummary && <CategorySummary />}</AnimatePresence>

      <AnimatePresence>
        {showFilters && (
          <CategoryFilter
            filters={filters}
            setFilters={setFilters}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center py-16"
        >
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-[#7678ed] animate-spin"></div>
            <div
              className="h-16 w-16 rounded-full border-r-4 border-l-4 border-[#f7b801] animate-spin absolute top-0 left-0"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl flex items-center shadow-sm"
        >
          <FiAlertCircle className="h-5 w-5 mr-3 flex-shrink-0 text-[#f35b04]" />
          <p>{error}</p>
        </motion.div>
      ) : categories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="mx-auto bg-[#7678ed]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-4">
            <FiFilter className="h-12 w-12 text-[#7678ed]" />
          </div>
          <h2 className="text-xl font-bold text-[#3d348b] mb-2">
            No Categories Found
          </h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {appliedFilters.search ||
            appliedFilters.isActive !== undefined ||
            appliedFilters.hasBudget !== undefined
              ? "No categories match your current filters. Try adjusting your filters or create a new category."
              : "You haven't created any expense categories yet. Create your first category to start organizing your expenses."}
          </p>
          {appliedFilters.search ||
          appliedFilters.isActive !== undefined ||
          appliedFilters.hasBudget !== undefined ? (
            <Button
              onClick={resetFilters}
              variant="secondary"
              className="mr-2"
              icon={<FiRefreshCw />}
            >
              Reset Filters
            </Button>
          ) : null}
          <Link to="/admin/categories/create">
            <Button variant="primary" icon={<FiPlusCircle />}>
              Create Category
            </Button>
          </Link>
        </motion.div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {categories.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col space-y-3"
            >
              {categories.map((category) => (
                <CategoryListItem key={category._id} category={category} />
              ))}
            </motion.div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              page={appliedFilters.page}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CategoryList;
