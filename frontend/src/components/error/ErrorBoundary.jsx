import React from 'react';
import { logError, getErrorMessage, ERROR_SEVERITY } from '../../utils/errorHandler';
import Button from '../ui/Button';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error with context
    const loggedError = logError(error, {
      component: this.props.componentName || 'Unknown Component',
      errorInfo,
      boundary: true,
      props: this.props.logProps ? this.props : undefined
    });

    this.setState({
      error,
      errorInfo,
      errorId: loggedError.id
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset,
          errorId: this.state.errorId
        });
      }

      // Default fallback UI
      const errorMessage = getErrorMessage(this.state.error);
      const isMinimal = this.props.minimal;

      if (isMinimal) {
        return (
          <div className="error-boundary-minimal">
            <div className="flex items-center space-x-2 text-red-600">
              <FiAlertTriangle className="w-4 h-4" />
              <span className="text-sm">{errorMessage}</span>
              <button
                onClick={this.handleReset}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Try again
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="error-boundary-container min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <FiAlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                {errorMessage}
              </p>
              
              {this.props.showDetails && this.state.errorId && (
                <div className="text-xs text-gray-400 mb-4">
                  Error ID: {this.state.errorId}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={this.handleReset}
                className="w-full"
                variant="primary"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button
                onClick={this.handleReload}
                className="w-full"
                variant="secondary"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>

              <Button
                onClick={this.handleGoHome}
                className="w-full"
                variant="outline"
              >
                <FiHome className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>

            {this.props.showDetails && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Technical Details
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, options = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary
      componentName={Component.displayName || Component.name}
      {...options}
    >
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for using error boundary in functional components
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const captureError = React.useCallback((error) => {
    setError(error);
  }, []);

  return captureError;
};

export default ErrorBoundary;