import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '../../../i18n';
import { GoogleAuthSection } from '../components/GoogleAuthButton';

let demoMode = false;

vi.mock('../../../shared/context/DemoModeContext', () => ({
  useDemoMode: () => ({ isDemoMode: demoMode }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ loginWithGoogleCredential: vi.fn(), loginWithGoogleDemo: vi.fn() }),
}));

vi.mock('../../../shared/context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

function renderSection() {
  render(
    <MemoryRouter>
      <GoogleAuthSection mode="signin" />
    </MemoryRouter>,
  );
}

const googleButton = () => screen.queryByRole('button', { name: /google/i });

describe('GoogleAuthSection', () => {
  afterEach(() => {
    demoMode = false;
    vi.unstubAllEnvs();
  });

  it('is hidden when Google is not configured', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    vi.stubEnv('VITE_GOOGLE_OAUTH_URL', '');
    renderSection();

    expect(googleButton()).not.toBeInTheDocument();
    expect(screen.queryByText('or')).not.toBeInTheDocument();
  });

  it('is visible when a Google client ID is configured', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id.apps.googleusercontent.com');
    renderSection();

    expect(googleButton()).toBeInTheDocument();
  });

  it('is visible when an OAuth redirect URL is configured', () => {
    vi.stubEnv('VITE_GOOGLE_OAUTH_URL', 'http://localhost:3000/api/v1/auth/google');
    renderSection();

    expect(googleButton()).toBeInTheDocument();
  });

  it('is visible in demo mode', () => {
    demoMode = true;
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    vi.stubEnv('VITE_GOOGLE_OAUTH_URL', '');
    renderSection();

    expect(googleButton()).toBeInTheDocument();
  });
});
