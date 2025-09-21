import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  login as loginApi,
  logout as logoutApi,
  getCurrentUser,
} from "../api/authApi";
import { tokenStorage } from "../utils/secureStorage";
// import { useApiCall } from "../hooks/useApiCall";
// import { useError } from "./ErrorContext";

// Create auth context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(tokenStorage.getToken() || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        try {
          const storedUser = tokenStorage.getUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // If we have token but no user data, fetch it
            const { data } = await getCurrentUser();
            setUser(data);
          }
        } catch (err) {
          // Error handled by error context
          // Clear invalid token/user data
          tokenStorage.clearAll();
          setToken(null);
          setUser(null);
          navigate("/login");
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, [token, navigate]);

  // Listen for logout events from error handling system
  useEffect(() => {
    const handleAuthLogout = (event) => {
      // Auth logout event received
      setUser(null);
      setToken(null);
      tokenStorage.clearAll();
      navigate("/login");
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [navigate]);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(credentials);
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      setLoading(false);

      // Redirect based on user role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }

      return data;
    } catch (err) {
      // Get the actual server error if available
      const errorMessage =
        err.message || err.response?.data?.message || "Login failed";
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await logoutApi();
    } catch (err) {
      // Error handled by error context
    } finally {
      // Always clear user data even if logout API fails
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setLoading(false);
      navigate("/login");
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        isAdmin: user?.role === "admin",
        isSalesRep: user?.role === "sales_rep",
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
