import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  FiEdit,
  FiTrash2,
  FiClock,
  FiMapPin,
  FiFileText,
  FiCalendar,
  FiArrowUpRight,
} from "react-icons/fi";
import { FaRoute } from "react-icons/fa";
import Pagination from "./ui/Pagination";
import Button from "./ui/Button";
import ExpenseFilters from "./ExpenseFilters";
import { calculateTotals } from "../utils/expenseUtils";
import { formatCurrency } from "../utils/formatters";

const ExpensesList = ({
  expenses = [],
  onDelete,
  onFilter,
  filters,
  pagination,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const [filteredExpenses, setFilteredExpenses] = useState(expenses);
  const [summary, setSummary] = useState({
    total: 0,
    count: 0,
    avgAmount: 0,
    totalDistance: 0,
  });

  useEffect(() => {
    setFilteredExpenses(expenses);
    const summaryData = calculateTotals(expenses);
    setSummary(summaryData);
  }, [expenses]);

  const handleEdit = (id) => {
    navigate(`/admin/expenses/edit/${id}`);
  };

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
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="space-y-6">
      <ExpenseFilters onFilter={onFilter} filters={filters} />

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3 text-[#3d348b]">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#3d348b]/5 to-[#7678ed]/10 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-[#3d348b]">
              {formatCurrency(summary.total, "CHF")}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#7678ed]/5 to-[#3d348b]/10 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Number of Expenses</p>
            <p className="text-2xl font-bold text-[#7678ed]">{summary.count}</p>
          </div>
          <div className="bg-gradient-to-br from-[#f7b801]/5 to-[#f35b04]/10 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Average Amount</p>
            <p className="text-2xl font-bold text-[#f7b801]">
              {formatCurrency(summary.avgAmount, "CHF")}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#f35b04]/5 to-[#f7b801]/10 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Total Distance</p>
            <p className="text-2xl font-bold text-[#f35b04]">
              {summary.totalDistance.toFixed(1)} km
            </p>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">
            No expenses found matching your filters.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate("/admin/expenses/create")}
            icon={<FiArrowUpRight />}
          >
            Create New Expense
          </Button>
        </div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filteredExpenses.map((expense) => (
                <motion.div
                  key={expense._id}
                  variants={itemVariants}
                  exit={{ opacity: 0, y: -20 }}
                  layout
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="bg-gradient-to-r from-[#3d348b] to-[#7678ed] p-3 text-white">
                    <h3 className="font-semibold truncate">
                      {expense.startLocation.address} →{" "}
                      {expense.endLocation.address}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiCalendar className="mr-2 text-[#7678ed]" />
                        <span>
                          {format(new Date(expense.date), "MMMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaRoute className="mr-2 text-[#f7b801]" />
                        <span>{expense.distance.toFixed(1)} km</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiFileText className="mr-2 text-[#f35b04]" />
                        <span className="truncate">
                          {expense.description || "No description"}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Amount:</p>
                        <p className="text-xl font-bold text-[#3d348b]">
                          {formatCurrency(expense.amount, "CHF")}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(expense._id)}
                        icon={<FiEdit />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(expense._id)}
                        icon={<FiTrash2 />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {pagination && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExpensesList;
