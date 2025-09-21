import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../api/apiConfig";
import { motion } from "framer-motion";
import {
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaArrowLeft,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaPercentage,
  FaStickyNote,
} from "react-icons/fa";

const EditBudget = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    category: "",
    amount: "",
    maxDistance: "",
    notes: "",
    warningThreshold: 75,
    criticalThreshold: 90,
    isActive: true,
  });

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setIsLoading(true);
        const response = await API.get(`/budgets/${id}`);

        if (response.data && response.data.success) {
          const budget = response.data.data;
          setFormData({
            year: budget.year,
            month: budget.month,
            category: budget.category?._id || "",
            amount: budget.amount,
            maxDistance: budget.maxDistance,
            notes: budget.notes || "",
            warningThreshold: budget.warningThreshold,
            criticalThreshold: budget.criticalThreshold,
            isActive: budget.isActive,
            isGlobal: budget.isGlobal || false,
          });
        } else {
          setError("Failed to fetch budget details");
        }
      } catch (err) {
        // Error handled by error context
        setError(
          err.response?.data?.message || "Failed to fetch budget details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await API.get("/categories?isActive=true");
        if (response.data && response.data.success) {
          setCategories(response.data.data || []);
        } else {
          setError("Failed to load categories");
        }
      } catch (err) {
        // Error handled by error context
        setError(err.response?.data?.message || "Failed to load categories");
      }
    };

    fetchBudget();
    fetchCategories();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await API.put(`/budgets/${id}`, formData);

      if (response.data && response.data.success) {
        navigate("/admin/budgets");
      } else {
        throw new Error(response.data?.message || "Failed to update budget");
      }
    } catch (err) {
      // Error handled by error context
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update budget. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const generateMonthOptions = () => {
    const months = [
      { value: 1, label: "January" },
      { value: 2, label: "February" },
      { value: 3, label: "March" },
      { value: 4, label: "April" },
      { value: 5, label: "May" },
      { value: 6, label: "June" },
      { value: 7, label: "July" },
      { value: 8, label: "August" },
      { value: 9, label: "September" },
      { value: 10, label: "October" },
      { value: 11, label: "November" },
      { value: 12, label: "December" },
      { value: 0, label: "Annual Budget" },
    ];

    return months.map((month) => (
      <option key={month.value} value={month.value}>
        {month.label}
      </option>
    ));
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let i = currentYear - 1; i <= currentYear + 2; i++) {
      years.push(i);
    }

    return years.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3d348b]"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-6"
    >
      <div className="flex items-center mb-6">
        <Link
          to="/admin/budgets"
          className="mr-4 p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
        >
          <FaArrowLeft className="text-[#3d348b]" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaMoneyBillWave className="mr-2 text-[#7678ed]" />
          Edit Budget
        </h1>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] p-5">
          <h2 className="text-xl font-semibold text-white">Budget Details</h2>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-5">
            <div className="flex">
              <FaExclamationTriangle className="text-red-500 mr-3 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Year & Month Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaCalendarAlt className="mr-2 text-[#7678ed]" />
                Year
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed]"
                required
              >
                {generateYearOptions()}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaCalendarAlt className="mr-2 text-[#7678ed]" />
                Month
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed]"
                required
              >
                {generateMonthOptions()}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select "Annual Budget" for a yearly budget instead of monthly
              </p>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#7678ed] mr-2"></div>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed]"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaMoneyBillWave className="mr-2 text-[#7678ed]" />
                Budget Amount (CHF)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 500.00"
                min="0"
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed]"
                required
              />
            </div>

            {/* Max Distance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-[#7678ed]" />
                Maximum Distance (km)
              </label>
              <input
                type="number"
                name="maxDistance"
                value={formData.maxDistance}
                onChange={handleChange}
                placeholder="e.g. 750"
                min="0"
                step="0.1"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Set a maximum allowed distance for this budget
              </p>
            </div>

            {/* Warning Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaPercentage className="mr-2 text-[#f7b801]" />
                Warning Threshold (%)
              </label>
              <input
                type="number"
                name="warningThreshold"
                value={formData.warningThreshold}
                onChange={handleChange}
                min="1"
                max="100"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed]"
                required
              />
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#f7b801] h-2 rounded-full"
                    style={{ width: `${formData.warningThreshold}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                When budget usage reaches this percentage, a warning will be
                shown
              </p>
            </div>

            {/* Critical Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaPercentage className="mr-2 text-[#f35b04]" />
                Critical Threshold (%)
              </label>
              <input
                type="number"
                name="criticalThreshold"
                value={formData.criticalThreshold}
                onChange={handleChange}
                min="1"
                max="100"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed]"
                required
              />
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#f35b04] h-2 rounded-full"
                    style={{ width: `${formData.criticalThreshold}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                When budget usage reaches this percentage, a critical alert will
                be shown
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaStickyNote className="mr-2 text-[#7678ed]" />
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes or comments about this budget"
              rows="3"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7678ed] focus:border-[#7678ed]"
            />
          </div>

          {/* Active Status */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-[#7678ed] focus:ring-[#7678ed] border-gray-300 rounded"
            />
            <label
              htmlFor="isActive"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Budget is active
            </label>
          </div>

          {/* Global Status */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="isGlobal"
              name="isGlobal"
              checked={formData.isGlobal}
              onChange={handleChange}
              className="h-4 w-4 text-[#7678ed] focus:ring-[#7678ed] border-gray-300 rounded"
            />
            <label
              htmlFor="isGlobal"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Global budget (applies to all users)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate("/admin/budgets")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 flex items-center shadow-sm"
            >
              <FaTimes className="mr-2" /> Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSaving}
              className={`px-4 py-2 rounded-md text-white bg-gradient-to-r from-[#3d348b] to-[#7678ed] hover:shadow-lg flex items-center shadow-sm ${
                isSaving ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              <FaSave className="mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditBudget;
