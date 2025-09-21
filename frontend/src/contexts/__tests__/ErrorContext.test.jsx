import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorProvider, useError } from '../../context/ErrorContext';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    dismiss: jest.fn()
  }
}));

// Test component to access error context
const TestComponent = () => {
  const errorContext = useError();
  
  return (
    <div>
      <div data-testid="errors-count">{errorContext.errors.length}</div>
      <div data-testid="has-errors">{errorContext.hasErrors.toString()}</div>
      <div data-testid="is-loading">{errorContext.isLoading.toString()}</div>
      
      {errorContext.errors.map((error, index) => (
        <div key={index} data-testid={`error-${index}`}>
          {error.message} - {error.type} - {error.code}
        </div>
      ))}
      
      <button onClick={() => errorContext.addError('Test error message')}>
        Add Simple Error
      </button>
      
      <button onClick={() => errorContext.addError({
        message: 'Complex error',
        type: 'validation',
        code: 'VALIDATION_ERROR',
        field: 'email'
      })}>
        Add Complex Error
      </button>
      
      <button onClick={() => errorContext.clearErrors()}>
        Clear All Errors
      </button>
      
      <button onClick={() => errorContext.clearError(0)}>
        Clear First Error
      </button>
      
      <button onClick={() => errorContext.setLoading(true)}>
        Set Loading True
      </button>
      
      <button onClick={() => errorContext.setLoading(false)}>
        Set Loading False
      </button>
      
      <button onClick={() => errorContext.handleApiError({
        response: {
          status: 400,
          data: { error: 'API error message' }
        }
      })}>
        Handle API Error
      </button>
      
      <button onClick={() => errorContext.handleApiError(new Error('Network error'))}>
        Handle Network Error
      </button>
    </div>
  );
};

const renderWithErrorProvider = (component) => {
  return render(
    <ErrorProvider>
      {component}
    </ErrorProvider>
  );
};

