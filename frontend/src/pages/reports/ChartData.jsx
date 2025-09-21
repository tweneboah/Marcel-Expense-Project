import React, { useState, useEffect } from "react";
import API from "../../api/apiConfig";
import { BASE_URL } from "../../api/apiConfig";
import {
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaFileExport,
  FaCalendarAlt,
  FaFilter,
  FaArrowDown,
} from "react-icons/fa";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from "chart.js";
import { motion } from "framer-motion";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

// Create a custom plugin for the doughnut center text
const centerTextPlugin = {
  id: "centerText",
  beforeDraw: function (chart) {
    if (chart.config.type === "doughnut") {
      // Get ctx and dimensions
      const ctx = chart.ctx;
      const width = chart.width;
      const height = chart.height;

      ctx.restore();

      // Calculate total sum from data
      const dataset = chart.data.datasets[0];
      const total = dataset.data.reduce((sum, value) => sum + value, 0);

      // Font settings for main value
      const fontSize = (height / 200).toFixed(2) * 12;
      ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
      ctx.textBaseline = "middle";

      // Draw total value
      ctx.fillStyle = "#3d348b";
      ctx.textAlign = "center";
      ctx.fillText(
        `CHF ${total.toFixed(2)}`,
        width / 2,
        height / 2 - fontSize / 2
      );

      // Draw "Total" label
      ctx.font = `${fontSize * 0.7}px 'Inter', sans-serif`;
      ctx.fillStyle = "#666";
      ctx.fillText("Total", width / 2, height / 2 + fontSize);

      ctx.save();
    }
  },
};

