import { useState, useEffect } from "react";
import { getYearlyComparison } from "../../../api/analyticsApi";
import ExpenseChart from "../../../components/charts/ExpenseChart";
import AnalyticsNav from "../../../components/analytics/AnalyticsNav";
import { motion } from "framer-motion";
import { formatCurrency } from "../../../utils/formatters";
import {
  FiCalendar,
  FiRepeat,
  FiBarChart2,
  FiTrendingUp,
  FiChevronDown,
  FiArrowUp,
  FiArrowDown,
  FiCreditCard,
  FiMapPin,
  FiList,
  FiActivity,
  FiPieChart,
  FiPercent,
} from "react-icons/fi";

const YearlyComparison = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [compareYears, setCompareYears] = useState([
    2024, // Use 2024 as first year
    2025, // Use 2025 as second year (where most expenses are)
  ]);

  // Fetch yearly comparison data
  useEffect(() => {
    const fetchYearlyData = async () => {
      try {
        setLoading(true);
        const response = await getYearlyComparison({
          year1: compareYears[0],
          year2: compareYears[1],
        });
        setYearlyData(response.data);
      } catch (err) {
        setError("Failed to load yearly comparison data");
        // Error handled by error context
      } finally {
        setLoading(false);
      }
    };

    fetchYearlyData();
  }, [compareYears]);

  // Handle comparison years change
  const handleCompareYearChange = (index, value) => {
    const newYears = [...compareYears];
    newYears[index] = parseInt(value);
    setCompareYears(newYears);
  };

  // Prepare chart data for yearly comparison
  const prepareYearlyComparisonChart = () => {
    if (!yearlyData) return null;

    const labels = yearlyData.monthNames;
    const year1Data = Array(12).fill(0);
    const year2Data = Array(12).fill(0);

    // Populate data for each month
    yearlyData.year1.months.forEach((month) => {
      year1Data[month.month - 1] = month.totalCost;
    });

    yearlyData.year2.months.forEach((month) => {
      year2Data[month.month - 1] = month.totalCost;
    });

    return {
      labels,
      datasets: [
        {
          label: `${yearlyData.year1.year} (CHF)`,
          data: year1Data,
          backgroundColor: "rgba(247, 184, 1, 0.6)",
          borderColor: "#f7b801",
          borderWidth: 1,
        },
        {
          label: `${yearlyData.year2.year} (CHF)`,
          data: year2Data,
          backgroundColor: "rgba(243, 91, 4, 0.6)",
          borderColor: "#f35b04",
          borderWidth: 1,
        },
      ],
    };
  };

  // Generate years for select dropdowns
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= 2025; i++) {
      years.push(i);
    }
    return years;
  };

  // Prepare expense count chart
  const prepareExpenseCountChart = () => {
    if (!yearlyData) return null;

    const labels = yearlyData.monthNames;
    const year1Data = Array(12).fill(0);
    const year2Data = Array(12).fill(0);

    // Populate data for each month
    yearlyData.year1.months.forEach((month) => {
      year1Data[month.month - 1] = month.totalExpenses;
    });

    yearlyData.year2.months.forEach((month) => {
      year2Data[month.month - 1] = month.totalExpenses;
    });

    return {
      labels,
      datasets: [
        {
          label: `${yearlyData.year1.year} (Count)`,
          data: year1Data,
          backgroundColor: "rgba(61, 52, 139, 0.6)",
          borderColor: "#3d348b",
          borderWidth: 1,
        },
        {
          label: `${yearlyData.year2.year} (Count)`,
          data: year2Data,
          backgroundColor: "rgba(118, 120, 237, 0.6)",
          borderColor: "#7678ed",
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

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        delay: 0.3,
      },
    },
  };

  // Chart options
  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          color: "#3d348b",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(61, 52, 139, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#f7b801",
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
      },
    },
  };

  // Format percentage change with color and arrow icon
  const formatPercentageChange = (value) => {
    const isPositive = value >= 0;
    return (
      <div
        className={`flex items-center ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <FiArrowUp className="mr-1" />
        ) : (
          <FiArrowDown className="mr-1" />
        )}
        <span className="font-bold">
          {isPositive ? "+" : ""}
          {value.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-7xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="text-3xl font-bold mb-6 text-[#3d348b] flex items-center"
        variants={itemVariants}
      >
        <FiRepeat className="mr-3 text-[#f7b801]" />
        Yearly Comparison
      </motion.h1>

      <motion.div variants={itemVariants}>
        <AnalyticsNav activeTab="yearly-comparison" />
      </motion.div>

      {error && (
        <motion.div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4"
          variants={itemVariants}
        >
          {error}
        </motion.div>
      )}

      <motion.div
        className="bg-white rounded-xl shadow-lg p-6 mt-6 border-t-4 border-[#7678ed]"
        variants={itemVariants}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <motion.h2
            className="text-2xl font-semibold mb-4 lg:mb-0 text-[#3d348b] flex items-center"
            variants={itemVariants}
          >
            <FiBarChart2 className="mr-2 text-[#7678ed]" />
            Expense Yearly Comparison
          </motion.h2>

          <motion.div
            className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg"
            variants={itemVariants}
          >
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiCalendar className="text-[#f7b801]" />
              </div>
              <select
                value={compareYears[0]}
                onChange={(e) => handleCompareYearChange(0, e.target.value)}
                className="pl-10 pr-10 py-2 rounded-lg border-2 border-[#f7b801] bg-white text-[#3d348b] font-medium focus:outline-none focus:ring-2 focus:ring-[#f7b801] appearance-none"
              >
                {generateYearOptions().map((year) => (
                  <option key={`year1-${year}`} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FiChevronDown className="text-[#f7b801]" />
              </div>
            </div>

            <span className="text-lg font-bold text-[#3d348b] px-1">vs</span>

            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiCalendar className="text-[#f35b04]" />
              </div>
              <select
                value={compareYears[1]}
                onChange={(e) => handleCompareYearChange(1, e.target.value)}
                className="pl-10 pr-10 py-2 rounded-lg border-2 border-[#f35b04] bg-white text-[#3d348b] font-medium focus:outline-none focus:ring-2 focus:ring-[#f35b04] appearance-none"
              >
                {generateYearOptions().map((year) => (
                  <option key={`year2-${year}`} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FiChevronDown className="text-[#f35b04]" />
              </div>
            </div>
          </motion.div>
        </div>

        {loading ? (
          <motion.div
            className="flex justify-center items-center h-64"
            variants={itemVariants}
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-[#f7b801] border-t-[#3d348b] rounded-full animate-spin"></div>
              <p className="mt-4 text-[#3d348b] font-medium">Loading data...</p>
            </div>
          </motion.div>
        ) : yearlyData ? (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              variants={containerVariants}
            >
              <motion.div
                className="relative overflow-hidden bg-gradient-to-br from-[#3d348b]/10 to-[#7678ed]/5 p-6 rounded-xl border-l-4 border-[#7678ed] shadow-sm hover:shadow-md transition-shadow duration-200"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#7678ed]/10 flex items-center justify-center">
                  <FiList className="text-3xl text-[#7678ed]/30" />
                </div>
                <h3 className="text-sm font-medium text-[#3d348b]/80 mb-1 flex items-center">
                  <FiPercent className="mr-2 text-[#7678ed]" />
                  Change in Expenses
                </h3>
                <div className="text-2xl font-bold mt-2">
                  {formatPercentageChange(yearlyData.changes.totalExpenses)}
                </div>
              </motion.div>

              <motion.div
                className="relative overflow-hidden bg-gradient-to-br from-[#f7b801]/10 to-[#f7b801]/5 p-6 rounded-xl border-l-4 border-[#f7b801] shadow-sm hover:shadow-md transition-shadow duration-200"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#f7b801]/10 flex items-center justify-center">
                  <FiMapPin className="text-3xl text-[#f7b801]/30" />
                </div>
                <h3 className="text-sm font-medium text-[#f7b801]/80 mb-1 flex items-center">
                  <FiPercent className="mr-2 text-[#f7b801]" />
                  Change in Distance
                </h3>
                <div className="text-2xl font-bold mt-2">
                  {formatPercentageChange(yearlyData.changes.totalDistance)}
                </div>
              </motion.div>

              <motion.div
                className="relative overflow-hidden bg-gradient-to-br from-[#f35b04]/10 to-[#f35b04]/5 p-6 rounded-xl border-l-4 border-[#f35b04] shadow-sm hover:shadow-md transition-shadow duration-200"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#f35b04]/10 flex items-center justify-center">
                  <FiCreditCard className="text-3xl text-[#f35b04]/30" />
                </div>
                <h3 className="text-sm font-medium text-[#f35b04]/80 mb-1 flex items-center">
                  <FiPercent className="mr-2 text-[#f35b04]" />
                  Change in Cost
                </h3>
                <div className="text-2xl font-bold mt-2">
                  {formatPercentageChange(yearlyData.changes.totalCost)}
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              variants={chartVariants}
            >
              <h3 className="text-xl font-semibold mb-4 text-[#3d348b] flex items-center">
                <FiCreditCard className="mr-2 text-[#f35b04]" />
                Monthly Cost Comparison
              </h3>
              <div className="h-80">
                <ExpenseChart
                  chartType="bar"
                  data={prepareYearlyComparisonChart()}
                  options={chartOptions}
                  height={300}
                />
              </div>
            </motion.div>

            <motion.div
              className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              variants={chartVariants}
            >
              <h3 className="text-xl font-semibold mb-4 text-[#3d348b] flex items-center">
                <FiActivity className="mr-2 text-[#7678ed]" />
                Monthly Expense Count Comparison
              </h3>
              <div className="h-80">
                <ExpenseChart
                  chartType="bar"
                  data={prepareExpenseCountChart()}
                  options={chartOptions}
                  height={300}
                />
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8"
              variants={containerVariants}
            >
              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#f7b801] hover:shadow-md transition-all duration-200"
                variants={itemVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <h3 className="text-lg font-semibold mb-4 text-[#3d348b] flex items-center">
                  <FiCalendar className="mr-2 text-[#f7b801]" />
                  <span className="bg-[#f7b801]/10 px-3 py-1 rounded-lg">
                    {yearlyData.year1.year} Summary
                  </span>
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[#f7b801]/5 hover:bg-[#f7b801]/10 transition-colors">
                    <span className="text-[#3d348b] flex items-center">
                      <FiList className="mr-2 text-[#7678ed]" />
                      Total Expenses:
                    </span>
                    <span className="font-medium text-[#3d348b]">
                      {yearlyData.year1.totals.totalExpenses}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[#f7b801]/5 hover:bg-[#f7b801]/10 transition-colors">
                    <span className="text-[#3d348b] flex items-center">
                      <FiMapPin className="mr-2 text-[#7678ed]" />
                      Total Distance:
                    </span>
                    <span className="font-medium text-[#3d348b]">
                      {yearlyData.year1.totals.totalDistance.toFixed(1)}{" "}
                      <span className="text-sm">km</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[#f7b801]/5 hover:bg-[#f7b801]/10 transition-colors">
                    <span className="text-[#3d348b] flex items-center">
                      <FiCreditCard className="mr-2 text-[#7678ed]" />
                      Total Cost:
                    </span>
                    <span className="font-medium text-[#3d348b]">
                      {formatCurrency(yearlyData.year1.totals.totalCost)}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#f35b04] hover:shadow-md transition-all duration-200"
                variants={itemVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <h3 className="text-lg font-semibold mb-4 text-[#3d348b] flex items-center">
                  <FiCalendar className="mr-2 text-[#f35b04]" />
                  <span className="bg-[#f35b04]/10 px-3 py-1 rounded-lg">
                    {yearlyData.year2.year} Summary
                  </span>
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[#f35b04]/5 hover:bg-[#f35b04]/10 transition-colors">
                    <span className="text-[#3d348b] flex items-center">
                      <FiList className="mr-2 text-[#7678ed]" />
                      Total Expenses:
                    </span>
                    <span className="font-medium text-[#3d348b]">
                      {yearlyData.year2.totals.totalExpenses}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[#f35b04]/5 hover:bg-[#f35b04]/10 transition-colors">
                    <span className="text-[#3d348b] flex items-center">
                      <FiMapPin className="mr-2 text-[#7678ed]" />
                      Total Distance:
                    </span>
                    <span className="font-medium text-[#3d348b]">
                      {yearlyData.year2.totals.totalDistance.toFixed(1)}{" "}
                      <span className="text-sm">km</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[#f35b04]/5 hover:bg-[#f35b04]/10 transition-colors">
                    <span className="text-[#3d348b] flex items-center">
                      <FiCreditCard className="mr-2 text-[#7678ed]" />
                      Total Cost:
                    </span>
                    <span className="font-medium text-[#3d348b]">
                      {formatCurrency(yearlyData.year2.totals.totalCost)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        ) : (
          <motion.div
            className="flex justify-center items-center h-64"
            variants={itemVariants}
          >
            <p className="text-[#3d348b] font-medium">No data available</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default YearlyComparison;