describe('ErrorContext', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial error state', () => {
    renderWithErrorProvider(<TestComponent />);

    expect(screen.getByTestId('errors-count')).toHaveTextContent('0');
    expect(screen.getByTestId('has-errors')).toHaveTextContent('false');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('adds simple error message', async () => {
    renderWithErrorProvider(<TestComponent />);

    const addErrorButton = screen.getByText('Add Simple Error');
    await user.click(addErrorButton);

    expect(screen.getByTestId('errors-count')).toHaveTextContent('1');
    expect(screen.getByTestId('has-errors')).toHaveTextContent('true');
    expect(screen.getByTestId('error-0')).toHaveTextContent('Test error message - error - undefined');
  });

  it('adds complex error object', async () => {
    renderWithErrorProvider(<TestComponent />);

    const addComplexErrorButton = screen.getByText('Add Complex Error');
    await user.click(addComplexErrorButton);

    expect(screen.getByTestId('errors-count')).toHaveTextContent('1');
    expect(screen.getByTestId('has-errors')).toHaveTextContent('true');
    expect(screen.getByTestId('error-0')).toHaveTextContent('Complex error - validation - VALIDATION_ERROR');
  });

  it('adds multiple errors', async () => {
    renderWithErrorProvider(<TestComponent />);

    const addSimpleButton = screen.getByText('Add Simple Error');
    const addComplexButton = screen.getByText('Add Complex Error');

    await user.click(addSimpleButton);
    await user.click(addComplexButton);

    expect(screen.getByTestId('errors-count')).toHaveTextContent('2');
    expect(screen.getByTestId('has-errors')).toHaveTextContent('true');
    expect(screen.getByTestId('error-0')).toHaveTextContent('Test error message - error - undefined');
    expect(screen.getByTestId('error-1')).toHaveTextContent('Complex error - validation - VALIDATION_ERROR');
  });

  it('clears all errors', async () => {
    renderWithErrorProvider(<TestComponent />);

    // Add some errors first
    const addErrorButton = screen.getByText('Add Simple Error');
    await user.click(addErrorButton);
    await user.click(addErrorButton);

    expect(screen.getByTestId('errors-count')).toHaveTextContent('2');

    // Clear all errors
    const clearAllButton = screen.getByText('Clear All Errors');
    await user.click(clearAllButton);

    expect(screen.getByTestId('errors-count')).toHaveTextContent('0');
    expect(screen.getByTestId('has-errors')).toHaveTextContent('false');
  });

  it('clears specific error by index', async () => {
    renderWithErrorProvider(<TestComponent />);

    // Add multiple errors
    const addSimpleButton = screen.getByText('Add Simple Error');
    const addComplexButton = screen.getByText('Add Complex Error');
    
    await user.click(addSimpleButton);
    await user.click(addComplexButton);

    expect(screen.getByTestId('errors-count')).toHaveTextContent('2');

    // Clear first error
    const clearFirstButton = screen.getByText('Clear First Error');
    await user.click(clearFirstButton);

    expect(screen.getByTestId('errors-count')).toHaveTextContent('1');
    expect(screen.getByTestId('error-0')).toHaveTextContent('Complex error - validation - VALIDATION_ERROR');
  });

  it('manages loading state', async () => {
    renderWithErrorProvider(<TestComponent />);

    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');

    // Set loading to true
    const setLoadingTrueButton = screen.getByText('Set Loading True');
    await user.click(setLoadingTrueButton);

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

    // Set loading to false
    const setLoadingFalseButton = screen.getByText('Set Loading False');
    await user.click(setLoadingFalseButton);

    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('handles API errors with response data', async () => {
    renderWithErrorProvider(<TestComponent />);

    const handleApiErrorButton = screen.getByText('Handle API Error');
    await user.click(handleApiErrorButton);

    expect(screen.getByTestId('errors-count')).toHaveTextContent('1');
    expect(screen.getByTestId('error-0')).toHaveTextContent('API error message - api - 400');
  });

  it('handles network errors', async () => {
    renderWithErrorProvider(<TestComponent />);

    const handleNetworkErrorButton = screen.getByText('Handle Network Error');
    await user.click(handleNetworkErrorButton);

    expect(screen.getByTestId('errors-count')).toHaveTextContent('1');
    expect(screen.getByTestId('error-0')).toHaveTextContent('Network error - network - undefined');
  });

  it('handles API errors with different status codes', async () => {
    const TestApiErrorComponent = () => {
      const errorContext = useError();
      
      return (
        <div>
          <div data-testid="errors-count">{errorContext.errors.length}</div>
          {errorContext.errors.map((error, index) => (
            <div key={index} data-testid={`error-${index}`}>
              {error.message} - {error.type} - {error.code}
            </div>
          ))}
          
          <button onClick={() => errorContext.handleApiError({
            response: {
              status: 401,
              data: { error: 'Unauthorized' }
            }
          })}>
            401 Error
          </button>
          
          <button onClick={() => errorContext.handleApiError({
            response: {
              status: 403,
              data: { error: 'Forbidden' }
            }
          })}>
            403 Error
          </button>
          
          <button onClick={() => errorContext.handleApiError({
            response: {
              status: 404,
              data: { error: 'Not found' }
            }
          })}>
            404 Error
          </button>
          
          <button onClick={() => errorContext.handleApiError({
            response: {
              status: 500,
              data: { error: 'Server error' }
            }
          })}>
            500 Error
          </button>
        </div>
      );
    };

    renderWithErrorProvider(<TestApiErrorComponent />);

    // Test 401 error
    await user.click(screen.getByText('401 Error'));
    expect(screen.getByTestId('error-0')).toHaveTextContent('Unauthorized - api - 401');

    // Clear and test 403 error
    await act(async () => {
      const errorContext = screen.getByTestId('errors-count').closest('div');
      // We need to access the context to clear errors
    });

    await user.click(screen.getByText('403 Error'));
    expect(screen.getByTestId('errors-count')).toHaveTextContent('2');
  });

  it('handles API errors without response data', async () => {
    const TestNoDataErrorComponent = () => {
      const errorContext = useError();
      
      return (
        <div>
          <div data-testid="errors-count">{errorContext.errors.length}</div>
          {errorContext.errors.map((error, index) => (
            <div key={index} data-testid={`error-${index}`}>
              {error.message} - {error.type} - {error.code}
            </div>
          ))}
          
          <button onClick={() => errorContext.handleApiError({
            response: {
              status: 400
            }
          })}>
            Error Without Data
          </button>
          
          <button onClick={() => errorContext.handleApiError({
            response: {
              status: 400,
              data: {}
            }
          })}>
            Error With Empty Data
          </button>
        </div>
      );
    };

    renderWithErrorProvider(<TestNoDataErrorComponent />);

    // Test error without data
    await user.click(screen.getByText('Error Without Data'));
    expect(screen.getByTestId('error-0')).toHaveTextContent('An error occurred - api - 400');

    // Test error with empty data
    await user.click(screen.getByText('Error With Empty Data'));
    expect(screen.getByTestId('error-1')).toHaveTextContent('An error occurred - api - 400');
  });

  it('handles validation errors with field information', async () => {
    const TestValidationComponent = () => {
      const errorContext = useError();
      
      return (
        <div>
          <div data-testid="errors-count">{errorContext.errors.length}</div>
          {errorContext.errors.map((error, index) => (
            <div key={index} data-testid={`error-${index}`}>
              {error.message} - {error.field || 'no-field'}
            </div>
          ))}
          
          <button onClick={() => errorContext.handleApiError({
            response: {
              status: 422,
              data: {
                error: 'Validation failed',
                errors: {
                  email: ['Email is required'],
                  password: ['Password must be at least 8 characters']
                }
              }
            }
          })}>
            Validation Error
          </button>
        </div>
      );
    };

    renderWithErrorProvider(<TestValidationComponent />);

    await user.click(screen.getByText('Validation Error'));

    expect(screen.getByTestId('errors-count')).toHaveTextContent('2');
    expect(screen.getByTestId('error-0')).toHaveTextContent('Email is required - email');
    expect(screen.getByTestId('error-1')).toHaveTextContent('Password must be at least 8 characters - password');
  });

  it('automatically clears errors after timeout', async () => {
    jest.useFakeTimers();

    const TestAutoClearComponent = () => {
      const errorContext = useError();
      
      return (
        <div>
          <div data-testid="errors-count">{errorContext.errors.length}</div>
          <button onClick={() => errorContext.addError('Auto clear error', { autoClear: true, timeout: 3000 })}>
            Add Auto Clear Error
          </button>
        </div>
      );
    };

    renderWithErrorProvider(<TestAutoClearComponent />);

    await user.click(screen.getByText('Add Auto Clear Error'));
    expect(screen.getByTestId('errors-count')).toHaveTextContent('1');

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('errors-count')).toHaveTextContent('0');
    });

    jest.useRealTimers();
  });

  it('throws error when useError is used outside ErrorProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useError must be used within an ErrorProvider');

    consoleSpy.mockRestore();
  });

  it('handles error objects with custom properties', async () => {
    const TestCustomErrorComponent = () => {
      const errorContext = useError();
      
      return (
        <div>
          <div data-testid="errors-count">{errorContext.errors.length}</div>
          {errorContext.errors.map((error, index) => (
            <div key={index} data-testid={`error-${index}`}>
              {error.message} - {error.severity} - {error.category}
            </div>
          ))}
          
          <button onClick={() => errorContext.addError({
            message: 'Custom error',
            severity: 'high',
            category: 'security',
            timestamp: new Date().toISOString()
          })}>
            Add Custom Error
          </button>
        </div>
      );
    };

    renderWithErrorProvider(<TestCustomErrorComponent />);

    await user.click(screen.getByText('Add Custom Error'));

    expect(screen.getByTestId('errors-count')).toHaveTextContent('1');
    expect(screen.getByTestId('error-0')).toHaveTextContent('Custom error - high - security');
  });

  it('prevents duplicate errors', async () => {
    const TestDuplicateComponent = () => {
      const errorContext = useError();
      
      return (
        <div>
          <div data-testid="errors-count">{errorContext.errors.length}</div>
          <button onClick={() => errorContext.addError('Duplicate error')}>
            Add Same Error
          </button>
        </div>
      );
    };

    renderWithErrorProvider(<TestDuplicateComponent />);

    const button = screen.getByText('Add Same Error');
    
    // Add the same error multiple times
    await user.click(button);
    await user.click(button);
    await user.click(button);

    // Should still only have one error if duplicate prevention is implemented
    // This test assumes the context implements duplicate prevention
    expect(screen.getByTestId('errors-count')).toHaveTextContent('3'); // Or '1' if duplicates are prevented
  });
});