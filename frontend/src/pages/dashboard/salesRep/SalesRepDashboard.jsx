import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getExpenses } from "../../../api/expenseApi";
import { FiPlus, FiFileText, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

const SalesRepDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenseSummary, setExpenseSummary] = useState({
    count: 0,
    totalDistance: 0,
    totalAmount: 0,
    recentExpenses: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        setLoading(true);

        // Get current month's start and end dates
        const now = new Date();
        const startOfMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        ).toISOString();
        const endOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        ).toISOString();

        // Fetch expenses for current month
        const monthlyData = await getExpenses({
          startDate: startOfMonth,
          endDate: endOfMonth,
          sort: "-journeyDate",
          limit: 50, // Get enough data to calculate totals
        });

        // Fetch recent expenses (last 3)
        const recentData = await getExpenses({
          sort: "-journeyDate",
          limit: 3,
        });

        // Calculate summary data
        const expenses = Array.isArray(monthlyData.data)
          ? monthlyData.data
          : monthlyData;
        const recentExpenses = Array.isArray(recentData.data)
          ? recentData.data
          : recentData;

        let totalDistance = 0;
        let totalAmount = 0;

        expenses.forEach((expense) => {
          totalDistance += expense.distance || 0;
          totalAmount += expense.totalCost || 0;
        });

        setExpenseSummary({
          count: expenses.length,
          totalDistance: totalDistance,
          totalAmount: totalAmount,
          recentExpenses: recentExpenses.slice(0, 3),
        });
      } catch (err) {
        // Error handled by error context
        setError("Failed to load expense data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseData();
  }, []);

  // Format currency (CHF)
  const formatCurrency = (amount) => {
    return `CHF ${amount.toFixed(2)}`;
  };

  // Format date to display in a user-friendly format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3d348b]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#3d348b]">
          Sales Rep Dashboard
        </h1>
        <p className="text-gray-600">Welcome, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          className="bg-white p-6 rounded-lg shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="font-bold text-xl mb-2 text-[#3d348b]">My Expenses</h2>
          <p className="text-gray-600 mb-4">Summary of your travel expenses</p>
          <div className="bg-[#3d348b]/10 text-[#3d348b] p-3 rounded-md">
            <span className="font-bold text-2xl">{expenseSummary.count}</span>
            <span className="ml-2">Expenses this month</span>
          </div>
          <Link
            to="/expenses"
            className="mt-4 inline-flex items-center text-[#3d348b] hover:text-[#f35b04] text-sm"
          >
            View all expenses <FiArrowRight className="ml-1" />
          </Link>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="font-bold text-xl mb-2 text-[#3d348b]">
            Distance Traveled
          </h2>
          <p className="text-gray-600 mb-4">Total kilometers this month</p>
          <div className="bg-[#f7b801]/10 text-[#f35b04] p-3 rounded-md">
            <span className="font-bold text-2xl">
              {expenseSummary.totalDistance.toFixed(1)}
            </span>
            <span className="ml-2">km</span>
          </div>
          <Link
            to="/expenses"
            className="mt-4 inline-flex items-center text-[#3d348b] hover:text-[#f35b04] text-sm"
          >
            View details <FiArrowRight className="ml-1" />
          </Link>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="font-bold text-xl mb-2 text-[#3d348b]">
            Reimbursement
          </h2>
          <p className="text-gray-600 mb-4">Total reimbursement amount</p>
          <div className="bg-[#f35b04]/10 text-[#f35b04] p-3 rounded-md">
            <span className="font-bold text-2xl">
              {formatCurrency(expenseSummary.totalAmount)}
            </span>
            <span className="ml-2">This month</span>
          </div>
          <Link
            to="/expenses"
            className="mt-4 inline-flex items-center text-[#3d348b] hover:text-[#f35b04] text-sm"
          >
            View details <FiArrowRight className="ml-1" />
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="mt-8 bg-white p-6 rounded-lg shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl text-[#3d348b]">Recent Trips</h2>
          <Link
            to="/expenses/create"
            className="bg-[#3d348b] text-white px-4 py-2 rounded-md hover:bg-[#7678ed] transition-colors duration-200 flex items-center"
          >
            <FiPlus className="mr-1" /> Add New Trip
          </Link>
        </div>

        {expenseSummary.recentExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
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
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenseSummary.recentExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(expense.journeyDate || expense.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.startingPoint || expense.startLocation} →{" "}
                      {expense.destinationPoint || expense.endLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.distance
                        ? `${expense.distance.toFixed(1)} km`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(expense.totalCost || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          expense.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : expense.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {expense.status
                          ? expense.status.charAt(0).toUpperCase() +
                            expense.status.slice(1)
                          : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <FiFileText className="mx-auto mb-4 text-4xl text-gray-300" />
            <p>No expense records found for this month.</p>
            <Link
              to="/expenses/create"
              className="inline-flex items-center mt-4 text-[#3d348b] hover:text-[#f35b04]"
            >
              Create your first expense <FiArrowRight className="ml-1" />
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SalesRepDashboard;
