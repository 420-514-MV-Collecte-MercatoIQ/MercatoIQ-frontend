import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '../../../i18n';
import { GuestRoute, ProtectedRoute } from '../components/RouteGuards';

const mockUseAuth = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('RouteGuards', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('redirects unauthenticated users from ProtectedRoute to /login', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAuthLoading: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Private Profile</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Screen</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login Screen')).toBeInTheDocument();
  });

  it('shows 403 Forbidden screen when user role does not match allowedRoles', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAuthLoading: false,
      user: { id: '1', email: 'user@mercatoiq.io', role: 'user' },
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div>Admin Console</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/403/)).toBeInTheDocument();
    expect(screen.queryByText('Admin Console')).not.toBeInTheDocument();
  });

  it('redirects authenticated users away from GuestRoute to /dashboard', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAuthLoading: false,
      user: { id: '1', email: 'user@mercatoiq.io', role: 'user' },
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <div>Login Screen</div>
              </GuestRoute>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard Home</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Dashboard Home')).toBeInTheDocument();
  });
});
