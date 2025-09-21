import { useEffect, useState } from "react";
import API from "../../api/apiConfig";
import { motion } from "framer-motion";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaToggleOn,
  FaChartLine,
  FaFilePdf,
  FaFileExcel,
  FaDownload,
  FaFilter,
  FaChartArea,
  FaChartPie,
  FaChartBar,
} from "react-icons/fa";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const YTDReports = () => {
  const YTDReportsContent = () => {
    const [reports, setReports] = useState({
      currentYear: {
        totals: {
          totalExpenses: 0,
          totalDistance: 0,
          totalCost: 0,
          avgCost: 0,
        },
        monthlyData: {},
        categories: {},
        quarterly: {},
      },
      previousYear: null,
      changes: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [compareWithPrevious, setCompareWithPrevious] = useState(false);

    // Animation variants
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2,
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

    useEffect(() => {
      const fetchYTDReports = async () => {
        try {
          setLoading(true);
          // Use the API instance which includes authorization headers
          const response = await API.get(
            `/advanced-reports/ytd?year=${year}&compareWithPreviousYear=${compareWithPrevious}`
          );
          // API response received

          // Process the data from the backend to match our frontend structure
          const data = response.data.data;

          // Transform monthlyData array to object with month name as key
          const processMonthlyData = (monthlyArray) => {
            const monthObj = {};
            if (Array.isArray(monthlyArray)) {
              monthlyArray.forEach((month) => {
                monthObj[month.monthName] = {
                  totalExpenses: month.totalExpenses,
                  totalDistance: month.totalDistance,
                  totalCost: month.totalCost,
                };
              });
            }
            return monthObj;
          };

          // Transform categoryBreakdown array to object with category name as key
          const processCategoryData = (categoryArray) => {
            const categoryObj = {};
            if (Array.isArray(categoryArray)) {
              categoryArray.forEach((category) => {
                categoryObj[category.categoryName] = category.totalCost;
              });
            }
            return categoryObj;
          };

          // Process quarterly data from monthly data
          const processQuarterlyData = (monthlyArray) => {
            if (!Array.isArray(monthlyArray)) return null;

            const quarterly = {
              Q1: 0,
              Q2: 0,
              Q3: 0,
              Q4: 0,
            };

            monthlyArray.forEach((month) => {
              const monthNum = month.month;
              if (monthNum >= 1 && monthNum <= 3)
                quarterly.Q1 += month.totalCost;
              else if (monthNum >= 4 && monthNum <= 6)
                quarterly.Q2 += month.totalCost;
              else if (monthNum >= 7 && monthNum <= 9)
                quarterly.Q3 += month.totalCost;
              else if (monthNum >= 10 && monthNum <= 12)
                quarterly.Q4 += month.totalCost;
            });

            return quarterly;
          };

          // Structure the data for our frontend
          const processedData = {
            currentYear: {
              ...data.currentYear,
              monthlyData: processMonthlyData(data.currentYear.monthlyData),
              categories: processCategoryData(
                data.currentYear.categoryBreakdown
              ),
              quarterly: processQuarterlyData(data.currentYear.monthlyData),
            },
            previousYear: data.previousYear
              ? {
                  ...data.previousYear,
                  monthlyData: processMonthlyData(
                    data.previousYear.monthlyData
                  ),
                  categories: processCategoryData(
                    data.previousYear.categoryBreakdown
                  ),
                  quarterly: processQuarterlyData(
                    data.previousYear.monthlyData
                  ),
                }
              : null,
            changes: data.changes,
          };

          setReports(processedData);
          setError(null);
        } catch (err) {
          // Error handled by error context
          setError(
            err.response?.data?.message || "Failed to fetch YTD reports"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchYTDReports();
    }, [year, compareWithPrevious]);

    const handleYearChange = (e) => {
      setYear(parseInt(e.target.value));
    };

    const handleCompareChange = (e) => {
      setCompareWithPrevious(e.target.checked);
    };

    const handleExport = (format) => {
      alert(`Exporting as ${format}...`);
    };

    if (loading && !reports) {
      return (
        <div className="flex items-center justify-center h-screen">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-t-[#7678ed] border-[#3d348b] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#3d348b] font-medium">Loading reports...</p>
          </motion.div>
        </div>
      );
    }

    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mt-10 p-6"
        >
          <div className="bg-red-100 border-l-4 border-[#f35b04] text-red-700 p-4 rounded shadow-md">
            <p className="font-medium">{error}</p>
            <p className="mt-2">
              Please try again or contact support if this problem persists.
            </p>
          </div>
        </motion.div>
      );
    }

    if (!reports) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mt-10 p-6"
        >
          <div className="bg-yellow-100 border-l-4 border-[#f7b801] text-yellow-700 p-4 rounded shadow-md">
            <p className="font-medium">No YTD report data available</p>
            <p className="mt-2">
              Please select a different year or check if you have any expense
              data.
            </p>
          </div>
        </motion.div>
      );
    }

    // Prepare data for charts
    if (reports && !reports.currentYear) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mt-10 p-6"
        >
          <div className="bg-yellow-100 border-l-4 border-[#f7b801] text-yellow-700 p-4 rounded shadow-md">
            <p className="font-medium">No YTD report data available</p>
            <p className="mt-2">
              Please select a different year or check if you have any expense
              data.
            </p>
          </div>
        </motion.div>
      );
    }

    // Prepare line chart data
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

    const lineData = {
      labels: months,
      datasets: [
        {
          label: `${year} Expenses`,
          data: months.map((month) => {
            const monthData = reports.currentYear.monthlyData[month];
            return monthData ? monthData.totalCost : 0;
          }),
          borderColor: "#3d348b",
          backgroundColor: "rgba(61, 52, 139, 0.1)",
          pointBackgroundColor: "#3d348b",
          tension: 0.3,
          fill: true,
        },
      ],
    };

    if (
      compareWithPrevious &&
      reports.previousYear &&
      reports.previousYear.monthlyData
    ) {
      lineData.datasets.push({
        label: `${year - 1} Expenses`,
        data: months.map((month) => {
          const monthData = reports.previousYear.monthlyData[month];
          return monthData ? monthData.totalCost : 0;
        }),
        borderColor: "#f7b801",
        backgroundColor: "rgba(247, 184, 1, 0.1)",
        pointBackgroundColor: "#f7b801",
        tension: 0.3,
        fill: true,
      });
    }

    return (
      <motion.div
        className="max-w-7xl mx-auto py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header and Controls */}
        <motion.div
          className="bg-white rounded-xl p-6 mb-6 shadow-md"
          variants={containerVariants}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FaCalendarAlt className="mr-2 text-[#3d348b]" />
                Year-to-Date Report
              </h1>
              <p className="text-gray-600 mt-1">
                Overview of {year} expenses and metrics
              </p>
            </div>
            <div className="flex mt-4 lg:mt-0 space-x-3">
              <button
                onClick={() => handleExport("pdf")}
                className="flex items-center px-4 py-2 bg-[#3d348b] text-white rounded-lg hover:bg-[#32296f] transition-colors"
              >
                <FaFilePdf className="mr-2" />
                Export PDF
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="flex items-center px-4 py-2 bg-[#7678ed] text-white rounded-lg hover:bg-[#5658c6] transition-colors"
              >
                <FaFileExcel className="mr-2" />
                Export Excel
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="compareWithPrevious"
                checked={compareWithPrevious}
                onChange={handleCompareChange}
                className="w-4 h-4 text-[#3d348b] rounded border-gray-300 focus:ring-[#7678ed]"
              />
              <label
                htmlFor="compareWithPrevious"
                className="ml-2 text-gray-700"
              >
                Compare with previous year
              </label>
            </div>
            <div className="flex items-center">
              <label htmlFor="yearSelect" className="text-gray-700 mr-2">
                Year:
              </label>
              <select
                id="yearSelect"
                value={year}
                onChange={handleYearChange}
                className="border-gray-300 rounded-md shadow-sm focus:border-[#7678ed] focus:ring focus:ring-[#7678ed] focus:ring-opacity-50 text-gray-700"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - i
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        <div>
          <motion.div
            className="bg-white rounded-xl p-6 mb-6 shadow-md"
            variants={containerVariants}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaChartLine className="mr-2 text-[#3d348b]" />
              Expense Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] text-white rounded-xl p-5 shadow-md overflow-hidden relative"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-3xl bg-white/10 flex items-center justify-center text-white/80">
                  <FaChartLine size={24} />
                </div>
                <div className="text-sm text-white/80 mb-1">Total Expenses</div>
                <div className="text-3xl font-bold">
                  {reports.currentYear.totals.totalExpenses}
                </div>
                {compareWithPrevious && reports.previousYear && (
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-white/80 mr-1">
                      vs {reports.previousYear.totals.totalExpenses} last year
                    </span>
                    {reports.changes &&
                    typeof reports.changes.totalExpenses !== "undefined" ? (
                      reports.changes.totalExpenses > 0 ? (
                        <span className="flex items-center text-red-300">
                          <FaArrowUp className="mr-1" size={10} />
                          {reports.changes.totalExpenses.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="flex items-center text-green-300">
                          <FaArrowDown className="mr-1" size={10} />
                          {Math.abs(reports.changes.totalExpenses).toFixed(2)}%
                        </span>
                      )
                    ) : null}
                  </div>
                )}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-[#7678ed] to-blue-400 text-white rounded-xl p-5 shadow-md overflow-hidden relative"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-3xl bg-white/10 flex items-center justify-center text-white/80">
                  <FaChartLine size={24} />
                </div>
                <div className="text-sm text-white/80 mb-1">Total Distance</div>
                <div className="text-3xl font-bold">
                  {reports.currentYear.totals.totalDistance
                    ? reports.currentYear.totals.totalDistance.toFixed(2)
                    : "0.00"}{" "}
                  km
                </div>
                {compareWithPrevious && reports.previousYear && (
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-white/80 mr-1">
                      vs{" "}
                      {reports.previousYear.totals.totalDistance
                        ? reports.previousYear.totals.totalDistance.toFixed(2)
                        : "0.00"}{" "}
                      km
                    </span>
                    {reports.changes &&
                    typeof reports.changes.totalDistance !== "undefined" ? (
                      reports.changes.totalDistance > 0 ? (
                        <span className="flex items-center text-red-300">
                          <FaArrowUp className="mr-1" size={10} />
                          {reports.changes.totalDistance.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="flex items-center text-green-300">
                          <FaArrowDown className="mr-1" size={10} />
                          {Math.abs(reports.changes.totalDistance).toFixed(2)}%
                        </span>
                      )
                    ) : null}
                  </div>
                )}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-[#f7b801] to-yellow-400 text-white rounded-xl p-5 shadow-md overflow-hidden relative"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-3xl bg-white/10 flex items-center justify-center text-white/80">
                  <FaChartLine size={24} />
                </div>
                <div className="text-sm text-white/80 mb-1">Total Cost</div>
                <div className="text-3xl font-bold">
                  {reports.currentYear.totals.totalCost
                    ? reports.currentYear.totals.totalCost.toFixed(2)
                    : "0.00"}{" "}
                  CHF
                </div>
                {compareWithPrevious && reports.previousYear && (
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-white/80 mr-1">
                      vs{" "}
                      {reports.previousYear.totals.totalCost
                        ? reports.previousYear.totals.totalCost.toFixed(2)
                        : "0.00"}{" "}
                      CHF
                    </span>
                    {reports.changes &&
                    typeof reports.changes.totalCost !== "undefined" ? (
                      reports.changes.totalCost > 0 ? (
                        <span className="flex items-center text-red-300">
                          <FaArrowUp className="mr-1" size={10} />
                          {reports.changes.totalCost.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="flex items-center text-green-300">
                          <FaArrowDown className="mr-1" size={10} />
                          {Math.abs(reports.changes.totalCost).toFixed(2)}%
                        </span>
                      )
                    ) : null}
                  </div>
                )}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-[#f35b04] to-orange-400 text-white rounded-xl p-5 shadow-md overflow-hidden relative"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-3xl bg-white/10 flex items-center justify-center text-white/80">
                  <FaChartLine size={24} />
                </div>
                <div className="text-sm text-white/80 mb-1">
                  Average Cost Per Expense
                </div>
                <div className="text-3xl font-bold">
                  {reports.currentYear.totals.avgCost !== undefined
                    ? reports.currentYear.totals.avgCost?.toFixed(2)
                    : reports.currentYear.totals.totalExpenses > 0
                    ? (
                        reports.currentYear.totals.totalCost /
                        reports.currentYear.totals.totalExpenses
                      ).toFixed(2)
                    : "0.00"}{" "}
                  CHF
                </div>
                {compareWithPrevious &&
                  reports.previousYear &&
                  reports.changes && (
                    <div className="flex items-center mt-2 text-sm">
                      {reports.changes.avgCost !== undefined &&
                      reports.changes.avgCost !== null ? (
                        reports.changes.avgCost > 0 ? (
                          <span className="flex items-center text-red-300">
                            <FaArrowUp className="mr-1" size={10} />
                            {reports.changes.avgCost.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="flex items-center text-green-300">
                            <FaArrowDown className="mr-1" size={10} />
                            {Math.abs(reports.changes.avgCost).toFixed(2)}%
                          </span>
                        )
                      ) : (
                        <span className="text-white/80">No change</span>
                      )}
                    </div>
                  )}
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 mb-6 shadow-md"
            variants={containerVariants}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaChartArea className="mr-2 text-[#7678ed]" />
              Monthly Expense Trend
            </h3>
            <div className="h-[400px] w-full">
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                      },
                      ticks: {
                        callback: function (value) {
                          return value + " CHF";
                        },
                      },
                    },
                    x: {
                      grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        usePointStyle: true,
                        boxWidth: 6,
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return (
                            context.dataset.label + ": " + context.raw + " CHF"
                          );
                        },
                      },
                    },
                  },
                  elements: {
                    point: {
                      radius: 4,
                      hoverRadius: 6,
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        </div>

        <div>
          <motion.div
            className="bg-white rounded-xl p-6 shadow-md mt-6"
            variants={containerVariants}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-[#f35b04]" />
              Monthly Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Month</th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Expenses
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Distance (km)
                    </th>
                    <th className="py-3 px-4 text-left font-semibold">
                      Cost (CHF)
                    </th>
                    {compareWithPrevious && reports.previousYear && (
                      <th className="py-3 px-4 text-left font-semibold">
                        vs {year - 1}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {months.map((monthName, index) => {
                    const month =
                      reports.currentYear.monthlyData[monthName] || {};
                    const prevYearMonth =
                      reports.previousYear?.monthlyData?.[monthName];

                    // Highlight the current month with a subtle background
                    const isCurrentMonth =
                      new Date().getMonth() === index &&
                      new Date().getFullYear() === year;

                    return (
                      <tr
                        key={index}
                        className={`${
                          isCurrentMonth ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="py-3 px-4">{monthName}</td>
                        <td className="py-3 px-4">
                          {month.totalExpenses || 0}
                        </td>
                        <td className="py-3 px-4">
                          {month.totalDistance
                            ? month.totalDistance.toFixed(2)
                            : "0.00"}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {month.totalCost
                            ? month.totalCost.toFixed(2)
                            : "0.00"}{" "}
                          CHF
                        </td>
                        {compareWithPrevious && reports.previousYear && (
                          <td className="py-3 px-4">
                            {prevYearMonth ? (
                              <div className="flex items-center">
                                <span className="mr-2">
                                  {prevYearMonth.totalCost
                                    ? prevYearMonth.totalCost.toFixed(2)
                                    : "0.00"}{" "}
                                  CHF
                                </span>
                                {prevYearMonth.totalCost && month.totalCost ? (
                                  prevYearMonth.totalCost > 0 ? (
                                    month.totalCost >
                                    prevYearMonth.totalCost ? (
                                      <span className="flex items-center text-red-500">
                                        <FaArrowUp className="mr-1" size={10} />
                                        {(
                                          ((month.totalCost -
                                            prevYearMonth.totalCost) /
                                            prevYearMonth.totalCost) *
                                          100
                                        ).toFixed(1)}
                                        %
                                      </span>
                                    ) : (
                                      <span className="flex items-center text-green-500">
                                        <FaArrowDown
                                          className="mr-1"
                                          size={10}
                                        />
                                        {(
                                          ((prevYearMonth.totalCost -
                                            month.totalCost) /
                                            prevYearMonth.totalCost) *
                                          100
                                        ).toFixed(1)}
                                        %
                                      </span>
                                    )
                                  ) : (
                                    <span className="text-gray-500">N/A</span>
                                  )
                                ) : (
                                  <span className="text-gray-500">N/A</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-md mt-6"
            variants={containerVariants}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaChartPie className="mr-2 text-[#7678ed]" />
              Category Breakdown
            </h3>
            <div className="overflow-x-auto">
              {reports.currentYear.categories &&
              Object.keys(reports.currentYear.categories).length > 0 ? (
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold">
                        Category
                      </th>
                      <th className="py-3 px-4 text-left font-semibold">
                        Cost (CHF)
                      </th>
                      <th className="py-3 px-4 text-left font-semibold">
                        % of Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(reports.currentYear.categories).map(
                      ([categoryName, value], index) => {
                        const totalSum = Object.values(
                          reports.currentYear.categories
                        ).reduce((sum, val) => sum + val, 0);
                        const percentage = (value / totalSum) * 100;

                        // Colors from our design system
                        const colors = [
                          "#3d348b",
                          "#7678ed",
                          "#f7b801",
                          "#f35b04",
                          "#20c997",
                          "#6610f2",
                          "#fd7e14",
                          "#198754",
                        ];
                        const color = colors[index % colors.length];

                        return (
                          <tr
                            key={`category-${index}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span
                                  className="w-3 h-3 rounded-full inline-block mr-2"
                                  style={{ backgroundColor: color }}
                                ></span>
                                <span>{categoryName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium">
                              {value.toFixed(2)} CHF
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span className="mr-2 w-12 text-right">
                                  {percentage.toFixed(1)}%
                                </span>
                                <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: color,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">
                  <p className="font-medium">
                    No category data available for this period.
                  </p>
                  <p className="mt-1 text-sm">
                    Try selecting a different year or add expenses with
                    categories.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Category and Quarterly Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Categories pie chart */}
          <motion.div
            className="bg-white rounded-xl p-6 shadow-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaChartPie className="mr-2 text-[#7678ed]" />
              Expenses by Category
            </h3>
            <div className="h-[300px] w-full">
              {reports.currentYear.categories &&
              Object.keys(reports.currentYear.categories).length > 0 ? (
                <Pie
                  data={{
                    labels: Object.keys(reports.currentYear.categories),
                    datasets: [
                      {
                        data: Object.values(reports.currentYear.categories),
                        backgroundColor: [
                          "#3d348b",
                          "#7678ed",
                          "#f7b801",
                          "#f35b04",
                          "#20c997",
                          "#6610f2",
                          "#fd7e14",
                          "#198754",
                        ],
                        borderWidth: 1,
                        borderColor: "#ffffff",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          usePointStyle: true,
                          boxWidth: 6,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce(
                              (a, b) => a + b,
                              0
                            );
                            const percentage = ((value / total) * 100).toFixed(
                              1
                            );
                            return `${context.label}: ${value} CHF (${percentage}%)`;
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No category data available
                </div>
              )}
            </div>
          </motion.div>

          {/* Quarterly comparison */}
          <motion.div
            className="bg-white rounded-xl p-6 shadow-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaChartBar className="mr-2 text-[#f7b801]" />
              Quarterly Comparison
            </h3>
            <div className="h-[300px] w-full">
              {reports.currentYear.quarterly ? (
                <Bar
                  data={{
                    labels: ["Q1", "Q2", "Q3", "Q4"],
                    datasets: [
                      {
                        label: `${year} Expenses`,
                        data: [
                          reports.currentYear.quarterly.Q1 || 0,
                          reports.currentYear.quarterly.Q2 || 0,
                          reports.currentYear.quarterly.Q3 || 0,
                          reports.currentYear.quarterly.Q4 || 0,
                        ],
                        backgroundColor: "#7678ed",
                        borderColor: "#3d348b",
                        borderWidth: 1,
                      },
                      ...(compareWithPrevious &&
                      reports.previousYear &&
                      reports.previousYear.quarterly
                        ? [
                            {
                              label: `${year - 1} Expenses`,
                              data: [
                                reports.previousYear.quarterly.Q1 || 0,
                                reports.previousYear.quarterly.Q2 || 0,
                                reports.previousYear.quarterly.Q3 || 0,
                                reports.previousYear.quarterly.Q4 || 0,
                              ],
                              backgroundColor: "#f7b801",
                              borderColor: "#f35b04",
                              borderWidth: 1,
                            },
                          ]
                        : []),
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: "rgba(0, 0, 0, 0.05)",
                        },
                        ticks: {
                          callback: function (value) {
                            return value + " CHF";
                          },
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          usePointStyle: true,
                          boxWidth: 6,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return (
                              context.dataset.label +
                              ": " +
                              context.raw +
                              " CHF"
                            );
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No quarterly data available
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return <YTDReportsContent />;
};

export default YTDReports;
