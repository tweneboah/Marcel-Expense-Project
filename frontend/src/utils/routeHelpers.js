/**
 * Helper functions for generating URL paths based on user role
 */

import { useAuth } from "../context/AuthContext";

/**
 * Returns the correct base path for expenses based on user role
 * @returns {string} The base path for expenses (e.g., '/admin/expenses' or '/expenses')
 */
export const useExpensesBasePath = () => {
  const { user } = useAuth();
  return user?.role === "admin" ? "/admin/expenses" : "/expenses";
};

/**
 * Returns the correct URL for a specific expense
 * @param {string} expenseId - The ID of the expense
 * @returns {string} The URL to the expense details
 */
export const getExpenseUrl = (expenseId) => {
  const { user } = useAuth();
  const basePath = user?.role === "admin" ? "/admin/expenses" : "/expenses";
  return `${basePath}/${expenseId}`;
};

/**
 * Returns the correct URL for creating a new expense
 * @returns {string} The URL to create a new expense
 */
export const getNewExpenseUrl = () => {
  const { user } = useAuth();
  const basePath = user?.role === "admin" ? "/admin/expenses" : "/expenses";
  return `${basePath}/new`;
};

/**
 * Custom hook to get a collection of route helpers for expenses
 * @returns {Object} Route helper functions and paths
 */
export const useExpenseRoutes = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const basePath = isAdmin ? "/admin/expenses" : "/expenses";

  return {
    basePath,
    listPath: basePath,
    listUrl: basePath,
    newPath: `${basePath}/new`,
    createPath: `${basePath}/create`,
    detailPath: (id) => `${basePath}/${id}`,
    detail: (id) => `${basePath}/${id}`,
    editPath: (id) => `${basePath}/edit/${id}`,
    isAdmin,
  };
};
