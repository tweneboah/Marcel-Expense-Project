import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../../api/apiConfig";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaChartPie,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaStickyNote,
  FaPercentage,
  FaTachometerAlt,
  FaInfoCircle,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const BudgetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchBudgetDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await API.get(`/budgets/${id}`);
        if (response.data && response.data.success) {
          setBudget(response.data.data);
        } else {
          setError("Failed to fetch budget details");
        }
      } catch (err) {
        // Error handled by error context
        setError(
          err.response?.data?.message || "Failed to fetch budget details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetDetails();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await API.delete(`/budgets/${id}`);

      if (response.data && response.data.success) {
        navigate("/admin/budgets", {
          state: {
            notification: {
              type: "success",
              message: "Budget deleted successfully",
            },
          },
        });
      } else {
        throw new Error("Failed to delete budget");
      }
    } catch (err) {
      // Error handled by error context
      setError(err.response?.data?.message || "Failed to delete budget");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d348b]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <FaExclamationTriangle className="text-red-500 mr-3 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
        <Link
          to="/admin/budgets"
          className="inline-flex items-center px-4 py-2 bg-white border border-[#3d348b] text-[#3d348b] rounded-md hover:bg-[#3d348b] hover:text-white transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back to Budgets
        </Link>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <FaExclamationTriangle className="text-yellow-500 mr-3 mt-0.5" />
            <p className="text-yellow-700">Budget not found</p>
          </div>
        </div>
        <Link
          to="/admin/budgets"
          className="inline-flex items-center px-4 py-2 bg-white border border-[#3d348b] text-[#3d348b] rounded-md hover:bg-[#3d348b] hover:text-white transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back to Budgets
        </Link>
      </div>
    );
  }

  // Status color mapping
  const getStatusColorClass = (status) => {
    switch (status) {
      case "over":
        return "bg-[#f35b04]";
      case "warning":
        return "bg-[#f7b801]";
      case "under":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="px-4 py-6 md:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Link
            to="/admin/budgets"
            className="mr-4 p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
          >
            <FaArrowLeft className="text-[#3d348b]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaMoneyBillWave className="mr-2 text-[#7678ed]" />
              Budget Details
            </h1>
            <p className="text-gray-600">
              {budget.periodLabel || `${budget.month}/${budget.year}`}
              {budget.category && ` - ${budget.category.name}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/admin/budgets/edit/${budget._id}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-3 py-2 bg-white border border-[#7678ed] text-[#3d348b] rounded-md hover:bg-[#7678ed] hover:text-white transition-all duration-300 shadow-sm"
            >
              <FaEdit className="mr-2" />
              Edit
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center px-3 py-2 bg-white border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
          >
            <FaTrash className="mr-2" />
            Delete
          </motion.button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Budget Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] p-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FaInfoCircle className="mr-2" />
              Budget Information
            </h2>
          </div>
          <div className="p-5">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <FaCalendarAlt className="text-[#7678ed]" />
                <span className="text-sm text-gray-600">Period</span>
              </div>
              <p className="text-gray-800 font-medium">
                {budget.periodLabel || `${budget.month}/${budget.year}`}
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: budget.category?.color || "#7678ed",
                  }}
                ></div>
                <span className="text-sm text-gray-600">Category</span>
              </div>
              <p className="text-gray-800 font-medium">
                {budget.category?.name || "N/A"}
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <FaMoneyBillWave className="text-[#7678ed]" />
                <span className="text-sm text-gray-600">Budget Amount</span>
              </div>
              <p className="text-gray-800 font-medium">
                CHF {budget.amount?.toFixed(2) || "0.00"}
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <FaMapMarkerAlt className="text-[#7678ed]" />
                <span className="text-sm text-gray-600">Maximum Distance</span>
              </div>
              <p className="text-gray-800 font-medium">
                {budget.maxDistance || 0} km
              </p>
            </div>

            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <FaStickyNote className="text-[#7678ed]" />
                <span className="text-sm text-gray-600">Notes</span>
              </div>
              <p className="text-gray-800">
                {budget.notes || "No notes available"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Usage Stats Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#f7b801] to-[#f35b04] p-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FaTachometerAlt className="mr-2" />
              Usage Statistics
            </h2>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <span className="text-lg font-semibold">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColorClass(
                  budget.status
                )}`}
              >
                {budget.status?.toUpperCase() || "N/A"}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Usage</span>
                <span className="text-sm font-medium text-gray-700">
                  {budget.usage?.usagePercentage?.toFixed(1) || "0.0"}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getStatusColorClass(
                    budget.status
                  )}`}
                  style={{ width: `${budget.usage?.usagePercentage || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span
                  className="text-yellow-600"
                  style={{ marginLeft: `${budget.warningThreshold - 5}%` }}
                >
                  {budget.warningThreshold}%
                </span>
                <span
                  className="text-red-600"
                  style={{
                    marginLeft: `${
                      budget.criticalThreshold - budget.warningThreshold - 5
                    }%`,
                  }}
                >
                  {budget.criticalThreshold}%
                </span>
                <span>100%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Actual Cost</div>
                <div className="text-lg font-semibold text-[#f35b04]">
                  CHF {budget.usage?.actualCost?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Remaining</div>
                <div className="text-lg font-semibold text-[#3d348b]">
                  CHF{" "}
                  {budget.usage?.remainingAmount?.toFixed(2) ||
                    budget.amount?.toFixed(2) ||
                    "0.00"}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Distance</div>
                <div className="text-lg font-semibold text-gray-800">
                  {budget.usage?.actualDistance?.toFixed(1) || "0.0"} km
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Expenses</div>
                <div className="text-lg font-semibold text-gray-800">
                  {budget.usage?.expenseCount || 0}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Thresholds Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] p-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FaPercentage className="mr-2" />
              Thresholds & Settings
            </h2>
          </div>
          <div className="p-5">
            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Warning Threshold</span>
                <span className="font-medium text-[#f7b801]">
                  {budget.warningThreshold}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#f7b801] h-2 rounded-full"
                  style={{ width: `${budget.warningThreshold}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Critical Threshold</span>
                <span className="font-medium text-[#f35b04]">
                  {budget.criticalThreshold}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#f35b04] h-2 rounded-full"
                  style={{ width: `${budget.criticalThreshold}%` }}
                ></div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <div className="font-medium">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
                      style={{
                        backgroundColor: budget.isActive
                          ? "#10B981"
                          : "#6B7280",
                      }}
                    ></span>
                    {budget.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Scope</div>
                  <div className="font-medium">
                    {budget.isGlobal ? "Global" : "Individual"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <div className="text-sm text-gray-500 mb-1">Created At</div>
              <div className="font-medium">
                {new Date(budget.createdAt).toLocaleDateString()}
                <span className="text-gray-400 ml-2">
                  {new Date(budget.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-2 mb-1">
                Last Updated
              </div>
              <div className="font-medium">
                {new Date(budget.updatedAt).toLocaleDateString()}
                <span className="text-gray-400 ml-2">
                  {new Date(budget.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
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
                Are you sure you want to delete this budget? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteModal(false)}
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

export default BudgetDetails;
