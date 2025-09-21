import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaFilter,
  FaFileExport,
  FaCalendarAlt,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
  FaRoad,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaChartLine,
  FaTags,
  FaUserAlt,
  FaDownload,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../../api/apiConfig";
import API from "../../api/apiConfig";
import { motion } from "framer-motion";

const AdvancedFilteredExpenses = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 0,
  });

  // Filter states
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [minDistance, setMinDistance] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [locations, setLocations] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortField, setSortField] = useState("journeyDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [summaryData, setSummaryData] = useState({});

  useEffect(() => {
    // Fetch categories first
    const fetchCategories = async () => {
      try {
        // Use API instance with auth headers instead of direct axios request
        const response = await API.get(`/categories`);
        setCategories(response.data.data);

        // Comment out mock data since we're using the real API
        // setTimeout(() => {
        //   setCategories([
        //     { id: "fuel", name: "Fuel", color: "#FF5722" },
        //     { id: "tolls", name: "Tolls", color: "#3F51B5" },
        //     { id: "maintenance", name: "Maintenance", color: "#4CAF50" },
        //   ]);
        // }, 300);
      } catch (err) {
        // Error handled by error context
        // Fallback to default categories if API fails
        setCategories([
          { id: "fuel", name: "Fuel", color: "#FF5722" },
          { id: "tolls", name: "Tolls", color: "#3F51B5" },
          { id: "maintenance", name: "Maintenance", color: "#4CAF50" },
        ]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [pagination.page, sortField, sortDirection]);

  const fetchExpenses = async (applyFilters = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare query parameters
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortField,
        sortDirection: sortDirection,
      };

      // Add filters if requested
      if (applyFilters) {
        if (dateRange.startDate)
          params.startDate = dateRange.startDate.toISOString().split("T")[0];
        if (dateRange.endDate)
          params.endDate = dateRange.endDate.toISOString().split("T")[0];
        if (minAmount) params.minCost = minAmount;
        if (maxAmount) params.maxCost = maxAmount;
        if (minDistance) params.minDistance = minDistance;
        if (maxDistance) params.maxDistance = maxDistance;
        if (locations) params.locations = locations;
        if (selectedCategories.length > 0)
          params.categories = selectedCategories.join(",");
        if (searchTerm) params.search = searchTerm;
      }

      // Use API instance with auth headers
      const response = await API.get(`/advanced-reports/expenses`, { params });

      // Map the API response to our component structure
      if (response.data && response.data.data) {
        const {
          expenses,
          pagination: paginationData,
          summary,
        } = response.data.data;

        // Set expenses data
        setExpenses(expenses || []);

        // Set pagination data
        setPagination({
          page: paginationData?.currentPage || 1,
          limit: paginationData?.perPage || 10,
          totalPages: paginationData?.totalPages || 1,
          totalResults: paginationData?.total || 0,
        });

        // Set total expenses from summary
        setTotalExpenses(summary?.totalCost || 0);

        // Store additional summary data if needed
        setSummaryData(summary || {});
      } else {
        // Handle empty response
        setExpenses([]);
        setPagination({
          page: 1,
          limit: 10,
          totalPages: 1,
          totalResults: 0,
        });
        setTotalExpenses(0);
        setSummaryData({});
      }

      setIsLoading(false);
    } catch (err) {
      // Error handled by error context
      setError("Failed to load expenses. Please try again later.");
      setIsLoading(false);
    }
  };

  const getMockData = (params) => {
    // Generate 30 mock expenses
    const allExpenses = Array.from({ length: 30 }, (_, i) => {
      const index = i + 1;
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      const category = categories[
        Math.floor(Math.random() * categories.length)
      ] || { id: "fuel", name: "Fuel", color: "#FF5722" };

      const fromLocations = ["Zürich", "Geneva", "Basel", "Bern", "Lausanne"];
      const toLocations = [
        "Lucerne",
        "St. Gallen",
        "Winterthur",
        "Lugano",
        "Biel",
      ];

      const distance = 50 + Math.floor(Math.random() * 200);
      const amount = distance * 0.7 + Math.floor(Math.random() * 20);

      return {
        id: `exp-${index}`,
        date: date.toISOString(),
        from: fromLocations[Math.floor(Math.random() * fromLocations.length)],
        to: toLocations[Math.floor(Math.random() * toLocations.length)],
        distance: distance,
        amount: amount,
        category: category,
        notes: `Expense ${index} notes`,
        status: Math.random() > 0.2 ? "approved" : "pending",
      };
    });

    // Apply filters
    let filteredExpenses = [...allExpenses];

    // Filter by date range
    if (params.startDate) {
      const startDate = new Date(params.startDate);
      filteredExpenses = filteredExpenses.filter(
        (exp) => new Date(exp.date) >= startDate
      );
    }

    if (params.endDate) {
      const endDate = new Date(params.endDate);
      filteredExpenses = filteredExpenses.filter(
        (exp) => new Date(exp.date) <= endDate
      );
    }

    // Filter by amount range
    if (params.minAmount) {
      filteredExpenses = filteredExpenses.filter(
        (exp) => exp.amount >= Number(params.minAmount)
      );
    }

    if (params.maxAmount) {
      filteredExpenses = filteredExpenses.filter(
        (exp) => exp.amount <= Number(params.maxAmount)
      );
    }

    // Filter by distance range
    if (params.minDistance) {
      filteredExpenses = filteredExpenses.filter(
        (exp) => exp.distance >= Number(params.minDistance)
      );
    }

    if (params.maxDistance) {
      filteredExpenses = filteredExpenses.filter(
        (exp) => exp.distance <= Number(params.maxDistance)
      );
    }

    // Filter by locations
    if (params.locations) {
      const locationTerms = params.locations
        .toLowerCase()
        .split(",")
        .map((term) => term.trim());
      filteredExpenses = filteredExpenses.filter((exp) =>
        locationTerms.some(
          (term) =>
            exp.from.toLowerCase().includes(term) ||
            exp.to.toLowerCase().includes(term)
        )
      );
    }

    // Filter by categories
    if (params.categories) {
      const categoryIds = params.categories.split(",");
      filteredExpenses = filteredExpenses.filter((exp) =>
        categoryIds.includes(exp.category.id)
      );
    }

    // Filter by search term
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredExpenses = filteredExpenses.filter(
        (exp) =>
          exp.from.toLowerCase().includes(search) ||
          exp.to.toLowerCase().includes(search) ||
          exp.notes.toLowerCase().includes(search)
      );
    }

    // Sort expenses
    if (params.sortBy) {
      const [field, direction] = params.sortBy.split(":");
      filteredExpenses.sort((a, b) => {
        let comparison = 0;

        if (field === "date") {
          comparison = new Date(a.date) - new Date(b.date);
        } else if (field === "amount") {
          comparison = a.amount - b.amount;
        } else if (field === "distance") {
          comparison = a.distance - b.distance;
        }

        return direction === "desc" ? -comparison : comparison;
      });
    }

    // Calculate total amount
    const totalAmount = filteredExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );

    // Paginate results
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = filteredExpenses.slice(startIndex, endIndex);

    return {
      results: paginatedResults,
      page,
      limit,
      totalPages: Math.ceil(filteredExpenses.length / limit),
      totalResults: filteredExpenses.length,
      totalAmount,
    };
  };

  const handleApplyFilters = () => {
    setPagination({ ...pagination, page: 1 }); // Reset to first page when applying filters
    fetchExpenses(true);
  };

  const handleResetFilters = () => {
    setDateRange({
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date(),
    });
    setMinAmount("");
    setMaxAmount("");
    setMinDistance("");
    setMaxDistance("");
    setLocations("");
    setSelectedCategories([]);
    setSearchTerm("");
    setPagination({ ...pagination, page: 1 });

    // Fetch without filters
    fetchExpenses(false);
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSortChange = (field) => {
    setSortDirection((prev) =>
      field === sortField ? (prev === "asc" ? "desc" : "asc") : "desc"
    );
    setSortField(field);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const handleExport = (format) => {
    alert(`Exporting filtered expenses as ${format}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 p-4 md:p-6"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4"
      >
        <div>
          <motion.h1
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-2xl md:text-3xl font-bold flex items-center text-[#3d348b]"
          >
            <div className="p-2 rounded-lg bg-[#3d348b] text-white mr-3">
              <FaFilter />
            </div>
            Advanced Filtered Expenses
          </motion.h1>
          <p className="text-gray-500 ml-12 mt-1">
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              /api/v1/advanced-reports/expenses
            </code>
          </p>
        </div>
        <motion.div
          initial={{ x: 20 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center space-x-3"
        >
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#f7b801" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport("csv")}
            className="px-4 py-2 rounded-md bg-[#f35b04] text-white flex items-center shadow-md hover:shadow-lg transition-all duration-300"
          >
            <FaDownload className="mr-2" /> Export CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#3d348b" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport("pdf")}
            className="px-4 py-2 rounded-md bg-[#7678ed] text-white flex items-center shadow-md hover:shadow-lg transition-all duration-300"
          >
            <FaFileExport className="mr-2" /> Export PDF
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white shadow-lg rounded-xl p-5 md:p-6 mb-6 border-t-4 border-[#7678ed]"
      >
        <h2 className="text-xl font-semibold mb-5 flex items-center text-[#3d348b]">
          <FaFilter className="mr-2 text-[#f7b801]" /> Filter Options
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {/* Date Range Filter */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-3 rounded-lg bg-gray-50 border border-gray-100"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FaCalendarAlt className="mr-2 text-[#3d348b]" /> Date Range
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <DatePicker
                  selected={dateRange.startDate}
                  onChange={(date) =>
                    setDateRange((prev) => ({ ...prev, startDate: date }))
                  }
                  selectsStart
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] outline-none"
                  dateFormat="yyyy-MM-dd"
                />
                <div className="absolute top-2 right-2 pointer-events-none text-[#f7b801]">
                  <FaCalendarAlt />
                </div>
              </div>
              <span className="text-[#3d348b] font-bold">→</span>
              <div className="relative flex-1">
                <DatePicker
                  selected={dateRange.endDate}
                  onChange={(date) =>
                    setDateRange((prev) => ({ ...prev, endDate: date }))
                  }
                  selectsEnd
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  minDate={dateRange.startDate}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] outline-none"
                  dateFormat="yyyy-MM-dd"
                />
                <div className="absolute top-2 right-2 pointer-events-none text-[#f7b801]">
                  <FaCalendarAlt />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Amount Range */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-3 rounded-lg bg-gray-50 border border-gray-100"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FaMoneyBillWave className="mr-2 text-[#f35b04]" /> Amount Range
              (CHF)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="Min"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] outline-none"
              />
              <span className="text-[#3d348b] font-bold">→</span>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="Max"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] outline-none"
              />
            </div>
          </motion.div>

          {/* Distance Range */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-3 rounded-lg bg-gray-50 border border-gray-100"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FaRoad className="mr-2 text-[#7678ed]" /> Distance Range (km)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={minDistance}
                onChange={(e) => setMinDistance(e.target.value)}
                placeholder="Min"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] outline-none"
              />
              <span className="text-[#3d348b] font-bold">→</span>
              <input
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                placeholder="Max"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] outline-none"
              />
            </div>
          </motion.div>

          {/* Locations */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-3 rounded-lg bg-gray-50 border border-gray-100"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-[#f35b04]" /> Locations
              (comma separated)
            </label>
            <input
              type="text"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              placeholder="e.g. Zürich, Bern"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] outline-none"
            />
          </motion.div>

          {/* Text Search */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-3 rounded-lg bg-gray-50 border border-gray-100"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FaSearch className="mr-2 text-[#f7b801]" /> Search Term
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in notes, locations..."
                className="w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-[#7678ed] focus:border-[#7678ed] outline-none"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#f7b801]">
                <FaSearch />
              </div>
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            whileHover={{ y: -2 }}
            className="p-3 rounded-lg bg-gray-50 border border-gray-100"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FaTags className="mr-2 text-[#7678ed]" /> Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  key={category._id}
                  onClick={() => handleCategoryToggle(category._id)}
                  className={`px-3 py-1 rounded-full text-xs transition-all duration-200 ${
                    selectedCategories.includes(category._id)
                      ? "bg-[#3d348b] text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: category.color || "#3F51B5" }}
                  ></span>
                  {category.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="flex justify-end space-x-3">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#f35b04" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleResetFilters}
            className="px-4 py-2 border border-gray-300 bg-white rounded-md hover:bg-gray-50 text-gray-700 transition-all duration-200 flex items-center"
          >
            Reset Filters
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-[#3d348b] text-white rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <FaFilter className="mr-2" /> Apply Filters
          </motion.button>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col justify-center items-center h-64 rounded-xl bg-white shadow-lg p-6"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#7678ed] mb-4"></div>
          <p className="text-[#3d348b] font-medium">Loading expense data...</p>
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center mb-2">
            <svg
              className="w-6 h-6 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-lg font-bold">Error Loading Data</h3>
          </div>
          <p>{error}</p>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white shadow-lg rounded-xl p-6 mb-6 border-t-4 border-[#f7b801]"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <motion.h2
                initial={{ x: -10 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="text-xl font-semibold text-[#3d348b] mb-2 md:mb-0"
              >
                Filtered Expenses ({pagination.totalResults})
              </motion.h2>
              <motion.div
                initial={{ x: 10 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="text-xl font-bold text-[#f35b04]"
              >
                Total: CHF {totalExpenses ? totalExpenses.toFixed(2) : "0.00"}
              </motion.div>
            </div>

            {/* Summary Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <motion.div
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="bg-gradient-to-br from-[#3d348b] to-[#7678ed] text-white p-5 rounded-xl shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-opacity-80 text-sm mb-1">
                      Total Distance
                    </div>
                    <div className="text-2xl font-bold">
                      {summaryData.totalDistance?.toFixed(1) || "0.0"} km
                    </div>
                  </div>
                  <div className="p-3 bg-white bg-opacity-20 rounded-full">
                    <FaRoad className="text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="bg-gradient-to-br from-[#f35b04] to-[#f7b801] text-white p-5 rounded-xl shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-opacity-80 text-sm mb-1">
                      Average Cost
                    </div>
                    <div className="text-2xl font-bold">
                      CHF {summaryData.averageCost?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                  <div className="p-3 bg-white bg-opacity-20 rounded-full">
                    <FaMoneyBillWave className="text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.9 }}
                className="bg-gradient-to-br from-[#7678ed] to-[#3d348b] text-white p-5 rounded-xl shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-opacity-80 text-sm mb-1">
                      Average Distance
                    </div>
                    <div className="text-2xl font-bold">
                      {summaryData.averageDistance?.toFixed(1) || "0.0"} km
                    </div>
                  </div>
                  <div className="p-3 bg-white bg-opacity-20 rounded-full">
                    <FaChartLine className="text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.0 }}
                className="bg-gradient-to-br from-[#f7b801] to-[#f35b04] text-white p-5 rounded-xl shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-opacity-80 text-sm mb-1">
                      Filtered Records
                    </div>
                    <div className="text-2xl font-bold">
                      {summaryData.filteredRecords || 0} /{" "}
                      {summaryData.totalRecords || 0}
                    </div>
                  </div>
                  <div className="p-3 bg-white bg-opacity-20 rounded-full">
                    <FaFilter className="text-xl" />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] text-white">
                    <th className="px-4 py-3 text-left">
                      <button
                        className="font-medium flex items-center text-white hover:text-[#f7b801] transition-colors"
                        onClick={() => handleSortChange("journeyDate")}
                      >
                        <FaCalendarAlt className="mr-2" /> Date
                        {sortField === "journeyDate" &&
                          (sortDirection === "desc" ? (
                            <FaSortAmountDown className="ml-1 text-[#f7b801]" />
                          ) : (
                            <FaSortAmountUp className="ml-1 text-[#f7b801]" />
                          ))}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">From</th>
                    <th className="px-4 py-3 text-left">To</th>
                    <th className="px-4 py-3 text-left">
                      <button
                        className="font-medium flex items-center text-white hover:text-[#f7b801] transition-colors"
                        onClick={() => handleSortChange("distance")}
                      >
                        <FaRoad className="mr-2" /> Distance
                        {sortField === "distance" &&
                          (sortDirection === "desc" ? (
                            <FaSortAmountDown className="ml-1 text-[#f7b801]" />
                          ) : (
                            <FaSortAmountUp className="ml-1 text-[#f7b801]" />
                          ))}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        className="font-medium flex items-center text-white hover:text-[#f7b801] transition-colors"
                        onClick={() => handleSortChange("totalCost")}
                      >
                        <FaMoneyBillWave className="mr-2" /> Amount
                        {sortField === "totalCost" &&
                          (sortDirection === "desc" ? (
                            <FaSortAmountDown className="ml-1 text-[#f7b801]" />
                          ) : (
                            <FaSortAmountUp className="ml-1 text-[#f7b801]" />
                          ))}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <FaSearch className="text-3xl mb-2 text-gray-300" />
                          <p>No expense records found matching your filters.</p>
                          <button
                            onClick={handleResetFilters}
                            className="mt-3 text-[#3d348b] hover:text-[#7678ed] underline transition-colors"
                          >
                            Reset filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense, index) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: 0.1 * (index % 10),
                        }}
                        key={expense._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <span className="flex items-center">
                            <span className="h-2 w-2 rounded-full mr-2 bg-[#7678ed]"></span>
                            {formatDate(expense.journeyDate)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center">
                            <FaMapMarkerAlt className="text-[#f35b04] mr-1 text-sm" />
                            {expense.startPoint}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center">
                            <FaMapMarkerAlt className="text-[#f35b04] mr-1 text-sm" />
                            {expense.endPoint}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-[#3d348b]">
                            {expense.distance
                              ? expense.distance.toFixed(1)
                              : "0.0"}{" "}
                            km
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-[#f35b04]">
                            CHF{" "}
                            {expense.totalCost
                              ? expense.totalCost.toFixed(2)
                              : "0.00"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#7678ed] bg-opacity-10 text-[#3d348b]">
                            <span
                              className="inline-block w-2 h-2 rounded-full mr-1"
                              style={{
                                backgroundColor: "#3F51B5",
                              }}
                            ></span>
                            {expense.category?.name || "Unknown"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center text-sm text-gray-700">
                            <span className="h-6 w-6 rounded-full bg-[#f7b801] text-white flex items-center justify-center text-xs mr-2">
                              {expense.user?.name
                                ? expense.user.name.charAt(0).toUpperCase()
                                : "?"}
                            </span>
                            {expense.user?.name || "Unknown"}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="flex flex-col md:flex-row md:justify-between md:items-center mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="text-sm text-gray-600 mb-4 md:mb-0">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.totalResults
                  )}{" "}
                  of {pagination.totalResults} results
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#3d348b",
                      color: "white",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-[#3d348b] text-[#3d348b] hover:bg-[#3d348b] hover:text-white transition-all duration-200"
                    }`}
                  >
                    First
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#7678ed",
                      color: "white",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-[#7678ed] text-[#7678ed] hover:bg-[#7678ed] hover:text-white transition-all duration-200"
                    }`}
                  >
                    Prev
                  </motion.button>
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      // Show 5 page buttons centered around current page
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else {
                        const leftOffset = Math.min(2, pagination.page - 1);
                        pageNum = pagination.page - leftOffset + i;
                        if (pageNum > pagination.totalPages) {
                          pageNum = pagination.totalPages - (4 - i);
                        }
                        if (pageNum < 1) pageNum = i + 1;
                      }

                      return (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-md min-w-[32px] ${
                            pagination.page === pageNum
                              ? "bg-[#f7b801] text-white font-medium shadow-md"
                              : "bg-white border border-gray-200 text-gray-700 hover:border-[#f7b801] hover:text-[#f7b801] transition-all duration-200"
                          }`}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    }
                  )}
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#7678ed",
                      color: "white",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === pagination.totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-[#7678ed] text-[#7678ed] hover:bg-[#7678ed] hover:text-white transition-all duration-200"
                    }`}
                  >
                    Next
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "#3d348b",
                      color: "white",
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`px-3 py-1 rounded-md ${
                      pagination.page === pagination.totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-[#3d348b] text-[#3d348b] hover:bg-[#3d348b] hover:text-white transition-all duration-200"
                    }`}
                  >
                    Last
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default AdvancedFilteredExpenses;
