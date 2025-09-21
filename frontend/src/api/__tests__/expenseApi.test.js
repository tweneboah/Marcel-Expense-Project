import axios from 'axios';
import * as expenseApi from '../expenseApi';
import { secureStorage } from '../../utils/secureStorage';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock secureStorage
jest.mock('../../utils/secureStorage', () => ({
  secureStorage: {
    getToken: jest.fn()
  }
}));

describe('expenseApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    secureStorage.getToken.mockReturnValue('mock-token');
  });

  describe('getExpenses', () => {
    const mockExpenses = [
      {
        id: '1',
        amount: 25.50,
        description: 'Lunch',
        category: 'Food',
        date: '2024-01-15',
        receipt: null
      },
      {
        id: '2',
        amount: 15.00,
        description: 'Coffee',
        category: 'Food',
        date: '2024-01-14',
        receipt: 'receipt.jpg'
      }
    ];

    it('should get expenses successfully', async () => {
      const mockResponse = { data: mockExpenses };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await expenseApi.getExpenses();

      expect(mockedAxios.get).toHaveBeenCalledWith('/expenses');
      expect(result).toEqual(mockResponse);
    });

    it('should get expenses with query parameters', async () => {
      const mockResponse = { data: mockExpenses };
      const params = {
        category: 'Food',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        limit: 10,
        offset: 0
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await expenseApi.getExpenses(params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/expenses', { params });
      expect(result).toEqual(mockResponse);
    });

    it('should handle unauthorized error', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(expenseApi.getExpenses()).rejects.toEqual(errorResponse);
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(networkError);

      await expect(expenseApi.getExpenses()).rejects.toThrow('Network Error');
    });
  });

  describe('getExpenseById', () => {
    const mockExpense = {
      id: '1',
      amount: 25.50,
      description: 'Lunch',
      category: 'Food',
      date: '2024-01-15',
      receipt: null
    };

    it('should get expense by id successfully', async () => {
      const mockResponse = { data: mockExpense };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await expenseApi.getExpenseById('1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/expenses/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle expense not found', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { error: 'Expense not found' }
        }
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(expenseApi.getExpenseById('999')).rejects.toEqual(errorResponse);
    });

    it('should validate expense id parameter', async () => {
      await expect(expenseApi.getExpenseById()).rejects.toThrow('Expense ID is required');
      await expect(expenseApi.getExpenseById('')).rejects.toThrow('Expense ID is required');
    });
  });

  describe('createExpense', () => {
    const expenseData = {
      amount: 25.50,
      description: 'Lunch',
      categoryId: '1',
      date: '2024-01-15',
      receipt: null
    };

    const mockResponse = {
      data: {
        id: '1',
        ...expenseData,
        category: 'Food',
        createdAt: '2024-01-15T12:00:00Z'
      }
    };

    it('should create expense successfully', async () => {
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await expenseApi.createExpense(expenseData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/expenses', expenseData);
      expect(result).toEqual(mockResponse);
    });

    it('should create expense with file upload', async () => {
      const formData = new FormData();
      const file = new File(['receipt'], 'receipt.jpg', { type: 'image/jpeg' });
      
      const expenseWithFile = {
        ...expenseData,
        receipt: file
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await expenseApi.createExpense(expenseWithFile);

      expect(mockedAxios.post).toHaveBeenCalledWith('/expenses', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should validate required fields', async () => {
      const invalidData = { description: 'Lunch' }; // missing amount, categoryId, date

      await expect(expenseApi.createExpense(invalidData)).rejects.toThrow();
    });

    it('should validate amount is positive', async () => {
      const invalidData = { ...expenseData, amount: -10 };

      await expect(expenseApi.createExpense(invalidData)).rejects.toThrow();
    });

    it('should handle validation errors from server', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { 
            error: 'Validation failed',
            details: ['Amount must be greater than 0']
          }
        }
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(expenseApi.createExpense(expenseData)).rejects.toEqual(errorResponse);
    });
  });

  describe('updateExpense', () => {
    const expenseId = '1';
    const updateData = {
      amount: 30.00,
      description: 'Updated lunch',
      categoryId: '2',
      date: '2024-01-16'
    };

    const mockResponse = {
      data: {
        id: expenseId,
        ...updateData,
        category: 'Transport',
        updatedAt: '2024-01-16T12:00:00Z'
      }
    };

    it('should update expense successfully', async () => {
      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await expenseApi.updateExpense(expenseId, updateData);

      expect(mockedAxios.put).toHaveBeenCalledWith(`/expenses/${expenseId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should update expense with file upload', async () => {
      const file = new File(['receipt'], 'receipt.jpg', { type: 'image/jpeg' });
      const updateWithFile = { ...updateData, receipt: file };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await expenseApi.updateExpense(expenseId, updateWithFile);

      expect(mockedAxios.put).toHaveBeenCalledWith(`/expenses/${expenseId}`, expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle expense not found during update', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { error: 'Expense not found' }
        }
      };

      mockedAxios.put.mockRejectedValue(errorResponse);

      await expect(expenseApi.updateExpense(expenseId, updateData)).rejects.toEqual(errorResponse);
    });

    it('should validate expense id parameter', async () => {
      await expect(expenseApi.updateExpense('', updateData)).rejects.toThrow('Expense ID is required');
    });
  });

  describe('deleteExpense', () => {
    const expenseId = '1';

    it('should delete expense successfully', async () => {
      const mockResponse = { data: { message: 'Expense deleted successfully' } };
      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await expenseApi.deleteExpense(expenseId);

      expect(mockedAxios.delete).toHaveBeenCalledWith(`/expenses/${expenseId}`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle expense not found during deletion', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { error: 'Expense not found' }
        }
      };

      mockedAxios.delete.mockRejectedValue(errorResponse);

      await expect(expenseApi.deleteExpense(expenseId)).rejects.toEqual(errorResponse);
    });

    it('should validate expense id parameter', async () => {
      await expect(expenseApi.deleteExpense()).rejects.toThrow('Expense ID is required');
      await expect(expenseApi.deleteExpense('')).rejects.toThrow('Expense ID is required');
    });

    it('should handle permission denied', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: { error: 'Permission denied' }
        }
      };

      mockedAxios.delete.mockRejectedValue(errorResponse);

      await expect(expenseApi.deleteExpense(expenseId)).rejects.toEqual(errorResponse);
    });
  });

  describe('getExpenseStats', () => {
    const mockStats = {
      totalExpenses: 150.75,
      expenseCount: 10,
      averageExpense: 15.08,
      categoryBreakdown: [
        { category: 'Food', amount: 75.50, count: 5 },
        { category: 'Transport', amount: 45.25, count: 3 },
        { category: 'Entertainment', amount: 30.00, count: 2 }
      ],
      monthlyTrend: [
        { month: '2024-01', amount: 120.50 },
        { month: '2024-02', amount: 150.75 }
      ]
    };

    it('should get expense statistics successfully', async () => {
      const mockResponse = { data: mockStats };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await expenseApi.getExpenseStats();

      expect(mockedAxios.get).toHaveBeenCalledWith('/expenses/stats');
      expect(result).toEqual(mockResponse);
    });

    it('should get expense statistics with date range', async () => {
      const mockResponse = { data: mockStats };
      const params = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await expenseApi.getExpenseStats(params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/expenses/stats', { params });
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty statistics', async () => {
      const emptyStats = {
        totalExpenses: 0,
        expenseCount: 0,
        averageExpense: 0,
        categoryBreakdown: [],
        monthlyTrend: []
      };

      const mockResponse = { data: emptyStats };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await expenseApi.getExpenseStats();

      expect(result.data).toEqual(emptyStats);
    });
  });

  describe('searchExpenses', () => {
    const mockSearchResults = [
      {
        id: '1',
        amount: 25.50,
        description: 'Lunch at restaurant',
        category: 'Food',
        date: '2024-01-15'
      }
    ];

    it('should search expenses successfully', async () => {
      const mockResponse = { data: mockSearchResults };
      const searchQuery = 'lunch';

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await expenseApi.searchExpenses(searchQuery);

      expect(mockedAxios.get).toHaveBeenCalledWith('/expenses/search', {
        params: { q: searchQuery }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should search expenses with filters', async () => {
      const mockResponse = { data: mockSearchResults };
      const searchQuery = 'lunch';
      const filters = {
        category: 'Food',
        minAmount: 10,
        maxAmount: 50
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await expenseApi.searchExpenses(searchQuery, filters);

      expect(mockedAxios.get).toHaveBeenCalledWith('/expenses/search', {
        params: { q: searchQuery, ...filters }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty search results', async () => {
      const mockResponse = { data: [] };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await expenseApi.searchExpenses('nonexistent');

      expect(result.data).toEqual([]);
    });

    it('should validate search query', async () => {
      await expect(expenseApi.searchExpenses('')).rejects.toThrow('Search query is required');
      await expect(expenseApi.searchExpenses()).rejects.toThrow('Search query is required');
    });
  });

  describe('exportExpenses', () => {
    it('should export expenses successfully', async () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });
      const mockResponse = { data: mockBlob };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await expenseApi.exportExpenses('csv');

      expect(mockedAxios.get).toHaveBeenCalledWith('/expenses/export', {
        params: { format: 'csv' },
        responseType: 'blob'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should export expenses with date range', async () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });
      const mockResponse = { data: mockBlob };
      const params = {
        format: 'csv',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await expenseApi.exportExpenses('csv', params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/expenses/export', {
        params,
        responseType: 'blob'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should validate export format', async () => {
      await expect(expenseApi.exportExpenses('invalid')).rejects.toThrow('Invalid export format');
    });
  });
});