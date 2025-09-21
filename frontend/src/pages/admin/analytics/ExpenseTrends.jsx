import { useState, useEffect } from "react";
import { getExpenseTrends } from "../../../api/analyticsApi";
import ExpenseChart from "../../../components/charts/ExpenseChart";
import AnalyticsNav from "../../../components/analytics/AnalyticsNav";
import { motion } from "framer-motion";
import { formatCurrency } from "../../../utils/formatters";
import {
  FiTrendingUp,
  FiCalendar,
  FiBarChart2,
  FiClock,
  FiFilter,
  FiChevronDown,
  FiActivity,
  FiMapPin,
  FiCreditCard,
  FiList,
  FiDatabase,
  FiArrowUp,
  FiArrowDown,
  FiSliders,
} from "react-icons/fi";

const ExpenseTrends = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [periodType, setPeriodType] = useState("month");
  const [months, setMonths] = useState(6);
  const [targetYear, setTargetYear] = useState(2025);

  // Fetch expense trends data
  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        const response = await getExpenseTrends({
          periodType,
          months,
          targetYear,
        });
        setTrendData(response.data);
      } catch (err) {
        setError("Failed to load expense trends data");
        // Error handled by error context
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [periodType, months, targetYear]);

  // Handle period type change
  const handlePeriodTypeChange = (e) => {
    setPeriodType(e.target.value);
  };

  // Handle months change
  const handleMonthsChange = (e) => {
    setMonths(parseInt(e.target.value));
  };

  // Handle target year change
  const handleTargetYearChange = (e) => {
    setTargetYear(parseInt(e.target.value));
  };

  // Prepare chart data for expense trends
  const prepareTrendChart = () => {
    if (!trendData) return null;

    const labels = trendData.trends.map((item) => item.dateString);
    const costData = trendData.trends.map((item) => item.totalCost);
    const countData = trendData.trends.map((item) => item.totalExpenses);
    const ma3Data = trendData.movingAverages?.ma3 || [];

    return {
      labels,
      datasets: [
        {
          label: "Total Cost (CHF)",
          data: costData,
          borderColor: "#f35b04",
          backgroundColor: "rgba(243, 91, 4, 0.2)",
          yAxisID: "y",
          tension: 0.3,
        },
        {
          label: "Expense Count",
          data: countData,
          borderColor: "#7678ed",
          backgroundColor: "rgba(118, 120, 237, 0.2)",
          yAxisID: "y1",
          tension: 0.3,
        },
        {
          label: "3-Month Moving Average (CHF)",
          data: ma3Data,
          borderColor: "#f7b801",
          backgroundColor: "rgba(247, 184, 1, 0.2)",
          borderDash: [5, 5],
          yAxisID: "y",
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    };
  };

  // Prepare chart options for trends
  const trendChartOptions = {
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Cost (CHF)",
          color: "#f35b04",
        },
        ticks: {
          color: "#f35b04",
        },
        border: {
          color: "rgba(243, 91, 4, 0.2)",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Count",
          color: "#7678ed",
        },
        ticks: {
          color: "#7678ed",
        },
        border: {
          color: "rgba(118, 120, 237, 0.2)",
        },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: "rgba(61, 52, 139, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#f7b801",
        borderWidth: 1,
        padding: 10,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        boxPadding: 5,
      },
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
    },
  };

  // Get period name
  const getPeriodName = (periodType) => {
    switch (periodType) {
      case "day":
        return "Daily";
      case "week":
        return "Weekly";
      case "month":
        return "Monthly";
      default:
        return "Monthly";
    }
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
        <FiTrendingUp className="mr-3 text-[#f7b801]" />
        Expense Trends
      </motion.h1>

      <motion.div variants={itemVariants}>
        <AnalyticsNav activeTab="trends" />
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
        className="bg-white rounded-xl shadow-lg p-6 mt-6 border-t-4 border-[#f35b04]"
        variants={itemVariants}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <motion.h2
            className="text-2xl font-semibold mb-4 lg:mb-0 text-[#3d348b] flex items-center"
            variants={itemVariants}
          >
            <FiActivity className="mr-2 text-[#f35b04]" />
            Expense Trend Analysis
          </motion.h2>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 bg-gray-50 p-3 rounded-lg w-full lg:w-auto"
            variants={itemVariants}
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FiBarChart2 className="text-[#7678ed]" />
              </div>
              <select
                value={periodType}
                onChange={handlePeriodTypeChange}
                className="pl-10 pr-10 py-2 block w-full rounded-lg border-2 border-[#7678ed] bg-white text-[#3d348b] font-medium focus:outline-none focus:ring-2 focus:ring-[#7678ed] appearance-none"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FiChevronDown className="text-[#7678ed]" />
              </div>
            </div>

            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FiClock className="text-[#7678ed]" />
              </div>
              <select
                value={months}
                onChange={handleMonthsChange}
                className="pl-10 pr-10 py-2 block w-full rounded-lg border-2 border-[#7678ed] bg-white text-[#3d348b] font-medium focus:outline-none focus:ring-2 focus:ring-[#7678ed] appearance-none"
              >
                <option value="3">Last 3 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last 12 Months</option>
                <option value="24">Last 24 Months</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FiChevronDown className="text-[#7678ed]" />
              </div>
            </div>

            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FiCalendar className="text-[#7678ed]" />
              </div>
              <select
                value={targetYear}
                onChange={handleTargetYearChange}
                className="pl-10 pr-10 py-2 block w-full rounded-lg border-2 border-[#7678ed] bg-white text-[#3d348b] font-medium focus:outline-none focus:ring-2 focus:ring-[#7678ed] appearance-none"
              >
                <option value="2025">2025</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <FiChevronDown className="text-[#7678ed]" />
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
        ) : trendData ? (
          <>
            <motion.div
              className="mb-6 p-4 bg-gradient-to-r from-[#3d348b]/5 to-[#7678ed]/5 rounded-lg border-l-4 border-[#7678ed]"
              variants={itemVariants}
            >
              <p className="text-[#3d348b] flex items-center">
                <FiFilter className="mr-2 text-[#7678ed]" />
                Viewing{" "}
                <span className="font-bold mx-1">
                  {getPeriodName(periodType)}
                </span>{" "}
                expense trends for the last{" "}
                <span className="font-bold mx-1">{months}</span> month
                {months !== 1 ? "s" : ""}
                {trendData.dateRange && (
                  <span className="ml-2 text-[#f35b04] font-medium">
                    (
                    {new Date(trendData.dateRange.startDate).toLocaleDateString(
                      "de-CH"
                    )}{" "}
                    -{" "}
                    {new Date(trendData.dateRange.endDate).toLocaleDateString(
                      "de-CH"
                    )}
                    )
                  </span>
                )}
              </p>
            </motion.div>

            <motion.div
              className="h-80 mb-8 bg-white p-4 rounded-xl shadow-sm"
              variants={itemVariants}
            >
              <ExpenseChart
                chartType="line"
                data={prepareTrendChart()}
                options={trendChartOptions}
                height={300}
              />
            </motion.div>

            {/* Trend Data Table */}
            <motion.div
              className="overflow-x-auto mt-8"
              variants={itemVariants}
            >
              <motion.h3
                className="text-xl font-semibold mb-4 text-[#3d348b] flex items-center"
                variants={itemVariants}
              >
                <FiDatabase className="mr-2 text-[#f35b04]" />
                Trend Data
              </motion.h3>
              <div className="rounded-xl overflow-hidden shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#3d348b] text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <div className="flex items-center">
                          <FiList className="mr-1" />
                          Total Expenses
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <div className="flex items-center">
                          <FiMapPin className="mr-1" />
                          Total Distance
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        <div className="flex items-center">
                          <FiCreditCard className="mr-1" />
                          Total Cost
                        </div>
                      </th>
                      {trendData.movingAverages?.ma3 && (
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          <div className="flex items-center">
                            <FiSliders className="mr-1" />
                            3-Month MA
                          </div>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {trendData.trends.map((trend, index) => {
                      // Calculate change indicators compared to previous period
                      const prevTrend =
                        index > 0 ? trendData.trends[index - 1] : null;
                      const costChange = prevTrend
                        ? trend.totalCost - prevTrend.totalCost
                        : 0;
                      const expenseChange = prevTrend
                        ? trend.totalExpenses - prevTrend.totalExpenses
                        : 0;

                      return (
                        <motion.tr
                          key={trend.dateString}
                          className="hover:bg-[#7678ed]/5 transition-colors duration-150"
                          custom={index}
                          variants={tableRowVariants}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-[#3d348b] flex items-center">
                              <FiCalendar className="mr-2 text-[#7678ed]" />
                              {trend.dateString}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700 flex items-center">
                              {trend.totalExpenses}
                              {prevTrend && (
                                <span
                                  className={`ml-2 text-xs flex items-center ${
                                    expenseChange > 0
                                      ? "text-green-600"
                                      : expenseChange < 0
                                      ? "text-red-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {expenseChange > 0 ? (
                                    <FiArrowUp className="mr-1" />
                                  ) : expenseChange < 0 ? (
                                    <FiArrowDown className="mr-1" />
                                  ) : null}
                                  {Math.abs(expenseChange)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">
                              {trend.totalDistance.toFixed(1)} km
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700 flex items-center">
                              {formatCurrency(trend.totalCost)}
                              {prevTrend && (
                                <span
                                  className={`ml-2 text-xs flex items-center ${
                                    costChange > 0
                                      ? "text-green-600"
                                      : costChange < 0
                                      ? "text-red-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {costChange > 0 ? (
                                    <FiArrowUp className="mr-1" />
                                  ) : costChange < 0 ? (
                                    <FiArrowDown className="mr-1" />
                                  ) : null}
                                  {formatCurrency(Math.abs(costChange))}
                                </span>
                              )}
                            </div>
                          </td>
                          {trendData.movingAverages?.ma3 && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">
                                {trendData.movingAverages.ma3[index]
                                  ? formatCurrency(
                                      trendData.movingAverages.ma3[index]
                                    )
                                  : "-"}
                              </div>
                            </td>
                          )}
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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

export default ExpenseTrends;
