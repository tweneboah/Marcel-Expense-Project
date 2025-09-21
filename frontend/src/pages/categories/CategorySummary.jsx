import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiPieChart,
  FiBarChart2,
  FiDollarSign,
  FiCalendar,
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiTag,
  FiPackage,
  FiCheck,
  FiSettings,
} from "react-icons/fi";
import {
  getExpenseCategories,
  getExpensesByCategory,
  getAllExpenses,
} from "../../api/expenseApi";
import Button from "../../components/ui/Button";

const SummaryCard = ({ title, value, icon, change, period, loading }) => {
  const Icon = icon;
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <h3 className="text-2xl font-bold text-[#3d348b]">{value}</h3>
          )}
        </div>
        <div className="bg-[#7678ed]/10 p-3 rounded-full">
          <Icon className="h-6 w-6 text-[#7678ed]" />
        </div>
      </div>

      {period && <div className="text-xs text-gray-500 mt-1">{period}</div>}

      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {loading ? (
            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              {isPositive && (
                <span className="flex items-center text-[#f35b04] text-sm font-medium">
                  <FiTrendingUp className="mr-1" />+
                  {Math.abs(change).toFixed(1)}%
                </span>
              )}
              {isNegative && (
                <span className="flex items-center text-[#f7b801] text-sm font-medium">
                  <FiTrendingDown className="mr-1" />-
                  {Math.abs(change).toFixed(1)}%
                </span>
              )}
              {!isPositive && !isNegative && (
                <span className="flex items-center text-gray-500 text-sm">
                  No change
                </span>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

const CategorySummary = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [period, setPeriod] = useState("current-month");
  const [error, setError] = useState(null);

  const periods = [
    { value: "current-month", label: "Current Month" },
    { value: "current-quarter", label: "Current Quarter" },
    { value: "current-year", label: "Current Year" },
    { value: "last-month", label: "Last Month" },
    { value: "last-quarter", label: "Last Quarter" },
    { value: "last-year", label: "Last Year" },
  ];

  // Force a refresh when the component mounts
  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use a minimal approach to avoid the ObjectId error
        // First just get basic category data without the problematic parameters
        const result = await getExpenseCategories({
          isActive: true,
          // Don't include complex parameters that trigger backend errors
          // includeUsage: true,
          // includeExpenseCounts: true,
          // period: period,
        });

        // Get the list of categories
        const categoriesData = result.categories || [];

        // For the top categories, fetch expenses separately for each one
        const topCategories = await enrichCategoriesWithExpenseData(
          categoriesData
        );

        // Calculate total expense amount (sum of all categories that have expenses)
        const totalAmount = topCategories.reduce(
          (sum, cat) => sum + cat.amount,
          0
        );

        // Create a summary from the actual categories data
        const summary = {
          totalCategories: categoriesData.length,
          activeCategories: categoriesData.filter(
            (cat) => cat.isActive !== false
          ).length,
          categoriesWithBudget: categoriesData.filter(
            (cat) => cat.budgetLimits && cat.budgetLimits.length > 0
          ).length,
          totalAmount: totalAmount,
          periodLabel: getPeriodLabel(period),
          categoryGrowth: null,
          activeGrowth: null,
          budgetGrowth: null,
          amountGrowth: null,
          topCategories: topCategories,
        };

        setSummary(summary);
      } catch (error) {
        // Error handled by error context
        setError(
          "Unable to load category data. Please try again later or contact support."
        );
        // Don't use mock data - set empty summary
        setSummary({
          totalCategories: 0,
          activeCategories: 0,
          categoriesWithBudget: 0,
          totalAmount: 0,
          periodLabel: getPeriodLabel(period),
          topCategories: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [period]);

  useEffect(() => {
    // Summary data updated
  }, [summary]);

  // Fetch expense data for each category and enrich the category objects
  const enrichCategoriesWithExpenseData = async (categories) => {
    try {
      // Process up to 5 categories to avoid too many API calls
      const topCats = categories.slice(0, 5);

      // Enriching categories with expense data

      // Create an array of promises for parallel execution
      const categoryPromises = topCats.map(async (category) => {
        try {
          // Fetch expenses for this category
          const expenses = await getExpensesByCategory(category._id);

          // Category expenses processed

          // Calculate total amount and count
          let totalAmount = 0;

          // Only process expenses where the category matches the current category
          const filteredExpenses = expenses.filter((exp) => {
            const expCategory = exp.category;
            // Check different possible formats of category in expenses
            if (typeof expCategory === "string") {
              return expCategory === category._id;
            } else if (expCategory && expCategory._id) {
              return expCategory._id === category._id;
            } else if (exp.categoryId) {
              return exp.categoryId === category._id;
            }
            return false;
          });

          // Filtered expenses for category

          // Try different properties that might contain the amount
          for (const expense of filteredExpenses) {
            // Check all possible fields that might contain the amount
            let expenseAmount = 0;

            // Try all possible structures for the expense amount
            if (typeof expense.totalCost === "number") {
              expenseAmount = expense.totalCost;
            } else if (typeof expense.amount === "number") {
              expenseAmount = expense.amount;
            } else if (typeof expense.total === "number") {
              expenseAmount = expense.total;
            } else if (
              expense.cost &&
              typeof expense.cost.amount === "number"
            ) {
              expenseAmount = expense.cost.amount;
            } else if (
              typeof expense.distance === "number" &&
              typeof expense.costPerKm === "number"
            ) {
              // Calculate from distance and cost per km
              expenseAmount = expense.distance * expense.costPerKm;
            }

            // Calculate expense amount
            if (expenseAmount <= 0) {
              // Attempt to estimate the amount if we have distance data
              if (
                typeof expense.distance === "number" ||
                typeof expense.distanceInKm === "number"
              ) {
                const distance = expense.distance || expense.distanceInKm || 0;
                const costRate = 0.7; // Default cost rate in CHF
                expenseAmount = distance * costRate;
              }
            }

            totalAmount += expenseAmount;
          }

          return {
            ...category,
            amount: totalAmount,
            expenseCount: filteredExpenses.length,
          };
        } catch (err) {
          // Error handled by error context
          return {
            ...category,
            amount: 0,
            expenseCount: 0,
          };
        }
      });

      // Wait for all the category data to be fetched
      const enrichedCategories = await Promise.all(categoryPromises);

      // Filter out categories with no expenses
      const categoriesWithExpenses = enrichedCategories.filter(
        (cat) => cat.expenseCount > 0
      );

      // If we have no categories with expenses, just return the original top category
      if (
        categoriesWithExpenses.length === 0 &&
        enrichedCategories.length > 0
      ) {
        return [enrichedCategories[0]];
      }

      // Sort by amount (highest first)
      return categoriesWithExpenses.sort((a, b) => b.amount - a.amount);
    } catch (error) {
      // Error handled by error context
      // Return empty array instead of mock data
      return [];
    }
  };

  // Format period label for display
  const getPeriodLabel = (periodValue) => {
    const matchingPeriod = periods.find((p) => p.value === periodValue);
    return matchingPeriod ? matchingPeriod.label : "All Time";
  };

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const refreshData = () => {
    // Refreshing category summary data
    setPeriod(period); // This will trigger the useEffect
  };

  // Animation variants for staggered card animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Empty state component
  const EmptyState = ({ message }) => (
    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
      <div className="mx-auto bg-[#7678ed]/10 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-4">
        <FiTag className="h-12 w-12 text-[#7678ed]" />
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-bold text-[#3d348b] flex items-center">
          <FiBarChart2 className="mr-2 h-5 w-5 text-[#7678ed]" />
          Category Summary
        </h2>

        <div className="flex items-center space-x-3 mt-3 md:mt-0">
          <div className="relative">
            <select
              value={period}
              onChange={handlePeriodChange}
              className="pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-[#7678ed] focus:border-[#7678ed] bg-white shadow-sm appearance-none"
            >
              {periods.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7678ed]" />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            className="p-2 rounded-lg text-[#7678ed] hover:bg-[#7678ed]/10 transition-colors duration-200"
            disabled={loading}
          >
            <FiRefreshCw
              className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
            />
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="bg-[#f35b04]/10 text-[#f35b04] p-4 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Main metrics */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <SummaryCard
          title="Total Categories"
          value={summary?.totalCategories || 0}
          icon={FiTag}
          change={summary?.categoryGrowth}
          period={summary?.periodLabel}
          loading={loading}
        />

        <SummaryCard
          title="Active Categories"
          value={summary?.activeCategories || 0}
          icon={FiCheck}
          change={summary?.activeGrowth}
          period={summary?.periodLabel}
          loading={loading}
        />

        <SummaryCard
          title="With Budget"
          value={summary?.categoriesWithBudget || 0}
          icon={FiSettings}
          change={summary?.budgetGrowth}
          period={summary?.periodLabel}
          loading={loading}
        />

        <SummaryCard
          title="Total Expenses"
          value={
            summary?.totalAmount
              ? formatCurrency(summary.totalAmount)
              : "CHF 0.00"
          }
          icon={FiDollarSign}
          change={summary?.amountGrowth}
          period={summary?.periodLabel}
          loading={loading}
        />
      </motion.div>

      {/* Categories section */}
      <div className="mb-2">
        <h3 className="text-md font-bold text-[#3d348b] flex items-start">
          <FiPieChart className="mr-2 h-5 w-5 text-[#7678ed]" />
          {summary?.topCategories?.length > 1
            ? "Top Categories by Expense Amount"
            : "Expense Category"}
        </h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1].map((i) => (
            <div
              key={i}
              className="bg-gray-100 h-14 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      ) : !summary?.topCategories?.length ? (
        <EmptyState message="No expense categories found. Please create a category first." />
      ) : (
        <div className="space-y-2">
          {summary.topCategories.map((category, index) => (
            <motion.div
              key={category._id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg border border-gray-100 shadow-sm p-3"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-[#7678ed]/10 p-2 rounded-full mr-3">
                    <FiPackage className="h-4 w-4 text-[#7678ed]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#3d348b]">
                      {category.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {category.expenseCount || 0} expense
                      {category.expenseCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#f35b04]">
                    {formatCurrency(category.amount || 0)}
                  </p>
                  {summary.topCategories.length > 1 && (
                    <div className="h-1.5 w-32 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            100,
                            (category.amount / (summary.totalAmount || 1)) * 100
                          )}%`,
                        }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-[#f7b801] rounded-full"
                      ></motion.div>
                    </div>
                  )}
                  {summary.topCategories.length === 1 && (
                    <div className="h-1.5 w-32 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1 }}
                        className="h-full bg-[#f7b801] rounded-full"
                      ></motion.div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CategorySummary;
