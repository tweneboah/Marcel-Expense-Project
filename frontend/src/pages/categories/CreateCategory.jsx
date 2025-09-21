import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  createCategory,
  updateCategory,
  getExpenseCategories,
  getCategoryById,
} from "../../api/expenseApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  FiPlusCircle,
  FiTrash2,
  FiCalendar,
  FiAlertTriangle,
  FiDollarSign,
  FiPercent,
  FiToggleRight,
  FiToggleLeft,
  FiTag,
  FiFileText,
  FiLoader,
} from "react-icons/fi";

const BudgetLimitForm = ({ index, limit, updateLimit, removeLimit }) => {
  const periodOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-4 border-2 rounded-lg border-[#14213D]/10 bg-white mb-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-[#14213D]">
          Budget Period {index + 1}
        </h3>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => removeLimit(index)}
          className="px-2"
        >
          <FiTrash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[#14213D] mb-2">
            <FiDollarSign className="h-4 w-4 text-[#FCA311]" />
            Budget Amount (CHF) <span className="text-[#FCA311]">*</span>
          </label>
          <input
            type="number"
            value={limit.amount}
            onChange={(e) =>
              updateLimit(index, "amount", parseFloat(e.target.value))
            }
            placeholder="Enter budget amount"
            min="0"
            step="0.01"
            required
            className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#FCA311] focus:ring-[#FCA311]/20 focus:ring-2 transition-all duration-200"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[#14213D] mb-2">
            <FiCalendar className="h-4 w-4 text-[#FCA311]" />
            Period <span className="text-[#FCA311]">*</span>
          </label>
          <select
            value={limit.period}
            onChange={(e) => updateLimit(index, "period", e.target.value)}
            required
            className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#FCA311] focus:ring-[#FCA311]/20 focus:ring-2 transition-all duration-200"
          >
            <option value="">Select Period</option>
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[#14213D] mb-2">
            <FiCalendar className="h-4 w-4 text-[#FCA311]" />
            Start Date <span className="text-[#FCA311]">*</span>
          </label>
          <input
            type="date"
            value={limit.startDate}
            onChange={(e) => updateLimit(index, "startDate", e.target.value)}
            required
            className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#FCA311] focus:ring-[#FCA311]/20 focus:ring-2 transition-all duration-200"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[#14213D] mb-2">
            <FiPercent className="h-4 w-4 text-[#FCA311]" />
            Notification Threshold (%)
          </label>
          <input
            type="number"
            value={limit.notificationThreshold || ""}
            onChange={(e) =>
              updateLimit(
                index,
                "notificationThreshold",
                parseFloat(e.target.value)
              )
            }
            placeholder="e.g. 80"
            min="0"
            max="100"
            className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#FCA311] focus:ring-[#FCA311]/20 focus:ring-2 transition-all duration-200"
          />
        </div>
      </div>
    </motion.div>
  );
};

const CreateCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    budgetLimits: [],
  });

  // Fetch category data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchCategoryData = async () => {
        try {
          setFetchLoading(true);
          const response = await getCategoryById(id);

          // API might return data in a nested 'data' property
          const categoryData = response.data || response;

          if (!categoryData) {
            setError("Category not found");
            return;
          }

          // Prepare budget limits data
          const budgetLimits =
            categoryData.budgetLimits?.map((limit) => ({
              ...limit,
              startDate: limit.startDate
                ? new Date(limit.startDate).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            })) || [];

          setFormData({
            name: categoryData.name || "",
            description: categoryData.description || "",
            isActive: categoryData.isActive !== false, // default to true if not specified
            budgetLimits,
          });
        } catch (err) {
          // Error handled by error context
          setError("Failed to load category data. Please try again.");
        } finally {
          setFetchLoading(false);
        }
      };

      fetchCategoryData();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const addBudgetLimit = () => {
    setFormData({
      ...formData,
      budgetLimits: [
        ...formData.budgetLimits,
        {
          amount: 0,
          period: "",
          startDate: new Date().toISOString().split("T")[0],
          notificationThreshold: 80,
        },
      ],
    });
  };

  const updateBudgetLimit = (index, field, value) => {
    const updatedLimits = [...formData.budgetLimits];
    updatedLimits[index] = {
      ...updatedLimits[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      budgetLimits: updatedLimits,
    });
  };

  const removeBudgetLimit = (index) => {
    setFormData({
      ...formData,
      budgetLimits: formData.budgetLimits.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert budget amounts to numbers
      const categoryData = {
        ...formData,
        budgetLimits: formData.budgetLimits.map((limit) => ({
          ...limit,
          amount: parseFloat(limit.amount),
          notificationThreshold: limit.notificationThreshold
            ? parseFloat(limit.notificationThreshold)
            : 80,
        })),
      };

      let response;
      if (isEditMode) {
        response = await updateCategory(id, categoryData);
      } else {
        response = await createCategory(categoryData);
      }

      navigate("/admin/categories");
    } catch (err) {
      // Error handled by error context
      setError(
        err.response?.data?.message ||
          err.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } category. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 flex items-center justify-center">
            <FiLoader className="h-8 w-8 text-[#FCA311] animate-spin" />
          </div>
          <div className="absolute inset-0 border-4 border-[#FCA311]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-[#FCA311] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#FCA311]/10 p-3 rounded-full">
            <FiTag className="h-8 w-8 text-[#FCA311]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#14213D]">
              {isEditMode ? "Edit" : "Create"} Expense Category
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode
                ? "Update your expense category details and budget limits"
                : "Add a new category with optional budget limits"}
            </p>
          </div>
        </div>

        <Card className="border border-[#14213D]/10 shadow-lg">
          {error && (
            <motion.div
              className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiAlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Basic Category Information */}
              <motion.div variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-semibold text-[#14213D] border-b border-[#14213D]/10 pb-2">
                  Category Information
                </h2>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#14213D] mb-2">
                    <FiTag className="h-4 w-4 text-[#FCA311]" />
                    Category Name <span className="text-[#FCA311]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter category name"
                    required
                    className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#FCA311] focus:ring-[#FCA311]/20 focus:ring-2 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#14213D] mb-2">
                    <FiFileText className="h-4 w-4 text-[#FCA311]" />
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter category description"
                    rows={3}
                    className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#FCA311] focus:ring-[#FCA311]/20 focus:ring-2 transition-all duration-200"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#14213D]">
                    <span>Active</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: !prev.isActive,
                      }))
                    }
                    className="flex items-center focus:outline-none"
                  >
                    {formData.isActive ? (
                      <div className="flex items-center">
                        <FiToggleRight className="h-8 w-8 text-[#FCA311]" />
                        <span className="ml-2 text-sm text-[#14213D]">
                          Active
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <FiToggleLeft className="h-8 w-8 text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">
                          Inactive
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Budget Limits Section */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#14213D]/10 pb-2">
                  <h2 className="text-xl font-semibold text-[#14213D]">
                    Budget Limits (Optional)
                  </h2>
                  <Button
                    type="button"
                    onClick={addBudgetLimit}
                    className="bg-[#FCA311] hover:bg-[#FCA311]/90 focus:ring-[#FCA311]/50 gap-2"
                    size="sm"
                  >
                    <FiPlusCircle className="h-4 w-4" /> Add Budget Limit
                  </Button>
                </div>

                {formData.budgetLimits.length === 0 ? (
                  <motion.div
                    className="text-center py-8 text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="mx-auto bg-[#FCA311]/5 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-3">
                      <FiDollarSign className="h-8 w-8 text-[#FCA311]" />
                    </div>
                    <p>No budget limits added yet.</p>
                    <p className="text-sm">
                      Click the button above to add a budget limit.
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {formData.budgetLimits.map((limit, index) => (
                      <BudgetLimitForm
                        key={index}
                        index={index}
                        limit={limit}
                        updateLimit={updateBudgetLimit}
                        removeLimit={removeBudgetLimit}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div
                variants={itemVariants}
                className="flex justify-end gap-3 pt-4 border-t border-[#14213D]/10"
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/admin/categories")}
                  className="border-[#14213D]/20 text-[#14213D]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  isLoading={loading}
                  className="bg-[#14213D] hover:bg-[#14213D]/90 focus:ring-[#14213D]/50"
                >
                  {isEditMode ? "Update" : "Create"} Category
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CreateCategory;
