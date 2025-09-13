import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  login as loginApi,
  logout as logoutApi,
  getCurrentUser,
} from "../api/authApi";

// Create auth context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // If we have token but no user data, fetch it
            const { data } = await getCurrentUser();
            setUser(data);
          }
        } catch (err) {
          console.error("Error fetching user:", err);
          // Clear invalid token/user data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
          navigate("/login");
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, [token, navigate]);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(credentials);
      setUser(data.user);
      setToken(data.token);
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
      console.error("Error during logout:", err);
    } finally {
      // Always clear user data even if logout API fails
      setUser(null);
      setToken(null);
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
        loading,
        error,
        isAuthenticated: !!token,
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
