import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ErrorProvider } from '../../context/ErrorContext';
import { SettingsProvider } from '../../context/SettingsContext';

// Mock implementations
export const mockAuthContext = {
  user: {
    _id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  },
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  loading: false,
  isAuthenticated: true
};

export const mockErrorContext = {
  errors: [],
  addError: jest.fn(),
  removeError: jest.fn(),
  clearErrors: jest.fn()
};

export const mockSettingsContext = {
  settings: {
    costPerKilometer: { value: '0.70' },
    cateringAllowance: { value: '25.00' },
    accommodationAllowance: { value: '150.00' }
  },
  loading: false,
  refreshSettings: jest.fn()
};

// Custom render function with providers
export const renderWithProviders = (
  ui,
  {
    authValue = mockAuthContext,
    errorValue = mockErrorContext,
    settingsValue = mockSettingsContext,
    route = '/',
    ...renderOptions
  } = {}
) => {
  // Mock the context providers
  const MockAuthProvider = ({ children }) => (
    <AuthProvider value={authValue}>{children}</AuthProvider>
  );
  
  const MockErrorProvider = ({ children }) => (
    <ErrorProvider value={errorValue}>{children}</ErrorProvider>
  );
  
  const MockSettingsProvider = ({ children }) => (
    <SettingsProvider value={settingsValue}>{children}</SettingsProvider>
  );

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <MockAuthProvider>
        <MockErrorProvider>
          <MockSettingsProvider>
            {children}
          </MockSettingsProvider>
        </MockErrorProvider>
      </MockAuthProvider>
    </BrowserRouter>
  );

  // Set initial route
  window.history.pushState({}, 'Test page', route);

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock API responses
export const mockApiResponse = (data, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {}
});

export const mockApiError = (message = 'API Error', status = 500) => ({
  response: {
    data: { error: message },
    status,
    statusText: 'Internal Server Error'
  },
  message
});

// Common test data
export const mockExpense = {
  _id: 'expense-1',
  description: 'Test Expense',
  amount: 100.50,
  category: 'Travel',
  date: '2024-01-15',
  user: 'test-user-id',
  status: 'pending'
};

export const mockCategory = {
  _id: 'category-1',
  name: 'Travel',
  description: 'Travel expenses',
  color: '#3B82F6'
};

export const mockBudget = {
  _id: 'budget-1',
  name: 'Monthly Travel Budget',
  amount: 1000,
  category: 'category-1',
  month: 1,
  year: 2024,
  spent: 250.75
};

// Helper functions
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const createMockEvent = (value) => ({
  target: { value },
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
});

export const mockLocalStorage = () => {
  const store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
};

// Custom matchers
export const expectElementToBeVisible = (element) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveText = (element, text) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent(text);
};