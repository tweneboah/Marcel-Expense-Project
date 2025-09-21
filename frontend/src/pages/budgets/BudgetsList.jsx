import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../../api/apiConfig";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaTimes,
  FaCheck,
  FaChartBar,
} from "react-icons/fa";

const BudgetsList = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a notification in the location state (e.g., after redirect)
    if (location.state?.notification) {
      setNotification(location.state.notification);
      // Clear the location state to prevent showing notification again on refresh
      navigate(location.pathname, { replace: true });

      // Auto-dismiss notification after 5 seconds
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await API.get(`/budgets?page=${currentPage}&limit=10`);

        if (response.data && response.data.data) {
          const budgetsData = Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data];
          setBudgets(budgetsData);
          setTotalPages(Math.ceil(response.data.count / 10));
          setError(null);
        } else {
          setBudgets([]);
          setError("No budget data received from server");
        }
      } catch (err) {
        // Error handled by error context
        setError(err.response?.data?.message || "Failed to fetch budgets");
        setBudgets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [currentPage]);

  const openDeleteModal = (budget) => {
    setBudgetToDelete(budget);
  };

  const closeDeleteModal = () => {
    setBudgetToDelete(null);
    setError(null);
  };

  const handleDelete = async () => {
    if (!budgetToDelete) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await API.delete(`/budgets/${budgetToDelete._id}`);

      if (response.data && response.data.success) {
        // Remove the deleted budget from the list
        setBudgets(
          budgets.filter((budget) => budget._id !== budgetToDelete._id)
        );

        // Show success notification
        setNotification({
          type: "success",
          message: "Budget deleted successfully",
        });

        // Close the modal
        closeDeleteModal();
      } else {
        throw new Error("Failed to delete budget");
      }
    } catch (err) {
      // Error handled by error context
      setError(err.response?.data?.message || "Failed to delete budget");
    } finally {
      setDeleting(false);
    }
  };

  const getBudgetStatusBadge = (budget) => {
    if (!budget)
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
          No data
        </span>
      );

    const status = budget.status || (budget.usage ? budget.usage.status : null);

    if (status === "under")
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500 text-white">
          Under Budget
        </span>
      );
    if (status === "warning")
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#f7b801] text-white">
          Warning
        </span>
      );
    if (status === "critical" || status === "over")
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#f35b04] text-white">
          Critical
        </span>
      );
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#7678ed] text-white">
        No status
      </span>
    );
  };

  if (loading && budgets.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d348b]"></div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="px-4 py-6 md:px-6 lg:px-8"
    >
      {notification && (
        <div
          className={`mb-4 p-4 rounded-md flex justify-between items-center ${
            notification.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          <p className="flex items-center">
            {notification.type === "success" ? (
              <FaCheck className="mr-2" />
            ) : (
              <FaExclamationTriangle className="mr-2" />
            )}
            {notification.message}
          </p>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <motion.div
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl font-bold text-white flex items-center">
                <FaMoneyBillWave className="mr-2" />
                Budgets Management
              </h1>
              <p className="text-white/80 mt-1">
                Create and manage your expense budgets
              </p>
            </motion.div>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/budgets">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white text-[#3d348b] rounded-md flex items-center font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <FaChartBar className="mr-2" />
                  Dashboard
                </motion.button>
              </Link>
              <Link to="/admin/budgets/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-[#f7b801] to-[#f35b04] text-white rounded-md flex items-center font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <FaPlus className="mr-2" />
                  New Budget
                </motion.button>
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Period
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Budget (CHF)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Used (CHF)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Remaining (CHF)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgets.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <FaMoneyBillWave className="text-4xl text-gray-300 mb-3" />
                      <p className="text-lg font-medium">No budgets found</p>
                      <p className="text-sm mt-1">
                        Create a new budget to get started
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <motion.tbody
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {budgets.map((budget, index) => (
                    <motion.tr
                      key={budget._id}
                      variants={item}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {budget.periodLabel ||
                            `${budget.month}/${budget.year}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className="h-3 w-3 rounded-full mr-2"
                            style={{
                              backgroundColor:
                                budget.category?.color || "#7678ed",
                            }}
                          ></span>
                          <span className="text-gray-900">
                            {budget.category?.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {budget.amount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-[#f35b04]">
                        {budget.usage?.actualCost
                          ? budget.usage.actualCost.toFixed(2)
                          : "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-[#3d348b]">
                        {budget.usage?.remainingAmount
                          ? budget.usage.remainingAmount.toFixed(2)
                          : budget.amount?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center">
                          {getBudgetStatusBadge(budget)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <Link to={`/admin/budgets/${budget._id}`}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-full bg-[#7678ed]/10 text-[#3d348b] hover:bg-[#7678ed]/20 transition-colors"
                            >
                              <FaEye size={16} />
                            </motion.button>
                          </Link>
                          <Link to={`/admin/budgets/edit/${budget._id}`}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-full bg-[#f7b801]/10 text-[#f7b801] hover:bg-[#f7b801]/20 transition-colors"
                            >
                              <FaEdit size={16} />
                            </motion.button>
                          </Link>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openDeleteModal(budget)}
                            className="p-2 rounded-full bg-[#f35b04]/10 text-[#f35b04] hover:bg-[#f35b04]/20 transition-colors"
                          >
                            <FaTrash size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{currentPage}</span>{" "}
                of <span className="font-medium">{totalPages}</span>
              </p>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-[#3d348b] border border-[#3d348b] hover:bg-[#3d348b] hover:text-white"
                  }`}
                >
                  <FaChevronLeft className="mr-2" size={12} />
                  Previous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-[#3d348b] border border-[#3d348b] hover:bg-[#3d348b] hover:text-white"
                  }`}
                >
                  Next
                  <FaChevronRight className="ml-2" size={12} />
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {budgetToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-red-50 p-4 border-b border-red-100">
              <h3 className="text-lg font-medium text-red-800 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                Confirm Deletion
              </h3>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                  <p className="flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    {error}
                  </p>
                </div>
              )}
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the budget for{" "}
                <span className="font-medium">
                  {budgetToDelete.periodLabel ||
                    `${budgetToDelete.month}/${budgetToDelete.year}`}
                </span>
                {budgetToDelete.category &&
                  ` - ${budgetToDelete.category.name}`}
                ?
                <br />
                <br />
                This action cannot be undone and will remove all associated
                data.
              </p>
              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="mr-2" />
                      Delete
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default BudgetsList;
