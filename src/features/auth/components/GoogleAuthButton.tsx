import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../../../shared/context/DemoModeContext';
import { useToast } from '../../../shared/context/ToastContext';
import { AppApiError } from '../../../shared/api/httpClient';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: (momentListener?: (notification: { isNotDisplayed: () => boolean }) => void) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.toString().trim();
const GOOGLE_OAUTH_URL = import.meta.env.VITE_GOOGLE_OAUTH_URL?.toString().trim();

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google script failed')), {
        once: true,
      });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

function GoogleLogoSvg() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3.01h3.87c2.26-2.08 3.56-5.15 3.56-8.66z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3.01c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.29v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.94 1.19 15.23 0 12 0A12 12 0 0 0 1.28 6.61l4 3.1C6.23 6.87 8.88 4.76 12 4.76z"
      />
    </svg>
  );
}

export function GoogleAuthButton() {
  const { t } = useTranslation();
  const { isDemoMode, enableDemoMode } = useDemoMode();
  const { loginWithGoogleCredential, loginWithGoogleDemo } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [setupHintOpen, setSetupHintOpen] = useState(false);

  const state = location.state as { from?: { pathname?: string } } | null;
  const redirectTarget = state?.from?.pathname || '/dashboard';

  const handleDemoGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogleDemo();
      showToast(t('googleAuth.demoSuccess'), 'success');
      navigate(redirectTarget, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setSetupHintOpen(false);

    if (isDemoMode) {
      await handleDemoGoogleSignIn();
      return;
    }

    if (GOOGLE_OAUTH_URL) {
      window.location.href = GOOGLE_OAUTH_URL;
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      setSetupHintOpen(true);
      return;
    }

    setLoading(true);
    try {
      await loadGoogleIdentityScript();
      const gis = window.google?.accounts?.id;
      if (!gis) {
        throw new Error(t('googleAuth.unavailable'));
      }

      gis.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response.credential) {
            setLoading(false);
            showToast(t('googleAuth.cancelled'), 'info');
            return;
          }
          try {
            const { clientFallback } = await loginWithGoogleCredential(response.credential);
            showToast(
              clientFallback ? t('googleAuth.clientFallbackNotice') : t('googleAuth.success'),
              clientFallback ? 'info' : 'success',
            );
            navigate(redirectTarget, { replace: true });
          } catch (err) {
            const msg =
              err instanceof AppApiError
                ? err.details.join(' · ') || err.message
                : t('googleAuth.unavailable');
            showToast(msg, 'error');
          } finally {
            setLoading(false);
          }
        },
      });

      gis.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          setLoading(false);
          showToast(t('googleAuth.promptBlocked'), 'info');
        }
      });
    } catch {
      setLoading(false);
      showToast(t('googleAuth.unavailable'), 'error');
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        isLoading={loading}
        leftIcon={<GoogleLogoSvg />}
        onClick={() => void handleGoogleClick()}
      >
        {t('googleAuth.continueWithGoogle')}
      </Button>

      {setupHintOpen && (
        <div className="rounded-2xl p-3.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-strong)] text-xs space-y-2.5">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {t('googleAuth.missingConfigHint')}
          </p>
          <Button
            type="button"
            size="sm"
            variant="pill"
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
            onClick={() => {
              enableDemoMode();
              void handleDemoGoogleSignIn();
            }}
          >
            {t('googleAuth.tryGoogleDemo')}
          </Button>
        </div>
      )}
    </div>
  );
}
