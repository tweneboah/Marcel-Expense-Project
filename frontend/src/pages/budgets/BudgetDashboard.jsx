import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/apiConfig";
import { motion } from "framer-motion";
import {
  FaMoneyBillWave,
  FaChartBar,
  FaCalendarAlt,
  FaPlus,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const BudgetDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    totalBudgets: 0,
    totalAllocated: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overBudgetCount: 0,
    warningCount: 0,
    underBudgetCount: 0,
  });
  const [budgetsByCategory, setBudgetsByCategory] = useState([]);
  const [budgetsByMonth, setBudgetsByMonth] = useState([]);
  const [topBudgets, setTopBudgets] = useState([]);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // Brand colors
  const BRAND_COLORS = {
    primary: "#3d348b",
    secondary: "#7678ed",
    accent1: "#f7b801",
    accent2: "#f35b04",
    danger: "#e63946",
    success: "#2a9d8f",
    warning: "#e9c46a",
  };

  useEffect(() => {
    fetchBudgetData();
  }, [filterYear]);

  const fetchBudgetData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all budgets
      const response = await API.get(`/budgets?year=${filterYear}`);

      if (response.data && response.data.success) {
        const budgets = response.data.data;
        processBudgetData(budgets);
      } else {
        setError("Failed to fetch budget data");
      }
    } catch (err) {
      // Error handled by error context
      setError(err.response?.data?.message || "Failed to fetch budget data");
    } finally {
      setLoading(false);
    }
  };

  const processBudgetData = (budgets) => {
    // 1. Calculate summary statistics
    const stats = {
      totalBudgets: budgets.length,
      totalAllocated: 0,
      totalSpent: 0,
      totalRemaining: 0,
      overBudgetCount: 0,
      warningCount: 0,
      underBudgetCount: 0,
    };

    // 2. Group budgets by category
    const categoriesMap = new Map();
    const monthsMap = new Map();

    budgets.forEach((budget) => {
      // Summary stats
      const amount = budget.amount || 0;
      const actualCost = budget.usage?.actualCost || 0;
      const remaining = amount - actualCost;

      stats.totalAllocated += amount;
      stats.totalSpent += actualCost;
      stats.totalRemaining += remaining;

      if (budget.status === "over") {
        stats.overBudgetCount++;
      } else if (budget.status === "warning") {
        stats.warningCount++;
      } else {
        stats.underBudgetCount++;
      }

      // By category
      const categoryId = budget.category?._id || "uncategorized";
      const categoryName = budget.category?.name || "Uncategorized";
      const categoryColor = budget.category?.color || "#808080";

      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          color: categoryColor,
          totalAllocated: 0,
          totalSpent: 0,
        });
      }

      const categoryData = categoriesMap.get(categoryId);
      categoryData.totalAllocated += amount;
      categoryData.totalSpent += actualCost;

      // By month
      const month = budget.month || 1;
      const monthName = getMonthName(month);

      if (!monthsMap.has(month)) {
        monthsMap.set(month, {
          month,
          name: monthName,
          totalAllocated: 0,
          totalSpent: 0,
        });
      }

      const monthData = monthsMap.get(month);
      monthData.totalAllocated += amount;
      monthData.totalSpent += actualCost;
    });

    // Sort and limit top budgets by amount
    const sortedBudgets = [...budgets].sort((a, b) => b.amount - a.amount);
    setTopBudgets(sortedBudgets.slice(0, 5));

    // Convert maps to arrays and sort by month/amount
    const categoriesArray = Array.from(categoriesMap.values());
    const monthsArray = Array.from(monthsMap.values()).sort(
      (a, b) => a.month - b.month
    );

    setSummaryStats(stats);
    setBudgetsByCategory(categoriesArray);
    setBudgetsByMonth(monthsArray);
  };

  const getMonthName = (monthNum) => {
    const months = [
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
    return months[monthNum - 1] || "Unknown";
  };

  const getBudgetStatusBadge = (status) => {
    if (!status) return "bg-gray-200 text-gray-700";

    if (status === "under") return "bg-green-500 text-white";
    if (status === "warning") return "bg-[#f7b801] text-white";
    if (status === "critical" || status === "over")
      return "bg-[#f35b04] text-white";
    return "bg-[#7678ed] text-white";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(amount);
  };

  // Chart data preparation
  const getCategoryChartData = () => {
    return {
      labels: budgetsByCategory.map((cat) => cat.name),
      datasets: [
        {
          label: "Budget Allocated",
          data: budgetsByCategory.map((cat) => cat.totalAllocated),
          backgroundColor: budgetsByCategory.map((cat) => cat.color),
          borderWidth: 1,
        },
        {
          label: "Actual Spent",
          data: budgetsByCategory.map((cat) => cat.totalSpent),
          backgroundColor: budgetsByCategory.map((cat) =>
            hexToRgba(cat.color, 0.6)
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  const getMonthlyChartData = () => {
    return {
      labels: budgetsByMonth.map((month) => month.name),
      datasets: [
        {
          label: "Budget Allocated",
          data: budgetsByMonth.map((month) => month.totalAllocated),
          backgroundColor: BRAND_COLORS.primary,
          borderWidth: 1,
        },
        {
          label: "Actual Spent",
          data: budgetsByMonth.map((month) => month.totalSpent),
          backgroundColor: BRAND_COLORS.accent2,
          borderWidth: 1,
        },
      ],
    };
  };

  const getStatusChartData = () => {
    return {
      labels: ["Under Budget", "Warning", "Over Budget"],
      datasets: [
        {
          data: [
            summaryStats.underBudgetCount,
            summaryStats.warningCount,
            summaryStats.overBudgetCount,
          ],
          backgroundColor: [
            BRAND_COLORS.success,
            BRAND_COLORS.warning,
            BRAND_COLORS.danger,
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            label += formatCurrency(context.parsed.y);
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce(
              (sum, val) => sum + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Utility function to convert hex to rgba
  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(128, 128, 128, ${alpha})`;

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading && !budgetsByCategory.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d348b]"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="px-4 py-6 md:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <motion.div
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl font-bold text-white flex items-center">
                <FaChartBar className="mr-2" />
                Budget Dashboard
              </h1>
              <p className="text-white/80 mt-1">
                Overview of all budget allocations and expenses
              </p>
            </motion.div>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/reports/all-budgets">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white text-[#3d348b] rounded-md flex items-center font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <FaMoneyBillWave className="mr-2" />
                  View All Budgets
                </motion.button>
              </Link>
              <Link to="/admin/budgets/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-[#f7b801] to-[#f35b04] text-white rounded-md flex items-center font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <FaPlus className="mr-2" />
                  New Budget
                </motion.button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <FaCalendarAlt className="text-gray-500 mr-2" />
              <select
                className="border rounded-md p-2 bg-white"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="p-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div
              variants={itemVariants}
              className="bg-white p-4 rounded-lg shadow border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total Budget</p>
                  <p className="text-2xl font-bold text-[#3d348b]">
                    {formatCurrency(summaryStats.totalAllocated)}
                  </p>
                </div>
                <div className="bg-[#3d348b]/10 p-2 rounded-lg">
                  <FaMoneyBillWave className="text-[#3d348b] text-xl" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Across {summaryStats.totalBudgets} budgets
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white p-4 rounded-lg shadow border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-[#f35b04]">
                    {formatCurrency(summaryStats.totalSpent)}
                  </p>
                </div>
                <div className="bg-[#f35b04]/10 p-2 rounded-lg">
                  <FaArrowUp className="text-[#f35b04] text-xl" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {(
                  (summaryStats.totalSpent / summaryStats.totalAllocated) *
                  100
                ).toFixed(1)}
                % of total budget
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white p-4 rounded-lg shadow border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Remaining</p>
                  <p className="text-2xl font-bold text-[#7678ed]">
                    {formatCurrency(summaryStats.totalRemaining)}
                  </p>
                </div>
                <div className="bg-[#7678ed]/10 p-2 rounded-lg">
                  <FaArrowDown className="text-[#7678ed] text-xl" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {(
                  (summaryStats.totalRemaining / summaryStats.totalAllocated) *
                  100
                ).toFixed(1)}
                % of total budget
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white p-4 rounded-lg shadow border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Budget Status</p>
                  <p className="text-lg font-bold mt-1 flex items-center flex-wrap gap-1">
                    <span className="px-2 py-1 rounded-full text-xs text-white bg-green-500">
                      {summaryStats.underBudgetCount} Under
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs text-white bg-[#f7b801]">
                      {summaryStats.warningCount} Warning
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs text-white bg-[#f35b04]">
                      {summaryStats.overBudgetCount} Over
                    </span>
                  </p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FaExclamationTriangle className="text-yellow-500 text-xl" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {summaryStats.overBudgetCount} budgets need attention
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Budget by Category */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#7678ed] to-[#3d348b] p-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <FaChartBar className="mr-2" />
              Budget by Category
            </h2>
          </div>
          <div className="p-4" style={{ height: "350px" }}>
            {budgetsByCategory.length > 0 ? (
              <Bar data={getCategoryChartData()} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Budget by Month */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#f7b801] to-[#f35b04] p-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <FaCalendarAlt className="mr-2" />
              Budget by Month
            </h2>
          </div>
          <div className="p-4" style={{ height: "350px" }}>
            {budgetsByMonth.length > 0 ? (
              <Bar data={getMonthlyChartData()} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No monthly data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Status Chart */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-lg shadow-lg overflow-hidden lg:col-span-1"
        >
          <div className="bg-gray-800 p-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <FaInfoCircle className="mr-2" />
              Budget Status
            </h2>
          </div>
          <div className="p-4" style={{ height: "300px" }}>
            <Doughnut data={getStatusChartData()} options={doughnutOptions} />
          </div>
        </motion.div>

        {/* Top Budgets Table */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-lg shadow-lg overflow-hidden lg:col-span-2"
        >
          <div className="bg-gray-800 p-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <FaMoneyBillWave className="mr-2" />
              Top Budgets
            </h2>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spent
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topBudgets.map((budget) => (
                  <tr key={budget._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {budget.periodLabel ||
                        `${getMonthName(budget.month)} ${budget.year}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className="h-3 w-3 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              budget.category?.color || "#808080",
                          }}
                        ></span>
                        <span>{budget.category?.name || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {formatCurrency(budget.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {formatCurrency(budget.usage?.actualCost || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getBudgetStatusBadge(
                          budget.status
                        )}`}
                      >
                        {budget.status?.toUpperCase() || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}

                {topBudgets.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No budget data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BudgetDashboard;
