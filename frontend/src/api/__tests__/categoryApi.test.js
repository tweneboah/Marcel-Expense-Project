import axios from 'axios';
import * as categoryApi from '../categoryApi';
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

describe('categoryApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    secureStorage.getToken.mockReturnValue('mock-token');
  });

  describe('getCategories', () => {
    const mockCategories = [
      { id: '1', name: 'Food', color: '#FF6B6B', icon: 'utensils' },
      { id: '2', name: 'Transport', color: '#4ECDC4', icon: 'car' },
      { id: '3', name: 'Entertainment', color: '#45B7D1', icon: 'film' }
    ];

    it('should get categories successfully', async () => {
      const mockResponse = { data: mockCategories };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await categoryApi.getCategories();

      expect(mockedAxios.get).toHaveBeenCalledWith('/categories');
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

      await expect(categoryApi.getCategories()).rejects.toEqual(errorResponse);
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(networkError);

      await expect(categoryApi.getCategories()).rejects.toThrow('Network Error');
    });

    it('should handle empty categories list', async () => {
      const mockResponse = { data: [] };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await categoryApi.getCategories();

      expect(result.data).toEqual([]);
    });
  });

  describe('getCategoryById', () => {
    const mockCategory = {
      id: '1',
      name: 'Food',
      color: '#FF6B6B',
      icon: 'utensils',
      description: 'Food and dining expenses'
    };

    it('should get category by id successfully', async () => {
      const mockResponse = { data: mockCategory };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await categoryApi.getCategoryById('1');

      expect(mockedAxios.get).toHaveBeenCalledWith('/categories/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle category not found', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { error: 'Category not found' }
        }
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(categoryApi.getCategoryById('999')).rejects.toEqual(errorResponse);
    });

    it('should validate category id parameter', async () => {
      await expect(categoryApi.getCategoryById()).rejects.toThrow('Category ID is required');
      await expect(categoryApi.getCategoryById('')).rejects.toThrow('Category ID is required');
    });
  });

  describe('createCategory', () => {
    const categoryData = {
      name: 'Health',
      color: '#FF9F43',
      icon: 'heart',
      description: 'Medical and health expenses'
    };

    const mockResponse = {
      data: {
        id: '4',
        ...categoryData,
        createdAt: '2024-01-15T12:00:00Z'
      }
    };

    it('should create category successfully', async () => {
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await categoryApi.createCategory(categoryData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/categories', categoryData);
      expect(result).toEqual(mockResponse);
    });

    it('should validate required fields', async () => {
      const invalidData = { color: '#FF9F43' }; // missing name

      await expect(categoryApi.createCategory(invalidData)).rejects.toThrow('Category name is required');
    });

    it('should validate color format', async () => {
      const invalidData = { ...categoryData, color: 'invalid-color' };

      await expect(categoryApi.createCategory(invalidData)).rejects.toThrow('Invalid color format');
    });

    it('should handle duplicate category name', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: { error: 'Category name already exists' }
        }
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(categoryApi.createCategory(categoryData)).rejects.toEqual(errorResponse);
    });

    it('should validate name length', async () => {
      const invalidData = { ...categoryData, name: 'A'.repeat(51) }; // too long

      await expect(categoryApi.createCategory(invalidData)).rejects.toThrow('Category name must be 50 characters or less');
    });
  });

  describe('updateCategory', () => {
    const categoryId = '1';
    const updateData = {
      name: 'Food & Dining',
      color: '#FF5722',
      icon: 'utensils',
      description: 'Updated food category'
    };

    const mockResponse = {
      data: {
        id: categoryId,
        ...updateData,
        updatedAt: '2024-01-16T12:00:00Z'
      }
    };

    it('should update category successfully', async () => {
      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await categoryApi.updateCategory(categoryId, updateData);

      expect(mockedAxios.put).toHaveBeenCalledWith(`/categories/${categoryId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle category not found during update', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { error: 'Category not found' }
        }
      };

      mockedAxios.put.mockRejectedValue(errorResponse);

      await expect(categoryApi.updateCategory(categoryId, updateData)).rejects.toEqual(errorResponse);
    });

    it('should validate category id parameter', async () => {
      await expect(categoryApi.updateCategory('', updateData)).rejects.toThrow('Category ID is required');
    });

    it('should handle duplicate name during update', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: { error: 'Category name already exists' }
        }
      };

      mockedAxios.put.mockRejectedValue(errorResponse);

      await expect(categoryApi.updateCategory(categoryId, updateData)).rejects.toEqual(errorResponse);
    });
  });

  describe('deleteCategory', () => {
    const categoryId = '1';

    it('should delete category successfully', async () => {
      const mockResponse = { data: { message: 'Category deleted successfully' } };
      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await categoryApi.deleteCategory(categoryId);

      expect(mockedAxios.delete).toHaveBeenCalledWith(`/categories/${categoryId}`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle category not found during deletion', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { error: 'Category not found' }
        }
      };

      mockedAxios.delete.mockRejectedValue(errorResponse);

      await expect(categoryApi.deleteCategory(categoryId)).rejects.toEqual(errorResponse);
    });

    it('should validate category id parameter', async () => {
      await expect(categoryApi.deleteCategory()).rejects.toThrow('Category ID is required');
      await expect(categoryApi.deleteCategory('')).rejects.toThrow('Category ID is required');
    });

    it('should handle category in use error', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { error: 'Cannot delete category that is in use by expenses' }
        }
      };

      mockedAxios.delete.mockRejectedValue(errorResponse);

      await expect(categoryApi.deleteCategory(categoryId)).rejects.toEqual(errorResponse);
    });

    it('should handle permission denied', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: { error: 'Permission denied' }
        }
      };

      mockedAxios.delete.mockRejectedValue(errorResponse);

      await expect(categoryApi.deleteCategory(categoryId)).rejects.toEqual(errorResponse);
    });
  });

  describe('getCategoryStats', () => {
    const mockStats = {
      totalCategories: 5,
      categoriesWithExpenses: 3,
      categoryUsage: [
        { categoryId: '1', categoryName: 'Food', expenseCount: 15, totalAmount: 450.75 },
        { categoryId: '2', categoryName: 'Transport', expenseCount: 8, totalAmount: 120.50 },
        { categoryId: '3', categoryName: 'Entertainment', expenseCount: 5, totalAmount: 200.00 }
      ],
      unusedCategories: [
        { categoryId: '4', categoryName: 'Health' },
        { categoryId: '5', categoryName: 'Education' }
      ]
    };

    it('should get category statistics successfully', async () => {
      const mockResponse = { data: mockStats };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await categoryApi.getCategoryStats();

      expect(mockedAxios.get).toHaveBeenCalledWith('/categories/stats');
      expect(result).toEqual(mockResponse);
    });

    it('should get category statistics with date range', async () => {
      const mockResponse = { data: mockStats };
      const params = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await categoryApi.getCategoryStats(params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/categories/stats', { params });
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty statistics', async () => {
      const emptyStats = {
        totalCategories: 0,
        categoriesWithExpenses: 0,
        categoryUsage: [],
        unusedCategories: []
      };

      const mockResponse = { data: emptyStats };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await categoryApi.getCategoryStats();

      expect(result.data).toEqual(emptyStats);
    });
  });

  describe('getDefaultCategories', () => {
    const mockDefaultCategories = [
      { name: 'Food', color: '#FF6B6B', icon: 'utensils' },
      { name: 'Transport', color: '#4ECDC4', icon: 'car' },
      { name: 'Entertainment', color: '#45B7D1', icon: 'film' },
      { name: 'Health', color: '#FF9F43', icon: 'heart' },
      { name: 'Shopping', color: '#A55EEA', icon: 'shopping-bag' }
    ];

    it('should get default categories successfully', async () => {
      const mockResponse = { data: mockDefaultCategories };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await categoryApi.getDefaultCategories();

      expect(mockedAxios.get).toHaveBeenCalledWith('/categories/defaults');
      expect(result).toEqual(mockResponse);
    });

    it('should handle error getting default categories', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        }
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(categoryApi.getDefaultCategories()).rejects.toEqual(errorResponse);
    });
  });

  describe('bulkCreateCategories', () => {
    const categoriesData = [
      { name: 'Health', color: '#FF9F43', icon: 'heart' },
      { name: 'Education', color: '#26C6DA', icon: 'book' },
      { name: 'Shopping', color: '#A55EEA', icon: 'shopping-bag' }
    ];

    const mockResponse = {
      data: {
        created: 3,
        categories: categoriesData.map((cat, index) => ({
          id: `${index + 4}`,
          ...cat,
          createdAt: '2024-01-15T12:00:00Z'
        }))
      }
    };

    it('should bulk create categories successfully', async () => {
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await categoryApi.bulkCreateCategories(categoriesData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/categories/bulk', { categories: categoriesData });
      expect(result).toEqual(mockResponse);
    });

    it('should validate categories array', async () => {
      await expect(categoryApi.bulkCreateCategories([])).rejects.toThrow('Categories array cannot be empty');
      await expect(categoryApi.bulkCreateCategories()).rejects.toThrow('Categories array is required');
    });

    it('should validate maximum categories limit', async () => {
      const tooManyCategories = Array(101).fill({ name: 'Test', color: '#FF0000', icon: 'test' });

      await expect(categoryApi.bulkCreateCategories(tooManyCategories)).rejects.toThrow('Cannot create more than 100 categories at once');
    });

    it('should handle partial success', async () => {
      const partialResponse = {
        data: {
          created: 2,
          failed: 1,
          categories: categoriesData.slice(0, 2).map((cat, index) => ({
            id: `${index + 4}`,
            ...cat,
            createdAt: '2024-01-15T12:00:00Z'
          })),
          errors: [
            { index: 2, error: 'Category name already exists' }
          ]
        }
      };

      mockedAxios.post.mockResolvedValue(partialResponse);

      const result = await categoryApi.bulkCreateCategories(categoriesData);

      expect(result.data.created).toBe(2);
      expect(result.data.failed).toBe(1);
      expect(result.data.errors).toHaveLength(1);
    });
  });

  describe('searchCategories', () => {
    const mockSearchResults = [
      { id: '1', name: 'Food', color: '#FF6B6B', icon: 'utensils' },
      { id: '4', name: 'Fast Food', color: '#FF5722', icon: 'hamburger' }
    ];

    it('should search categories successfully', async () => {
      const mockResponse = { data: mockSearchResults };
      const searchQuery = 'food';

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await categoryApi.searchCategories(searchQuery);

      expect(mockedAxios.get).toHaveBeenCalledWith('/categories/search', {
        params: { q: searchQuery }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty search results', async () => {
      const mockResponse = { data: [] };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await categoryApi.searchCategories('nonexistent');

      expect(result.data).toEqual([]);
    });

    it('should validate search query', async () => {
      await expect(categoryApi.searchCategories('')).rejects.toThrow('Search query is required');
      await expect(categoryApi.searchCategories()).rejects.toThrow('Search query is required');
    });

    it('should handle search with minimum length', async () => {
      await expect(categoryApi.searchCategories('a')).rejects.toThrow('Search query must be at least 2 characters');
    });
  });
});