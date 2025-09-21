import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getAdminDashboardData } from "../../../api/adminApi";
import ExpenseChart from "../../../components/charts/ExpenseChart";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUsers,
  FiMapPin,
  FiDollarSign,
  FiTrendingUp,
  FiCalendar,
  FiPieChart,
  FiActivity,
  FiBarChart2,
  FiClock,
  FiSettings,
  FiTruck,
  FiNavigation,
  FiTarget,
  FiArrowRight,
} from "react-icons/fi";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getAdminDashboardData();
        setDashboardData(response.data);

        // Debug logging for received data
        // Recent expenses date formats processed
      } catch (err) {
        // Error handled by error context
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare monthly expenses chart data
  const prepareMonthlyExpensesChart = () => {
    if (!dashboardData?.monthlyExpensesChart) return null;

    const labels = dashboardData.monthlyExpensesChart.map((item) => item.month);
    const costData = dashboardData.monthlyExpensesChart.map(
      (item) => item.totalCost
    );
    const countData = dashboardData.monthlyExpensesChart.map(
      (item) => item.count
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
          label: "Expense Count",
          data: countData,
          borderColor: "#7678ed",
          backgroundColor: "rgba(118, 120, 237, 0.5)",
          yAxisID: "y1",
        },
      ],
    };
  };

  // Prepare category breakdown chart data
  const prepareCategoryChart = () => {
    if (!dashboardData?.categoryBreakdown) return null;

    return {
      labels: dashboardData.categoryBreakdown.map((item) => item.categoryName),
      datasets: [
        {
          data: dashboardData.categoryBreakdown.map((item) => item.totalCost),
          backgroundColor: [
            "#3d348b",
            "#7678ed",
            "#f7b801",
            "#f35b04",
            "#56c596",
            "#9c6644",
          ],
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
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
          callback: function(value) {
            return Math.round(value);
          },
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
          callback: function(value) {
            return Math.round(value);
          },
        },
      },
    },
  };

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#3d348b]/5 to-[#f35b04]/5">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 rounded-full border-4 border-transparent border-t-[#7678ed] border-l-[#f7b801]"
        ></motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mx-4 my-6"
        role="alert"
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="font-medium">Error Loading Dashboard</p>
        </div>
        <p className="mt-2">{error}</p>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d348b]/5 to-[#f35b04]/5 px-3 sm:px-4 py-4 sm:py-6 lg:py-8 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-1 sm:px-0">
        <div className="mb-4 sm:mb-6 lg:mb-8 bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#3d348b] to-[#7678ed] bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 flex items-center gap-2 text-sm sm:text-base">
                <FiUsers className="text-[#f7b801]" /> Welcome, {user?.name}!
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              <div className="py-1 px-2 sm:px-3 bg-indigo-100 text-[#3d348b] text-xs sm:text-sm rounded-full font-medium">
                {dashboardData?.timeInfo?.currentYear}
              </div>
              <Link
                to="/admin/settings"
                className="flex items-center gap-1 py-2 px-3 sm:px-4 bg-[#3d348b] hover:bg-[#3d348b]/90 text-white rounded-full transition-all duration-300 text-xs sm:text-sm font-medium"
              >
                <FiSettings className="text-[#f7b801]" /> 
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Metrics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Yearly Total Stats */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-[#3d348b]/30">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-xl mb-2 flex items-center">
                  <div className="mr-3 p-2 bg-[#3d348b]/10 rounded-lg">
                    <FiActivity className="text-[#3d348b] text-xl" />
                  </div>
                  Yearly Overview
                </h2>
                <div className="text-gray-600 text-sm mb-4">
                  Total figures for {dashboardData?.timeInfo?.currentYear}
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Year
              </span>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mt-4">
              <div className="bg-gradient-to-br from-[#3d348b]/10 to-[#7678ed]/10 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Trips</p>
                <p className="font-bold text-xl sm:text-2xl text-[#3d348b]">
                  {dashboardData?.yearlyMetrics?.totalTrips || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#3d348b]/10 to-[#7678ed]/10 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Distance</p>
                <div className="font-bold text-xl sm:text-2xl text-[#3d348b] flex items-end">
                  {dashboardData?.yearlyMetrics?.totalDistance || 0}
                  <span className="text-sm ml-1 text-gray-500">km</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#f35b04]/10 to-[#f7b801]/10 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Total Cost</p>
                <p className="font-bold text-xl sm:text-2xl text-[#f35b04]">
                  {formatCurrency(
                    dashboardData?.yearlyMetrics?.totalCost || 0,
                    "CHF"
                  )}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#f35b04]/10 to-[#f7b801]/10 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Avg Per Trip</p>
                <p className="font-bold text-xl sm:text-2xl text-[#f35b04]">
                  {formatCurrency(
                    dashboardData?.yearlyMetrics?.avgCostPerTrip || 0,
                    "CHF"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quarterly Stats */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-[#f7b801]/30">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-xl mb-2 flex items-center">
                  <div className="mr-3 p-2 bg-[#f7b801]/10 rounded-lg">
                    <FiClock className="text-[#f7b801] text-xl" />
                  </div>
                  Current Quarter
                </h2>
                <div className="text-gray-600 text-sm mb-4">
                  {dashboardData?.timeInfo?.currentQuarter}
                </div>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Quarter
              </span>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mt-4">
              <div className="bg-gradient-to-br from-[#f7b801]/10 to-[#f35b04]/10 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Trips</p>
                <p className="font-bold text-xl sm:text-2xl text-[#f7b801]">
                  {dashboardData?.quarterlyMetrics?.totalTrips || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#f7b801]/10 to-[#f35b04]/10 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Distance</p>
                <div className="font-bold text-xl sm:text-2xl text-[#f7b801] flex items-end">
                  {dashboardData?.quarterlyMetrics?.totalDistance || 0}
                  <span className="text-sm ml-1 text-gray-500">km</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#f35b04]/10 to-[#f7b801]/10 p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Total Cost</p>
                <p className="font-bold text-xl sm:text-2xl text-[#f35b04]">
                  {formatCurrency(
                    dashboardData?.quarterlyMetrics?.totalCost || 0,
                    "CHF"
                  )}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#f35b04]/10 to-[#f7b801]/10 p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Avg Per Trip</p>
                <p className="font-bold text-xl sm:text-2xl text-[#f35b04]">
                  {formatCurrency(
                    dashboardData?.quarterlyMetrics?.avgCostPerTrip || 0,
                    "CHF"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-[#7678ed]/30">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-xl mb-2 flex items-center">
                  <div className="mr-3 p-2 bg-[#7678ed]/10 rounded-lg">
                    <FiCalendar className="text-[#7678ed] text-xl" />
                  </div>
                  Current Month
                </h2>
                <div className="text-gray-600 text-sm mb-4">
                  {dashboardData?.timeInfo?.currentMonth}
                </div>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Month
              </span>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mt-4">
              <div className="bg-gradient-to-br from-[#7678ed]/10 to-[#f7b801]/10 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Trips</p>
                <p className="font-bold text-xl sm:text-2xl text-[#7678ed]">
                  {dashboardData?.monthlyMetrics?.totalTrips || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#7678ed]/10 to-[#3d348b]/10 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Distance</p>
                <div className="font-bold text-xl sm:text-2xl text-[#7678ed] flex items-end">
                  {dashboardData?.monthlyMetrics?.totalDistance || 0}
                  <span className="text-sm ml-1 text-gray-500">km</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#f7b801]/10 to-[#f35b04]/10 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Total Cost</p>
                <p className="font-bold text-xl sm:text-2xl text-[#f35b04]">
                  {formatCurrency(
                    dashboardData?.monthlyMetrics?.totalCost || 0,
                    "CHF"
                  )}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#f7b801]/10 to-[#f35b04]/10 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Avg Per Trip</p>
                <p className="font-bold text-xl sm:text-2xl text-[#f35b04]">
                  {formatCurrency(
                    dashboardData?.monthlyMetrics?.avgCostPerTrip || 0,
                    "CHF"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-[#f35b04]/30">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-xl mb-2 flex items-center">
                  <div className="mr-3 p-2 bg-[#f35b04]/10 rounded-lg">
                    <FiSettings className="text-[#f35b04] text-xl" />
                  </div>
                  System Settings
                </h2>
                <div className="text-gray-600 text-sm mb-4">
                  Configuration details
                </div>
              </div>
              <Link
                to="/admin/settings"
                className="text-[#3d348b] hover:text-[#7678ed] text-sm font-medium transition-colors duration-300 flex items-center gap-1"
              >
                Manage <FiArrowRight />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div className="bg-gradient-to-r from-[#f35b04]/10 to-[#f7b801]/10 p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Current Rate</p>
                <div className="flex items-center">
                  <p className="font-bold text-2xl text-[#f35b04]">
                    {formatCurrency(
                      dashboardData?.settings?.ratePerKm || 0.3,
                      "CHF"
                    )}
                  </p>
                  <p className="text-sm text-gray-500 ml-1">/km</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-[#3d348b]/10 to-[#7678ed]/10 p-3 sm:p-4 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Active Users</p>
                <div className="flex items-center">
                  <FiUsers className="text-[#7678ed] mr-2" />
                  <p className="font-bold text-xl sm:text-2xl text-[#3d348b]">
                    {dashboardData?.settings?.activeUsers || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Monthly Expenses Chart */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
            <h2 className="font-semibold text-lg sm:text-xl mb-4 sm:mb-6 flex items-center">
              <div className="mr-3 p-2 bg-[#3d348b]/10 rounded-lg">
                <FiBarChart2 className="text-[#3d348b] text-xl" />
              </div>
              Monthly Expenses
            </h2>
            <div className="h-64 sm:h-80">
              {dashboardData?.monthlyExpensesChart ? (
                <div>
                  <ExpenseChart
                    chartType="bar"
                    data={prepareMonthlyExpensesChart()}
                    options={chartOptions}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <FiBarChart2 className="mx-auto mb-2 text-3xl text-gray-300" />
                    <p>No data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown Chart */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
            <h2 className="font-semibold text-lg sm:text-xl mb-4 sm:mb-6 flex items-center">
              <div className="mr-3 p-2 bg-[#7678ed]/10 rounded-lg">
                <FiPieChart className="text-[#7678ed] text-xl" />
              </div>
              Category Breakdown
            </h2>
            <div className="h-64 sm:h-80">
              {dashboardData?.categoryBreakdown ? (
                <div>
                  <ExpenseChart
                    chartType="doughnut"
                    data={prepareCategoryChart()}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <FiPieChart className="mx-auto mb-2 text-3xl text-gray-300" />
                    <p>No data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
            <h2 className="font-semibold text-lg sm:text-xl flex items-center">
              <div className="mr-3 p-2 bg-[#f7b801]/10 rounded-lg">
                <FiTrendingUp className="text-[#f7b801] text-xl" />
              </div>
              Recent Expenses
            </h2>
            <Link
              to="/admin/expenses"
              className="flex items-center gap-1 py-2 px-3 sm:px-4 bg-[#f7b801] hover:bg-[#f7b801]/90 text-white rounded-full transition-all duration-300 text-xs sm:text-sm font-medium"
            >
              View All <FiArrowRight />
            </Link>
          </div>

          {dashboardData?.recentExpenses &&
          dashboardData.recentExpenses.length > 0 ? (
            <div className="overflow-x-auto rounded-xl -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200" style={{minWidth: '600px'}}>
                <thead className="bg-gradient-to-r from-[#3d348b]/10 to-[#7678ed]/10">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FiNavigation className="mr-1 text-[#7678ed]" />
                        From
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FiTarget className="mr-1 text-[#f35b04]" />
                        To
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <FiTruck className="mr-1 text-[#f7b801]" />
                        Distance
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recentExpenses.map((expense, index) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-[#3d348b] flex items-center justify-center text-white text-xs sm:text-sm">
                            {expense.user?.name
                              ? expense.user.name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <div className="ml-2 sm:ml-3 font-medium text-gray-900 text-sm sm:text-base">
                            {expense.user?.name || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                        {formatDate(expense.journeyDate, "short")}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                        <span className="px-2 py-1 bg-[#7678ed]/10 rounded-full text-[#3d348b] text-xs sm:text-sm">
                          {expense.startingPoint || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                        <span className="px-2 py-1 bg-[#f35b04]/10 rounded-full text-[#f35b04] text-xs sm:text-sm">
                          {expense.destinationPoint || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                        <span className="px-2 py-1 bg-[#f7b801]/10 rounded-full text-xs sm:text-sm">
                          {expense.distance} km
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#f35b04]/10 rounded-full text-[#f35b04] font-bold text-xs sm:text-sm">
                          {formatCurrency(expense.totalCost, "CHF")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-xl">
              <FiTrendingUp className="mx-auto mb-3 text-4xl text-gray-300" />
              <p className="font-medium">No recent expenses found</p>
              <p className="text-sm mt-2">
                New expenses will appear here once created
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