const ChartData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState("pie");

  // Set current year as default date range
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);

  // Brand colors
  const brandColors = {
    primary: "#3d348b",
    secondary: "#7678ed",
    accent1: "#f7b801",
    accent2: "#f35b04",
  };

  // Enhanced color palette for pie/doughnut charts
  const enhancedColors = [
    brandColors.primary,
    brandColors.secondary,
    brandColors.accent1,
    brandColors.accent2,
    "#4CAF50", // green
    "#9C27B0", // purple
    "#2196F3", // blue
    "#FF5722", // deep orange
    "#795548", // brown
    "#607D8B", // blue gray
    "#E91E63", // pink
    "#9E9E9E", // gray
  ];

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Backend only supports certain chart types, so we use 'pie' for doughnut
        const apiChartType = chartType === "doughnut" ? "pie" : chartType;

        // Make sure we're only sending supported chart types to the API
        const supportedTypes = ["pie", "line", "bar"];
        const finalChartType = supportedTypes.includes(apiChartType)
          ? apiChartType
          : "pie";

        // Fetching data for chart type
        const response = await API.get(
          `/advanced-reports/chart-data?chartType=${finalChartType}&startDate=${startDate}&endDate=${endDate}`
        );

        if (response.data && response.data.data) {
          // API response received

          // Chart data structure analyzed

          // For line/bar charts, if we get pie chart data, transform it
          if (
            (chartType === "line" || chartType === "bar") &&
            response.data.data.chartData &&
            Array.isArray(response.data.data.chartData)
          ) {
            // Transforming pie data to line/bar format
            // Transform pie chart data into line/bar chart format
            const transformedData = {
              chartType: chartType,
              labels: response.data.data.chartData.map((item) => item.label),
              datasets: [
                {
                  label: "Expenses (CHF)",
                  data: response.data.data.chartData.map((item) => item.value),
                  backgroundColor:
                    chartType === "bar"
                      ? response.data.data.chartData.map(
                          (item) =>
                            item.color ||
                            getColorForCategory(item.id || "", item.label)
                        )
                      : hexToRgba(brandColors.secondary, 0.1),
                  borderColor:
                    chartType === "line"
                      ? brandColors.secondary
                      : response.data.data.chartData.map((item) =>
                          darkenColor(
                            item.color ||
                              getColorForCategory(item.id || "", item.label),
                            10
                          )
                        ),
                },
              ],
            };
            setChartData(transformedData);
          } else {
            setChartData(response.data.data);
          }
        } else {
          // Handle empty response
          // Empty or invalid response from server
          setError("No data returned from the server");
        }
        setIsLoading(false);
      } catch (err) {
        // Error handled by error context
        setError(
          `Failed to load chart data: ${err.message || "Unknown error"}`
        );
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [chartType, startDate, endDate]);

  const getPieChartData = () => {
    if (!chartData) return null;

    // Check the response format - handle both structures
    if (!chartData.chartData || !Array.isArray(chartData.chartData)) {
      // Alternative data format
      const labels = chartData.labels || [];
      const datasets = chartData.datasets || [];

      if (datasets.length > 0 && datasets[0].data) {
        // Convert line format to pie format
        return {
          labels,
          datasets: [
            {
              label: "Expense Distribution",
              data: datasets[0].data,
              backgroundColor:
                datasets[0].backgroundColor ||
                labels.map((_, i) => enhancedColors[i % enhancedColors.length]),
              borderColor: "#ffffff",
              borderWidth: 2,
              hoverOffset: chartType === "doughnut" ? 15 : 10,
              hoverBorderColor: "#ffffff",
              hoverBorderWidth: 3,
            },
          ],
        };
      }

      return {
        labels: ["No Data"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#e0e0e0"],
            borderColor: "white",
            borderWidth: 2,
          },
        ],
      };
    }

    // Make sure we have consistent colors for each category
    const categoryColors = {};
    chartData.chartData.forEach((item, index) => {
      if (!categoryColors[item.label]) {
        categoryColors[item.label] =
          item.color || enhancedColors[index % enhancedColors.length];
      }
    });

    return {
      labels: chartData.chartData.map((item) => item.label),
      datasets: [
        {
          label: "Expense Distribution",
          data: chartData.chartData.map((item) => item.value),
          backgroundColor: chartData.chartData.map(
            (item) => categoryColors[item.label]
          ),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: chartType === "doughnut" ? 18 : 12,
          hoverBorderWidth: 3,
          hoverBorderColor: "#ffffff",
        },
      ],
    };
  };

  const getLineChartData = () => {
    if (!chartData) return null;

    // Check the response format - handle both structures
    if (!chartData.chartData || !Array.isArray(chartData.chartData)) {
      // Alternative data format
      const labels = chartData.labels || [];
      const datasets = chartData.datasets || [];

      if (datasets.length > 0) {
        return {
          labels,
          datasets: datasets.map((dataset) => ({
            ...dataset,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 8,
            fill: true,
            borderWidth: 3,
            backgroundColor: hexToRgba(brandColors.secondary, 0.1),
            borderColor: brandColors.secondary,
            pointBackgroundColor: brandColors.primary,
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          })),
        };
      }

      return {
        labels: [],
        datasets: [
          {
            label: "No data available",
            data: [],
            backgroundColor: hexToRgba(brandColors.secondary, 0.1),
            borderColor: brandColors.secondary,
          },
        ],
      };
    }

    // Original format - process with enhanced styling
    return {
      labels: chartData.chartData.map((item) => item.label),
      datasets: [
        {
          label: "Expense Amount (CHF)",
          data: chartData.chartData.map((item) => item.value),
          backgroundColor: hexToRgba(brandColors.secondary, 0.1),
          borderColor: brandColors.secondary,
          borderWidth: 3,
          pointBackgroundColor: brandColors.primary,
          pointBorderColor: "#fff",
          pointRadius: 5,
          pointHoverRadius: 8,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const getBarChartData = () => {
    if (!chartData) return null;

    // Handle the specific API response format for bar charts with totalValue and categoryValues
    if (
      chartData.chartData &&
      chartData.chartData.labels &&
      chartData.chartData.datasets &&
      Array.isArray(chartData.chartData.datasets) &&
      chartData.chartData.datasets.some(
        (dataset) => dataset.totalValue !== undefined
      )
    ) {
      const { labels } = chartData.chartData;
      const datasets = chartData.chartData.datasets;

      // Extract total values for each period
      const data = datasets.map((dataset) => dataset.totalValue || 0);

      // Create consistent colors based on period labels
      const backgroundColor = labels.map((label, idx) => {
        const colorMap = {
          Jan: brandColors.primary,
          Feb: brandColors.secondary,
          Mar: brandColors.accent1,
          Apr: brandColors.accent2,
          May: "#4CAF50",
          Jun: "#9C27B0",
          Jul: "#2196F3",
          Aug: "#FF5722",
          Sep: "#795548",
          Oct: "#607D8B",
          Nov: "#E91E63",
          Dec: "#9E9E9E",
        };

        // Try to match month in label
        for (const [month, color] of Object.entries(colorMap)) {
          if (label.includes(month)) {
            return color;
          }
        }

        // Default to a color from our brand palette
        return getColorForCategory(`${idx}`, label);
      });

      return {
        labels,
        datasets: [
          {
            label: "Monthly Expenses (CHF)",
            data,
            backgroundColor,
            borderColor: backgroundColor.map((color) => darkenColor(color, 15)),
            borderWidth: 1,
            borderRadius: 6,
            hoverBackgroundColor: backgroundColor.map((color) =>
              lightenColor(color, 10)
            ),
            barThickness: 30,
            maxBarThickness: 40,
          },
        ],
      };
    }

    // Check if data is in a standard format (labels + datasets with data arrays)
    if (
      chartData.chartData &&
      chartData.chartData.labels &&
      chartData.chartData.datasets &&
      chartData.chartData.datasets.length > 0 &&
      chartData.chartData.datasets[0].data
    ) {
      return {
        labels: chartData.chartData.labels,
        datasets: chartData.chartData.datasets.map((dataset) => ({
          ...dataset,
          borderRadius: 6,
          borderWidth: 1,
          barThickness: 30,
          maxBarThickness: 40,
          hoverBackgroundColor: Array.isArray(dataset.backgroundColor)
            ? dataset.backgroundColor.map((color) => lightenColor(color, 10))
            : lightenColor(dataset.backgroundColor || brandColors.primary, 10),
        })),
      };
    }

    // Handle direct format with labels and datasets at top level
    if (
      chartData.labels &&
      chartData.datasets &&
      chartData.datasets.length > 0
    ) {
      return {
        labels: chartData.labels,
        datasets: chartData.datasets.map((dataset) => ({
          ...dataset,
          borderRadius: 6,
          borderWidth: 1,
          barThickness: 30,
          maxBarThickness: 40,
          hoverBackgroundColor: Array.isArray(dataset.backgroundColor)
            ? dataset.backgroundColor.map((color) => lightenColor(color, 10))
            : lightenColor(dataset.backgroundColor || brandColors.primary, 10),
        })),
      };
    }

    // Return empty data if nothing matched
    return {
      labels: [],
      datasets: [
        {
          label: "No data available",
          data: [],
          backgroundColor: brandColors.primary,
        },
      ],
    };
  };

  // Function to generate a consistent color based on category ID and name
  const getColorForCategory = (id, label) => {
    // Map common category names to specific brand colors (case insensitive)
    const categoryColorMap = {
      fuel: brandColors.accent2,
      maintenance: brandColors.accent1,
      toll: brandColors.secondary,
      parking: brandColors.primary,
      travel: brandColors.secondary,
      food: "#4CAF50",
      accommodation: "#9C27B0",
      other: "#607D8B",
    };

    // Check if the category has a predefined color (case insensitive)
    if (label) {
      const normalizedLabel = label.toLowerCase();
      for (const [key, value] of Object.entries(categoryColorMap)) {
        if (normalizedLabel.includes(key)) {
          return value;
        }
      }
    }

    // Use a hash function to deterministically assign colors
    const hashCode = String(id)
      .split("")
      .reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);

    // Use absolute value and modulo to get an index in the brand colors array
    const colorsList = Object.values(brandColors);
    const colorIndex = Math.abs(hashCode) % colorsList.length;
    return colorsList[colorIndex];
  };

  // Helper functions for color manipulation
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function darkenColor(hex, percent) {
    // Convert hex to RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    // Darken
    r = Math.max(0, Math.floor((r * (100 - percent)) / 100));
    g = Math.max(0, Math.floor((g * (100 - percent)) / 100));
    b = Math.max(0, Math.floor((b * (100 - percent)) / 100));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  function lightenColor(hex, percent) {
    // Convert hex to RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    // Lighten
    r = Math.min(255, Math.floor((r * (100 + percent)) / 100));
    g = Math.min(255, Math.floor((g * (100 + percent)) / 100));
    b = Math.min(255, Math.floor((b * (100 + percent)) / 100));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
      },
      plugins: {
        legend: {
          position:
            chartType === "pie" || chartType === "doughnut" ? "right" : "top",
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
          text: `Expense Distribution (${startDate} to ${endDate})`,
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
              } else if (context.parsed !== null) {
                label += `CHF ${context.parsed.toFixed(2)}`;
              }
              return label;
            },
          },
        },
      },
    };

    // Add specific options based on chart type
    if (chartType === "doughnut") {
      return {
        ...baseOptions,
        cutout: "70%",
        borderWidth: 2,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            ...baseOptions.plugins.legend,
            position: "right",
          },
          centerText: {
            enabled: true,
          },
          tooltip: {
            ...baseOptions.plugins.tooltip,
            callbacks: {
              ...baseOptions.plugins.tooltip.callbacks,
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.chart.data.datasets[0].data.reduce(
                  (a, b) => a + b,
                  0
                );
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: CHF ${value.toFixed(2)} (${percentage}%)`;
              },
            },
          },
        },
      };
    } else if (chartType === "pie") {
      return {
        ...baseOptions,
        borderWidth: 2,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            ...baseOptions.plugins.legend,
            position: "right",
          },
          tooltip: {
            ...baseOptions.plugins.tooltip,
            callbacks: {
              ...baseOptions.plugins.tooltip.callbacks,
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.chart.data.datasets[0].data.reduce(
                  (a, b) => a + b,
                  0
                );
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: CHF ${value.toFixed(2)} (${percentage}%)`;
              },
            },
          },
        },
      };
    } else if (chartType === "line") {
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
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
        elements: {
          point: {
            backgroundColor: brandColors.primary,
            borderColor: "#fff",
            borderWidth: 2,
            hoverRadius: 8,
            hoverBorderWidth: 3,
          },
          line: {
            tension: 0.4,
          },
        },
      };
    } else if (chartType === "bar") {
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
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
          ...baseOptions.plugins,
          legend: {
            display: false,
          },
        },
      };
    }

    return baseOptions;
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  const handleDateRangeChange = (type, value) => {
    if (type === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  const handleExport = (format) => {
    alert(`Exporting chart data as ${format}`);
  };

  const renderChart = () => {
    if (!chartData || !chartType) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Select chart type to view data</p>
        </div>
      );
    }

    if (chartData.error) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{chartData.error}</p>
        </div>
      );
    }

    if (!hasValidData()) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">
            No data available for the selected period
          </p>
        </div>
      );
    }

    try {
      switch (chartType) {
        case "pie":
          return <Pie data={getPieChartData()} options={getChartOptions()} />;
        case "doughnut":
          return (
            <Doughnut
              data={getPieChartData()}
              options={getChartOptions()}
              plugins={[centerTextPlugin]}
            />
          );
        case "line":
          // For line charts, check if data is at the top level (not nested)
          if (chartData.datasets && chartData.labels) {
            // Using top-level line chart data directly

            const enhancedData = {
              labels: chartData.labels,
              datasets: chartData.datasets.map((dataset) => ({
                ...dataset,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 8,
                borderWidth: 3,
                fill: true,
                backgroundColor: hexToRgba(brandColors.secondary, 0.1),
              })),
            };

            return <Line data={enhancedData} options={getChartOptions()} />;
          } else if (
            chartData.chartData?.datasets &&
            chartData.chartData?.labels
          ) {
            // Use nested data
            // Using nested line chart data

            const enhancedData = {
              labels: chartData.chartData.labels,
              datasets: chartData.chartData.datasets.map((dataset) => ({
                ...dataset,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 8,
                borderWidth: 3,
                fill: true,
                backgroundColor: hexToRgba(brandColors.secondary, 0.1),
              })),
            };

            return <Line data={enhancedData} options={getChartOptions()} />;
          }

          return (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Invalid line chart data format</p>
            </div>
          );
        case "bar":
          return <Bar data={getBarChartData()} options={getChartOptions()} />;
        default:
          return (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Select a valid chart type</p>
            </div>
          );
      }
    } catch (error) {
      // Error handled by error context
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error rendering chart: {error.message}</p>
        </div>
      );
    }
  };

  const getTotalValue = () => {
    if (!chartData) return 0;

    // Special case for bar chart with totalValue format
    if (
      chartType === "bar" &&
      chartData.chartData &&
      chartData.chartData.datasets &&
      Array.isArray(chartData.chartData.datasets) &&
      chartData.chartData.datasets.some(
        (dataset) => dataset.totalValue !== undefined
      )
    ) {
      return chartData.chartData.datasets.reduce(
        (sum, dataset) => sum + (dataset.totalValue || 0),
        0
      );
    }

    // For API response with nested chartData structure
    if (
      chartData.chartData &&
      chartData.chartData.datasets &&
      chartData.chartData.datasets.length > 0 &&
      chartData.chartData.datasets[0] &&
      chartData.chartData.datasets[0].data
    ) {
      // Sum values from the first dataset (or potentially from all datasets)
      return chartData.chartData.datasets[0].data.reduce(
        (sum, value) => sum + (value || 0),
        0
      );
    }

    // For pie chart data format
    if (chartData.chartData && Array.isArray(chartData.chartData)) {
      return chartData.chartData.reduce(
        (sum, item) => sum + (item.value || 0),
        0
      );
    }

    // For standard line chart data format
    if (
      chartData.datasets &&
      chartData.datasets.length > 0 &&
      chartData.datasets[0].data
    ) {
      return chartData.datasets[0].data.reduce(
        (sum, value) => sum + (value || 0),
        0
      );
    }

    return 0;
  };

  const hasValidData = () => {
    // Checking data validity

    try {
      // If we have pie/doughnut chart data
      if (chartData.chartData && Array.isArray(chartData.chartData)) {
        return chartData.chartData.length > 0;
      }

      // Special case for bar chart with totalValue format
      if (
        chartType === "bar" &&
        chartData.chartData &&
        chartData.chartData.datasets &&
        Array.isArray(chartData.chartData.datasets) &&
        chartData.chartData.datasets.some(
          (dataset) => dataset.totalValue !== undefined
        )
      ) {
        return true;
      }

      // If we have line/bar chart data with chartData.chartData directly
      if (
        chartData.chartData &&
        chartData.chartData.labels &&
        chartData.chartData.datasets &&
        Array.isArray(chartData.chartData.datasets) &&
        chartData.chartData.datasets.length > 0
      ) {
        // Make sure at least one dataset has valid data
        return chartData.chartData.datasets.some(
          (dataset) => dataset && dataset.data && dataset.data.length > 0
        );
      }

      // If we have line/bar chart data at top level
      if (
        chartData.labels &&
        chartData.datasets &&
        Array.isArray(chartData.datasets)
      ) {
        const hasDatasets = chartData.datasets.some(
          (dataset) =>
            (dataset && dataset.data && dataset.data.length > 0) ||
            dataset.totalValue !== undefined
        );
        // Has datasets with data
        return hasDatasets;
      }

      // Check for minimal data that we can use
      if (chartType === "line" || chartType === "bar") {
        // If we have a period and chartType, assume we can generate at least something
        if (chartData.chartType && chartData.period) {
          // Minimal chart data detected - will try to create visualization
          return true;
        }
      }

      // No valid data found for visualization
      return false;
    } catch (err) {
      // Error handled by error context
      return false;
    }
  };

  const getCategoryRows = () => {
    if (!chartData) return null;

    // For API response with bar chart format with totalValue and categoryValues
    if (
      chartType === "bar" &&
      chartData.chartData &&
      chartData.chartData.datasets &&
      Array.isArray(chartData.chartData.datasets) &&
      chartData.chartData.datasets.some(
        (dataset) => dataset.totalValue !== undefined
      )
    ) {
      // Combine all datasets to show total expenses by period
      const combinedRows = chartData.chartData.datasets.map(
        (dataset, index) => {
          const label =
            dataset.label ||
            chartData.chartData.labels[index] ||
            `Period ${index + 1}`;
          const value = dataset.totalValue || 0;
          const total = chartData.chartData.datasets.reduce(
            (sum, ds) => sum + (ds.totalValue || 0),
            0
          );
          const percentage =
            total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";

          // Find color based on month name if possible
          const colorMap = {
            Jan: brandColors.primary,
            Feb: brandColors.secondary,
            Mar: brandColors.accent1,
            Apr: brandColors.accent2,
            May: "#4CAF50",
            Jun: "#9C27B0",
            Jul: "#2196F3",
            Aug: "#FF5722",
            Sep: "#795548",
            Oct: "#607D8B",
            Nov: "#E91E63",
            Dec: "#9E9E9E",
          };

          let categoryColor = brandColors.primary;
          for (const [month, color] of Object.entries(colorMap)) {
            if (label.includes(month)) {
              categoryColor = color;
              break;
            }
          }

          return (
            <motion.tr
              key={index}
              className="hover:bg-gray-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <td className="px-4 py-3 flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: categoryColor }}
                ></div>
                <span className="font-medium">{label}</span>
              </td>
              <td className="px-4 py-3 text-right font-medium">
                CHF {value.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end">
                  <span className="mr-2">{percentage}%</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: categoryColor,
                      }}
                    ></div>
                  </div>
                </div>
              </td>
            </motion.tr>
          );
        }
      );

      // If the first dataset has categoryValues, add a divider and show breakdown
      const firstDataset = chartData.chartData.datasets[0];
      if (
        firstDataset &&
        firstDataset.categoryValues &&
        firstDataset.categoryValues.length > 0
      ) {
        // Add a divider row
        combinedRows.push(
          <tr key="divider" className="bg-gray-100">
            <td
              colSpan="3"
              className="px-4 py-2 text-sm font-medium text-gray-500"
            >
              Category breakdown for {firstDataset.label || "selected period"}
            </td>
          </tr>
        );

        // Add category breakdown rows
        const categoryTotal =
          firstDataset.totalValue ||
          firstDataset.categoryValues.reduce(
            (sum, cat) => sum + (cat.value || 0),
            0
          );

        firstDataset.categoryValues.forEach((category, idx) => {
          const value = category.value || 0;
          const percentage =
            categoryTotal > 0
              ? ((value / categoryTotal) * 100).toFixed(1)
              : "0.0";
          const categoryColor =
            category.color || getColorForCategory(category.id, category.name);

          combinedRows.push(
            <motion.tr
              key={`category-${idx}`}
              className="hover:bg-gray-50 bg-gray-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + 0.05 * idx, duration: 0.3 }}
            >
              <td className="px-4 py-3 flex items-center pl-8">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: categoryColor }}
                ></div>
                <span className="font-medium">{category.name}</span>
              </td>
              <td className="px-4 py-3 text-right font-medium">
                CHF {value.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end">
                  <span className="mr-2">{percentage}%</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: categoryColor,
                      }}
                    ></div>
                  </div>
                </div>
              </td>
            </motion.tr>
          );
        });
      }

      return combinedRows;
    }

    // For API response with nested chartData structure
    if (
      chartData.chartData &&
      chartData.chartData.labels &&
      chartData.chartData.datasets
    ) {
      const { labels, datasets } = chartData.chartData;

      // Make sure datasets[0] and datasets[0].data exist
      if (!datasets.length || !datasets[0] || !datasets[0].data) {
        return (
          <tr>
            <td colSpan="3" className="px-4 py-3 text-center">
              No data available for this chart type
            </td>
          </tr>
        );
      }

      const dataset = datasets[0]; // Use the first dataset for calculations
      const total = dataset.data.reduce((sum, value) => sum + (value || 0), 0);

      return labels.map((label, index) => {
        const value = dataset.data[index] || 0;
        const percentage =
          total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
        const categoryColor = Array.isArray(dataset.backgroundColor)
          ? dataset.backgroundColor[index]
          : dataset.borderColor || brandColors.accent2;

        return (
          <motion.tr
            key={index}
            className="hover:bg-gray-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
          >
            <td className="px-4 py-3 flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: categoryColor }}
              ></div>
              <span className="font-medium">{label}</span>
            </td>
            <td className="px-4 py-3 text-right font-medium">
              CHF {value.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end">
                <span className="mr-2">{percentage}%</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: categoryColor,
                    }}
                  ></div>
                </div>
              </div>
            </td>
          </motion.tr>
        );
      });
    }

    // For transformed data in line charts
    if (
      chartType === "line" &&
      chartData.chartData &&
      Array.isArray(chartData.chartData)
    ) {
      return chartData.chartData.map((category, index) => {
        const categoryColor =
          category.color || getColorForCategory(category.id, category.label);
        const total = getTotalValue();
        const percentage =
          total > 0 ? ((category.value / total) * 100).toFixed(1) : "0.0";

        return (
          <motion.tr
            key={index}
            className="hover:bg-gray-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
          >
            <td className="px-4 py-3 flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: categoryColor }}
              ></div>
              <span className="font-medium">{category.label}</span>
            </td>
            <td className="px-4 py-3 text-right font-medium">
              CHF {category.value.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end">
                <span className="mr-2">{percentage}%</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: categoryColor,
                    }}
                  ></div>
                </div>
              </div>
            </td>
          </motion.tr>
        );
      });
    }

    // Handle pie chart data format
    if (chartData.chartData && Array.isArray(chartData.chartData)) {
      return chartData.chartData.map((category, index) => {
        const categoryColor =
          category.color || getColorForCategory(category.id, category.label);
        return (
          <motion.tr
            key={index}
            className="hover:bg-gray-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
          >
            <td className="px-4 py-3 flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: categoryColor }}
              ></div>
              <span className="font-medium">{category.label}</span>
            </td>
            <td className="px-4 py-3 text-right font-medium">
              CHF {category.value.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end">
                <span className="mr-2">
                  {category.percentage ||
                    ((category.value / getTotalValue()) * 100).toFixed(1)}
                  %
                </span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${
                        category.percentage ||
                        ((category.value / getTotalValue()) * 100).toFixed(1)
                      }%`,
                      backgroundColor: categoryColor,
                    }}
                  ></div>
                </div>
              </div>
            </td>
          </motion.tr>
        );
      });
    }

    // Handle line chart data format
    if (
      chartData.labels &&
      chartData.datasets &&
      chartData.datasets.length > 0
    ) {
      const dataset = chartData.datasets[0];
      const total = getTotalValue();

      return chartData.labels.map((label, index) => {
        const value = dataset.data[index] || 0;
        const percentage =
          total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
        const categoryColor = Array.isArray(dataset.backgroundColor)
          ? dataset.backgroundColor[index]
          : dataset.borderColor || brandColors.primary;

        return (
          <motion.tr
            key={index}
            className="hover:bg-gray-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
          >
            <td className="px-4 py-3 flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: categoryColor }}
              ></div>
              <span className="font-medium">{label}</span>
            </td>
            <td className="px-4 py-3 text-right font-medium">
              CHF {value.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end">
                <span className="mr-2">{percentage}%</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: categoryColor,
                    }}
                  ></div>
                </div>
              </div>
            </td>
          </motion.tr>
        );
      });
    }

    return (
      <tr>
        <td colSpan="3" className="px-4 py-3 text-center">
          No data available
        </td>
      </tr>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d348b]"></div>
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
          <FaChartPie className="mr-2 text-[#7678ed]" />
          Expense Chart Visualization
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
        className="bg-white shadow-lg rounded-lg overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] px-6 py-4 text-white">
          <h2 className="text-lg font-medium">Expense Analysis</h2>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-auto">
              <div className="flex items-center space-x-2 mb-3">
                <FaFilter className="text-[#7678ed]" />
                <span className="font-medium">Chart Type:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    id: "pie",
                    label: "Pie",
                    icon: <FaChartPie className="mr-1" />,
                  },
                  {
                    id: "doughnut",
                    label: "Doughnut",
                    icon: <FaChartPie className="mr-1" />,
                  },
                  {
                    id: "line",
                    label: "Line",
                    icon: <FaChartLine className="mr-1" />,
                  },
                  {
                    id: "bar",
                    label: "Bar",
                    icon: <FaChartBar className="mr-1" />,
                  },
                ].map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center px-4 py-2 rounded-md text-sm transition-all ${
                      chartType === type.id
                        ? "text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => handleChartTypeChange(type.id)}
                    style={
                      chartType === type.id
                        ? {
                            background:
                              type.id === "line"
                                ? "linear-gradient(to right, #7678ed, #3d348b)"
                                : type.id === "pie"
                                ? "linear-gradient(to right, #f7b801, #f35b04)"
                                : "linear-gradient(to right, #3d348b, #7678ed)",
                          }
                        : {}
                    }
                  >
                    {type.icon} {type.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="flex items-center space-x-2 mb-3">
                <FaCalendarAlt className="text-[#7678ed]" />
                <span className="font-medium">Date Range:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    handleDateRangeChange("start", e.target.value)
                  }
                  className="border rounded px-3 py-2 text-sm focus:border-[#7678ed] focus:ring-1 focus:ring-[#7678ed] focus:outline-none"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateRangeChange("end", e.target.value)}
                  className="border rounded px-3 py-2 text-sm focus:border-[#7678ed] focus:ring-1 focus:ring-[#7678ed] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div
            className="flex justify-center items-center bg-gray-50 rounded-lg p-4"
            style={{ height: "400px" }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d348b] mb-3"></div>
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : (
              renderChart()
            )}
          </div>
        </div>
      </motion.div>

      {chartData && !isLoading && (
        <motion.div
          className="bg-white shadow-lg rounded-lg overflow-hidden mt-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-[#f7b801] to-[#f35b04] px-6 py-4 text-white">
            <h2 className="text-lg font-medium">Category Breakdown</h2>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#3d348b] mr-2"></div>
                <span className="font-medium">
                  Total: CHF {getTotalValue().toFixed(2)}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FaArrowDown className="mr-1" size={12} />
                <span>Scroll for more</span>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value (CHF)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">{getCategoryRows()}</tbody>
                <tfoot className="bg-gray-50 font-medium">
                  <tr>
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">
                      CHF {getTotalValue().toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChartData;
