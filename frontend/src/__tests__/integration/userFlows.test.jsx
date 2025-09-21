import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';

// Mock API modules
jest.mock('../../api/authApi', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  register: jest.fn()
}));

// Mock tokenStorage
jest.mock('../../utils/secureStorage', () => ({
  tokenStorage: {
    getToken: jest.fn(),
    getUser: jest.fn(),
    setToken: jest.fn(),
    setUser: jest.fn(),
    clearAll: jest.fn()
  }
}));

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import { login, getCurrentUser } from '../../api/authApi';
import { tokenStorage } from '../../utils/secureStorage';

// Simple test component that uses AuthContext
const TestApp = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div data-testid="app">Test App</div>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    tokenStorage.getToken.mockReturnValue(null);
    tokenStorage.getUser.mockReturnValue(null);
  });

  it('should render app with AuthProvider', async () => {
    render(<TestApp />);
    
    await waitFor(() => {
      expect(screen.getByTestId('app')).toBeInTheDocument();
    });
  });

  it('should handle authenticated user state', async () => {
    // Mock authenticated user
    const mockUser = { id: 1, email: 'test@test.com', role: 'user' };
    const mockToken = 'existing-token';
    
    tokenStorage.getToken.mockReturnValue(mockToken);
    tokenStorage.getUser.mockReturnValue(mockUser);

    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByTestId('app')).toBeInTheDocument();
    });

    // Verify that the app renders without errors for authenticated users
    expect(tokenStorage.getToken).toHaveBeenCalled();
  });

  it('should handle unauthenticated user state', async () => {
    // Mock unauthenticated user
    tokenStorage.getToken.mockReturnValue(null);
    tokenStorage.getUser.mockReturnValue(null);

    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByTestId('app')).toBeInTheDocument();
    });

    // Verify that the app renders without errors for unauthenticated users
    expect(tokenStorage.getToken).toHaveBeenCalled();
  });

  it('should handle auth logout event', async () => {
    // Mock authenticated user initially
    const mockUser = { id: 1, email: 'test@test.com', role: 'user' };
    tokenStorage.getToken.mockReturnValue('token');
    tokenStorage.getUser.mockReturnValue(mockUser);

    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByTestId('app')).toBeInTheDocument();
    });

    // Simulate logout event
    act(() => {
      window.dispatchEvent(new CustomEvent('auth:logout'));
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should handle invalid token scenario', async () => {
    // Mock invalid token scenario
    tokenStorage.getToken.mockReturnValue('invalid-token');
    tokenStorage.getUser.mockReturnValue(null);
    getCurrentUser.mockRejectedValue(new Error('Invalid token'));

    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByTestId('app')).toBeInTheDocument();
    });

    // Should clear invalid token and redirect to login
    await waitFor(() => {
      expect(tokenStorage.clearAll).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});