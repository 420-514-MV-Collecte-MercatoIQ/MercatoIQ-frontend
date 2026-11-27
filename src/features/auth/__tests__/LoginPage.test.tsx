import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '../../../i18n';
import { ThemeProvider } from '../../../shared/context/ThemeContext';
import { LoginPage } from '../pages/LoginPage';

const loginMock = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: loginMock,
    register: vi.fn(),
    loginWithGoogleCredential: vi.fn(),
    loginWithGoogleDemo: vi.fn(),
    logout: vi.fn(),
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: false,
  }),
}));

vi.mock('../../../shared/context/DemoModeContext', () => ({
  useDemoMode: () => ({
    isDemoMode: true,
    enableDemoMode: vi.fn(),
    disableDemoMode: vi.fn(),
    toggleDemoMode: vi.fn(),
  }),
}));

vi.mock('../../../shared/context/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe('LoginPage validation', () => {
  it('blocks short passwords (<8 chars) with inline alert error', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: '123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in$/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 8 characters.');
    expect(loginMock).not.toHaveBeenCalled();
  });
});
