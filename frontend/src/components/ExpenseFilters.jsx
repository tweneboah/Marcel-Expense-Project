import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiFilter,
  FiCalendar,
  FiDollarSign,
  FiMapPin,
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import Button from "./ui/Button";
import DateRangePicker from "./ui/DateRangePicker";

const ExpenseFilters = ({ onFilter, filters = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    startDate: filters.startDate || "",
    endDate: filters.endDate || "",
    minAmount: filters.minAmount || "",
    maxAmount: filters.maxAmount || "",
    location: filters.location || "",
    keyword: filters.keyword || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateRangeChange = (range) => {
    setLocalFilters((prev) => ({
      ...prev,
      startDate: range.startDate,
      endDate: range.endDate,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(localFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      location: "",
      keyword: "",
    };
    setLocalFilters(resetFilters);
    onFilter(resetFilters);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const hasActiveFilters = Object.values(localFilters).some(
    (value) => value !== ""
  );

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center">
          <FiFilter className="text-[#3d348b] mr-2" />
          <h3 className="font-medium text-[#3d348b]">
            Filter Expenses
            {hasActiveFilters && (
              <span className="ml-2 bg-[#f7b801] text-[#3d348b] text-xs py-0.5 px-2 rounded-full">
                Active
              </span>
            )}
          </h3>
        </div>
        <div>
          {isExpanded ? (
            <FiChevronUp className="text-gray-500" />
          ) : (
            <FiChevronDown className="text-gray-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form
            onSubmit={handleSubmit}
            className="p-4 pt-0 border-t border-gray-100"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiCalendar className="mr-1 text-[#7678ed]" />
                  Date Range
                </label>
                <DateRangePicker
                  startDate={localFilters.startDate}
                  endDate={localFilters.endDate}
                  onChange={handleDateRangeChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiDollarSign className="mr-1 text-[#f7b801]" />
                  Min Amount (CHF)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="minAmount"
                    value={localFilters.minAmount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3d348b]/30 focus:border-[#3d348b]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiDollarSign className="mr-1 text-[#f35b04]" />
                  Max Amount (CHF)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="maxAmount"
                    value={localFilters.maxAmount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3d348b]/30 focus:border-[#3d348b]"
                    placeholder="No limit"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiMapPin className="mr-1 text-[#7678ed]" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={localFilters.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3d348b]/30 focus:border-[#3d348b]"
                  placeholder="Search by location"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiSearch className="mr-1 text-[#f7b801]" />
                  Keyword
                </label>
                <input
                  type="text"
                  name="keyword"
                  value={localFilters.keyword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3d348b]/30 focus:border-[#3d348b]"
                  placeholder="Search by keyword"
                />
              </div>
            </div>

            <div className="flex items-center justify-end mt-6 space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={clearFilters}
                size="sm"
                icon={<FiX />}
              >
                Clear
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={<FiFilter />}
              >
                Apply Filters
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ExpenseFilters;
