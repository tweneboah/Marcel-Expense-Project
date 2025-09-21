import React, { useState, useEffect } from "react";
import {
  FaChartPie,
  FaCalendarAlt,
  FaFileExport,
  FaChevronDown,
  FaChevronUp,
  FaCircle,
  FaWallet,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaPercentage,
  FaSpinner,
  FaInfoCircle,
} from "react-icons/fa";
import API from "../../api/apiConfig";
import { motion, AnimatePresence } from "framer-motion";

const BudgetSummaryReport = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedMonths, setExpandedMonths] = useState({});

  const toggleMonth = (month) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [month]: !prev[month],
    }));
  };

  useEffect(() => {
    const fetchBudgetSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await API.get(`/budgets/summary?year=${selectedYear}`);
        // Budget summary response received

        if (response.data && response.data.success) {
          setSummaryData(response.data.data);
          // Expand current month by default
          const currentMonth = new Date().getMonth() + 1;
          setExpandedMonths((prev) => ({
            ...prev,
            [currentMonth]: true,
          }));
        } else {
          setError(null);
          setSummaryData(null);
        }
      } catch (err) {
        // Error handled by error context
        // Don't set error for network errors or "no budgets found" errors, just show no data
        if (
          err.code === "ERR_NETWORK" ||
          err.code === "ERR_BAD_REQUEST" ||
          err.response?.status === 404 ||
          err.message?.includes("No budgets found")
        ) {
          setError(null);
        } else {
          setError(
            err.response?.data?.message || "Failed to fetch budget summary"
          );
        }
        setSummaryData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgetSummary();
  }, [selectedYear]);

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const getYearsOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  const handleExport = () => {
    if (!summaryData) return;

    // Generate CSV content
    let csvContent =
      "Month,Category,Budgeted (CHF),Actual (CHF),Remaining (CHF),Usage %\n";

    summaryData.months.forEach((month) => {
      // Add month summary row
      csvContent += `${month.monthName},TOTAL,${month.totalBudgeted.toFixed(
        2
      )},${month.totalActual.toFixed(2)},${month.totalRemaining.toFixed(
        2
      )},${month.usagePercentage.toFixed(1)}\n`;

      // Add category rows
      month.categories.forEach((category) => {
        csvContent += `${month.monthName},${
          category.categoryName
        },${category.budgetedAmount.toFixed(2)},${category.actualAmount.toFixed(
          2
        )},${category.remaining.toFixed(2)},${category.usagePercentage.toFixed(
          1
        )}\n`;
      });
    });

    // Add yearly total
    csvContent += `YEARLY TOTAL,ALL CATEGORIES,${summaryData.yearlyTotal.totalBudgeted.toFixed(
      2
    )},${summaryData.yearlyTotal.totalActual.toFixed(
      2
    )},${summaryData.yearlyTotal.totalRemaining.toFixed(
      2
    )},${summaryData.yearlyTotal.usagePercentage.toFixed(1)}\n`;

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `budget-summary-${selectedYear}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to get status color based on usage percentage
  const getStatusColor = (
    percentage,
    warningThreshold = 75,
    criticalThreshold = 90
  ) => {
    if (percentage >= criticalThreshold) return "bg-[#f35b04]";
    if (percentage >= warningThreshold) return "bg-[#f7b801]";
    return "bg-[#22c55e]";
  };

  // Helper function to get text color based on usage percentage
  const getTextColor = (
    percentage,
    warningThreshold = 75,
    criticalThreshold = 90
  ) => {
    if (percentage >= criticalThreshold)
      return "text-white bg-[#f35b04] px-2 py-0.5 rounded-full shadow-md font-bold";
    if (percentage >= warningThreshold)
      return "text-[#3d348b] bg-[#f7b801] px-2 py-0.5 rounded-full shadow-md font-bold";
    return "text-white bg-[#22c55e] px-2 py-0.5 rounded-full shadow-md font-bold";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-gradient-to-br from-[#3d348b]/5 to-[#7678ed]/5 rounded-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#7678ed] mb-4"></div>
        <p className="text-[#3d348b] font-medium">
          Loading budget summary data...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pb-8"
    >
      {/* Header Section with Gradient Background */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] rounded-lg shadow-lg p-6 mb-8 text-white"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold flex items-center">
              <FaChartPie className="mr-3 text-[#f7b801]" />
              Budget Summary Report
            </h1>
            <p className="mt-1 text-white/80">
              Comprehensive overview of your budget allocation and actual
              expenses
            </p>
          </motion.div>
          <div className="flex flex-wrap gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white/10 rounded-md p-1 backdrop-blur-sm border border-white/20"
            >
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="block w-full pl-3 pr-10 py-2 text-white bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-[#f7b801] rounded-md appearance-none"
                style={{ minWidth: "120px" }}
              >
                {getYearsOptions().map((year) => (
                  <option key={year} value={year} className="text-gray-800">
                    {year}
                  </option>
                ))}
              </select>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-[#f7b801] to-[#f35b04] text-white rounded-md hover:shadow-lg transition-all duration-300 shadow-md"
            >
              <FaFileExport className="mr-2" />
              Export CSV
            </motion.button>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border-l-4 border-[#f35b04] text-red-700 p-4 rounded-md mb-6 shadow-md"
        >
          <div className="flex items-center">
            <FaInfoCircle className="text-[#f35b04] mr-3 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </motion.div>
      )}

      {summaryData && (
        <>
          {/* Yearly Summary Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-100"
          >
            <h2 className="text-xl font-bold mb-5 text-[#3d348b] flex items-center border-b border-gray-100 pb-3">
              <FaWallet className="mr-3 text-[#7678ed]" />
              {selectedYear} - Yearly Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#3d348b]/5 to-[#7678ed]/10 p-5 rounded-xl border border-[#3d348b]/10 shadow-sm"
              >
                <div className="flex items-center text-[#3d348b] mb-2">
                  <div className="p-2 bg-[#3d348b]/10 rounded-full mr-3">
                    <FaMoneyBillWave className="text-[#3d348b]" />
                  </div>
                  <span className="font-medium">Total Budgeted</span>
                </div>
                <div className="text-2xl font-bold text-[#3d348b] mt-2">
                  CHF {summaryData.yearlyTotal.totalBudgeted.toFixed(2)}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#f35b04]/5 to-[#f35b04]/10 p-5 rounded-xl border border-[#f35b04]/10 shadow-sm"
              >
                <div className="flex items-center text-[#f35b04] mb-2">
                  <div className="p-2 bg-[#f35b04]/10 rounded-full mr-3">
                    <FaExchangeAlt className="text-[#f35b04]" />
                  </div>
                  <span className="font-medium">Total Actual</span>
                </div>
                <div className="text-2xl font-bold text-[#f35b04] mt-2">
                  CHF {summaryData.yearlyTotal.totalActual.toFixed(2)}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-[#7678ed]/5 to-[#7678ed]/10 p-5 rounded-xl border border-[#7678ed]/10 shadow-sm"
              >
                <div className="flex items-center text-[#7678ed] mb-2">
                  <div className="p-2 bg-[#7678ed]/10 rounded-full mr-3">
                    <FaWallet className="text-[#7678ed]" />
                  </div>
                  <span className="font-medium">Total Remaining</span>
                </div>
                <div className="text-2xl font-bold text-[#7678ed] mt-2">
                  CHF {summaryData.yearlyTotal.totalRemaining.toFixed(2)}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-[#f7b801]/5 to-[#f7b801]/10 p-5 rounded-xl border border-[#f7b801]/10 shadow-sm"
              >
                <div className="flex items-center text-[#f7b801] mb-2">
                  <div className="p-2 bg-[#f7b801]/10 rounded-full mr-3">
                    <FaPercentage className="text-[#f7b801]" />
                  </div>
                  <span className="font-medium">Usage Percentage</span>
                </div>
                <div className="flex items-center mt-2">
                  <div className="w-full">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
                        <div
                          style={{
                            width: `${Math.min(
                              summaryData.yearlyTotal.usagePercentage,
                              100
                            )}%`,
                          }}
                          className={`shadow-md flex flex-col text-center whitespace-nowrap justify-center rounded-full transition-all duration-500 ${getStatusColor(
                            summaryData.yearlyTotal.usagePercentage
                          )}`}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-3">
                    <span
                      className={`text-lg ${getTextColor(
                        summaryData.yearlyTotal.usagePercentage
                      )}`}
                    >
                      {summaryData.yearlyTotal.usagePercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Monthly Summaries */}
          <h2 className="text-xl font-bold mb-4 text-[#3d348b] pl-2 border-l-4 border-[#7678ed]">
            Monthly Breakdown
          </h2>
          <div className="space-y-4">
            {summaryData.months.map((month, index) => (
              <motion.div
                key={month.month}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * (index % 5) }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`p-4 flex items-center justify-between cursor-pointer border-l-4 ${getStatusColor(
                    month.usagePercentage
                  )}`}
                  onClick={() => toggleMonth(month.month)}
                >
                  <div className="flex items-center">
                    <h3 className="text-lg font-bold text-gray-800 ml-2">
                      {month.monthName} {selectedYear}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs text-gray-500">Budgeted</span>
                      <span className="font-bold text-[#3d348b]">
                        CHF {month.totalBudgeted.toFixed(2)}
                      </span>
                    </div>
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-xs text-gray-500">Actual</span>
                      <span className="font-bold text-[#f35b04]">
                        CHF {month.totalActual.toFixed(2)}
                      </span>
                    </div>
                    <div className="hidden lg:flex flex-col items-end">
                      <span className="text-xs text-gray-500">Remaining</span>
                      <span className="font-bold text-[#7678ed]">
                        CHF {month.totalRemaining.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">Usage</span>
                      <div className="flex items-center">
                        <div className="w-12 mr-2 hidden sm:block">
                          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                            <div
                              style={{
                                width: `${Math.min(
                                  month.usagePercentage,
                                  100
                                )}%`,
                              }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap justify-center rounded-full ${getStatusColor(
                                month.usagePercentage
                              )}`}
                            ></div>
                          </div>
                        </div>
                        <span className={getTextColor(month.usagePercentage)}>
                          {month.usagePercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-full">
                      {expandedMonths[month.month] ? (
                        <FaChevronUp className="text-[#3d348b]" />
                      ) : (
                        <FaChevronDown className="text-[#3d348b]" />
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedMonths[month.month] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 py-4 bg-gradient-to-br from-white to-gray-50">
                        <h4 className="text-sm font-bold text-[#3d348b] mb-4 flex items-center">
                          <FaCircle className="text-xs mr-2 text-[#7678ed]" />
                          Category Breakdown
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white rounded-lg shadow-sm">
                            <thead>
                              <tr className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] text-xs text-white uppercase tracking-wider">
                                <th className="px-4 py-3 text-left rounded-tl-lg">
                                  Category
                                </th>
                                <th className="px-4 py-3 text-right">
                                  Budgeted
                                </th>
                                <th className="px-4 py-3 text-right">Actual</th>
                                <th className="px-4 py-3 text-right">
                                  Remaining
                                </th>
                                <th className="px-4 py-3 text-right rounded-tr-lg">
                                  Usage %
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {month.categories.map((category, catIndex) => (
                                <motion.tr
                                  key={category.categoryId}
                                  className="hover:bg-gray-50 transition-colors"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.05 * catIndex }}
                                >
                                  <td className="px-4 py-3">
                                    <div className="flex items-center">
                                      <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{
                                          backgroundColor:
                                            category.categoryColor || "#999",
                                        }}
                                      ></div>
                                      <span className="font-medium">
                                        {category.categoryName}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right font-bold text-[#3d348b]">
                                    CHF {category.budgetedAmount.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-right font-bold text-[#f35b04]">
                                    CHF {category.actualAmount.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-right font-bold text-[#7678ed]">
                                    CHF {category.remaining.toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end">
                                      <div className="w-24">
                                        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                                          <div
                                            style={{
                                              width: `${Math.min(
                                                category.usagePercentage,
                                                100
                                              )}%`,
                                            }}
                                            className={`shadow-none flex flex-col text-center whitespace-nowrap justify-center rounded-full transition-all duration-300 ${getStatusColor(
                                              category.usagePercentage
                                            )}`}
                                          ></div>
                                        </div>
                                      </div>
                                      <span
                                        className={`ml-2 ${getTextColor(
                                          category.usagePercentage
                                        )}`}
                                      >
                                        {category.usagePercentage.toFixed(1)}%
                                      </span>
                                    </div>
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {!summaryData && !isLoading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100"
        >
          <div className="bg-[#3d348b]/5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FaChartPie className="text-5xl text-[#7678ed]" />
          </div>
          <h3 className="text-xl font-bold text-[#3d348b] mb-3">
            No Budget Summary Data
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            There is no budget summary data available for {selectedYear}.
          </p>
          <p className="text-sm text-gray-400 mt-3 max-w-md mx-auto">
            This might be because no budgets have been created for this year, or
            there are no expense records to analyze.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-[#3d348b] to-[#7678ed] text-white rounded-md hover:shadow-lg transition-all duration-300"
            onClick={() => setSelectedYear(new Date().getFullYear())}
          >
            View Current Year
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BudgetSummaryReport;
