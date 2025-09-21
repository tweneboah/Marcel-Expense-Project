import { useState, useEffect } from "react";
import { getCategoryBreakdown } from "../../../api/analyticsApi";
import ExpenseChart from "../../../components/charts/ExpenseChart";
import AnalyticsNav from "../../../components/analytics/AnalyticsNav";
import { motion } from "framer-motion";
import { formatCurrency } from "../../../utils/formatters";
import {
  FiCalendar,
  FiPieChart,
  FiTrendingUp,
  FiCreditCard,
  FiBarChart2,
  FiList,
  FiFileText,
  FiTag,
  FiPercent,
  FiInfo,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";

const CategoryBreakdown = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: "2025-01-01",
    endDate: "2025-12-31",
  });

  // Fetch category breakdown data
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const response = await getCategoryBreakdown({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
        setCategoryData(response.data);
      } catch (err) {
        setError("Failed to load category breakdown data");
        // Error handled by error context
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [dateRange]);

  // Handle date range change
  const handleDateRangeChange = (type, value) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Prepare chart data for category breakdown
  const prepareCategoryChart = () => {
    if (!categoryData) return null;

    const labels = categoryData.categories.map((cat) => cat.categoryName);
    const costData = categoryData.categories.map((cat) => cat.totalCost);
    const colors = categoryData.categories.map(
      (cat) =>
        cat.categoryColor ||
        [
          "#3d348b",
          "#7678ed",
          "#f7b801",
          "#f35b04",
          "#a4036f",
          "#048ba8",
          "#16db93",
          "#efea5a",
        ][Math.floor(Math.random() * 8)]
    );

    return {
      labels,
      datasets: [
        {
          label: "Total Cost by Category (CHF)",
          data: costData,
          backgroundColor: colors,
          borderColor: colors.map((color) => color),
          borderWidth: 1,
          hoverOffset: 15,
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
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
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
        Category Breakdown
      </motion.h1>

      <motion.div variants={itemVariants}>
        <AnalyticsNav activeTab="category-breakdown" />
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <motion.h2
            className="text-2xl font-semibold mb-4 md:mb-0 text-[#3d348b] flex items-center"
            variants={itemVariants}
          >
            <FiPieChart className="mr-2 text-[#f7b801]" />
            Expense Breakdown by Category
          </motion.h2>

          <motion.div
            className="flex flex-col md:flex-row gap-4 md:space-x-4 bg-gray-50 p-3 rounded-lg"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-2">
              <FiArrowRight className="text-[#7678ed]" />
              <label className="text-sm text-[#3d348b] font-medium">
                From:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiCalendar className="text-[#7678ed]" />
                </div>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    handleDateRangeChange("startDate", e.target.value)
                  }
                  className="pl-10 py-2 rounded-lg border-2 border-[#7678ed] bg-white text-[#3d348b] font-medium focus:outline-none focus:ring-2 focus:ring-[#7678ed]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <FiArrowLeft className="text-[#7678ed]" />
              <label className="text-sm text-[#3d348b] font-medium">To:</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiCalendar className="text-[#7678ed]" />
                </div>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    handleDateRangeChange("endDate", e.target.value)
                  }
                  className="pl-10 py-2 rounded-lg border-2 border-[#7678ed] bg-white text-[#3d348b] font-medium focus:outline-none focus:ring-2 focus:ring-[#7678ed]"
                />
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
        ) : categoryData ? (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              variants={containerVariants}
            >
              <motion.div
                className="bg-gradient-to-br from-[#3d348b]/10 to-[#3d348b]/5 p-6 rounded-xl border-l-4 border-[#3d348b] shadow-sm hover:shadow-md transition-shadow duration-200"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-sm font-medium text-[#3d348b]/80 mb-1 flex items-center">
                  <FiTag className="mr-2 text-[#3d348b]" />
                  Total Categories
                </h3>
                <p className="text-3xl font-bold text-[#3d348b]">
                  {categoryData.totals.totalCategories}
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-[#7678ed]/10 to-[#7678ed]/5 p-6 rounded-xl border-l-4 border-[#7678ed] shadow-sm hover:shadow-md transition-shadow duration-200"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-sm font-medium text-[#7678ed]/80 mb-1 flex items-center">
                  <FiFileText className="mr-2 text-[#7678ed]" />
                  Total Expenses
                </h3>
                <p className="text-3xl font-bold text-[#7678ed]">
                  {categoryData.totals.totalExpenses}
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
                  {formatCurrency(categoryData.totals.totalCost)}
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
              variants={containerVariants}
            >
              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold mb-4 text-[#3d348b] flex items-center">
                  <FiPieChart className="mr-2 text-[#f35b04]" />
                  Cost Distribution
                </h3>
                <div className="h-80">
                  <ExpenseChart
                    chartType="doughnut"
                    data={prepareCategoryChart()}
                    height={300}
                    options={{
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            usePointStyle: true,
                            boxWidth: 10,
                            font: {
                              size: 11,
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold mb-4 text-[#3d348b] flex items-center">
                  <FiList className="mr-2 text-[#f35b04]" />
                  Category Details
                </h3>
                <div className="overflow-auto max-h-80 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-[#3d348b] text-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Expenses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Total Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          % of Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {categoryData.categories.map((category, index) => (
                        <motion.tr
                          key={category.categoryId}
                          className="hover:bg-[#7678ed]/5 transition-colors duration-150"
                          custom={index}
                          variants={tableRowVariants}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-4 h-4 mr-2 rounded-full shadow-sm"
                                style={{
                                  backgroundColor: category.categoryColor,
                                }}
                              ></div>
                              <div className="text-sm font-medium text-[#3d348b]">
                                {category.categoryName}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {category.totalExpenses}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {formatCurrency(category.totalCost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                <div
                                  className="h-2.5 rounded-full"
                                  style={{
                                    width: `${category.percentageOfTotalCost}%`,
                                    backgroundColor:
                                      category.categoryColor || "#f35b04",
                                  }}
                                ></div>
                              </div>
                              <span className="text-gray-700">
                                {category.percentageOfTotalCost.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>

            {/* Additional Stats Section */}
            <motion.div className="mt-8 border-t pt-6" variants={itemVariants}>
              <motion.h3
                className="text-xl font-semibold mb-4 text-[#3d348b] flex items-center"
                variants={itemVariants}
              >
                <FiInfo className="mr-2 text-[#f35b04]" />
                Additional Statistics
              </motion.h3>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={containerVariants}
              >
                {categoryData.categories.map((category, index) => (
                  <motion.div
                    key={`stats-${category.categoryId}`}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                    variants={itemVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    custom={index}
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center mb-3">
                      <div
                        className="w-4 h-4 mr-2 rounded-full"
                        style={{
                          backgroundColor: category.categoryColor,
                        }}
                      ></div>
                      <h4 className="text-sm font-medium text-[#3d348b]">
                        {category.categoryName}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#7678ed]/5 p-3 rounded-lg">
                        <span className="text-xs text-[#7678ed] font-medium flex items-center">
                          <FiTrendingUp className="mr-1" />
                          Avg Distance
                        </span>
                        <p className="font-bold text-[#3d348b] mt-1">
                          {category.avgDistance.toFixed(1)}{" "}
                          <span className="text-xs">km</span>
                        </p>
                      </div>
                      <div className="bg-[#f7b801]/5 p-3 rounded-lg">
                        <span className="text-xs text-[#f7b801] font-medium flex items-center">
                          <FiCreditCard className="mr-1" />
                          Avg Cost
                        </span>
                        <p className="font-bold text-[#3d348b] mt-1">
                          {formatCurrency(category.avgCost)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
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

export default CategoryBreakdown;
