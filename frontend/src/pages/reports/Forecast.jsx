import React, { useState, useEffect } from "react";
import API from "../../api/apiConfig";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaChartLine,
  FaFileExport,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Forecast = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [forecastMonths, setForecastMonths] = useState(3);
  const [forecastMethod, setForecastMethod] = useState("seasonal");
  const [expandedSection, setExpandedSection] = useState("all");

  // Brand colors
  const brandColors = {
    primary: "#3d348b",
    secondary: "#7678ed",
    accent1: "#f7b801",
    accent2: "#f35b04",
  };

  useEffect(() => {
    const fetchForecastData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await API.get(
          `/advanced-reports/forecast?months=${forecastMonths}&method=${forecastMethod}`
        );

        if (response.data && response.data.data) {
          // Forecast API response received
          setForecastData(response.data.data);
        } else {
          // Empty or invalid response from server
          setError("No data returned from the server");
        }
      } catch (err) {
        // Error handled by error context
        setError(
          `Failed to load forecast data: ${err.message || "Unknown error"}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecastData();
  }, [forecastMonths, forecastMethod]);

  // Helper functions for color manipulation
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? "all" : section);
  };

  const handleExport = (format) => {
    alert(`Exporting forecast data as ${format}`);
  };

  const getChartData = () => {
    if (!forecastData) return null;

    const historical = forecastData.historical.data || [];
    const forecast = forecastData.forecast.data || [];

    // Combine historical and forecast data for the chart
    const labels = [
      ...historical.map((item) => item.monthName),
      ...forecast.map((item) => item.monthName),
    ];

    const historicalValues = historical.map((item) => item.totalCost);
    const forecastValues = forecast.map((item) => item.forecast.totalCost);
    const lowerBoundValues = forecast.map((item) => item.forecast.lowerBound);
    const upperBoundValues = forecast.map((item) => item.forecast.upperBound);

    // Add null values for historical period to forecast datasets
    const forecastDataWithNulls = [
      ...Array(historical.length).fill(null),
      ...forecastValues,
    ];
    const lowerBoundWithNulls = [
      ...Array(historical.length).fill(null),
      ...lowerBoundValues,
    ];
    const upperBoundWithNulls = [
      ...Array(historical.length).fill(null),
      ...upperBoundValues,
    ];

    return {
      labels,
      datasets: [
        {
          label: "Historical",
          data: [...historicalValues, ...Array(forecast.length).fill(null)],
          borderColor: brandColors.primary,
          backgroundColor: hexToRgba(brandColors.primary, 0.1),
          borderWidth: 3,
          pointBackgroundColor: brandColors.primary,
          pointBorderColor: "#fff",
          pointRadius: 5,
          pointHoverRadius: 8,
          fill: false,
          tension: 0.4,
        },
        {
          label: "Forecast",
          data: forecastDataWithNulls,
          borderColor: brandColors.accent1,
          backgroundColor: "transparent",
          borderWidth: 3,
          pointBackgroundColor: brandColors.accent1,
          pointBorderColor: "#fff",
          pointRadius: 5,
          pointHoverRadius: 8,
          fill: false,
          tension: 0.4,
          borderDash: [5, 5],
        },
        {
          label: "Upper Bound",
          data: upperBoundWithNulls,
          borderColor: hexToRgba(brandColors.accent2, 0.5),
          backgroundColor: "transparent",
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.4,
          borderDash: [3, 3],
        },
        {
          label: "Lower Bound",
          data: lowerBoundWithNulls,
          borderColor: hexToRgba(brandColors.accent2, 0.5),
          backgroundColor: hexToRgba(brandColors.accent1, 0.1),
          borderWidth: 2,
          pointRadius: 0,
          fill: "+1", // Fill between this dataset and the dataset with index 2 (upper bound)
          tension: 0.4,
          borderDash: [3, 3],
        },
      ],
    };
  };

  const getChartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Cost (CHF)",
            font: {
              size: 12,
              weight: "bold",
            },
          },
          ticks: {
            callback: function (value) {
              return "CHF " + value;
            },
            font: {
              size: 11,
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
            drawBorder: false,
          },
        },
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            font: {
              size: 11,
            },
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: {
              family: "'Inter', sans-serif",
              size: 12,
              weight: 500,
            },
            usePointStyle: true,
            padding: 20,
            boxWidth: 10,
            boxHeight: 10,
          },
        },
        title: {
          display: true,
          text: `Expense Forecast (${
            forecastMethod.charAt(0).toUpperCase() + forecastMethod.slice(1)
          } Method)`,
          font: {
            size: 16,
            weight: "bold",
            family: "'Inter', sans-serif",
          },
          padding: {
            top: 10,
            bottom: 20,
          },
          color: "#333",
        },
        tooltip: {
          backgroundColor: "rgba(61, 52, 139, 0.8)",
          titleFont: {
            size: 14,
            weight: "bold",
            family: "'Inter', sans-serif",
          },
          bodyFont: {
            size: 13,
            family: "'Inter', sans-serif",
          },
          padding: 12,
          cornerRadius: 6,
          displayColors: true,
          usePointStyle: true,
          borderColor: "rgba(255, 255, 255, 0.2)",
          borderWidth: 1,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += `CHF ${context.parsed.y.toFixed(2)}`;
              }
              return label;
            },
          },
        },
      },
    };
  };

  const renderForecastTable = () => {
    if (!forecastData || !forecastData.forecast.data) return null;

    return (
      <table className="w-full min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Month
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Forecasted Cost (CHF)
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Distance (km)
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Confidence Range (CHF)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {forecastData.forecast.data.map((item, index) => (
            <motion.tr
              key={index}
              className="hover:bg-gray-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: brandColors.accent1 }}
                  ></div>
                  <span className="font-medium">
                    {item.monthName} {item.year}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-medium">
                CHF {item.forecast.totalCost.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                {item.forecast.totalDistance.toFixed(2)} km
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end space-x-1">
                  <span className="text-gray-500 text-xs">
                    {item.forecast.lowerBound.toFixed(2)}
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mx-1">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#f7b801] to-[#f35b04]"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {item.forecast.upperBound.toFixed(2)}
                  </span>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 font-medium">
          <tr>
            <td className="px-4 py-3">Total</td>
            <td className="px-4 py-3 text-right">
              CHF {forecastData.forecast.summary.totalForecastedCost.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-right">
              {forecastData.forecast.summary.totalForecastedDistance.toFixed(2)}{" "}
              km
            </td>
            <td className="px-4 py-3 text-right">
              Avg: CHF {forecastData.forecast.summary.avgMonthlyCost.toFixed(2)}
              /month
            </td>
          </tr>
        </tfoot>
      </table>
    );
  };

  const renderHistoricalTable = () => {
    if (!forecastData || !forecastData.historical.data) return null;

    return (
      <table className="w-full min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Month
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Cost (CHF)
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Distance (km)
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Count
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {forecastData.historical.data.map((item, index) => (
            <motion.tr
              key={index}
              className="hover:bg-gray-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: brandColors.primary }}
                  ></div>
                  <span className="font-medium">
                    {item.monthName} {item.period.year}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-medium">
                CHF {item.totalCost.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                {item.totalDistance.toFixed(2)} km
              </td>
              <td className="px-4 py-3 text-right">{item.count} expenses</td>
            </motion.tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 font-medium">
          <tr>
            <td className="px-4 py-3">Total</td>
            <td className="px-4 py-3 text-right">
              CHF {forecastData.historical.summary.totalCost.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-right">
              {forecastData.historical.summary.totalDistance.toFixed(2)} km
            </td>
            <td className="px-4 py-3 text-right">
              Avg: CHF{" "}
              {forecastData.historical.summary.avgMonthlyCost.toFixed(2)}/month
            </td>
          </tr>
        </tfoot>
      </table>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d348b] mb-3"></div>
          <p className="text-gray-500">Loading forecast data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <motion.h1
          className="text-2xl font-bold text-gray-800 flex items-center"
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <FaChartLine className="mr-2 text-[#7678ed]" />
          Expense Forecast
        </motion.h1>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport("pdf")}
            className="flex items-center px-3 py-2 bg-gradient-to-r from-[#3d348b] to-[#7678ed] text-white rounded-md hover:shadow-lg transition-all duration-300 shadow-sm"
          >
            <FaFileExport className="mr-2" />
            Export PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport("csv")}
            className="flex items-center px-3 py-2 bg-gradient-to-r from-[#f7b801] to-[#f35b04] text-white rounded-md hover:shadow-lg transition-all duration-300 shadow-sm"
          >
            <FaFileExport className="mr-2" />
            Export CSV
          </motion.button>
        </div>
      </div>

      <motion.div
        className="bg-white shadow-lg rounded-lg overflow-hidden mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] px-6 py-4 text-white">
          <h2 className="text-lg font-medium">Forecast Configuration</h2>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-auto">
              <div className="flex items-center space-x-2 mb-3">
                <FaCalendarAlt className="text-[#7678ed]" />
                <span className="font-medium">Forecast Period:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 3, 6, 12].map((months) => (
                  <motion.button
                    key={months}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center px-4 py-2 rounded-md text-sm transition-all ${
                      forecastMonths === months
                        ? "text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setForecastMonths(months)}
                    style={
                      forecastMonths === months
                        ? {
                            background:
                              "linear-gradient(to right, #7678ed, #3d348b)",
                          }
                        : {}
                    }
                  >
                    {months} {months === 1 ? "Month" : "Months"}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="flex items-center space-x-2 mb-3">
                <FaChartLine className="text-[#7678ed]" />
                <span className="font-medium">Forecast Method:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "linear", label: "Linear" },
                  { id: "seasonal", label: "Seasonal" },
                  { id: "arima", label: "ARIMA" },
                ].map((method) => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center px-4 py-2 rounded-md text-sm transition-all ${
                      forecastMethod === method.id
                        ? "text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setForecastMethod(method.id)}
                    style={
                      forecastMethod === method.id
                        ? {
                            background:
                              "linear-gradient(to right, #f7b801, #f35b04)",
                          }
                        : {}
                    }
                  >
                    {method.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white shadow-lg rounded-lg overflow-hidden mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] px-6 py-4 text-white">
          <h2 className="text-lg font-medium">Expense Forecast Chart</h2>
        </div>

        <div className="p-6">
          <div
            className="flex justify-center items-center bg-gray-50 rounded-lg p-4"
            style={{ height: "400px" }}
          >
            {forecastData ? (
              <Line data={getChartData()} options={getChartOptions()} />
            ) : (
              <div className="text-gray-500">No forecast data available</div>
            )}
          </div>
        </div>
      </motion.div>

      {forecastData && (
        <>
          <motion.div
            className="bg-white shadow-lg rounded-lg overflow-hidden mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div
              className="bg-gradient-to-r from-[#f7b801] to-[#f35b04] px-6 py-4 text-white cursor-pointer flex justify-between items-center"
              onClick={() => toggleSection("forecast")}
            >
              <h2 className="text-lg font-medium">Forecast Data</h2>
              {expandedSection === "forecast" ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </div>

            {(expandedSection === "forecast" || expandedSection === "all") && (
              <div className="p-6">
                <div className="mb-4 bg-blue-50 p-4 rounded-lg text-blue-800 text-sm flex items-start">
                  <FaInfoCircle className="text-blue-500 mr-2 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">About This Forecast</p>
                    <p>
                      This forecast uses the{" "}
                      <span className="font-medium">
                        {forecastMethod.charAt(0).toUpperCase() +
                          forecastMethod.slice(1)}
                      </span>{" "}
                      method over {forecastMonths} months with a confidence
                      range. Historical data is used to predict future expenses
                      based on past patterns.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                  {renderForecastTable()}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            className="bg-white shadow-lg rounded-lg overflow-hidden"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div
              className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] px-6 py-4 text-white cursor-pointer flex justify-between items-center"
              onClick={() => toggleSection("historical")}
            >
              <h2 className="text-lg font-medium">Historical Data</h2>
              {expandedSection === "historical" ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}
            </div>

            {(expandedSection === "historical" ||
              expandedSection === "all") && (
              <div className="p-6">
                <div className="mb-4 bg-purple-50 p-4 rounded-lg text-purple-800 text-sm flex items-start">
                  <FaInfoCircle className="text-purple-500 mr-2 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Historical Data</p>
                    <p>
                      This table shows historical expense data that was used as
                      the basis for the forecast calculations. Past trends
                      inform the prediction model for future expenses.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                  {renderHistoricalTable()}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default Forecast;
