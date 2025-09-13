import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Dashboard from "../pages/dashboard/Dashboard";
import NotFound from "../pages/error/NotFound";
import Layout from "../components/layout/Layout";
import UserManagement from "../pages/admin/UserManagement";
import SystemSettings from "../pages/admin/SystemSettings";
import Reports from "../pages/reports/Reports";
import Analytics from "../pages/admin/Analytics";
import PeriodDetail from "../pages/admin/analytics/PeriodDetail";
import CategoryList from "../pages/categories/CategoryList";
import CreateCategory from "../pages/categories/CreateCategory";
import CategoryDetail from "../pages/categories/CategoryDetail";
import ExpensesList from "../pages/expenses/ExpensesList";
import ExpenseDetails from "../pages/expenses/ExpenseDetails";
import CreateExpense from "../pages/expenses/CreateExpense";
import EditExpense from "../pages/expenses/EditExpense";
import ExpenseManagement from "../pages/admin/ExpenseManagement";
import TimeSummary from "../pages/admin/analytics/TimeSummary";
import CategoryBreakdown from "../pages/admin/analytics/CategoryBreakdown";
import ExpenseTrends from "../pages/admin/analytics/ExpenseTrends";
import YearlyComparison from "../pages/admin/analytics/YearlyComparison";
import BudgetsList from "../pages/budgets/BudgetsList";
import BudgetDetails from "../pages/budgets/BudgetDetails";
import CreateBudget from "../pages/budgets/CreateBudget";
import EditBudget from "../pages/budgets/EditBudget";
import BudgetDashboard from "../pages/budgets/BudgetDashboard";
import YTDReports from "../pages/reports/YTDReports";
import ChartData from "../pages/reports/ChartData";
import ExpenseForecasting from "../pages/reports/ExpenseForecasting";
import BudgetComparison from "../pages/reports/BudgetComparison";
import AdvancedFilteredExpenses from "../pages/reports/AdvancedFilteredExpenses";
import BudgetSummaryReport from "../pages/reports/BudgetSummaryReport";
import AllBudgetsReport from "../pages/reports/AllBudgetsReport";
import Forecast from "../pages/reports/Forecast";
import ReportsLayout from "../components/layout/ReportsLayout";
import Profile from "../pages/profile/Profile";
import Documentation from "../pages/documentation/Documentation";

const AdminRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Admin routes */}
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="documentation" element={<Documentation />} />

        {/* Reports routes with separate layout */}
        <Route path="reports" element={<ReportsLayout />}>
          <Route index element={<Reports />} />
          <Route path="ytd" element={<YTDReports />} />
          <Route path="chart-data" element={<ChartData />} />
          <Route path="forecast" element={<Forecast />} />
          <Route path="expense-forecasting" element={<ExpenseForecasting />} />
          <Route path="budget-comparison" element={<BudgetComparison />} />
          <Route
            path="filtered-expenses"
            element={<AdvancedFilteredExpenses />}
          />
          <Route path="budget-summary" element={<BudgetSummaryReport />} />
          <Route path="all-budgets" element={<AllBudgetsReport />} />
        </Route>

        <Route path="analytics" element={<Analytics />} />
        <Route
          path="analytics/period/:periodType/:period/:year"
          element={<PeriodDetail />}
        />
        <Route path="analytics/time-summary" element={<TimeSummary />} />
        <Route
          path="analytics/category-breakdown"
          element={<CategoryBreakdown />}
        />
        <Route path="analytics/expense-trends" element={<ExpenseTrends />} />
        <Route
          path="analytics/yearly-comparison"
          element={<YearlyComparison />}
        />

        {/* Budget routes */}
        <Route path="budgets">
          <Route index element={<BudgetDashboard />} />
          <Route path="list" element={<BudgetsList />} />
          <Route path="create" element={<CreateBudget />} />
          <Route path=":id" element={<BudgetDetails />} />
          <Route path="edit/:id" element={<EditBudget />} />
        </Route>

        {/* Category routes */}
        <Route path="categories">
          <Route index element={<CategoryList />} />
          <Route path="create" element={<CreateCategory />} />
          <Route path=":id" element={<CategoryDetail />} />
          <Route path=":id/edit" element={<CreateCategory />} />
        </Route>

        {/* Expense routes */}
        <Route path="expenses">
          <Route index element={<ExpenseManagement />} />
          <Route path="list" element={<ExpensesList />} />
          <Route path="new" element={<CreateExpense />} />
          <Route path="create" element={<CreateExpense />} />
          <Route path=":id" element={<ExpenseDetails />} />
          <Route path="edit/:id" element={<EditExpense />} />
        </Route>

        {/* Redirect /home to / */}
        <Route path="home" element={<Navigate to="/" replace />} />

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
