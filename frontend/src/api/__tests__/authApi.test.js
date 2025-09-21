import axios from 'axios';
import * as authApi from '../authApi';
import { secureStorage } from '../../utils/secureStorage';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock secureStorage
jest.mock('../../utils/secureStorage', () => ({
  secureStorage: {
    setToken: jest.fn(),
    getToken: jest.fn(),
    removeToken: jest.fn(),
    setRefreshToken: jest.fn(),
    getRefreshToken: jest.fn(),
    removeRefreshToken: jest.fn()
  }
}));

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.post.mockClear();
    mockedAxios.get.mockClear();
    mockedAxios.put.mockClear();
    mockedAxios.delete.mockClear();
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockResponse = {
      data: {
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        }
      }
    };

    it('should login successfully with valid credentials', async () => {
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.login(loginData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(secureStorage.setToken).toHaveBeenCalledWith('mock-jwt-token');
      expect(secureStorage.setRefreshToken).toHaveBeenCalledWith('mock-refresh-token');
      expect(result).toEqual(mockResponse);
    });

    it('should handle login error with invalid credentials', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { error: 'Invalid credentials' }
        }
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(authApi.login(loginData)).rejects.toEqual(errorResponse);
      expect(secureStorage.setToken).not.toHaveBeenCalled();
      expect(secureStorage.setRefreshToken).not.toHaveBeenCalled();
    });

    it('should handle network error during login', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValue(networkError);

      await expect(authApi.login(loginData)).rejects.toThrow('Network Error');
    });

    it('should validate required login fields', async () => {
      const invalidData = { email: 'test@example.com' }; // missing password

      await expect(authApi.login(invalidData)).rejects.toThrow();
    });
  });

  describe('register', () => {
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    };

    const mockResponse = {
      data: {
        message: 'Registration successful',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        }
      }
    };

    it('should register successfully with valid data', async () => {
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.register(registerData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle registration error with existing email', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: { error: 'Email already exists' }
        }
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(authApi.register(registerData)).rejects.toEqual(errorResponse);
    });

    it('should validate password confirmation', async () => {
      const invalidData = {
        ...registerData,
        confirmPassword: 'different-password'
      };

      await expect(authApi.register(invalidData)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      secureStorage.getToken.mockReturnValue('mock-token');
      mockedAxios.post.mockResolvedValue({ data: { message: 'Logged out successfully' } });

      const result = await authApi.logout();

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/logout');
      expect(secureStorage.removeToken).toHaveBeenCalled();
      expect(secureStorage.removeRefreshToken).toHaveBeenCalled();
      expect(result.data.message).toBe('Logged out successfully');
    });

    it('should handle logout error gracefully', async () => {
      secureStorage.getToken.mockReturnValue('mock-token');
      mockedAxios.post.mockRejectedValue(new Error('Logout failed'));

      // Should still clear tokens even if API call fails
      await expect(authApi.logout()).rejects.toThrow('Logout failed');
      expect(secureStorage.removeToken).toHaveBeenCalled();
      expect(secureStorage.removeRefreshToken).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    };

    it('should get current user successfully', async () => {
      secureStorage.getToken.mockReturnValue('mock-token');
      mockedAxios.get.mockResolvedValue({ data: mockUser });

      const result = await authApi.getCurrentUser();

      expect(mockedAxios.get).toHaveBeenCalledWith('/auth/me');
      expect(result.data).toEqual(mockUser);
    });

    it('should handle unauthorized error', async () => {
      secureStorage.getToken.mockReturnValue('invalid-token');
      const errorResponse = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      };

      mockedAxios.get.mockRejectedValue(errorResponse);

      await expect(authApi.getCurrentUser()).rejects.toEqual(errorResponse);
    });

    it('should handle missing token', async () => {
      secureStorage.getToken.mockReturnValue(null);

      await expect(authApi.getCurrentUser()).rejects.toThrow('No token found');
    });
  });

  describe('refreshToken', () => {
    const mockResponse = {
      data: {
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token'
      }
    };

    it('should refresh token successfully', async () => {
      secureStorage.getRefreshToken.mockReturnValue('mock-refresh-token');
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.refreshToken();

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'mock-refresh-token'
      });
      expect(secureStorage.setToken).toHaveBeenCalledWith('new-jwt-token');
      expect(secureStorage.setRefreshToken).toHaveBeenCalledWith('new-refresh-token');
      expect(result).toEqual(mockResponse);
    });

    it('should handle refresh token error', async () => {
      secureStorage.getRefreshToken.mockReturnValue('invalid-refresh-token');
      const errorResponse = {
        response: {
          status: 401,
          data: { error: 'Invalid refresh token' }
        }
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(authApi.refreshToken()).rejects.toEqual(errorResponse);
      expect(secureStorage.removeToken).toHaveBeenCalled();
      expect(secureStorage.removeRefreshToken).toHaveBeenCalled();
    });

    it('should handle missing refresh token', async () => {
      secureStorage.getRefreshToken.mockReturnValue(null);

      await expect(authApi.refreshToken()).rejects.toThrow('No refresh token found');
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';

    it('should send forgot password email successfully', async () => {
      const mockResponse = {
        data: { message: 'Password reset email sent' }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.forgotPassword(email);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/forgot-password', { email });
      expect(result).toEqual(mockResponse);
    });

    it('should handle forgot password error', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { error: 'Email not found' }
        }
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(authApi.forgotPassword(email)).rejects.toEqual(errorResponse);
    });

    it('should validate email format', async () => {
      const invalidEmail = 'invalid-email';

      await expect(authApi.forgotPassword(invalidEmail)).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    const resetData = {
      token: 'reset-token',
      password: 'newpassword123',
      confirmPassword: 'newpassword123'
    };

    it('should reset password successfully', async () => {
      const mockResponse = {
        data: { message: 'Password reset successful' }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.resetPassword(resetData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/reset-password', resetData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid reset token', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { error: 'Invalid or expired reset token' }
        }
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(authApi.resetPassword(resetData)).rejects.toEqual(errorResponse);
    });

    it('should validate password confirmation', async () => {
      const invalidData = {
        ...resetData,
        confirmPassword: 'different-password'
      };

      await expect(authApi.resetPassword(invalidData)).rejects.toThrow();
    });
  });

  describe('changePassword', () => {
    const changePasswordData = {
      currentPassword: 'oldpassword123',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123'
    };

    it('should change password successfully', async () => {
      secureStorage.getToken.mockReturnValue('mock-token');
      const mockResponse = {
        data: { message: 'Password changed successfully' }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await authApi.changePassword(changePasswordData);

      expect(mockedAxios.put).toHaveBeenCalledWith('/auth/change-password', changePasswordData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle incorrect current password', async () => {
      secureStorage.getToken.mockReturnValue('mock-token');
      const errorResponse = {
        response: {
          status: 400,
          data: { error: 'Current password is incorrect' }
        }
      };

      mockedAxios.put.mockRejectedValue(errorResponse);

      await expect(authApi.changePassword(changePasswordData)).rejects.toEqual(errorResponse);
    });

    it('should require authentication', async () => {
      secureStorage.getToken.mockReturnValue(null);

      await expect(authApi.changePassword(changePasswordData)).rejects.toThrow('No token found');
    });
  });

  describe('verifyEmail', () => {
    const verificationToken = 'verification-token';

    it('should verify email successfully', async () => {
      const mockResponse = {
        data: { message: 'Email verified successfully' }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.verifyEmail(verificationToken);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/verify-email', {
        token: verificationToken
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid verification token', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { error: 'Invalid or expired verification token' }
        }
      };

      mockedAxios.post.mockRejectedValue(errorResponse);

      await expect(authApi.verifyEmail(verificationToken)).rejects.toEqual(errorResponse);
    });
  });
});