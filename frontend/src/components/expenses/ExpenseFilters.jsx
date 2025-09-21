import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getExpenseCategories } from "../../api/expenseApi";
import {
  FiCalendar,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiCheck,
  FiX,
} from "react-icons/fi";

const ExpenseFilters = ({
  onFilter,
  onSearch,
  onPageChange,
  onLimitChange,
  pagination,
  loading,
  totalItems,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getExpenseCategories();
        setCategories(data.categories || []);
      } catch (err) {
        // Error handled by error context
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    onFilter({
      startDate,
      endDate,
      filterStatus: filterStatus !== "all" ? filterStatus : null,
      categoryId: categoryId || null,
    });
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterStatus("all");
    setCategoryId("");
    onFilter({});
  };

  const handlePageChange = (newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div className="flex flex-grow items-center space-x-2 mb-3 md:mb-0">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search expenses..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] transition-colors"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg ${
              showFilters
                ? "bg-[#3d348b] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FiFilter className="h-5 w-5" />
          </button>
        </div>

        {/* Pagination controls */}
        {pagination && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {pagination.startItem}-{pagination.endItem} of {totalItems}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(pagination.prev?.page || 1)}
                disabled={!pagination.prev}
                className={`p-2 rounded-lg ${
                  pagination.prev
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
              >
                Prev
              </button>
              <button
                onClick={() => handlePageChange(pagination.next?.page || 1)}
                disabled={!pagination.next}
                className={`p-2 rounded-lg ${
                  pagination.next
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <form
          onSubmit={handleFilterSubmit}
          className="p-4 bg-gray-50 rounded-lg mt-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiCalendar className="inline mr-1" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiCalendar className="inline mr-1" /> End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed]"
                disabled={categoriesLoading}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categoriesLoading && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading categories...
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
            >
              <FiRefreshCw className="mr-2" /> Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#3d348b] text-white rounded-md hover:bg-[#3d348b]/90 flex items-center"
            >
              <FiCheck className="mr-2" /> Apply Filters
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

ExpenseFilters.propTypes = {
  onFilter: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,
  pagination: PropTypes.object,
  loading: PropTypes.bool,
  totalItems: PropTypes.number,
};

export default ExpenseFilters;
