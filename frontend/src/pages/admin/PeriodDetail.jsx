import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPeriodDetail } from "../../api/analyticsApi";
import ExpenseChart from "../../components/charts/ExpenseChart";

const PeriodDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [chartData, setChartData] = useState(null);

  // Get period parameters from URL
  const periodType = searchParams.get("periodType") || "month";
  const periodValue =
    searchParams.get("periodValue") || new Date().getMonth() + 1;
  const year = searchParams.get("year") || new Date().getFullYear();
  const userId = searchParams.get("userId");

  // Fetch period detail data
  useEffect(() => {
    const fetchPeriodDetail = async () => {
      try {
        setLoading(true);
        const response = await getPeriodDetail({
          periodType,
          periodValue,
          year,
          userId,
        });
        setPeriodData(response.data);

        // Prepare chart data
        if (response.data?.expenses?.length > 0) {
          prepareChartData(response.data.expenses);
        }
      } catch (err) {
        setError("Failed to load period detail");
        // Error handled by error context
      } finally {
        setLoading(false);
      }
    };

    fetchPeriodDetail();
  }, [periodType, periodValue, year, userId]);

  // Prepare chart data from expenses
  const prepareChartData = (expenses) => {
    // Group data by date
    const expensesByDate = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date).toLocaleDateString("de-CH");
      if (!acc[date]) {
        acc[date] = {
          totalCost: 0,
          totalDistance: 0,
          count: 0,
        };
      }
      acc[date].totalCost += expense.cost;
      acc[date].totalDistance += expense.distance;
      acc[date].count += 1;
      return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(expensesByDate).sort((a, b) => {
      return (
        new Date(a.split(".").reverse().join("-")) -
        new Date(b.split(".").reverse().join("-"))
      );
    });

    const data = {
      labels: sortedDates,
      datasets: [
        {
          label: "Daily Cost (CHF)",
          data: sortedDates.map((date) => expensesByDate[date].totalCost),
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgb(255, 99, 132)",
          borderWidth: 1,
          yAxisID: "y",
        },
        {
          label: "Daily Distance (km)",
          data: sortedDates.map((date) => expensesByDate[date].totalDistance),
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          borderColor: "rgb(53, 162, 235)",
          borderWidth: 1,
          yAxisID: "y1",
        },
      ],
    };

    setChartData(data);
  };

  // Chart options with dual Y axes
  const chartOptions = {
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Cost (CHF)",
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
          text: "Distance (km)",
        },
      },
    },
  };

  // Format period label
  const formatPeriodLabel = () => {
    if (!periodData) return "";

    return periodData.periodInfo.label;
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/admin/analytics");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="mr-4 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          &larr; Back to Analytics
        </button>
        <h1 className="text-3xl font-bold">
          Period Detail: {formatPeriodLabel()}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading data...</p>
        </div>
      ) : periodData ? (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500">Total Expenses</h3>
              <p className="text-2xl font-bold">
                {periodData.summary.totalExpenses}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500">Total Distance</h3>
              <p className="text-2xl font-bold">
                {periodData.summary.totalDistance.toFixed(1)} km
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500">Total Cost</h3>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("de-CH", {
                  style: "currency",
                  currency: "CHF",
                }).format(periodData.summary.totalCost)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500">Average Cost</h3>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("de-CH", {
                  style: "currency",
                  currency: "CHF",
                }).format(periodData.summary.averageCost)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-500">Average Distance</h3>
              <p className="text-2xl font-bold">
                {periodData.summary.averageDistance.toFixed(1)} km
              </p>
            </div>
          </div>

          {/* Daily Chart */}
          {chartData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Daily Expense Distribution
              </h2>
              <div className="h-80">
                <ExpenseChart
                  chartType="bar"
                  data={chartData}
                  options={chartOptions}
                  height={300}
                />
              </div>
            </div>
          )}

          {/* Expense List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Expense Details</h2>

            {periodData.expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Distance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {periodData.expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(expense.date).toLocaleDateString("de-CH")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.from} &rarr; {expense.to}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.distance.toFixed(1)} km
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Intl.NumberFormat("de-CH", {
                            style: "currency",
                            currency: "CHF",
                          }).format(expense.cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 mr-2 rounded-full"
                              style={{
                                backgroundColor: expense.category.color,
                              }}
                            ></div>
                            <span className="text-sm text-gray-900">
                              {expense.category.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${
                              expense.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : expense.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {expense.status.charAt(0).toUpperCase() +
                              expense.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  No expenses found for this period
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </div>
  );
};

export default PeriodDetail;
