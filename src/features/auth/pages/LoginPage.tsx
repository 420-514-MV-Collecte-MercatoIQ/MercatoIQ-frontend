import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getApiErrorMessage } from '../../../shared/api/httpClient';
import { Spinner } from '../../../shared/components/ui/Loaders';
import { useDemoMode } from '../../../shared/context/DemoModeContext';
import { useToast } from '../../../shared/context/ToastContext';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';
import { cn } from '../../../shared/utils/formatters';
import { isValidEmail } from '../../../shared/utils/validation';
import { AuthLayout } from '../components/AuthLayout';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { GoogleAuthSection } from '../components/GoogleAuthButton';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';
import { getRedirectPath } from '../utils/authSession';

export function LoginPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('common.signIn'));

  const { login } = useAuth();
  const { showToast } = useToast();
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const redirectTarget = getRedirectPath(location.state);
  const canSubmit = email.trim().length > 0 && password.length >= 8;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg(null);

    if (!isValidEmail(email)) {
      setErrorMsg(t('auth.invalidEmail'));
      return;
    }
    if (password.length < 8) {
      setErrorMsg(t('auth.passwordTooShort'));
      return;
    }
    if (password.length > 72) {
      setErrorMsg(t('auth.passwordTooLong'));
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      showToast(isDemoMode ? t('auth.demoLoginNotice') : t('auth.loginSuccess'), 'success');
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, t('common.apiOfflineTitle')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.loginTitle')}
      belowCard={
        <div className="text-center space-y-2 text-xs text-[var(--text-secondary)]">
          <p>
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="font-semibold text-[var(--accent-primary)] hover:underline">
              {t('auth.goToRegister')}
            </Link>
          </p>
          <Link
            to="/dashboard"
            className="inline-block text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('auth.continueGuest')}
          </Link>
        </div>
      }
    >
      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg px-3.5 py-2.5 text-xs font-medium bg-[var(--accent-negative-soft)] text-[var(--accent-negative)] border border-[var(--accent-negative)]/30"
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-xs font-medium text-[var(--text-secondary)]">
            {t('auth.emailLabel')}
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            className="h-11 w-full rounded-lg px-3.5 text-sm bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>

        <PasswordField
          id="login-password"
          label={t('auth.passwordLabel')}
          value={password}
          onChange={setPassword}
          placeholder={t('auth.passwordPlaceholder')}
          autoComplete="current-password"
        />

        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="text-xs font-medium text-[var(--accent-primary)] hover:underline cursor-pointer"
          >
            {t('auth.forgotPassword')}
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            'h-11 w-full rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2',
            canSubmit
              ? 'bg-[var(--bg-pill-active)] text-[var(--text-pill-active)] hover:opacity-90'
              : 'bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]',
          )}
        >
          {submitting && <Spinner size="sm" />}
          <span>{submitting ? t('common.loading') : t('auth.submitLogin')}</span>
        </button>
      </form>

      <GoogleAuthSection mode="signin" />

      <ForgotPasswordModal
        open={forgotOpen}
        initialEmail={email}
        onClose={() => setForgotOpen(false)}
      />
    </AuthLayout>
  );
}
