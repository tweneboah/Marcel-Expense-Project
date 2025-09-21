import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFileExport,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaEye,
  FaSpinner,
  FaExclamationTriangle,
  FaChevronUp,
} from "react-icons/fa";
import API from "../../api/apiConfig";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tokenStorage } from "../../utils/secureStorage";

const AllBudgetsReport = () => {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    year: null,
    month: 0, // 0 means all months
    isActive: null,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isExporting, setIsExporting] = useState(false);

  const monthNames = [
    "All Months",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query parameters based on current state
        let queryParams = "";
        let paramAdded = false;

        // Add sorting if present
        if (sortField) {
          const sortPrefix = sortDirection === "desc" ? "-" : "";
          queryParams += `${
            paramAdded ? "&" : "?"
          }sort=${sortPrefix}${sortField}`;
          paramAdded = true;
        }

        // Add pagination
        if (pagination.page) {
          queryParams += `${paramAdded ? "&" : "?"}page=${pagination.page}`;
          paramAdded = true;
        }

        if (pagination.limit) {
          queryParams += `${paramAdded ? "&" : "?"}limit=${pagination.limit}`;
          paramAdded = true;
        }

        // Add filters
        if (filters.year) {
          queryParams += `${paramAdded ? "&" : "?"}year=${filters.year}`;
          paramAdded = true;
        }

        if (filters.month && filters.month > 0) {
          queryParams += `${paramAdded ? "&" : "?"}month=${filters.month}`;
          paramAdded = true;
        }

        if (filters.isActive !== null) {
          queryParams += `${paramAdded ? "&" : "?"}isActive=${
            filters.isActive
          }`;
          paramAdded = true;
        }

        // Fetching budgets with params

        const token = tokenStorage.getToken();
        const response = await fetch(
          `${API.defaults.baseURL}/budgets${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Budgets data received

        setBudgets(data.data || []);
        setPagination({
          ...pagination,
          total: data.count || 0,
          pages: Math.ceil((data.count || 0) / pagination.limit) || 1,
        });
      } catch (error) {
        // Error handled by error context
        setError("Failed to load budgets. Please try again.");
        setBudgets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgets();
  }, [sortField, sortDirection, pagination.page, pagination.limit, filters]);

  const handleSort = (field) => {
    // Convert field to proper sort parameter
    let newSortField = field;

    if (field === sortField.replace("-", "")) {
      // Toggle direction
      newSortField = sortField.startsWith("-")
        ? field // Change to ascending
        : `-${field}`; // Change to descending
    } else if (field === "period") {
      // Special case for period - sort by year and month
      newSortField = sortField.includes("-year")
        ? "year,month" // Ascending
        : "-year,-month"; // Descending
    } else {
      // New field, default to descending
      newSortField = `-${field}`;
    }

    setSortField(newSortField);
    setSortDirection(newSortField.startsWith("-") ? "desc" : "asc");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    let parsedValue;

    if (value === "") {
      parsedValue = null;
    } else if (name === "isActive") {
      parsedValue = value === "true";
    } else if (name === "year" || name === "month") {
      parsedValue = parseInt(value);
    } else {
      parsedValue = value;
    }

    setFilters({
      ...filters,
      [name]: parsedValue,
    });
    // Reset to first page when changing filters
    setPagination({ ...pagination, page: 1 });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Build query parameters using current filters
      let exportParams = "";
      let paramAdded = false;

      // Add sorting if present
      if (sortField) {
        exportParams += `${paramAdded ? "&" : "?"}sort=${
          sortDirection === "desc" ? "-" : ""
        }${sortField}`;
        paramAdded = true;
      }

      // Add filters
      if (filters.year) {
        exportParams += `${paramAdded ? "&" : "?"}year=${filters.year}`;
        paramAdded = true;
      }

      if (filters.month && filters.month > 0) {
        exportParams += `${paramAdded ? "&" : "?"}month=${filters.month}`;
        paramAdded = true;
      }

      if (filters.isActive !== null) {
        exportParams += `${paramAdded ? "&" : "?"}isActive=${filters.isActive}`;
        paramAdded = true;
      }

      // Add unlimited limit to get all matching records
      exportParams += `${paramAdded ? "&" : "?"}limit=1000`;

      const token = tokenStorage.getToken();
      const response = await fetch(
        `${API.defaults.baseURL}/budgets${exportParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch budgets for export");
      }

      const data = await response.json();
      const allBudgets = data.data;

      if (allBudgets.length === 0) {
        toast.info("No budgets to export");
        setIsExporting(false);
        return;
      }

      const csvContent = generateCSV(allBudgets);
      downloadCSV(csvContent, "budgets_export.csv");
      toast.success("Budgets exported successfully");
    } catch (error) {
      // Error handled by error context
      toast.error("Failed to export budgets");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to generate CSV content
  const generateCSV = (budgets) => {
    // Define headers
    const headers = [
      "Period",
      "Category",
      "Budget (CHF)",
      "Actual Cost (CHF)",
      "Remaining (CHF)",
      "Distance (km)",
      "Expenses Count",
      "Usage %",
      "Status",
    ].join(",");

    // Generate rows
    const rows = budgets.map((budget) => {
      const periodName = `${budget.year}-${
        budget.month > 9 ? budget.month : "0" + budget.month
      } (${monthNames[budget.month - 1]})`;

      return [
        periodName,
        budget.category?.name || "Unknown",
        budget.amount.toFixed(2),
        budget.actualCost?.toFixed(2) || "0.00",
        budget.remainingAmount?.toFixed(2) || budget.amount.toFixed(2),
        budget.distance || "0",
        budget.expensesCount || "0",
        budget.usagePercentage ? `${budget.usagePercentage.toFixed(2)}%` : "0%",
        budget.isActive ? "Active" : "Inactive",
      ].join(",");
    });

    // Combine headers and rows
    return [headers, ...rows].join("\n");
  };

  // Helper function to download CSV
  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d348b] mb-4"></div>
        <p className="text-gray-600">Loading budgets data...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pb-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <motion.div
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaMoneyBillWave className="mr-2 text-[#7678ed]" />
            All Budgets Report
          </h1>
          <p className="text-gray-600">
            Comprehensive overview of all budget allocations and usage
          </p>
        </motion.div>
        <div className="flex flex-wrap gap-2">
          <motion.button
            onClick={() => setFilterOpen(!filterOpen)}
            className="mb-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filterOpen ? (
              <>
                <FaChevronUp className="mr-2" /> Hide Filters
              </>
            ) : (
              <>
                <FaFilter className="mr-2" /> Show Filters
              </>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport()}
            className="mb-4 flex items-center px-4 py-2 bg-gradient-to-r from-[#f7b801] to-[#f35b04] text-white rounded-md hover:shadow-lg transition-all duration-300 shadow-sm"
          >
            <FaFileExport className="mr-2" />
            Export CSV
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {filterOpen && (
        <div className="p-4 bg-white rounded-md shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Filter Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                name="year"
                value={filters.year || ""}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - 2 + i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">All Months</option>
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="isActive"
                value={
                  filters.isActive === null ? "" : filters.isActive.toString()
                }
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setFilters({
                  year: null,
                  month: 0,
                  isActive: null,
                });
                setPagination({ ...pagination, page: 1 });
                setSortField("");
                setSortDirection("desc");
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors mr-2"
            >
              Reset All Filters
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleExport()}
              disabled={isExporting}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-[#f7b801] to-[#f35b04] text-white rounded-md hover:shadow-lg transition-all duration-300 shadow-sm disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Exporting...
                </>
              ) : (
                <>
                  <FaFileExport className="mr-2" /> Export to CSV
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}

      <motion.div
        className="bg-white shadow-lg rounded-lg overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center font-semibold"
                    onClick={() => handleSort("period")}
                  >
                    Period
                    {sortField.includes("year") &&
                      (sortField.includes("-year") ? (
                        <FaSortAmountDown className="ml-1" size={12} />
                      ) : (
                        <FaSortAmountUp className="ml-1" size={12} />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center font-semibold ml-auto"
                    onClick={() => handleSort("amount")}
                  >
                    Budget
                    {sortField.includes("amount") &&
                      (sortField.includes("-amount") ? (
                        <FaSortAmountDown className="ml-1" size={12} />
                      ) : (
                        <FaSortAmountUp className="ml-1" size={12} />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center font-semibold ml-auto"
                    onClick={() => handleSort("usage.actualCost")}
                  >
                    Actual
                    {sortField.includes("usage.actualCost") &&
                      (sortField.includes("-usage.actualCost") ? (
                        <FaSortAmountDown className="ml-1" size={12} />
                      ) : (
                        <FaSortAmountUp className="ml-1" size={12} />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    className="flex items-center font-semibold ml-auto"
                    onClick={() => handleSort("usage.usagePercentage")}
                  >
                    Usage %
                    {sortField.includes("usage.usagePercentage") &&
                      (sortField.includes("-usage.usagePercentage") ? (
                        <FaSortAmountDown className="ml-1" size={12} />
                      ) : (
                        <FaSortAmountUp className="ml-1" size={12} />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <FaSpinner className="animate-spin text-3xl text-blue-500 mb-2" />
                      <p className="text-gray-500">Loading budgets...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="10" className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <FaExclamationTriangle className="text-3xl text-red-500 mb-2" />
                      <p className="text-red-500">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : budgets.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <FaMoneyBillWave className="text-4xl text-gray-300 mb-3" />
                      <p className="text-lg">No budget data available</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                budgets.map((budget, index) => (
                  <motion.tr
                    key={budget._id}
                    className="hover:bg-gray-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.1 * Math.min(index, 5),
                      duration: 0.3,
                    }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {budget.periodName || `${budget.month}/${budget.year}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: budget.category?.color || "#999",
                          }}
                        ></div>
                        {budget.category?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap font-medium">
                      CHF {budget.amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-[#f35b04] font-medium">
                      CHF {budget.usage?.actualCost?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-[#3d348b] font-medium">
                      CHF{" "}
                      {budget.usage?.remainingAmount?.toFixed(2) ||
                        budget.remainingAmount?.toFixed(2) ||
                        budget.amount?.toFixed(2) ||
                        "0.00"}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-gray-900">
                      {budget.usage?.actualDistance?.toFixed(1) || "0.0"} km
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {budget.usage?.expenseCount || 0}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div
                            style={{
                              width: `${Math.min(
                                budget.usage?.usagePercentage ||
                                  budget.usagePercentage ||
                                  0,
                                100
                              )}%`,
                            }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                              (budget.usage?.usagePercentage ||
                                budget.usagePercentage ||
                                0) >= budget.criticalThreshold
                                ? "bg-[#f35b04]"
                                : (budget.usage?.usagePercentage ||
                                    budget.usagePercentage ||
                                    0) >= budget.warningThreshold
                                ? "bg-[#f7b801]"
                                : "bg-green-500"
                            }`}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold inline-block mt-1">
                          {(
                            budget.usage?.usagePercentage ||
                            budget.usagePercentage ||
                            0
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
                          budget.status === "critical" ||
                          budget.status === "over"
                            ? "bg-[#f35b04]"
                            : budget.status === "warning"
                            ? "bg-[#f7b801]"
                            : "bg-green-500"
                        }`}
                      >
                        {(budget.status || "UNDER").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <Link to={`/admin/budgets/${budget._id}`}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-full bg-[#7678ed]/10 text-[#3d348b] hover:bg-[#7678ed]/20 transition-colors"
                          title="View Budget Details"
                        >
                          <FaEye size={16} />
                        </motion.button>
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.total > pagination.limit && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{" "}
                of <span className="font-medium">{pagination.total}</span>{" "}
                budgets
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className={`flex items-center px-3 py-1 rounded-md ${
                  !pagination.hasPrev
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-[#3d348b] text-[#3d348b] hover:bg-[#3d348b] hover:text-white transition-colors"
                }`}
              >
                <FaChevronLeft className="mr-1" size={12} /> Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className={`flex items-center px-3 py-1 rounded-md ${
                  !pagination.hasNext
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-[#3d348b] text-[#3d348b] hover:bg-[#3d348b] hover:text-white transition-colors"
                }`}
              >
                Next <FaChevronRight className="ml-1" size={12} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AllBudgetsReport;
