import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockAuthContext, mockSettingsContext } from '../../../__tests__/utils/testUtils';
import Settings from '../Settings';
import * as settingsApi from '../../../api/settingsApi';

// Mock the settingsApi
jest.mock('../../../api/settingsApi');

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockUserSettings = {
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  theme: 'light',
  notifications: {
    email: true,
    push: false,
    budgetAlerts: true
  },
  privacy: {
    profileVisibility: 'private',
    dataSharing: false
  }
};

describe('Settings Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    settingsApi.getUserSettings.mockResolvedValue({ data: mockUserSettings });
    settingsApi.updateUserSettings.mockResolvedValue({ data: mockUserSettings });
  });

  it('renders settings page correctly', async () => {
    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('loads and displays user settings', async () => {
    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(settingsApi.getUserSettings).toHaveBeenCalled();
    });

    expect(screen.getByDisplayValue('USD')).toBeInTheDocument();
    expect(screen.getByDisplayValue('MM/DD/YYYY')).toBeInTheDocument();
    expect(screen.getByDisplayValue('light')).toBeInTheDocument();
  });

  it('updates currency setting', async () => {
    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    });

    const currencySelect = screen.getByLabelText(/currency/i);
    await user.selectOptions(currencySelect, 'EUR');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(settingsApi.updateUserSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'EUR'
        })
      );
    });
  });

  it('updates date format setting', async () => {
    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/date format/i)).toBeInTheDocument();
    });

    const dateFormatSelect = screen.getByLabelText(/date format/i);
    await user.selectOptions(dateFormatSelect, 'DD/MM/YYYY');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(settingsApi.updateUserSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFormat: 'DD/MM/YYYY'
        })
      );
    });
  });

  it('toggles theme setting', async () => {
    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    });

    const themeSelect = screen.getByLabelText(/theme/i);
    await user.selectOptions(themeSelect, 'dark');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(settingsApi.updateUserSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'dark'
        })
      );
    });
  });

  it('toggles email notifications', async () => {
    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
    });

    const emailToggle = screen.getByLabelText(/email notifications/i);
    await user.click(emailToggle);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(settingsApi.updateUserSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications: expect.objectContaining({
            email: false
          })
        })
      );
    });
  });

  it('toggles push notifications', async () => {
    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/push notifications/i)).toBeInTheDocument();
    });

    const pushToggle = screen.getByLabelText(/push notifications/i);
    await user.click(pushToggle);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(settingsApi.updateUserSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications: expect.objectContaining({
            push: true
          })
        })
      );
    });
  });

  it('toggles budget alerts', async () => {
    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/budget alerts/i)).toBeInTheDocument();
    });

    const budgetAlertsToggle = screen.getByLabelText(/budget alerts/i);
    await user.click(budgetAlertsToggle);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(settingsApi.updateUserSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          notifications: expect.objectContaining({
            budgetAlerts: false
          })
        })
      );
    });
  });

  it('updates privacy settings', async () => {
    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/profile visibility/i)).toBeInTheDocument();
    });

    const profileVisibilitySelect = screen.getByLabelText(/profile visibility/i);
    await user.selectOptions(profileVisibilitySelect, 'public');

    const dataSharing = screen.getByLabelText(/data sharing/i);
    await user.click(dataSharing);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(settingsApi.updateUserSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          privacy: {
            profileVisibility: 'public',
            dataSharing: true
          }
        })
      );
    });
  });

  it('shows loading state during save', async () => {
    settingsApi.updateUserSettings.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    });

    const currencySelect = screen.getByLabelText(/currency/i);
    await user.selectOptions(currencySelect, 'EUR');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it('handles save error gracefully', async () => {
    settingsApi.updateUserSettings.mockRejectedValue(new Error('Failed to save settings'));

    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    });

    const currencySelect = screen.getByLabelText(/currency/i);
    await user.selectOptions(currencySelect, 'EUR');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save settings/i)).toBeInTheDocument();
    });
  });

  it('resets form when reset button is clicked', async () => {
    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    });

    const currencySelect = screen.getByLabelText(/currency/i);
    await user.selectOptions(currencySelect, 'EUR');

    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('USD')).toBeInTheDocument();
    });
  });

  it('shows unsaved changes warning', async () => {
    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    });

    const currencySelect = screen.getByLabelText(/currency/i);
    await user.selectOptions(currencySelect, 'EUR');

    expect(screen.getByText(/you have unsaved changes/i)).toBeInTheDocument();
  });

  it('handles loading error gracefully', async () => {
    settingsApi.getUserSettings.mockRejectedValue(new Error('Failed to load settings'));

    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to load settings/i)).toBeInTheDocument();
    });
  });

  it('has accessible form elements', async () => {
    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    });

    const currencySelect = screen.getByLabelText(/currency/i);
    const emailToggle = screen.getByLabelText(/email notifications/i);

    expect(currencySelect).toHaveAttribute('aria-label');
    expect(emailToggle).toHaveAttribute('type', 'checkbox');
    expect(emailToggle).toHaveAttribute('role', 'switch');
  });

  it('validates required fields', async () => {
    renderWithProviders(<Settings />, {
      authValue: mockAuthContext,
      settingsValue: mockSettingsContext
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    });

    const currencySelect = screen.getByLabelText(/currency/i);
    await user.selectOptions(currencySelect, '');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/currency is required/i)).toBeInTheDocument();
    });

    expect(settingsApi.updateUserSettings).not.toHaveBeenCalled();
  });
});