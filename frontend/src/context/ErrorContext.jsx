import React, { createContext, useContext, useState, useCallback } from 'react';
import { parseError, logError, getErrorMessage, ERROR_SEVERITY } from '../utils/errorHandler';

const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);
  const [globalError, setGlobalError] = useState(null);

  // Add a new error to the global state
  const addError = useCallback((error, options = {}) => {
    const {
      context = {},
      persistent = false,
      autoRemove = true,
      autoRemoveDelay = 5000
    } = options;

    const parsedError = parseError(error);
    
    // Log the error
    logError(parsedError, context);

    // Create error object with metadata
    const errorObj = {
      ...parsedError,
      persistent,
      context,
      createdAt: Date.now()
    };

    // Add to errors array
    setErrors(prev => [...prev, errorObj]);

    // Set as global error if it's critical
    if (parsedError.severity === ERROR_SEVERITY.CRITICAL) {
      setGlobalError(errorObj);
    }

    // Auto-remove non-persistent errors
    if (!persistent && autoRemove) {
      setTimeout(() => {
        removeError(errorObj.id);
      }, autoRemoveDelay);
    }

    return errorObj;
  }, []);

  // Remove an error by ID
  const removeError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
    
    // Clear global error if it matches
    setGlobalError(prev => prev?.id === errorId ? null : prev);
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([]);
    setGlobalError(null);
  }, []);

  // Clear global error
  const clearGlobalError = useCallback(() => {
    setGlobalError(null);
  }, []);

  // Get errors by type
  const getErrorsByType = useCallback((type) => {
    return errors.filter(error => error.type === type);
  }, [errors]);

  // Get errors by severity
  const getErrorsBySeverity = useCallback((severity) => {
    return errors.filter(error => error.severity === severity);
  }, [errors]);

  // Check if there are any critical errors
  const hasCriticalErrors = useCallback(() => {
    return errors.some(error => error.severity === ERROR_SEVERITY.CRITICAL);
  }, [errors]);

  // Get the most recent error
  const getLatestError = useCallback(() => {
    return errors.length > 0 ? errors[errors.length - 1] : null;
  }, [errors]);

  // Handle async operations with error handling
  const withErrorHandling = useCallback((asyncFn, options = {}) => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        addError(error, options);
        throw error; // Re-throw so components can handle if needed
      }
    };
  }, [addError]);

  // Show user-friendly error message
  const showError = useCallback((error, options = {}) => {
    const message = getErrorMessage(error);
    addError(error, { ...options, userMessage: message });
  }, [addError]);

  const value = {
    // State
    errors,
    globalError,
    
    // Actions
    addError,
    removeError,
    clearErrors,
    clearGlobalError,
    showError,
    
    // Utilities
    getErrorsByType,
    getErrorsBySeverity,
    hasCriticalErrors,
    getLatestError,
    withErrorHandling
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export default ErrorContext;