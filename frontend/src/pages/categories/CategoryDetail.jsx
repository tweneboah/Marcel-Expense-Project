import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiEdit,
  FiTag,
  FiCalendar,
  FiBarChart2,
  FiAlertTriangle,
  FiTrash2,
  FiX,
  FiAlertCircle,
  FiClock,
  FiInfo,
  FiActivity,
  FiDollarSign,
  FiChevronDown,
  FiChevronUp,
  FiDatabase,
  FiCheckCircle,
  FiFileText,
  FiPackage,
  FiPercent,
} from "react-icons/fi";
import { getCategoryById, deleteCategory } from "../../api/expenseApi";
import Button from "../../components/ui/Button";

// Confirmation Modal Component
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  isDeleting,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-3">
                <FiAlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#3d348b]">
                Delete Category
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#3d348b]">
                {categoryName}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={onConfirm}
                disabled={isDeleting}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format currency helper
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "CHF 0.00";
  return `CHF ${parseFloat(amount).toFixed(2)}`;
};

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  useEffect(() => {
    const fetchCategoryDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the dedicated function to fetch a category by ID
        const categoryData = await getCategoryById(id);
        setCategory(categoryData);
      } catch (err) {
        // Error handled by error context
        setError("Failed to load category details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetail();
  }, [id]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteCategory(id);
      navigate("/admin/categories", {
        state: {
          notification: {
            type: "success",
            message: `Category "${category.name}" has been deleted.`,
          },
        },
      });
    } catch (err) {
      setError(`Failed to delete category: ${err.message || "Unknown error"}`);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Process category data before using it
  const categoryData = category?.data || category;

  // Get the current time period's budget if available
  const getCurrentBudget = (period) => {
    if (
      !category ||
      !categoryData ||
      !categoryData.budgetLimits ||
      categoryData.budgetLimits.length === 0
    ) {
      return null;
    }

    return categoryData.budgetLimits.find(
      (limit) => limit.period === period && limit.isActive
    );
  };

  // Calculate usage percentage
  const getUsagePercentage = (budget) => {
    if (!budget || !categoryData || !categoryData.currentUsage) return 0;
    const usage = categoryData.currentUsage[budget.period]?.amount || 0;
    return Math.min(Math.round((usage / budget.amount) * 100), 100);
  };

  // Loading state animation
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="relative">
          <motion.div
            className="h-20 w-20 rounded-full border-4 border-[#7678ed]/30"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
          <motion.div
            className="h-20 w-20 rounded-full border-4 border-t-[#f7b801] border-r-transparent border-b-transparent border-l-transparent absolute top-0 left-0"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <FiTag className="h-8 w-8 text-[#3d348b]" />
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl shadow-sm flex items-center"
        >
          <FiAlertTriangle className="h-6 w-6 mr-3 flex-shrink-0 text-[#f35b04]" />
          <p>{error || "Category not found"}</p>
        </motion.div>
        <div className="mt-6">
          <Button
            onClick={() => navigate("/admin/categories")}
            variant="primary"
          >
            <FiArrowLeft className="mr-2" /> Back to Categories
          </Button>
        </div>
      </div>
    );
  }

  const monthlyBudget = getCurrentBudget("monthly");
  const quarterlyBudget = getCurrentBudget("quarterly");
  const yearlyBudget = getCurrentBudget("yearly");

  const monthlyUsage = getUsagePercentage(monthlyBudget);
  const quarterlyUsage = getUsagePercentage(quarterlyBudget);
  const yearlyUsage = getUsagePercentage(yearlyBudget);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-5xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        categoryName={categoryData.name}
        isDeleting={isDeleting}
      />

      {/* Header with back button */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        variants={itemVariants}
      >
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/admin/categories")}
            variant="secondary"
            icon={<FiArrowLeft />}
          >
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#3d348b]">
            Category Details
          </h1>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="danger"
            onClick={handleDeleteClick}
            icon={<FiTrash2 />}
          >
            Delete
          </Button>
          <Link to={`/admin/categories/${id}/edit`}>
            <Button variant="accent" icon={<FiEdit />}>
              Edit
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Category details card */}
      <motion.div
        className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100"
        variants={itemVariants}
      >
        {/* Category header */}
        <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 p-3 rounded-full">
              <FiTag className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {categoryData.name}
              </h2>
              {categoryData.description && (
                <p className="text-white/80 mt-1">{categoryData.description}</p>
              )}
            </div>
          </div>
          <div
            className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                    bg-white/20 text-white"
          >
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              {categoryData.isActive ? (
                <>
                  <FiCheckCircle className="mr-1.5" />
                  Active
                </>
              ) : (
                <>
                  <FiX className="mr-1.5" />
                  Inactive
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Budget information */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-[#3d348b] mb-4 flex items-center">
            <FiBarChart2 className="mr-2 text-[#f7b801]" /> Budget Information
          </h3>

          {!monthlyBudget && !quarterlyBudget && !yearlyBudget ? (
            <div className="bg-[#7678ed]/5 p-5 rounded-xl text-center">
              <FiInfo className="h-10 w-10 mx-auto mb-2 text-[#7678ed]" />
              <p className="text-gray-600">
                No budget limits set for this category.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Monthly budget */}
              {monthlyBudget && (
                <motion.div
                  className="bg-[#7678ed]/5 p-5 rounded-xl"
                  whileHover={{
                    y: -3,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="bg-[#f7b801]/20 p-2 rounded-full mr-3">
                        <FiCalendar className="h-5 w-5 text-[#f7b801]" />
                      </div>
                      <span className="font-medium text-[#3d348b]">
                        Monthly Budget
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#f35b04]">
                      CHF {monthlyBudget.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${monthlyUsage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        monthlyUsage > 90
                          ? "bg-[#f35b04]"
                          : monthlyUsage > 75
                          ? "bg-[#f7b801]"
                          : "bg-[#7678ed]"
                      }`}
                    ></motion.div>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-[#3d348b]">
                      Used:{" "}
                      <span className="font-semibold">
                        CHF{" "}
                        {(monthlyBudget.amount * (monthlyUsage / 100)).toFixed(
                          2
                        )}
                      </span>
                    </span>
                    <span
                      className={`font-medium ${
                        monthlyUsage > 90
                          ? "text-[#f35b04]"
                          : monthlyUsage > 75
                          ? "text-[#f7b801]"
                          : "text-[#7678ed]"
                      }`}
                    >
                      {monthlyUsage}% of budget
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Quarterly budget */}
              {quarterlyBudget && (
                <motion.div
                  className="bg-[#7678ed]/5 p-5 rounded-xl"
                  whileHover={{
                    y: -3,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="bg-[#f7b801]/20 p-2 rounded-full mr-3">
                        <FiCalendar className="h-5 w-5 text-[#f7b801]" />
                      </div>
                      <span className="font-medium text-[#3d348b]">
                        Quarterly Budget
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#f35b04]">
                      CHF {quarterlyBudget.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${quarterlyUsage}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-full rounded-full ${
                        quarterlyUsage > 90
                          ? "bg-[#f35b04]"
                          : quarterlyUsage > 75
                          ? "bg-[#f7b801]"
                          : "bg-[#7678ed]"
                      }`}
                    ></motion.div>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-[#3d348b]">
                      Used:{" "}
                      <span className="font-semibold">
                        CHF{" "}
                        {(
                          quarterlyBudget.amount *
                          (quarterlyUsage / 100)
                        ).toFixed(2)}
                      </span>
                    </span>
                    <span
                      className={`font-medium ${
                        quarterlyUsage > 90
                          ? "text-[#f35b04]"
                          : quarterlyUsage > 75
                          ? "text-[#f7b801]"
                          : "text-[#7678ed]"
                      }`}
                    >
                      {quarterlyUsage}% of budget
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Yearly budget */}
              {yearlyBudget && (
                <motion.div
                  className="bg-[#7678ed]/5 p-5 rounded-xl"
                  whileHover={{
                    y: -3,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className="bg-[#f7b801]/20 p-2 rounded-full mr-3">
                        <FiCalendar className="h-5 w-5 text-[#f7b801]" />
                      </div>
                      <span className="font-medium text-[#3d348b]">
                        Yearly Budget
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#f35b04]">
                      CHF {yearlyBudget.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${yearlyUsage}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className={`h-full rounded-full ${
                        yearlyUsage > 90
                          ? "bg-[#f35b04]"
                          : yearlyUsage > 75
                          ? "bg-[#f7b801]"
                          : "bg-[#7678ed]"
                      }`}
                    ></motion.div>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-[#3d348b]">
                      Used:{" "}
                      <span className="font-semibold">
                        CHF{" "}
                        {(yearlyBudget.amount * (yearlyUsage / 100)).toFixed(2)}
                      </span>
                    </span>
                    <span
                      className={`font-medium ${
                        yearlyUsage > 90
                          ? "text-[#f35b04]"
                          : yearlyUsage > 75
                          ? "text-[#f7b801]"
                          : "text-[#7678ed]"
                      }`}
                    >
                      {yearlyUsage}% of budget
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Advanced Details */}
        <div className="p-6">
          <motion.div
            className="flex justify-between items-center cursor-pointer bg-[#7678ed]/5 p-4 rounded-xl hover:bg-[#7678ed]/10 transition-colors"
            onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <h3 className="text-lg font-semibold text-[#3d348b] flex items-center">
              <FiInfo className="mr-2 text-[#7678ed]" /> Advanced Details
            </h3>
            <motion.div
              animate={{ rotate: showAdvancedDetails ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FiChevronDown className="text-[#7678ed] h-5 w-5" />
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {showAdvancedDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-6 overflow-hidden"
              >
                {/* Timestamps */}
                <motion.div
                  className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h4 className="font-medium text-[#3d348b] mb-3 flex items-center text-lg">
                    <FiClock className="mr-2 text-[#f7b801]" /> Timestamps
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#f7b801]/5 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Created At</p>
                      <p className="font-medium text-[#3d348b]">
                        {formatDate(categoryData.createdAt)}
                      </p>
                    </div>
                    <div className="bg-[#f35b04]/5 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                      <p className="font-medium text-[#3d348b]">
                        {formatDate(categoryData.updatedAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Current Usage Section */}
                {categoryData.currentUsage && (
                  <motion.div
                    className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h4 className="font-medium text-[#3d348b] mb-3 flex items-center text-lg">
                      <FiActivity className="mr-2 text-[#f7b801]" /> Current
                      Usage
                    </h4>

                    <div className="space-y-4">
                      {/* Monthly Usage */}
                      {categoryData.currentUsage.monthly && (
                        <div className="border-b border-gray-100 pb-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="bg-[#7678ed]/10 p-2 rounded-full mr-3">
                                <FiCalendar className="h-5 w-5 text-[#7678ed]" />
                              </div>
                              <span className="font-medium text-[#3d348b]">
                                Monthly Usage
                              </span>
                            </div>
                            <span className="font-bold text-[#f35b04]">
                              {formatCurrency(
                                categoryData.currentUsage.monthly.amount
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 ml-10">
                            Last Updated:{" "}
                            <span className="text-[#7678ed]">
                              {formatDate(
                                categoryData.currentUsage.monthly.lastUpdated
                              )}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Quarterly Usage */}
                      {categoryData.currentUsage.quarterly && (
                        <div className="border-b border-gray-100 pb-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="bg-[#7678ed]/10 p-2 rounded-full mr-3">
                                <FiCalendar className="h-5 w-5 text-[#7678ed]" />
                              </div>
                              <span className="font-medium text-[#3d348b]">
                                Quarterly Usage
                              </span>
                            </div>
                            <span className="font-bold text-[#f35b04]">
                              {formatCurrency(
                                categoryData.currentUsage.quarterly.amount
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 ml-10">
                            Last Updated:{" "}
                            <span className="text-[#7678ed]">
                              {formatDate(
                                categoryData.currentUsage.quarterly.lastUpdated
                              )}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Yearly Usage */}
                      {categoryData.currentUsage.yearly && (
                        <div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="bg-[#7678ed]/10 p-2 rounded-full mr-3">
                                <FiCalendar className="h-5 w-5 text-[#7678ed]" />
                              </div>
                              <span className="font-medium text-[#3d348b]">
                                Yearly Usage
                              </span>
                            </div>
                            <span className="font-bold text-[#f35b04]">
                              {formatCurrency(
                                categoryData.currentUsage.yearly.amount
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 ml-10">
                            Last Updated:{" "}
                            <span className="text-[#7678ed]">
                              {formatDate(
                                categoryData.currentUsage.yearly.lastUpdated
                              )}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Budget Limits Details */}
                {categoryData.budgetLimits &&
                  categoryData.budgetLimits.length > 0 && (
                    <motion.div
                      className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="font-medium text-[#3d348b] mb-3 flex items-center text-lg">
                        <FiDollarSign className="mr-2 text-[#f7b801]" /> Budget
                        Limits
                      </h4>

                      <div className="space-y-4">
                        {categoryData.budgetLimits.map((limit, index) => (
                          <motion.div
                            key={index}
                            className={`p-4 rounded-lg ${
                              index < categoryData.budgetLimits.length - 1
                                ? "border-b border-gray-100 mb-2"
                                : ""
                            } bg-gradient-to-r from-white to-[#f7b801]/5`}
                            whileHover={{ x: 5 }}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium text-[#3d348b] flex items-center">
                                  <FiPackage className="mr-2 text-[#7678ed]" />
                                  {limit.period.charAt(0).toUpperCase() +
                                    limit.period.slice(1)}{" "}
                                  Budget
                                </span>
                                <p className="text-xs text-gray-500 mt-1 ml-6">
                                  Start Date:{" "}
                                  <span className="text-[#7678ed]">
                                    {formatDate(limit.startDate)}
                                  </span>
                                </p>
                              </div>
                              <span className="font-bold text-[#f35b04] bg-white px-3 py-1 rounded-full shadow-sm">
                                {formatCurrency(limit.amount)}
                              </span>
                            </div>
                            {limit.notificationThreshold && (
                              <div className="flex items-center ml-6 mt-2">
                                <FiPercent className="text-[#f7b801] mr-1 h-4 w-4" />
                                <p className="text-xs text-gray-600">
                                  Notification Threshold:{" "}
                                  <span className="font-medium text-[#3d348b]">
                                    {limit.notificationThreshold}%
                                  </span>
                                </p>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                {/* Technical Details */}
                <motion.div
                  className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h4 className="font-medium text-[#3d348b] mb-3 flex items-center text-lg">
                    <FiDatabase className="mr-2 text-[#f7b801]" /> Technical
                    Details
                  </h4>
                  <div className="bg-[#3d348b]/5 p-3 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Category ID</p>
                    <p className="font-medium text-[#3d348b] break-all">{id}</p>
                  </div>
                  {categoryData.__v !== undefined && (
                    <div className="bg-[#f35b04]/5 p-3 rounded-lg mt-3">
                      <p className="text-sm text-gray-500 mb-1">Version</p>
                      <p className="font-medium text-[#3d348b]">
                        {categoryData.__v}
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CategoryDetail;
