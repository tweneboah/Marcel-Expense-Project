import React, { useState, useEffect } from "react";
import API from "../../api/apiConfig";
import {
  FaChartBar,
  FaFileExport,
  FaCalendarAlt,
  FaFilter,
} from "react-icons/fa";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Brand colors
const BRAND_COLORS = {
  darkPurple: "#3d348b",
  lightPurple: "#7678ed",
  yellow: "#f7b801",
  orange: "#f35b04",
};

const BudgetComparison = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(2025);
  const [months, setMonths] = useState([
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
  ]);
  const [selectedMonth, setSelectedMonth] = useState("February");

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Construct query parameters
        let queryParams = `year=${year}`;
        const monthIndex = months.findIndex((m) => m === selectedMonth) + 1;
        queryParams += `&month=${monthIndex}`;
        queryParams += "&debug=true";

        // Making API request

        const response = await API.get(
          `/advanced-reports/budget-comparison?${queryParams}`
        );

        // API returns {success: true, data: {...}} structure
        if (response.data && response.data.success && response.data.data) {
          // Setting comparison data from API response
          const apiData = response.data.data;

          // Create chart data structure from API response
          const chartData = {
            labels: apiData.categories.map((cat) => cat.categoryName),
            datasets: [
              {
                label: "Budget",
                data: apiData.categories.map((cat) => cat.budgetAmount),
                backgroundColor: BRAND_COLORS.lightPurple,
                borderRadius: 6,
              },
              {
                label: "Actual",
                data: apiData.categories.map((cat) => cat.actualCost),
                backgroundColor: BRAND_COLORS.orange,
                borderRadius: 6,
              },
            ],
          };

          // Prepare data for the component
          setComparisonData({
            chartData,
            period: apiData.period,
            categories: apiData.categories,
            totals: apiData.totals,
            rawResponse: response.data,
          });
        } else {
          // Unexpected API response structure
          setError("Unexpected API response structure");
        }
      } catch (err) {
        // Error handled by error context
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparisonData();
  }, [year, selectedMonth, months]);

  const getChartOptions = () => {
    // Always show month period text
    const periodText = `${selectedMonth} ${year}`;

    return {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: {
              family: "'Inter', sans-serif",
              size: 12,
            },
            usePointStyle: true,
            padding: 20,
          },
        },
        title: {
          display: true,
          text: `Budget vs. Actual - ${periodText}`,
          font: {
            family: "'Inter', sans-serif",
            size: 16,
            weight: "bold",
          },
          padding: {
            top: 10,
            bottom: 20,
          },
          color: BRAND_COLORS.darkPurple,
        },
        tooltip: {
          backgroundColor: "rgba(61, 52, 139, 0.85)",
          titleFont: {
            family: "'Inter', sans-serif",
            size: 14,
          },
          bodyFont: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          padding: 12,
          cornerRadius: 8,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif",
            },
            color: "#555",
          },
          title: {
            display: true,
            text: "Amount (CHF)",
            font: {
              family: "'Inter', sans-serif",
              size: 12,
            },
            color: "#555",
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif",
            },
            color: "#555",
          },
        },
      },
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 0,
          bottom: 10,
        },
      },
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
      },
    };
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleExport = (format) => {
    alert(`Exporting budget comparison data as ${format}`);
  };

  const getStatusColor = (status) => {
    return status === "over"
      ? "text-red-500"
      : status === "under"
      ? "text-green-500"
      : "text-yellow-500";
  };

  const getStatusBgColor = (status) => {
    return status === "over"
      ? "bg-red-50"
      : status === "under"
      ? "bg-green-50"
      : "bg-yellow-50";
  };

  const getStatusLabel = (status) => {
    return status === "over"
      ? "Over Budget"
      : status === "under"
      ? "Under Budget"
      : "On Target";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          className="h-16 w-16 rounded-full border-t-4 border-l-4 border-r-4"
          style={{ borderColor: BRAND_COLORS.lightPurple }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm"
      >
        <div className="flex items-center">
          <svg
            className="h-6 w-6 mr-3 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>{error}</p>
        </div>
      </motion.div>
    );
  }

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
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-8"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center text-gray-800">
            <span style={{ color: BRAND_COLORS.darkPurple }}>
              <FaChartBar className="mr-3 inline" />
            </span>
            Budget Comparison
          </h1>
          <p className="text-gray-500 mt-1">
            View, analyze, and export your budget comparison data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport("pdf")}
            className="px-4 py-2 rounded-md flex items-center font-medium text-white shadow-sm"
            style={{ backgroundColor: BRAND_COLORS.darkPurple }}
          >
            <HiOutlineDocumentDownload className="mr-2 text-lg" /> Export PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport("csv")}
            className="px-4 py-2 rounded-md flex items-center font-medium shadow-sm"
            style={{ backgroundColor: BRAND_COLORS.yellow, color: "#333" }}
          >
            <HiOutlineDocumentDownload className="mr-2 text-lg" /> Export CSV
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-100"
      >
        <div className="flex flex-wrap items-center gap-6 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
              <FaCalendarAlt className="text-gray-400" />
              <span className="font-medium text-gray-600">Year:</span>
              <select
                value={year}
                onChange={handleYearChange}
                className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ focus: { ringColor: BRAND_COLORS.lightPurple } }}
              >
                {Array.from({ length: 7 }, (_, i) => currentYear - 5 + i).map(
                  (yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
              <FaFilter className="text-gray-400" />
              <span className="font-medium text-gray-600">Month:</span>
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ focus: { ringColor: BRAND_COLORS.lightPurple } }}
              >
                {months.map((month, index) => (
                  <option key={index} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="text-sm bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg mb-6 border border-indigo-100">
          <div className="font-medium mb-1 text-indigo-700">API Query</div>
          <code className="text-xs text-indigo-500 font-mono bg-white px-2 py-1 rounded border border-indigo-100">
            /advanced-reports/budget-comparison?year={year}&month=
            {months.findIndex((m) => m === selectedMonth) + 1}&debug=true
          </code>
        </div>

        <div className="h-80 p-2">
          {comparisonData && (
            <div className="text-xs text-gray-400 mb-2">
              <p>
                Available data: {JSON.stringify(Object.keys(comparisonData))}
              </p>
            </div>
          )}

          {comparisonData && comparisonData.chartData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Bar
                data={comparisonData.chartData}
                options={getChartOptions()}
              />
            </motion.div>
          )}

          {comparisonData && !comparisonData.chartData && (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">
                No chart data available for the selected period
              </p>
            </div>
          )}

          {!comparisonData && (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">No data received from API</p>
            </div>
          )}
        </div>
      </motion.div>

      {comparisonData && comparisonData.totals && (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
        >
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: BRAND_COLORS.darkPurple }}
            >
              Period Summary
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg shadow-sm"
                style={{ backgroundColor: "rgba(118, 120, 237, 0.1)" }}
              >
                <div
                  className="text-sm font-medium"
                  style={{ color: BRAND_COLORS.lightPurple }}
                >
                  Total Budget
                </div>
                <div
                  className="text-xl font-bold mt-1"
                  style={{ color: BRAND_COLORS.darkPurple }}
                >
                  CHF {comparisonData.totals.budgetAmount.toFixed(2)}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg shadow-sm"
                style={{ backgroundColor: "rgba(243, 91, 4, 0.1)" }}
              >
                <div
                  className="text-sm font-medium"
                  style={{ color: BRAND_COLORS.orange }}
                >
                  Total Actual
                </div>
                <div
                  className="text-xl font-bold mt-1"
                  style={{ color: "#333" }}
                >
                  CHF {comparisonData.totals.actualCost.toFixed(2)}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg shadow-sm bg-gray-50"
              >
                <div className="text-sm font-medium text-gray-600">
                  Variance
                </div>
                <div
                  className={`text-xl font-bold mt-1 ${
                    comparisonData.totals.variance > 0
                      ? "text-red-500"
                      : comparisonData.totals.variance < 0
                      ? "text-green-500"
                      : "text-gray-600"
                  }`}
                >
                  CHF {comparisonData.totals.variance.toFixed(2)}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg shadow-sm ${getStatusBgColor(
                  comparisonData.totals.status
                )}`}
              >
                <div
                  className={`text-sm font-medium ${getStatusColor(
                    comparisonData.totals.status
                  )}`}
                >
                  Status
                </div>
                <div
                  className={`text-xl font-bold mt-1 flex items-center ${getStatusColor(
                    comparisonData.totals.status
                  )}`}
                >
                  {getStatusLabel(comparisonData.totals.status)}
                  <span className="ml-2 text-sm">
                    ({comparisonData.totals.usagePercentage.toFixed(1)}%)
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {comparisonData && comparisonData.categories && (
        <motion.div
          variants={itemVariants}
          className="bg-white shadow-md rounded-xl p-6 border border-gray-100"
        >
          <h2
            className="text-lg font-bold mb-4"
            style={{ color: BRAND_COLORS.darkPurple }}
          >
            Category Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget (CHF)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual (CHF)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variance (CHF)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage (%)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonData.categories.map((category, index) => (
                  <motion.tr
                    key={index}
                    className="hover:bg-gray-50"
                    whileHover={{
                      backgroundColor: "rgba(118, 120, 237, 0.05)",
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {category.categoryName}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div
                        className="font-medium"
                        style={{ color: BRAND_COLORS.darkPurple }}
                      >
                        {category.budgetAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div
                        className="font-medium"
                        style={{ color: BRAND_COLORS.orange }}
                      >
                        {category.actualCost.toFixed(2)}
                      </div>
                    </td>
                    <td
                      className={`px-4 py-3 text-right whitespace-nowrap font-medium ${
                        category.variance < 0
                          ? "text-red-500"
                          : category.variance > 0
                          ? "text-green-500"
                          : "text-gray-600"
                      }`}
                    >
                      {category.variance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="font-medium text-gray-700">
                        {category.usagePercentage.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.status === "over"
                            ? "bg-red-100 text-red-800"
                            : category.status === "under"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {getStatusLabel(category.status)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">Total</td>
                  <td
                    className="px-4 py-3 text-right font-bold"
                    style={{ color: BRAND_COLORS.darkPurple }}
                  >
                    CHF {comparisonData.totals.budgetAmount.toFixed(2)}
                  </td>
                  <td
                    className="px-4 py-3 text-right font-bold"
                    style={{ color: BRAND_COLORS.orange }}
                  >
                    CHF {comparisonData.totals.actualCost.toFixed(2)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-bold ${
                      comparisonData.totals.variance < 0
                        ? "text-red-500"
                        : comparisonData.totals.variance > 0
                        ? "text-green-500"
                        : "text-gray-600"
                    }`}
                  >
                    CHF {comparisonData.totals.variance.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-700">
                    {comparisonData.totals.usagePercentage.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        comparisonData.totals.status === "over"
                          ? "bg-red-100 text-red-800"
                          : comparisonData.totals.status === "under"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {getStatusLabel(comparisonData.totals.status)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BudgetComparison;
