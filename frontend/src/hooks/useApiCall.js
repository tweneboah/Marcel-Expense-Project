import { useState, useCallback } from 'react';
import { useError } from '../context/ErrorContext';
import { parseError, ERROR_TYPES } from '../utils/errorHandler';

/**
 * Custom hook for making API calls with consistent error handling
 */
export const useApiCall = (options = {}) => {
  const {
    showErrorToast = true,
    retryOnNetworkError = true,
    maxRetries = 2,
    retryDelay = 1000,
    onSuccess = null,
    onError = null
  } = options;

  const { addError } = useError();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (apiCall, callOptions = {}) => {
    const {
      showToast = showErrorToast,
      retry = retryOnNetworkError,
      maxRetryAttempts = maxRetries,
      delay = retryDelay,
      context = {}
    } = callOptions;

    setLoading(true);
    setError(null);

    let attempts = 0;
    const maxAttempts = maxRetryAttempts + 1;

    while (attempts < maxAttempts) {
      try {
        const result = await apiCall();
        
        setData(result);
        setLoading(false);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        attempts++;
        const parsedError = parseError(err);
        
        // Check if we should retry
        const shouldRetry = 
          retry && 
          attempts < maxAttempts && 
          (parsedError.type === ERROR_TYPES.NETWORK || 
           (parsedError.type === ERROR_TYPES.SERVER && err.status >= 500));

        if (shouldRetry) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
          continue;
        }

        // Final error handling
        setError(parsedError);
        setLoading(false);

        // Add to global error state if requested
        if (showToast) {
          addError(parsedError, { context });
        }

        // Call custom error handler
        if (onError) {
          onError(parsedError);
        }

        throw parsedError;
      }
    }
  }, [addError, showErrorToast, retryOnNetworkError, maxRetries, retryDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset
  };
};

/**
 * Hook for simple API calls without state management
 */
export const useSimpleApiCall = () => {
  const { addError } = useError();

  const call = useCallback(async (apiCall, options = {}) => {
    const {
      showErrorToast = true,
      context = {},
      onError = null
    } = options;

    try {
      return await apiCall();
    } catch (error) {
      const parsedError = parseError(error);
      
      if (showErrorToast) {
        addError(parsedError, { context });
      }

      if (onError) {
        onError(parsedError);
      }

      throw parsedError;
    }
  }, [addError]);

  return call;
};

/**
 * Hook for handling form submissions with error handling
 */
export const useFormSubmit = (submitFn, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    showSuccessToast = false,
    successMessage = 'Operation completed successfully'
  } = options;

  const { execute, loading, error } = useApiCall({
    showErrorToast: true,
    onSuccess: (result) => {
      if (showSuccessToast) {
        // You can implement a success toast here
        // Success message handled by UI components
      }
      if (onSuccess) {
        onSuccess(result);
      }
    },
    onError
  });

  const handleSubmit = useCallback(async (formData, submitOptions = {}) => {
    return execute(() => submitFn(formData), {
      context: { form: true, ...submitOptions.context }
    });
  }, [execute, submitFn]);

  return {
    handleSubmit,
    loading,
    error
  };
};

/**
 * Hook for data fetching with error handling
 */
export const useFetch = (fetchFn, dependencies = [], options = {}) => {
  const {
    immediate = true,
    showErrorToast = true,
    retryOnError = true
  } = options;

  const { execute, loading, error, data } = useApiCall({
    showErrorToast,
    retryOnNetworkError: retryOnError
  });

  const fetch = useCallback(() => {
    return execute(fetchFn, {
      context: { fetch: true }
    });
  }, [execute, fetchFn]);

  // Auto-fetch on mount and dependency changes
  React.useEffect(() => {
    if (immediate) {
      fetch();
    }
  }, [fetch, immediate, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetch
  };
};

export default useApiCall;