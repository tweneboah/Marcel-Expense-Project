import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTimePeriodSummary } from "../../../api/analyticsApi";
import ExpenseChart from "../../../components/charts/ExpenseChart";
import AnalyticsNav from "../../../components/analytics/AnalyticsNav";
import { motion } from "framer-motion";
import { formatCurrency } from "../../../utils/formatters";
import {
  FiCalendar,
  FiTrendingUp,
  FiCreditCard,
  FiBarChart2,
  FiMap,
  FiPieChart,
  FiArrowRight,
  FiFilter,
  FiChevronDown,
} from "react-icons/fi";

const TimeSummary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodSummary, setPeriodSummary] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [periodType, setPeriodType] = useState("month");

  // Fetch time period summary data
  useEffect(() => {
    const fetchPeriodSummary = async () => {
      try {
        setLoading(true);
        const response = await getTimePeriodSummary({
          periodType,
          year: selectedYear,
        });
        setPeriodSummary(response.data);
      } catch (err) {
        setError("Failed to load period summary data");
        // Error handled by error context
      } finally {
        setLoading(false);
      }
    };

    fetchPeriodSummary();
  }, [periodType, selectedYear]);

  // Handle period type change
  const handlePeriodTypeChange = (e) => {
    setPeriodType(e.target.value);
  };

  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  // Navigate to period detail
  const navigateToPeriodDetail = (period) => {
    navigate(
      `/admin/analytics/period/${periodType}/${period.period}/${selectedYear}`
    );
  };

  // Prepare chart data for period summary
  const preparePeriodSummaryChart = () => {
    if (!periodSummary) return null;

    const labels = periodSummary.summary.map((item) => item.periodLabel);
    const costData = periodSummary.summary.map((item) => item.totalCost);
    const distanceData = periodSummary.summary.map(
      (item) => item.totalDistance
    );

    return {
      labels,
      datasets: [
        {
          label: "Total Cost (CHF)",
          data: costData,
          borderColor: "#f35b04",
          backgroundColor: "rgba(243, 91, 4, 0.5)",
          yAxisID: "y",
        },
        {
          label: "Total Distance (km)",
          data: distanceData,
          borderColor: "#7678ed",
          backgroundColor: "rgba(118, 120, 237, 0.5)",
          yAxisID: "y1",
        },
      ],
    };
  };

  // Prepare chart options for period summary
  const periodSummaryChartOptions = {
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
          text: "Distance (km)",
          color: "#7678ed",
        },
        ticks: {
          color: "#7678ed",
        },
      },
    },
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
        className="text-3xl font-bold mb-6 text-[#3d348b]"
        variants={itemVariants}
      >
        Time Period Summary
      </motion.h1>

      <motion.div variants={itemVariants}>
        <AnalyticsNav activeTab="time-summary" />
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
        className="bg-white rounded-xl shadow-lg p-6 mt-6 border-t-4 border-[#3d348b]"
        variants={itemVariants}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <motion.h2
            className="text-2xl font-semibold mb-4 md:mb-0 text-[#3d348b] flex items-center"
            variants={itemVariants}
          >
            <FiBarChart2 className="mr-2 text-[#f7b801]" />
            Expense Summary by Period
          </motion.h2>

          <motion.div
            className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 bg-gray-50 p-3 rounded-lg"
            variants={itemVariants}
          >
            <div className="relative flex items-center">
              <FiFilter className="absolute left-3 text-[#7678ed]" />
              <select
                value={periodType}
                onChange={handlePeriodTypeChange}
                className="pl-10 pr-10 py-2 rounded-lg border-2 border-[#7678ed] bg-white text-[#3d348b] font-medium focus:outline-none focus:ring-2 focus:ring-[#7678ed] appearance-none"
              >
                <option value="month">Monthly</option>
                <option value="quarter">Quarterly</option>
                <option value="year">Yearly</option>
              </select>
              <FiChevronDown className="absolute right-3 text-[#7678ed]" />
            </div>

            <div className="relative flex items-center">
              <FiCalendar className="absolute left-3 text-[#7678ed]" />
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="pl-10 pr-10 py-2 rounded-lg border-2 border-[#7678ed] bg-white text-[#3d348b] font-medium focus:outline-none focus:ring-2 focus:ring-[#7678ed] appearance-none"
              >
                {generateYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 text-[#7678ed]" />
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
        ) : periodSummary ? (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              variants={containerVariants}
            >
              <motion.div
                className="bg-gradient-to-br from-[#3d348b]/10 to-[#3d348b]/5 p-6 rounded-xl border-l-4 border-[#3d348b] shadow-sm hover:shadow-md transition-shadow duration-200"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-sm font-medium text-[#3d348b]/80 mb-1 flex items-center">
                  <FiTrendingUp className="mr-2 text-[#3d348b]" />
                  Total Expenses
                </h3>
                <p className="text-3xl font-bold text-[#3d348b]">
                  {periodSummary.totals.totalExpenses}
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-[#7678ed]/10 to-[#7678ed]/5 p-6 rounded-xl border-l-4 border-[#7678ed] shadow-sm hover:shadow-md transition-shadow duration-200"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-sm font-medium text-[#7678ed]/80 mb-1 flex items-center">
                  <FiMap className="mr-2 text-[#7678ed]" />
                  Total Distance
                </h3>
                <p className="text-3xl font-bold text-[#7678ed]">
                  {periodSummary.totals.totalDistance.toFixed(1)}{" "}
                  <span className="text-lg">km</span>
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-[#f7b801]/10 to-[#f7b801]/5 p-6 rounded-xl border-l-4 border-[#f7b801] shadow-sm hover:shadow-md transition-shadow duration-200"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-sm font-medium text-[#f7b801]/80 mb-1 flex items-center">
                  <FiCreditCard className="mr-2 text-[#f7b801]" />
                  Total Cost
                </h3>
                <p className="text-3xl font-bold text-[#f7b801]">
                  {formatCurrency(periodSummary.totals.totalCost)}
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-[#f35b04]/10 to-[#f35b04]/5 p-6 rounded-xl border-l-4 border-[#f35b04] shadow-sm hover:shadow-md transition-shadow duration-200"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-sm font-medium text-[#f35b04]/80 mb-1 flex items-center">
                  <FiPieChart className="mr-2 text-[#f35b04]" />
                  Avg Cost per Expense
                </h3>
                <p className="text-3xl font-bold text-[#f35b04]">
                  {formatCurrency(periodSummary.totals.avgCost)}
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              className="h-80 mb-8 bg-white p-4 rounded-xl shadow-sm"
              variants={itemVariants}
            >
              <ExpenseChart
                chartType="bar"
                data={preparePeriodSummaryChart()}
                options={periodSummaryChartOptions}
                height={300}
              />
            </motion.div>

            {/* Period Summary Table with Links to Detail */}
            <motion.div
              className="mt-6 overflow-x-auto"
              variants={itemVariants}
            >
              <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-[#3d348b] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Expenses
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Distance
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Avg Cost
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {periodSummary.summary.map((period, index) => (
                    <motion.tr
                      key={`${period.period}-${period.year}`}
                      className="hover:bg-[#7678ed]/5 transition-colors duration-150"
                      custom={index}
                      variants={tableRowVariants}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#3d348b]">
                          {period.periodLabel}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {period.totalExpenses}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {period.totalDistance.toFixed(1)} km
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {formatCurrency(period.totalCost)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {formatCurrency(period.avgCost)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigateToPeriodDetail(period)}
                          className="flex items-center text-[#f35b04] hover:text-[#f7b801] transition-colors group"
                        >
                          View Details
                          <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
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

export default TimeSummary;
