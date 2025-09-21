import React, { useState, useEffect } from "react";
import axios from "axios";
import API from "../../api/apiConfig";
import { BASE_URL } from "../../api/apiConfig";
import {
  FaChartLine,
  FaFileExport,
  FaCalendarAlt,
  FaFilter,
  FaCog,
  FaChartArea,
  FaInfoCircle,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Link } from "react-router-dom";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ExpenseForecasting = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [category, setCategory] = useState("all");
  const [months, setMonths] = useState(6);
  const [algorithm, setAlgorithm] = useState("linear");
  const [categories, setCategories] = useState([
    { id: "fuel", name: "Fuel" },
    { id: "tolls", name: "Tolls" },
    { id: "maintenance", name: "Maintenance" },
  ]);

  useEffect(() => {
    const fetchForecastData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Use API instance with auth headers instead of direct axios request
        const response = await API.get(
          `/advanced-reports/forecast?category=${category}&months=${months}&algorithm=${algorithm}`
        );
        setForecastData(response.data.data);
        setIsLoading(false);

        // Comment out mock data
        // setTimeout(() => {
        //   const mockData = getMockData(category, months, algorithm);
        //   setForecastData(mockData);
        //   setIsLoading(false);
        // }, 1000);
      } catch (err) {
        // Error handled by error context
        setError("Failed to load forecast data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchForecastData();
  }, [category, months, algorithm]);

  const getMockData = (category, months, algorithm) => {
    // Current date for creating timeline
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Generate labels for the past 12 months and future forecast months
    const labels = [];
    const historicalData = [];
    const forecastData = [];
    const forecastRangeUpper = [];
    const forecastRangeLower = [];

    // Historical data (past 12 months)
    for (let i = 11; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentYear - Math.floor((currentMonth - i + 12) / 12) + 1;
      labels.push(`${getMonthName(month)} ${year}`);

      // Generate some realistic looking historical data
      const baseValue =
        category === "fuel" ? 180 : category === "tolls" ? 80 : 50;
      const seasonality = Math.sin((month / 12) * 2 * Math.PI) * 0.2 + 1; // Seasonal fluctuation
      const randomness = 0.9 + Math.random() * 0.2; // Random fluctuation between 0.9 and 1.1
      const value = baseValue * seasonality * randomness;

      historicalData.push(value.toFixed(2));

      // Empty values for the historical period in forecast arrays
      if (i === 0) {
        forecastData.push(value.toFixed(2));
        forecastRangeUpper.push(value.toFixed(2));
        forecastRangeLower.push(value.toFixed(2));
      } else {
        forecastData.push(null);
        forecastRangeUpper.push(null);
        forecastRangeLower.push(null);
      }
    }

    // Forecast data (future months)
    const trend =
      algorithm === "linear" ? 1.02 : algorithm === "exponential" ? 1.05 : 1.01; // Growth rate
    let lastValue = parseFloat(historicalData[11]);

    for (let i = 1; i <= months; i++) {
      const month = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      labels.push(`${getMonthName(month)} ${year}`);

      // Calculate forecasted value based on algorithm
      const seasonality = Math.sin((month / 12) * 2 * Math.PI) * 0.2 + 1;
      if (algorithm === "exponential") {
        lastValue *= trend;
      } else if (algorithm === "linear") {
        lastValue += lastValue * (trend - 1);
      } else {
        // Moving average-like behavior
        const pastValues = historicalData.slice(-3).map((v) => parseFloat(v));
        lastValue =
          (pastValues.reduce((a, b) => a + b, 0) / pastValues.length) * trend;
      }

      const value = lastValue * seasonality;
      historicalData.push(null); // Empty values for the forecast period in historical array
      forecastData.push(value.toFixed(2));

      // Add confidence interval (increasing uncertainty with time)
      const uncertainty = 0.05 + (i / months) * 0.15; // Starts at 5%, increases to 20% at the end
      forecastRangeUpper.push((value * (1 + uncertainty)).toFixed(2));
      forecastRangeLower.push((value * (1 - uncertainty)).toFixed(2));
    }

    // Calculate summary statistics
    const lastHistoricalValue = parseFloat(historicalData[11]);
    const lastForecastValue = parseFloat(forecastData[forecastData.length - 1]);
    const growth = (
      ((lastForecastValue - lastHistoricalValue) / lastHistoricalValue) *
      100
    ).toFixed(1);

    // Categorize growth trend
    let trend_status = "stable";
    if (growth > 10) trend_status = "increasing_rapidly";
    else if (growth > 2) trend_status = "increasing";
    else if (growth < -10) trend_status = "decreasing_rapidly";
    else if (growth < -2) trend_status = "decreasing";

    return {
      labels,
      datasets: [
        {
          label: "Historical Data",
          data: historicalData,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          borderWidth: 2,
          pointRadius: 3,
          tension: 0.3,
        },
        {
          label: "Forecast",
          data: forecastData,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderWidth: 2,
          pointRadius: 3,
          borderDash: [5, 5],
          tension: 0.3,
        },
        {
          label: "Upper Range",
          data: forecastRangeUpper,
          borderColor: "rgba(255, 99, 132, 0.3)",
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          borderWidth: 1,
          pointRadius: 0,
          fill: "+1",
          tension: 0.3,
        },
        {
          label: "Lower Range",
          data: forecastRangeLower,
          borderColor: "rgba(255, 99, 132, 0.3)",
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
          tension: 0.3,
        },
      ],
      summary: {
        category:
          category === "all"
            ? "All Categories"
            : categories.find((c) => c.id === category)?.name ||
              "Selected Category",
        forecast_algorithm: getAlgorithmName(algorithm),
        forecast_horizon: `${months} months`,
        current_monthly: lastHistoricalValue.toFixed(2),
        end_of_forecast: lastForecastValue.toFixed(2),
        growth_percentage: growth,
        trend: trend_status,
        confidence_level: "85%",
        potential_savings:
          category !== "all"
            ? (lastHistoricalValue * 0.1 * months).toFixed(2)
            : "N/A",
      },
    };
  };

  const getMonthName = (month) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[month];
  };

  const getAlgorithmName = (algorithm) => {
    const algorithms = {
      linear: "Linear Regression",
      exponential: "Exponential Growth",
      arima: "ARIMA Model",
    };
    return algorithms[algorithm] || algorithm;
  };

  const getTrendLabel = (trend) => {
    const trends = {
      increasing_rapidly: "Increasing Rapidly",
      increasing: "Increasing",
      stable: "Stable",
      decreasing: "Decreasing",
      decreasing_rapidly: "Decreasing Rapidly",
    };
    return trends[trend] || trend;
  };

  const getTrendColor = (trend) => {
    const colors = {
      increasing_rapidly: "text-red-600",
      increasing: "text-orange-500",
      stable: "text-green-600",
      decreasing: "text-blue-500",
      decreasing_rapidly: "text-blue-600",
    };
    return colors[trend] || "text-gray-700";
  };

  const getChartOptions = () => {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            filter: function (item, chart) {
              // Hide the range datasets from the legend
              return !item.text.includes("Range");
            },
          },
        },
        title: {
          display: true,
          text: `Expense Forecast (${
            forecastData?.summary.category || "All Categories"
          })`,
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Expense (CHF)",
          },
        },
        x: {
          title: {
            display: true,
            text: "Month",
          },
        },
      },
    };
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleMonthsChange = (e) => {
    setMonths(parseInt(e.target.value));
  };

  const handleAlgorithmChange = (e) => {
    setAlgorithm(e.target.value);
  };

  const handleExport = (format) => {
    alert(`Exporting forecast data as ${format}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold mb-2">Expense Forecasting</h1>
        <p className="text-gray-600">
          Basic expense forecasting tools and projections
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-md">
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-blue-800">
              Try Our New Advanced Forecast Feature!
            </h3>
            <p className="text-blue-700 mt-1">
              We've developed a more sophisticated forecasting tool with
              statistical models, confidence intervals, and interactive
              visualizations.
            </p>
            <Link
              to="/admin/reports/forecast"
              className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center w-max"
            >
              <FaChartArea className="mr-2" />
              Go to Advanced Forecast
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Basic Forecast</h2>
        <p className="text-gray-600 mb-4">
          This page contains our original expense forecasting tools. For more
          advanced features and improved accuracy, please use our new Advanced
          Forecast tool.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-2">Next Month Projection</h3>
            <div className="text-2xl font-bold text-indigo-600">
              CHF 1,250.00
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Based on last 3 months average
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-2">Annual Projection</h3>
            <div className="text-2xl font-bold text-green-600">
              CHF 15,000.00
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Based on year-to-date data
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/admin/reports/forecast"
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-md hover:from-indigo-700 hover:to-blue-600 transition-all inline-flex items-center shadow-md"
        >
          <FaChartArea className="mr-2" />
          Switch to Advanced Forecast
        </Link>
      </div>
    </div>
  );
};

export default ExpenseForecasting;
