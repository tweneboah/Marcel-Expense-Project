import axios from "axios";

// Define the base URL as a constant
export const BASE_URL = "http://localhost:5000/api/v1";

// Create axios instance with base URL
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Circuit breaker to prevent API call loops
const recentCalls = {};
const THROTTLE_WINDOW = 1000; // 1 second

// Request interceptor for adding auth token
API.interceptors.request.use(
  (config) => {
    // Circuit breaker to prevent API call loops
    const endpoint = config.url;
    const now = Date.now();

    // Check if we've made this exact call recently
    if (
      recentCalls[endpoint] &&
      now - recentCalls[endpoint].time < THROTTLE_WINDOW
    ) {
      recentCalls[endpoint].count++;

      // If we're seeing rapid repeated calls, block them
      if (recentCalls[endpoint].count > 3) {
        console.warn(
          `Blocking repeated call to ${endpoint} (${recentCalls[endpoint].count} calls in 1s)`
        );

        // For GET requests, return the last response if we have it
        if (config.method === "get" && recentCalls[endpoint].lastResponse) {
          return Promise.resolve({
            data: {
              ...recentCalls[endpoint].lastResponse,
              _cached: true,
            },
          });
        }

        throw new axios.Cancel(
          `Circuit breaker: Too many calls to ${endpoint}`
        );
      }
    } else {
      // First call or after window
      recentCalls[endpoint] = { time: now, count: 1, lastResponse: null };
    }

    // Handle /settings/defaults endpoint specifically
    if (endpoint === "/settings/defaults") {
      console.warn(
        "Intercepted request to non-existent /settings/defaults endpoint"
      );
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
      };
      throw { __MOCK_RESPONSE__: mockResponse };
    }

    const token = localStorage.getItem("token");
    console.log(`API Request to ${config.url}`, {
      hasToken: !!token,
      tokenFirstChars: token ? `${token.substring(0, 10)}...` : "none",
      method: config.method,
      headers: config.headers,
    });

    if (token) {
      // Make sure token is properly formatted - some APIs expect exactly "Bearer TOKEN"
      // with proper spacing, while others might have different requirements
      const formattedToken = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
      config.headers["Authorization"] = formattedToken;

      console.log(
        "Authorization header set:",
        formattedToken.substring(0, 15) + "..."
      );
    } else {
      console.warn("No authentication token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
API.interceptors.response.use(
  (response) => {
    // Store this response in our circuit breaker
    const endpoint = response.config.url;
    if (recentCalls[endpoint]) {
      recentCalls[endpoint].lastResponse = response.data;
    }

    // Log successful responses
    console.log(`API Response success from ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      dataPreview: response.data
        ? JSON.stringify(response.data).substring(0, 100) + "..."
        : "No data",
    });
    return response;
  },
  (error) => {
    // Check if this is our mock response for /settings/defaults
    if (error.__MOCK_RESPONSE__) {
      console.log("Returning mock response for intercepted endpoint");
      return error.__MOCK_RESPONSE__;
    }

    console.error(`API Error for ${error.config?.url || "unknown endpoint"}:`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    // Handle specific error cases
    if (error.response && error.response.status === 401) {
      console.error(
        "Unauthorized access (401). Token may be invalid or expired."
      );
      // Just clear the auth data, let components handle redirects
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    // Create a more detailed error object
    const enhancedError = {
      ...error,
      message:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message,
      status: error.response?.status,
      isServerError: !!error.response,
    };

    return Promise.reject(enhancedError);
  }
);

export default API;
