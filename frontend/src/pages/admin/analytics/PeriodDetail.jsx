import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getPeriodDetail } from "../../../api/analyticsApi";
import ExpenseChart from "../../../components/charts/ExpenseChart";
import AnalyticsNav from "../../../components/analytics/AnalyticsNav";
import { motion } from "framer-motion";
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from "../../../utils/formatters";
import {
  FiCalendar,
  FiArrowLeft,
  FiCreditCard,
  FiMap,
  FiTrendingUp,
  FiFileText,
  FiTag,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFilter,
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";

const PeriodDetail = () => {
  const {
    periodType: routePeriodType,
    period: routePeriod,
    year: routeYear,
  } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodDetail, setPeriodDetail] = useState(null);

  // Filter state
  const [periodType, setPeriodType] = useState(routePeriodType || "month");
  const [periodValue, setPeriodValue] = useState(routePeriod || "8");
  const [year, setYear] = useState(routeYear || "2023");

  // Fetch period detail data
  useEffect(() => {
    const fetchPeriodDetail = async () => {
      try {
        setLoading(true);
        const response = await getPeriodDetail({
          periodType,
          periodValue,
          year,
        });
        setPeriodDetail(response.data);
      } catch (err) {
        setError("Failed to load period detail data");
        // Error handled by error context
      } finally {
        setLoading(false);
      }
    };

    fetchPeriodDetail();
  }, [periodType, periodValue, year]);

  // Update URL when filters change
  useEffect(() => {
    if (
      routePeriodType !== periodType ||
      routePeriod !== periodValue ||
      routeYear !== year
    ) {
      navigate(`/admin/analytics/period/${periodType}/${periodValue}/${year}`, {
        replace: true,
      });
    }
  }, [
    periodType,
    periodValue,
    year,
    navigate,
    routePeriodType,
    routePeriod,
    routeYear,
  ]);

  // Handle navigation back to summary
  const navigateToSummary = () => {
    navigate("/admin/analytics/time-summary");
  };

  // Handle filter changes
  const handlePeriodTypeChange = (e) => {
    setPeriodType(e.target.value);
    // Reset period value when period type changes to avoid invalid combinations
    if (e.target.value === "month") {
      setPeriodValue(periodValue > 12 ? "1" : periodValue);
    } else if (e.target.value === "quarter") {
      setPeriodValue(periodValue > 4 ? "1" : periodValue);
    }
  };

  const handlePeriodValueChange = (e) => {
    setPeriodValue(e.target.value);
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  const applyFilters = () => {
    // URL is already updated via useEffect
    // This function could be used for additional logic if needed
  };

  // Generate period value options based on selected period type
  const getPeriodValueOptions = () => {
    if (periodType === "month") {
      return Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: new Date(0, i).toLocaleString("default", { month: "long" }),
      }));
    } else if (periodType === "quarter") {
      return Array.from({ length: 4 }, (_, i) => ({
        value: String(i + 1),
        label: `Q${i + 1}`,
      }));
    } else {
      // For year, we don't need period value
      return [];
    }
  };

  // Generate year options
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  };

  // Prepare chart data for category breakdown
  const prepareCategoryChart = () => {
    if (!periodDetail) return null;

    const categoryMap = {};
    periodDetail.expenses.forEach((expense) => {
      const category = expense.category.name;
      if (!categoryMap[category]) {
        categoryMap[category] = {
          count: 0,
          totalCost: 0,
          totalDistance: 0,
        };
      }
      categoryMap[category].count += 1;
      categoryMap[category].totalCost += expense.cost;
      categoryMap[category].totalDistance += expense.distance;
    });

    const categories = Object.keys(categoryMap);
    const costData = categories.map((cat) => categoryMap[cat].totalCost);
    const backgroundColor = [
      "rgba(243, 91, 4, 0.7)",
      "rgba(247, 184, 1, 0.7)",
      "rgba(118, 120, 237, 0.7)",
      "rgba(61, 52, 139, 0.7)",
      "rgba(34, 139, 34, 0.7)",
    ];

    return {
      labels: categories,
      datasets: [
        {
          data: costData,
          backgroundColor,
          borderColor: backgroundColor.map((color) =>
            color.replace("0.7", "1")
          ),
          borderWidth: 1,
        },
      ],
    };
  };

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
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d348b]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button
            className="mt-2 text-sm underline"
            onClick={navigateToSummary}
          >
            Return to Time Period Summary
          </button>
        </div>
      </div>
    );
  }

  if (!periodDetail) {
    return null;
  }

  const { summary, periodInfo, expenses } = periodDetail;

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-7xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <motion.div variants={itemVariants}>
          <button
            onClick={navigateToSummary}
            className="text-[#3d348b] hover:text-[#7678ed] mb-4 flex items-center transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Summary
          </button>
          <h1 className="text-3xl font-bold text-[#3d348b] flex items-center">
            <FiCalendar className="mr-3 text-[#f7b801]" />
            {periodInfo.label} Details
          </h1>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <AnalyticsNav activeTab="period-detail" />
      </motion.div>

      {/* Filter Controls */}
      <motion.div
        className="bg-white rounded-xl shadow-sm p-6 mb-8"
        variants={itemVariants}
      >
        <h2 className="text-xl font-semibold mb-4 text-[#3d348b] flex items-center">
          <FiFilter className="mr-2 text-[#f7b801]" />
          Filter Options
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period Type
            </label>
            <div className="relative">
              <select
                value={periodType}
                onChange={handlePeriodTypeChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#7678ed] focus:border-[#7678ed] rounded-md"
              >
                <option value="month">Monthly</option>
                <option value="quarter">Quarterly</option>
                <option value="year">Yearly</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FiChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {periodType !== "year" && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period Value
              </label>
              <div className="relative">
                <select
                  value={periodValue}
                  onChange={handlePeriodValueChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#7678ed] focus:border-[#7678ed] rounded-md"
                >
                  {getPeriodValueOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FiChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <div className="relative">
              <select
                value={year}
                onChange={handleYearChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#7678ed] focus:border-[#7678ed] rounded-md"
              >
                {getYearOptions().map((yearOption) => (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FiChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full bg-[#3d348b] text-white py-2 px-4 rounded-md hover:bg-[#7678ed] transition-colors flex items-center justify-center"
            >
              <FiSearch className="mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-8"
        variants={containerVariants}
      >
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#3d348b]"
          variants={itemVariants}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-[#3d348b]">
                {formatNumber(summary.totalExpenses)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#3d348b]/15">
              <FiFileText className="text-2xl text-[#3d348b]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#7678ed]"
          variants={itemVariants}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Distance</p>
              <p className="text-2xl font-bold text-[#7678ed]">
                {formatNumber(summary.totalDistance)} km
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#7678ed]/15">
              <FiMap className="text-2xl text-[#7678ed]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#f35b04]"
          variants={itemVariants}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-[#f35b04]">
                {formatCurrency(summary.totalCost)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#f35b04]/15">
              <FiCreditCard className="text-2xl text-[#f35b04]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#f7b801]"
          variants={itemVariants}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Average Cost</p>
              <p className="text-2xl font-bold text-[#f7b801]">
                {formatCurrency(summary.averageCost)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#f7b801]/15">
              <FiTrendingUp className="text-2xl text-[#f7b801]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#22A39F]"
          variants={itemVariants}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Average Distance</p>
              <p className="text-2xl font-bold text-[#22A39F]">
                {formatNumber(summary.averageDistance)} km
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#22A39F]/15">
              <FiMap className="text-2xl text-[#22A39F]" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8"
        variants={containerVariants}
      >
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6"
          variants={itemVariants}
        >
          <h2 className="text-xl font-semibold mb-4 text-[#3d348b]">
            Expense Category Breakdown
          </h2>
          <div className="h-80">
            <ExpenseChart
              chartType="doughnut"
              data={prepareCategoryChart()}
              height={300}
              options={{
                plugins: {
                  legend: {
                    position: "right",
                  },
                },
              }}
            />
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-sm p-6"
          variants={itemVariants}
        >
          <h2 className="text-xl font-semibold mb-4 text-[#3d348b]">
            Period Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center border-b pb-3">
              <FiCalendar className="text-[#f7b801] mr-3" />
              <span className="text-gray-500 w-32">Period Type:</span>
              <span className="font-medium">
                {periodInfo.type.charAt(0).toUpperCase() +
                  periodInfo.type.slice(1)}
              </span>
            </div>
            <div className="flex items-center border-b pb-3">
              <FiClock className="text-[#f7b801] mr-3" />
              <span className="text-gray-500 w-32">Period Value:</span>
              <span className="font-medium">{periodInfo.label}</span>
            </div>
            <div className="flex items-center border-b pb-3">
              <FiCalendar className="text-[#f35b04] mr-3" />
              <span className="text-gray-500 w-32">Start Date:</span>
              <span className="font-medium">
                {formatDate(periodInfo.startDate)}
              </span>
            </div>
            <div className="flex items-center">
              <FiCalendar className="text-[#f35b04] mr-3" />
              <span className="text-gray-500 w-32">End Date:</span>
              <span className="font-medium">
                {formatDate(periodInfo.endDate)}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Expenses Table */}
      <motion.div className="mt-8" variants={containerVariants}>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#3d348b]">
              Expense Records
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Detailed list of all expenses during this period
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    From
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    To
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
                    Cost
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
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense, index) => (
                  <motion.tr
                    key={expense.id}
                    custom={index}
                    variants={tableRowVariants}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.from}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.to}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(expense.distance)} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(expense.cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        <FiTag className="mr-1" />
                        {expense.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.status === "approved" ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <FiCheckCircle className="mr-1" />
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          <FiXCircle className="mr-1" />
                          {expense.status}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PeriodDetail;
