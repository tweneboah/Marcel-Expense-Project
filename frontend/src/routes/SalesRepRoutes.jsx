import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "../pages/dashboard/Dashboard";
import NotFound from "../pages/error/NotFound";
import Layout from "../components/layout/Layout";
import ExpensesList from "../pages/expenses/ExpensesList";
import ExpenseDetails from "../pages/expenses/ExpenseDetails";
import CreateExpense from "../pages/expenses/CreateExpense";
import EditExpense from "../pages/expenses/EditExpense";
import Profile from "../pages/profile/Profile";
import Documentation from "../pages/documentation/Documentation";

const SalesRepRoutes = () => {
  const location = useLocation();

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Expense routes */}
        <Route path="expenses">
          <Route index element={<ExpensesList />} />
          <Route path="new" element={<CreateExpense />} />
          <Route path="create" element={<CreateExpense />} />
          <Route path=":id" element={<ExpenseDetails />} />
          <Route path="edit/:id" element={<EditExpense />} />
        </Route>

        {/* Profile routes */}
        <Route path="profile" element={<Profile />} />

        {/* Documentation route */}
        <Route path="documentation" element={<Documentation />} />

        {/* Redirect /home to / */}
        <Route path="home" element={<Navigate to="/" replace />} />

        {/* Redirect category routes to dashboard */}
        <Route
          path="categories/*"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default SalesRepRoutes;
