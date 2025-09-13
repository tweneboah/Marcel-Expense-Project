import { useEffect, useRef } from "react";
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
  defaults,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Set default options for all charts
defaults.font.family = "Inter, sans-serif";
defaults.color = "#6B7280";

// Helper function to format Swiss Francs
export const formatChf = (value) => {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(value);
};

/**
 * Generic chart component that can render different chart types for expense data
 */
const ExpenseChart = ({
  chartType = "line",
  data,
  options = {},
  height = 300,
  width = "100%",
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // Define default options for different chart types
  const getDefaultOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null && label.includes("CHF")) {
                label += formatChf(context.parsed.y);
              } else {
                label += context.parsed.y;
              }
              return label;
            },
          },
        },
      },
    };

    switch (chartType) {
      case "line":
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => {
                  // Check if any dataset has CHF in the label
                  const hasCurrency = data?.datasets?.some((dataset) =>
                    dataset.label?.includes("CHF")
                  );
                  return hasCurrency ? formatChf(value) : value;
                },
              },
            },
          },
        };
      case "bar":
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => {
                  // Check if any dataset has CHF in the label
                  const hasCurrency = data?.datasets?.some((dataset) =>
                    dataset.label?.includes("CHF")
                  );
                  return hasCurrency ? formatChf(value) : value;
                },
              },
            },
          },
        };
      case "doughnut":
        return {
          ...baseOptions,
          cutout: "70%",
          plugins: {
            ...baseOptions.plugins,
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || "";
                  const value = context.raw || 0;
                  const percentage = context.parsed || 0;
                  return `${label}: ${formatChf(value)} (${(
                    percentage * 100
                  ).toFixed(1)}%)`;
                },
              },
            },
          },
        };
      default:
        return baseOptions;
    }
  };

  // Merge default options with user-provided options
  const mergedOptions = {
    ...getDefaultOptions(),
    ...options,
  };

  // Render the appropriate chart based on chartType
  const renderChart = () => {
    if (!data || !data.datasets) {
      return (
        <div className="flex items-center justify-center h-full">
          No data available
        </div>
      );
    }

    switch (chartType) {
      case "line":
        return <Line data={data} options={mergedOptions} />;
      case "bar":
        return <Bar data={data} options={mergedOptions} />;
      case "doughnut":
        return <Doughnut data={data} options={mergedOptions} />;
      default:
        return <Line data={data} options={mergedOptions} />;
    }
  };

  return (
    <div style={{ height, width }} ref={chartRef}>
      {renderChart()}
    </div>
  );
};

export default ExpenseChart;
