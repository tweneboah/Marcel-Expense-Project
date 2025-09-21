import axios from "axios";
import { tokenStorage } from "../utils/secureStorage";
import { parseError, logError, ERROR_TYPES, ERROR_SEVERITY } from "../utils/errorHandler";

// Define the base URL from environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export const BASE_URL = `${API_BASE_URL}/api/v1`;

// Create axios instance with base URL
const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Enhanced Circuit breaker implementation with fallback strategies
const recentCalls = {};
const THROTTLE_WINDOW = 1000; // 1 second
const MAX_CALLS_PER_WINDOW = 10;
const CIRCUIT_BREAKER_THRESHOLD = 5; // Number of failures before opening circuit
const CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 seconds before trying again
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

// Circuit breaker states
const CIRCUIT_STATES = {
  CLOSED: 'CLOSED',     // Normal operation
  OPEN: 'OPEN',         // Circuit is open, requests fail fast
  HALF_OPEN: 'HALF_OPEN' // Testing if service is back
};

// Circuit breaker storage
const circuitBreakers = {};
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fallback data for critical endpoints
const fallbackData = {
  '/settings': {
    success: true,
    data: [],
    message: 'Using cached settings data'
  },
  '/expenses': {
    success: true,
    data: [],
    pagination: { page: 1, limit: 10, total: 0 },
    message: 'Using cached expenses data'
  },
  '/budgets': {
    success: true,
    data: [],
    pagination: { page: 1, limit: 10, total: 0 },
    message: 'Using cached budgets data'
  }
};

// Helper function to get circuit breaker for endpoint
const getCircuitBreaker = (endpoint) => {
  if (!circuitBreakers[endpoint]) {
    circuitBreakers[endpoint] = {
      state: CIRCUIT_STATES.CLOSED,
      failureCount: 0,
      lastFailureTime: null,
      lastSuccessTime: null
    };
  }
  return circuitBreakers[endpoint];
};

// Helper function to check if circuit should be half-open
const shouldAttemptReset = (breaker) => {
  return breaker.state === CIRCUIT_STATES.OPEN && 
         Date.now() - breaker.lastFailureTime > CIRCUIT_BREAKER_TIMEOUT;
};

// Helper function to get cached response
const getCachedResponse = (cacheKey) => {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      ...cached.data,
      fromCache: true,
      cacheAge: Date.now() - cached.timestamp
    };
  }
  return null;
};

// Helper function to cache response
const cacheResponse = (cacheKey, data) => {
  responseCache.set(cacheKey, {
    data: data,
    timestamp: Date.now()
  });
};

// Helper function to get fallback response
const getFallbackResponse = (endpoint, method = 'GET') => {
  // Try to find a matching fallback pattern
  const fallbackKey = Object.keys(fallbackData).find(key => 
    endpoint.includes(key) || endpoint.startsWith(key)
  );
  
  if (fallbackKey) {
    return {
      data: {
        ...fallbackData[fallbackKey],
        fallback: true,
        endpoint: endpoint,
        timestamp: new Date().toISOString()
      },
      status: 200,
      statusText: 'OK (Fallback)',
      config: { url: endpoint, method }
    };
  }
  
  // Generic fallback for unknown endpoints
  return {
    data: {
      success: false,
      message: 'Service temporarily unavailable. Please try again later.',
      fallback: true,
      endpoint: endpoint,
      timestamp: new Date().toISOString()
    },
    status: 503,
    statusText: 'Service Unavailable (Fallback)',
    config: { url: endpoint, method }
  };
};

// Retry mechanism with exponential backoff
const retryRequest = async (config, attempt = 1) => {
  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    if (attempt < RETRY_ATTEMPTS && 
        error.response?.status >= 500 && 
        error.response?.status < 600) {
      
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(config, attempt + 1);
    }
    throw error;
  }
};

