import apiConfig from "./apiConfig";
// Mock data import remains for fallback
import { mockAdminDashboardData } from "./mockData";

/**
 * Get admin dashboard overview data
 * @returns {Promise<Object>} - Dashboard data including metrics and charts
 */
export const getAdminDashboardData = async () => {
  try {
    // Use the real API endpoint (without duplicate /api/v1 prefix)
    const response = await apiConfig.get("/analytics/dashboard");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    throw error;
  }
};
