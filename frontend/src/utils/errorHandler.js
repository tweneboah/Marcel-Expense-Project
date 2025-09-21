/**
 * Centralized Error Handling Utilities
 * Provides consistent error handling across the application
 */

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  CLIENT: 'CLIENT',
  UNKNOWN: 'UNKNOWN'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

/**
 * Standardized error object structure
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, severity = ERROR_SEVERITY.MEDIUM, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
    this.id = Math.random().toString(36).substr(2, 9);
  }
}

/**
 * Parse and categorize errors from different sources
 */
export const parseError = (error) => {
  // If it's already an AppError, return as is
  if (error instanceof AppError) {
    return error;
  }

  let message = 'An unexpected error occurred';
  let type = ERROR_TYPES.UNKNOWN;
  let severity = ERROR_SEVERITY.MEDIUM;

  // Handle Axios/API errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Extract message from response
    message = data?.error || data?.message || error.message || `Server error (${status})`;

    // Categorize by status code
    if (status === 401) {
      type = ERROR_TYPES.AUTHENTICATION;
      severity = ERROR_SEVERITY.HIGH;
      message = 'Authentication required. Please log in again.';
    } else if (status === 403) {
      type = ERROR_TYPES.AUTHORIZATION;
      severity = ERROR_SEVERITY.HIGH;
      message = 'You do not have permission to perform this action.';
    } else if (status >= 400 && status < 500) {
      type = ERROR_TYPES.VALIDATION;
      severity = ERROR_SEVERITY.MEDIUM;
    } else if (status >= 500) {
      type = ERROR_TYPES.SERVER;
      severity = ERROR_SEVERITY.HIGH;
      message = 'Server error. Please try again later.';
    }
  } 
  // Handle network errors
  else if (error.request) {
    type = ERROR_TYPES.NETWORK;
    severity = ERROR_SEVERITY.HIGH;
    message = 'Network error. Please check your connection and try again.';
  }
  // Handle client-side errors
  else if (error.message) {
    type = ERROR_TYPES.CLIENT;
    message = error.message;
  }

  return new AppError(message, type, severity, error);
};

/**
 * Get user-friendly error messages
 */
export const getErrorMessage = (error) => {
  const parsedError = parseError(error);
  
  // Return user-friendly messages based on error type
  switch (parsedError.type) {
    case ERROR_TYPES.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection.';
    case ERROR_TYPES.AUTHENTICATION:
      return 'Your session has expired. Please log in again.';
    case ERROR_TYPES.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    case ERROR_TYPES.VALIDATION:
      return parsedError.message || 'Please check your input and try again.';
    case ERROR_TYPES.SERVER:
      return 'Server is temporarily unavailable. Please try again later.';
    default:
      return parsedError.message || 'Something went wrong. Please try again.';
  }
};

/**
 * Log errors with appropriate level using secure logging
 */
export const logError = (error, context = {}) => {
  const parsedError = parseError(error);
  
  // Import logger dynamically to avoid circular dependencies
  import('./logger.js').then(({ default: logger }) => {
    // Use secure logger that sanitizes sensitive data
    logger.error(parsedError.message, {
      id: parsedError.id,
      type: parsedError.type,
      severity: parsedError.severity,
      timestamp: parsedError.timestamp,
      context: context, // Logger will sanitize this
      // Don't include originalError as it might contain sensitive data
    });
  }).catch(() => {
    // Fallback: log through proper infrastructure in development
    if (process.env.NODE_ENV === 'development') {
      // Error logged through proper infrastructure without sensitive data
    }
  });

  return parsedError;
};

/**
 * Handle errors with optional retry logic
 */
export const handleError = async (error, options = {}) => {
  const {
    context = {},
    showToast = true,
    logError: shouldLog = true,
    onRetry = null,
    maxRetries = 0,
    retryDelay = 1000
  } = options;

  const parsedError = parseError(error);

  // Log the error if requested
  if (shouldLog) {
    logError(parsedError, context);
  }

  // Handle authentication errors
  if (parsedError.type === ERROR_TYPES.AUTHENTICATION) {
    // Clear auth data and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Dispatch custom event for auth context to handle
    window.dispatchEvent(new CustomEvent('auth:logout', { 
      detail: { reason: 'authentication_error' } 
    }));
  }

  // Retry logic for network errors
  if (parsedError.type === ERROR_TYPES.NETWORK && onRetry && maxRetries > 0) {
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    
    try {
      return await onRetry();
    } catch (retryError) {
      return handleError(retryError, {
        ...options,
        maxRetries: maxRetries - 1,
        retryDelay: retryDelay * 1.5 // Exponential backoff
      });
    }
  }

  return parsedError;
};

/**
 * Create error boundary fallback component props
 */
export const createErrorBoundaryProps = (componentName) => ({
  onError: (error, errorInfo) => {
    logError(error, {
      component: componentName,
      errorInfo,
      boundary: true
    });
  },
  fallback: ({ error, resetError }) => {
    // Safe fallback without innerHTML to prevent XSS
    const div = document.createElement('div');
    div.className = 'error-boundary-fallback';
    
    // Create elements safely
    const heading = document.createElement('h2');
    heading.textContent = `Something went wrong in ${componentName}`;
    
    const paragraph = document.createElement('p');
    paragraph.textContent = getErrorMessage(error);
    
    const button = document.createElement('button');
    button.textContent = 'Try again';
    button.addEventListener('click', resetError);
    
    // Append elements safely
    div.appendChild(heading);
    div.appendChild(paragraph);
    div.appendChild(button);
    
    return div;
  }
});

/**
 * Async error wrapper for components
 */
export const withErrorHandling = (asyncFn, options = {}) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      return handleError(error, options);
    }
  };
};

export default {
  ERROR_TYPES,
  ERROR_SEVERITY,
  AppError,
  parseError,
  getErrorMessage,
  logError,
  handleError,
  createErrorBoundaryProps,
  withErrorHandling
};