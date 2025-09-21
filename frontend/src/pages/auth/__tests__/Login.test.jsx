import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockAuthContext } from '../../../__tests__/utils/testUtils';
import Login from '../Login';
import * as authApi from '../../../api/authApi';

// Mock the authApi
jest.mock('../../../api/authApi');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('Login Component', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders login form correctly', () => {
    renderWithProviders(<Login />, {
      authValue: { ...mockAuthContext, isAuthenticated: false }
    });

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('shows validation error for empty fields', async () => {
    renderWithProviders(<Login />, {
      authValue: { ...mockAuthContext, isAuthenticated: false }
    });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter both email and password/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email format', async () => {
    renderWithProviders(<Login />, {
      authValue: { ...mockAuthContext, isAuthenticated: false }
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('handles successful login', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      token: 'mock-token',
      user: { id: '1', email: 'test@example.com', role: 'user' }
    });

    authApi.login.mockResolvedValue({
      data: {
        token: 'mock-token',
        user: { id: '1', email: 'test@example.com', role: 'user' }
      }
    });

    renderWithProviders(<Login />, {
      authValue: { 
        ...mockAuthContext, 
        isAuthenticated: false,
        login: mockLogin
      }
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('handles login error', async () => {
    const mockLogin = jest.fn().mockRejectedValue({
      response: {
        data: { error: 'Invalid credentials' }
      }
    });

    renderWithProviders(<Login />, {
      authValue: { 
        ...mockAuthContext, 
        isAuthenticated: false,
        login: mockLogin
      }
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during login', async () => {
    const mockLogin = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithProviders(<Login />, {
      authValue: { 
        ...mockAuthContext, 
        isAuthenticated: false,
        login: mockLogin
      }
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('redirects authenticated users', () => {
    renderWithProviders(<Login />, {
      authValue: { ...mockAuthContext, isAuthenticated: true }
    });

    // Should redirect, so login form should not be visible
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
  });

  it('has accessible form elements', () => {
    renderWithProviders(<Login />, {
      authValue: { ...mockAuthContext, isAuthenticated: false }
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('clears form errors when user starts typing', async () => {
    renderWithProviders(<Login />, {
      authValue: { ...mockAuthContext, isAuthenticated: false }
    });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter both email and password/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    await waitFor(() => {
      expect(screen.queryByText(/please enter both email and password/i)).not.toBeInTheDocument();
    });
  });
});