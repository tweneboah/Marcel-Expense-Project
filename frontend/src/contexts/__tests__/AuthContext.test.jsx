import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  BrowserRouter: ({ children }) => <div>{children}</div>
}));

// Mock authApi
jest.mock('../../api/authApi', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn()
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

import { login as loginApi, logout as logoutApi, getCurrentUser } from '../../api/authApi';
import { tokenStorage } from '../../utils/secureStorage';

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  
  return (
    <div>
      <div data-testid="user">{auth.user ? JSON.stringify(auth.user) : 'null'}</div>
      <div data-testid="token">{auth.token || 'null'}</div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="error">{auth.error || 'null'}</div>
      <div data-testid="isAdmin">{auth.isAdmin.toString()}</div>
      <div data-testid="isSalesRep">{auth.isSalesRep.toString()}</div>
      <button onClick={() => auth.login({ email: 'test@test.com', password: 'password' })}>
        Login
      </button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.hasRole('admin')}>Check Admin Role</button>
    </div>
  );
};

const renderWithAuthProvider = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    tokenStorage.getToken.mockReturnValue(null);
    tokenStorage.getUser.mockReturnValue(null);
  });

  it('provides initial state correctly', async () => {
    renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('null');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
    expect(screen.getByTestId('isSalesRep')).toHaveTextContent('false');
  });

  it('initializes with existing token and user', async () => {
    const mockUser = { id: 1, email: 'test@test.com', role: 'user' };
    const mockToken = 'existing-token';
    
    tokenStorage.getToken.mockReturnValue(mockToken);
    tokenStorage.getUser.mockReturnValue(mockUser);

    renderWithAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
  });

  it('fetches user data when token exists but no user data', async () => {
    const mockUser = { id: 1, email: 'test@test.com', role: 'user' };
    const mockToken = 'existing-token';
    
    tokenStorage.getToken.mockReturnValue(mockToken);
    tokenStorage.getUser.mockReturnValue(null);
    getCurrentUser.mockResolvedValue({ data: mockUser });

    renderWithAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(getCurrentUser).toHaveBeenCalled();
    expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
  });

  it('handles login successfully', async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, email: 'test@test.com', role: 'user' };
    const mockToken = 'new-token';
    
    loginApi.mockResolvedValue({
      user: mockUser,
      token: mockToken
    });

    renderWithAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      await user.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
    });

    expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('handles admin login and redirects to admin dashboard', async () => {
      const user = userEvent.setup();
      const mockUser = { id: 1, email: 'admin@test.com', role: 'admin' };
      const mockToken = 'admin-token';
      
      loginApi.mockResolvedValue({
        user: mockUser,
        token: mockToken
      });

      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      await act(async () => {
        await user.click(screen.getByText('Login'));
      });

      // Check if login was called
      expect(loginApi).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password'
      });

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });

  it('handles logout successfully', async () => {
    const user = userEvent.setup();
    const mockUser = { id: 1, email: 'test@test.com', role: 'user' };
    
    // Set initial authenticated state
    tokenStorage.getToken.mockReturnValue('token');
    tokenStorage.getUser.mockReturnValue(mockUser);
    logoutApi.mockResolvedValue();

    renderWithAuthProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      await user.click(screen.getByText('Logout'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('throws error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });
});