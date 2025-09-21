import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockAuthContext } from '../../../__tests__/utils/testUtils';
import ExpenseForm from '../ExpenseForm';
import * as expenseApi from '../../../api/expenseApi';
import * as categoryApi from '../../../api/categoryApi';

// Mock the APIs
jest.mock('../../../api/expenseApi');
jest.mock('../../../api/categoryApi');

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockCategories = [
  { id: '1', name: 'Food', color: '#FF6B6B' },
  { id: '2', name: 'Transport', color: '#4ECDC4' },
  { id: '3', name: 'Entertainment', color: '#45B7D1' }
];

const mockExpense = {
  id: '1',
  amount: 25.50,
  description: 'Lunch at restaurant',
  category: 'Food',
  categoryId: '1',
  date: '2024-01-15',
  receipt: null
};

describe('ExpenseForm Component', () => {
  const user = userEvent.setup();
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    categoryApi.getCategories.mockResolvedValue({ data: mockCategories });
  });

  it('renders form correctly for creating new expense', async () => {
    renderWithProviders(
      <ExpenseForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { authValue: mockAuthContext }
    );

    await waitFor(() => {
      expect(screen.getByText('Add New Expense')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByText(/add receipt/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders form correctly for editing existing expense', async () => {
    renderWithProviders(
      <ExpenseForm 
        expense={mockExpense}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { authValue: mockAuthContext }
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Expense')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('25.50')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lunch at restaurant')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update expense/i })).toBeInTheDocument();
  });

  it('loads and displays categories in dropdown', async () => {
    renderWithProviders(
      <ExpenseForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { authValue: mockAuthContext }
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText(/category/i);
    fireEvent.click(categorySelect);

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Transport')).toBeInTheDocument();
      expect(screen.getByText('Entertainment')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    renderWithProviders(
      <ExpenseForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { authValue: mockAuthContext }
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/category is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates amount format', async () => {
    renderWithProviders(
      <ExpenseForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { authValue: mockAuthContext }
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });

    const amountInput = screen.getByLabelText(/amount/i);
    await user.type(amountInput, 'invalid-amount');

    const submitButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid amount/i)).toBeInTheDocument();
    });
  });

  it('validates amount is positive', async () => {
    renderWithProviders(
      <ExpenseForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { authValue: mockAuthContext }
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });

    const amountInput = screen.getByLabelText(/amount/i);
    await user.type(amountInput, '-10.50');

    const submitButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    renderWithProviders(
      <ExpenseForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { authValue: mockAuthContext }
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });

    // Fill out the form
    const amountInput = screen.getByLabelText(/amount/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const dateInput = screen.getByLabelText(/date/i);

    await user.type(amountInput, '15.75');
    await user.type(descriptionInput, 'Coffee and pastry');
    
    fireEvent.click(categorySelect);
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Food'));

    await user.clear(dateInput);
    await user.type(dateInput, '2024-01-20');

    const submitButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        amount: 15.75,
        description: 'Coffee and pastry',
        categoryId: '1',
        date: '2024-01-20',
        receipt: null
      });
    });
  });

  it('handles file upload for receipt', async () => {
    renderWithProviders(
      <ExpenseForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { authValue: mockAuthContext }
    );

    await waitFor(() => {
      expect(screen.getByText(/add receipt/i)).toBeInTheDocument();
    });

    const file = new File(['receipt content'], 'receipt.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/receipt/i);

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('receipt.jpg')).toBeInTheDocument();
    });
  });

  it('validates file size for receipt', async () => {
    renderWithProviders(
      <ExpenseForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { authValue: mockAuthContext }
    );

    await waitFor(() => {
      expect(screen.getByText(/add receipt/i)).toBeInTheDocument();
    });

    // Create a file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large-receipt.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/receipt/i);

    await user.upload(fileInput, largeFile);

    await waitFor(() => {
      expect(screen.getByText(/file size must be less than 5mb/i)).toBeInTheDocument();
    });
  });

  it('validates file type for receipt', async () => {
    renderWithProviders(
      <ExpenseForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { authValue: mockAuthContext }
    );

    await waitFor(() => {
      expect(screen.getByText(/add receipt/i)).toBeInTheDocument();
    });

    const invalidFile = new File(['content'], 'document.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/receipt/i);

    await user.upload(fileInput, invalidFile);

    await waitFor(() => {
      expect(screen.getByText(/only image files are allowed/i)).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    renderWithProviders(
      <ExpenseForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { authValue: mockAuthContext }
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    const slowSubmit = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithProviders(
      <ExpenseForm 
        onSubmit={slowSubmit}
        onCancel={mockOnCancel}
      />,
      { authValue: mockAuthContext }
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });

    // Fill required fields
    const amountInput = screen.getByLabelText(/amount/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const categorySelect = screen.getByLabelText(/category/i);

    await user.type(amountInput, '10.00');
    await user.type(descriptionInput, 'Test expense');
    
    fireEvent.click(categorySelect);
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Food'));

    const submitButton = screen.getByRole('button', { name: /add expense/i });
    await user.click(submitButton);

    expect(screen.getByText(/adding expense/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('handles category loading error gracefully', async () => {
    categoryApi.getCategories.mockRejectedValue(new Error('Failed to load categories'));

    renderWithProviders(
      <ExpenseForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
      { authValue: mockAuthContext }
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load categories/i)).toBeInTheDocument();
    });
  });
});