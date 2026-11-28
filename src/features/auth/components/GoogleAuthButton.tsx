import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spinner } from '../../../shared/components/ui/Loaders';
import { getApiErrorMessage } from '../../../shared/api/httpClient';
import { useDemoMode } from '../../../shared/context/DemoModeContext';
import { useToast } from '../../../shared/context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getRedirectPath } from '../utils/authSession';
import { loadGoogleIdentityScript } from '../utils/googleIdentityLoader';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.toString().trim();
const GOOGLE_OAUTH_URL = import.meta.env.VITE_GOOGLE_OAUTH_URL?.toString().trim();

export function isGoogleAuthConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_GOOGLE_CLIENT_ID?.toString().trim() ||
      import.meta.env.VITE_GOOGLE_OAUTH_URL?.toString().trim(),
  );
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

export function GoogleAuthButton({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const { t } = useTranslation();
  const { isDemoMode } = useDemoMode();
  const { loginWithGoogleCredential, loginWithGoogleDemo } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const redirectTarget = getRedirectPath(location.state);

  const handleDemoGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogleDemo();
      showToast(t('googleAuth.demoSuccess'), 'success');
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      showToast(getApiErrorMessage(err, t('googleAuth.unavailable')), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    if (isDemoMode) {
      await handleDemoGoogleSignIn();
      return;
    }

    if (GOOGLE_OAUTH_URL) {
      window.location.href = GOOGLE_OAUTH_URL;
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    setLoading(true);
    try {
      const gis = await loadGoogleIdentityScript();
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
            showToast(getApiErrorMessage(err, t('googleAuth.unavailable')), 'error');
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

  const buttonLabel =
    mode === 'signup' ? t('googleAuth.signUpWithGoogle') : t('googleAuth.continueWithGoogle');

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void handleGoogleClick()}
      className="h-11 w-full rounded-lg border border-[var(--border-strong)] bg-transparent hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-sm font-semibold inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Spinner size="sm" /> : <GoogleLogoSvg />}
      <span>{buttonLabel}</span>
    </button>
  );
}

// Visible seulement si Google est configuré ou en mode démo
export function GoogleAuthSection({ mode }: { mode: 'signin' | 'signup' }) {
  const { t } = useTranslation();
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode && !isGoogleAuthConfigured()) {
    return null;
  }

  return (
    <>
      <div className="relative flex items-center justify-center py-1">
        <div className="border-t border-[var(--border-subtle)] w-full" />
        <span className="px-3 text-xs text-[var(--text-muted)] bg-[var(--bg-surface)]">
          {t('googleAuth.orDivider')}
        </span>
        <div className="border-t border-[var(--border-subtle)] w-full" />
      </div>
      <GoogleAuthButton mode={mode} />
    </>
  );
}
