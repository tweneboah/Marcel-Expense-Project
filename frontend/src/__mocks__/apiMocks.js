// Mock axios for API testing
export const mockAxios = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(() => mockAxios),
  defaults: {
    headers: {
      common: {}
    }
  },
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn()
    },
    response: {
      use: jest.fn(),
      eject: jest.fn()
    }
  }
};

// Mock API responses
export const mockAuthApiResponses = {
  login: {
    data: {
      token: 'mock-jwt-token',
      user: {
        _id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }
    }
  },
  register: {
    data: {
      token: 'mock-jwt-token',
      user: {
        _id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }
    }
  },
  forgotPassword: {
    data: {
      message: 'Password reset email sent'
    }
  },
  resetPassword: {
    data: {
      message: 'Password reset successful'
    }
  }
};

export const mockExpenseApiResponses = {
  getExpenses: {
    data: {
      expenses: [
        {
          _id: 'expense-1',
          description: 'Test Expense 1',
          amount: 100.50,
          category: 'Travel',
          date: '2024-01-15',
          status: 'pending'
        },
        {
          _id: 'expense-2',
          description: 'Test Expense 2',
          amount: 75.25,
          category: 'Meals',
          date: '2024-01-16',
          status: 'approved'
        }
      ],
      totalPages: 1,
      currentPage: 1,
      totalExpenses: 2
    }
  },
  createExpense: {
    data: {
      _id: 'expense-new',
      description: 'New Expense',
      amount: 50.00,
      category: 'Office',
      date: '2024-01-17',
      status: 'pending'
    }
  },
  updateExpense: {
    data: {
      _id: 'expense-1',
      description: 'Updated Expense',
      amount: 120.00,
      category: 'Travel',
      date: '2024-01-15',
      status: 'pending'
    }
  }
};

export const mockCategoryApiResponses = {
  getCategories: {
    data: [
      {
        _id: 'category-1',
        name: 'Travel',
        description: 'Travel expenses',
        color: '#3B82F6'
      },
      {
        _id: 'category-2',
        name: 'Meals',
        description: 'Meal expenses',
        color: '#10B981'
      }
    ]
  },
  createCategory: {
    data: {
      _id: 'category-new',
      name: 'New Category',
      description: 'New category description',
      color: '#F59E0B'
    }
  }
};

export const mockBudgetApiResponses = {
  getBudgets: {
    data: [
      {
        _id: 'budget-1',
        name: 'Monthly Travel Budget',
        amount: 1000,
        category: 'category-1',
        month: 1,
        year: 2024,
        spent: 250.75
      }
    ]
  },
  createBudget: {
    data: {
      _id: 'budget-new',
      name: 'New Budget',
      amount: 500,
      category: 'category-2',
      month: 2,
      year: 2024,
      spent: 0
    }
  }
};

export const mockSettingsApiResponses = {
  getSettings: {
    data: [
      {
        _id: 'setting-1',
        key: 'costPerKilometer',
        value: '0.70',
        description: 'Cost per kilometer for travel expenses'
      },
      {
        _id: 'setting-2',
        key: 'cateringAllowance',
        value: '25.00',
        description: 'Daily catering allowance'
      }
    ]
  },
  getSettingByKey: {
    data: {
      _id: 'setting-1',
      key: 'costPerKilometer',
      value: '0.70',
      description: 'Cost per kilometer for travel expenses'
    }
  }
};

// Error responses
export const mockApiErrors = {
  unauthorized: {
    response: {
      status: 401,
      data: { error: 'Unauthorized access' }
    }
  },
  forbidden: {
    response: {
      status: 403,
      data: { error: 'Forbidden' }
    }
  },
  notFound: {
    response: {
      status: 404,
      data: { error: 'Resource not found' }
    }
  },
  serverError: {
    response: {
      status: 500,
      data: { error: 'Internal server error' }
    }
  },
  networkError: {
    message: 'Network Error',
    code: 'NETWORK_ERROR'
  }
};

// Helper to reset all mocks
export const resetApiMocks = () => {
  Object.values(mockAxios).forEach(mock => {
    if (typeof mock === 'function' && mock.mockReset) {
      mock.mockReset();
    }
  });
};