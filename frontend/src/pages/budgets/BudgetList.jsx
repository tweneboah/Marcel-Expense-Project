import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaFileExport,
  FaPlus,
  FaSearch,
  FaFilter,
  FaSort,
  FaExclamationTriangle,
} from "react-icons/fa";

const BudgetList = () => {
  const [budgets, setBudgets] = useState([]);
  const [filteredBudgets, setFilteredBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [sortField, setSortField] = useState("year");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  // Mock data for budget calculations
  const getRandomUsage = () => {
    return Math.floor(Math.random() * 100);
  };

  const mockBudgetUsage = {
    "60d5ec9af682fbf6bff91761": getRandomUsage(),
    "60d5ec9af682fbf6bff91762": getRandomUsage(),
    "60d5ec9af682fbf6bff91763": getRandomUsage(),
    "60d5ec9af682fbf6bff91764": getRandomUsage(),
    "60d5ec9af682fbf6bff91765": getRandomUsage(),
  };

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setIsLoading(true);
        // In production, call the actual API
        // const response = await axios.get('/api/v1/budgets');
        // setBudgets(response.data.data);

        // Mock data for demo
        const mockBudgets = [
          {
            _id: "60d5ec9af682fbf6bff91761",
            year: 2023,
            month: 11,
            category: {
              _id: "60d5ec9af682fbf6bff9175e",
              name: "Fuel",
              color: "#FF5722",
            },
            amount: 1200,
            maxDistance: 800,
            warningThreshold: 75,
            criticalThreshold: 90,
            isActive: true,
            notes: "Regular budget for November fuel expenses",
            createdAt: "2023-10-28T08:30:00.000Z",
            updatedAt: "2023-10-28T08:30:00.000Z",
          },
          {
            _id: "60d5ec9af682fbf6bff91762",
            year: 2023,
            month: 12,
            category: {
              _id: "60d5ec9af682fbf6bff9175f",
              name: "Tolls",
              color: "#2196F3",
            },
            amount: 450,
            maxDistance: 1200,
            warningThreshold: 80,
            criticalThreshold: 95,
            isActive: true,
            notes: "December toll expenses",
            createdAt: "2023-11-02T10:15:00.000Z",
            updatedAt: "2023-11-02T10:15:00.000Z",
          },
          {
            _id: "60d5ec9af682fbf6bff91763",
            year: 2023,
            month: 12,
            category: {
              _id: "60d5ec9af682fbf6bff91760",
              name: "Maintenance",
              color: "#4CAF50",
            },
            amount: 850,
            maxDistance: 0,
            warningThreshold: 70,
            criticalThreshold: 90,
            isActive: true,
            notes: "End of year vehicle maintenance budget",
            createdAt: "2023-11-10T14:20:00.000Z",
            updatedAt: "2023-11-10T14:20:00.000Z",
          },
          {
            _id: "60d5ec9af682fbf6bff91764",
            year: 2024,
            month: 1,
            category: {
              _id: "60d5ec9af682fbf6bff9175e",
              name: "Fuel",
              color: "#FF5722",
            },
            amount: 1100,
            maxDistance: 750,
            warningThreshold: 75,
            criticalThreshold: 90,
            isActive: true,
            notes: "January fuel expenses",
            createdAt: "2023-12-15T11:45:00.000Z",
            updatedAt: "2023-12-15T11:45:00.000Z",
          },
          {
            _id: "60d5ec9af682fbf6bff91765",
            year: 2024,
            month: 0,
            category: {
              _id: "60d5ec9af682fbf6bff91760",
              name: "Maintenance",
              color: "#4CAF50",
            },
            amount: 3600,
            maxDistance: 0,
            warningThreshold: 70,
            criticalThreshold: 90,
            isActive: true,
            notes: "Annual maintenance budget for 2024",
            createdAt: "2023-12-20T09:30:00.000Z",
            updatedAt: "2023-12-20T09:30:00.000Z",
          },
        ];

        setBudgets(mockBudgets);
        setFilteredBudgets(mockBudgets);
        setIsLoading(false);
      } catch (err) {
        // Error handled by error context
        setError("Failed to load budgets. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let results = budgets;

    // Apply search
    if (searchTerm) {
      results = results.filter(
        (budget) =>
          budget.category.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          budget.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply year filter
    if (filterYear) {
      results = results.filter(
        (budget) => budget.year.toString() === filterYear
      );
    }

    // Apply month filter
    if (filterMonth !== "") {
      results = results.filter(
        (budget) => budget.month.toString() === filterMonth
      );
    }

    // Apply sorting
    results = [...results].sort((a, b) => {
      if (sortField === "amount") {
        return sortDirection === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else if (sortField === "category") {
        return sortDirection === "asc"
          ? a.category.name.localeCompare(b.category.name)
          : b.category.name.localeCompare(a.category.name);
      } else if (sortField === "year" || sortField === "month") {
        if (a[sortField] === b[sortField]) {
          // Secondary sort by the other date field
          const secondaryField = sortField === "year" ? "month" : "year";
          return sortDirection === "asc"
            ? a[secondaryField] - b[secondaryField]
            : b[secondaryField] - a[secondaryField];
        }
        return sortDirection === "asc"
          ? a[sortField] - b[sortField]
          : b[sortField] - a[sortField];
      }

      return 0;
    });

    setFilteredBudgets(results);
  }, [budgets, searchTerm, filterYear, filterMonth, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const confirmDelete = (budget) => {
    setBudgetToDelete(budget);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!budgetToDelete) return;

    try {
      setIsLoading(true);

      // In production, call the actual API
      // await axios.delete(`/api/v1/budgets/${budgetToDelete._id}`);

      // Deleting budget
      
      await deleteBudget(budgetToDelete._id);
      
      // Remove the deleted budget from the list
      setBudgets(budgets.filter(budget => budget._id !== budgetToDelete._id));
      setShowDeleteModal(false);
      setBudgetToDelete(null);
      setSuccessMessage("Budget deleted successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      // Error handled by error context
      setError("Failed to delete budget. Please try again.");
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setBudgetToDelete(null);
  };

  const exportBudgets = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filteredBudgets, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "budgets_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getMonthName = (monthNum) => {
    if (monthNum === 0) return "Annual";
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNum - 1];
  };

  const generateYearOptions = () => {
    const years = [...new Set(budgets.map((budget) => budget.year))].sort(
      (a, b) => b - a
    );
    return (
      <>
        <option value="">All Years</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </>
    );
  };

  const generateMonthOptions = () => {
    const months = [...new Set(budgets.map((budget) => budget.month))].sort(
      (a, b) => a - b
    );
    return (
      <>
        <option value="">All Periods</option>
        {months.map((month) => (
          <option key={month} value={month}>
            {getMonthName(month)}
          </option>
        ))}
      </>
    );
  };

  const getBadgeColor = (budget) => {
    const usage = mockBudgetUsage[budget._id] || 0;

    if (usage >= budget.criticalThreshold) {
      return "bg-red-600";
    } else if (usage >= budget.warningThreshold) {
      return "bg-yellow-500";
    } else {
      return "bg-green-500";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Budget Management</h1>
          <Link
            to="/admin/budgets/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <FaPlus className="mr-2" /> Create Budget
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center relative">
            <FaSearch className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by category or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 p-2 border rounded w-full"
            />
          </div>

          <div className="flex items-center">
            <FaFilter className="mr-2 text-gray-400" />
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="p-2 border rounded w-full"
            >
              {generateYearOptions()}
            </select>
          </div>

          <div className="flex items-center">
            <FaFilter className="mr-2 text-gray-400" />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="p-2 border rounded w-full"
            >
              {generateMonthOptions()}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">
              No budgets found. Create your first budget!
            </p>
            <Link
              to="/admin/budgets/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
            >
              <FaPlus className="mr-2" /> Create Budget
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th
                      className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort("year")}
                    >
                      <div className="flex items-center">
                        Period
                        {sortField === "year" && <FaSort className="ml-2" />}
                      </div>
                    </th>
                    <th
                      className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center">
                        Category
                        {sortField === "category" && (
                          <FaSort className="ml-2" />
                        )}
                      </div>
                    </th>
                    <th
                      className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center">
                        Amount (CHF)
                        {sortField === "amount" && <FaSort className="ml-2" />}
                      </div>
                    </th>
                    <th className="py-2 px-4 border-b">Usage</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBudgets.map((budget) => (
                    <tr key={budget._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">
                        {budget.month === 0
                          ? `${budget.year} (Annual)`
                          : `${getMonthName(budget.month)} ${budget.year}`}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: budget.category.color }}
                          ></div>
                          {budget.category.name}
                        </div>
                      </td>
                      <td className="py-2 px-4 border-b text-right">
                        {budget.amount.toLocaleString("de-CH", {
                          style: "currency",
                          currency: "CHF",
                        })}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${getBadgeColor(
                              budget
                            )}`}
                            style={{
                              width: `${mockBudgetUsage[budget._id] || 0}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {mockBudgetUsage[budget._id] || 0}% used
                        </div>
                      </td>
                      <td className="py-2 px-4 border-b">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            budget.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {budget.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/reports/budget-details?id=${budget._id}`}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            to={`/admin/budgets/edit/${budget._id}`}
                            className="p-1 text-yellow-600 hover:text-yellow-800"
                            title="Edit Budget"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => confirmDelete(budget)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete Budget"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredBudgets.length} of {budgets.length} budgets
              </div>
              <button
                onClick={exportBudgets}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
              >
                <FaFileExport className="mr-2" /> Export
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete the budget for
              <span className="font-semibold">
                {budgetToDelete?.month === 0
                  ? ` ${budgetToDelete?.year} (Annual) `
                  : ` ${getMonthName(budgetToDelete?.month)} ${
                      budgetToDelete?.year
                    } `}
              </span>
              <span className="font-semibold">
                {budgetToDelete?.category.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetList;