// Request interceptor with enhanced circuit breaker and fallback strategies
API.interceptors.request.use(
  (config) => {
    const endpoint = config.url;
    const method = config.method?.toUpperCase() || 'GET';
    const now = Date.now();
    const cacheKey = `${method}:${endpoint}`;

    // Get circuit breaker for this endpoint
    const breaker = getCircuitBreaker(endpoint);

    // Check circuit breaker state
    if (breaker.state === CIRCUIT_STATES.OPEN) {
      if (shouldAttemptReset(breaker)) {
        // Try to reset circuit to half-open
        breaker.state = CIRCUIT_STATES.HALF_OPEN;
      } else {
        // Circuit is open, try fallback strategies
        
        // 1. Try cached response first
        const cachedResponse = getCachedResponse(cacheKey);
        if (cachedResponse) {
          throw { __MOCK_RESPONSE__: { 
            data: cachedResponse, 
            status: 200, 
            statusText: "OK (Cached)", 
            config 
          }};
        }
        
        // 2. Use fallback data
        const fallbackResponse = getFallbackResponse(endpoint, method);
        throw { __MOCK_RESPONSE__: fallbackResponse };
      }
    }

    // Simple throttling to prevent API call loops
    if (recentCalls[endpoint]) {
      const timeDiff = now - recentCalls[endpoint].time;
      if (timeDiff < THROTTLE_WINDOW) {
        recentCalls[endpoint].count++;
        if (recentCalls[endpoint].count > MAX_CALLS_PER_WINDOW) {
          
          // Try cached response first
          const cachedResponse = getCachedResponse(cacheKey);
          if (cachedResponse) {
            // Sanitize config to remove sensitive headers
            const sanitizedConfig = {
              ...config,
              headers: {
                ...config?.headers,
                Authorization: '[REDACTED]' // Remove token from config
              }
            };
            
            throw { __MOCK_RESPONSE__: { 
              data: cachedResponse, 
              status: 200, 
              statusText: "OK (Cached)", 
              config: sanitizedConfig 
            }};
          }
          
          // Return last response if available
          if (recentCalls[endpoint].lastResponse) {
            // Sanitize config to remove sensitive headers
            const sanitizedConfig = {
              ...config,
              headers: {
                ...config?.headers,
                Authorization: '[REDACTED]' // Remove token from config
              }
            };
            
            throw { __MOCK_RESPONSE__: {
              data: recentCalls[endpoint].lastResponse,
              status: 200,
              statusText: "OK (Throttled Cache)",
              config: sanitizedConfig,
            }};
          }
          
          throw new axios.Cancel(
            `Circuit breaker: Too many calls to ${endpoint}`
          );
        }
      } else {
        // Reset window
        recentCalls[endpoint] = { time: now, count: 1, lastResponse: null };
      }
    } else {
      // First call
      recentCalls[endpoint] = { time: now, count: 1, lastResponse: null };
    }

    // Handle deprecated /settings/defaults endpoint specifically
    if (endpoint === "/settings/defaults") {
      const mockResponse = {
        data: {
          success: true,
          data: [],
          message: "Deprecated endpoint - use /settings instead"
        },
      };
      throw { __MOCK_RESPONSE__: mockResponse };
    }

    // Add authentication token
    const token = tokenStorage.getToken();

    if (token) {
      const formattedToken = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
      config.headers["Authorization"] = formattedToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with enhanced circuit breaker and caching
API.interceptors.response.use(
  (response) => {
    const endpoint = response.config.url;
    const method = response.config.method?.toUpperCase() || 'GET';
    const cacheKey = `${method}:${endpoint}`;
    
    // Update circuit breaker on successful response
    const breaker = getCircuitBreaker(endpoint);
    if (breaker.state === CIRCUIT_STATES.HALF_OPEN) {
      // Reset circuit breaker on successful response in half-open state
      breaker.state = CIRCUIT_STATES.CLOSED;
      breaker.failureCount = 0;
      breaker.lastSuccessTime = Date.now();
    } else if (breaker.state === CIRCUIT_STATES.CLOSED) {
      // Reset failure count on successful response
      breaker.failureCount = 0;
      breaker.lastSuccessTime = Date.now();
    }

    // Cache successful GET responses for fallback
    if (method === 'GET' && response.data && response.status === 200) {
      cacheResponse(cacheKey, response.data);
    }

    // Store response in throttling cache
    if (recentCalls[endpoint]) {
      recentCalls[endpoint].lastResponse = response.data;
    }
    
    return response;
  },
  async (error) => {
    // Check if this is our mock response
    if (error.__MOCK_RESPONSE__) {
      return error.__MOCK_RESPONSE__;
    }

    const endpoint = error.config?.url;
    const method = error.config?.method?.toUpperCase() || 'GET';
    const cacheKey = `${method}:${endpoint}`;

    // Update circuit breaker on error
    if (endpoint) {
      const breaker = getCircuitBreaker(endpoint);
      const isServerError = error.response?.status >= 500;
      const isNetworkError = !error.response && error.request;
      
      if (isServerError || isNetworkError) {
        breaker.failureCount++;
        breaker.lastFailureTime = Date.now();
        
        if (breaker.failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
          breaker.state = CIRCUIT_STATES.OPEN;
        }
      }
    }

    // Try retry mechanism for server errors
    if (error.response?.status >= 500 && error.response?.status < 600 && error.config) {
      try {
        const retryResponse = await retryRequest(error.config);
        return retryResponse;
      } catch (retryError) {
        error = retryError; // Use the final retry error
      }
    }

    // Try fallback strategies for critical errors
    if (endpoint && (error.response?.status >= 500 || !error.response)) {
      // Try cached response first
      const cachedResponse = getCachedResponse(cacheKey);
      if (cachedResponse) {
        // Sanitize config to remove sensitive headers
        const sanitizedConfig = {
          ...error.config,
          headers: {
            ...error.config?.headers,
            Authorization: '[REDACTED]' // Remove token from config
          }
        };
        
        return {
          data: cachedResponse,
          status: 200,
          statusText: 'OK (Cached Fallback)',
          config: sanitizedConfig
        };
      }
      
      // For GET requests, try fallback data
      if (method === 'GET') {
        const fallbackResponse = getFallbackResponse(endpoint, method);
        return fallbackResponse;
      }
    }

    // Use centralized error handling
    const parsedError = parseError(error);
    
    // Log the error with enhanced context (sanitized for security)
    const sanitizedContext = {
      endpoint: endpoint || "unknown endpoint",
      method: method || "unknown method",
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      // Only log request data, not headers which may contain tokens
      requestData: error.config?.data,
      circuitState: endpoint ? getCircuitBreaker(endpoint).state : 'unknown',
      retryAttempted: error.config?._retryCount > 0,
      api: true
      // Explicitly exclude headers to prevent token exposure
    };
    
    logError(parsedError, sanitizedContext);

    // Handle authentication errors
    if (parsedError.type === ERROR_TYPES.AUTHENTICATION) {
      // Clear auth data and dispatch logout event
      tokenStorage.clearAll();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Dispatch custom event for auth context to handle
      window.dispatchEvent(new CustomEvent('auth:logout', { 
        detail: { reason: 'api_authentication_error' } 
      }));
    }

    // Create enhanced error object with standardized structure
    const enhancedError = {
      ...error,
      ...parsedError,
      // Preserve original error properties
      originalMessage: error.message,
      status: error.response?.status,
      isServerError: !!error.response,
      isNetworkError: !error.response && error.request,
      // Add API-specific metadata
      endpoint: endpoint,
      method: method,
      circuitState: endpoint ? getCircuitBreaker(endpoint).state : 'unknown',
      timestamp: new Date().toISOString(),
      fallbackAttempted: true
    };

    return Promise.reject(enhancedError);
  }
);

export default API;
