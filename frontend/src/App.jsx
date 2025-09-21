import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ErrorProvider } from "./context/ErrorContext";
import ErrorBoundary from "./components/error/ErrorBoundary";
import ErrorToast from "./components/error/ErrorToast";
import PublicRoutes from "./routes/PublicRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import SalesRepRoutes from "./routes/SalesRepRoutes";
import React from "react";

function App() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ErrorProvider>
      <ErrorBoundary componentName="App">
        <SettingsProvider>
          <ErrorToast />
          {/* <GoogleMapComponent /> */}
          <Routes>
        {/* Public routes - accessible when not authenticated */}
        {!isAuthenticated ? (
          <Route path="/*" element={<PublicRoutes />} />
        ) : (
          <>
            {/* Admin routes */}
            {user?.role === "admin" ? (
              <Route path="/admin/*" element={<AdminRoutes />} />
            ) : (
              // Sales Rep routes
              <Route path="/*" element={<SalesRepRoutes />} />
            )}

            {/* Base redirects based on role */}
            <Route
              path="/"
              element={
                user?.role === "admin" ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />

            {/* Redirect /admin to /admin/dashboard for admin users */}
            {user?.role === "admin" && (
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            )}

            {/* Catch unauthorized admin access attempts */}
            {user?.role !== "admin" && (
              <Route
                path="/admin/*"
                element={<Navigate to="/dashboard" replace />}
              />
            )}

            {/* Fallback for any other route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
        </SettingsProvider>
      </ErrorBoundary>
    </ErrorProvider>
  );
}

export default App;
