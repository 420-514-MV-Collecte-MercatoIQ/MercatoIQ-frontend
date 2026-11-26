import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { BrandLogo } from '../../../shared/components/layout/BrandLogo';
import { LanguageToggle } from '../../../shared/components/ui/LanguageToggle';
import { ThemeToggle } from '../../../shared/components/ui/ThemeToggle';
import { Spinner } from '../../../shared/components/ui/Loaders';
import { Modal } from '../../../shared/components/ui/Modal';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../../../shared/context/ToastContext';
import { useDemoMode } from '../../../shared/context/DemoModeContext';
import { AppApiError } from '../../../shared/api/httpClient';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';
import { cn } from '../../../shared/utils/formatters';

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
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const state = location.state as { from?: { pathname?: string } } | null;
  const redirectTarget = state?.from?.pathname || '/dashboard';
  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.includes('@')) {
      setErrorMsg(t('auth.invalidEmail'));
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
      const msg =
        err instanceof AppApiError
          ? err.details.join(' · ') || err.message
          : err instanceof Error
            ? err.message
            : t('common.apiOfflineTitle');
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes('@')) return;
    setForgotSent(true);
    showToast(t('auth.forgotModalSent', { email: forgotEmail.trim() }), 'info');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Minimal Top Brand Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <BrandLogo to="/" />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Centered Clean Sign-In Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[440px] space-y-6">
          <div className="surface-card rounded-2xl p-8 sm:p-10 space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {t('auth.loginTitle')}
            </h1>

            {errorMsg && (
              <div className="rounded-lg px-3.5 py-2.5 text-xs font-medium bg-[var(--accent-negative-soft)] text-[var(--accent-negative)] border border-[var(--accent-negative)]/30">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-medium text-[var(--text-secondary)]"
                >
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

              <div className="space-y-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-medium text-[var(--text-secondary)]"
                >
                  {t('auth.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    maxLength={72}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="h-11 w-full rounded-lg pl-3.5 pr-11 text-sm bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSent(false);
                    setForgotOpen(true);
                  }}
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

            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-[var(--border-subtle)] w-full" />
              <span className="px-3 text-xs text-[var(--text-muted)] bg-[var(--bg-surface)]">
                {t('googleAuth.orDivider')}
              </span>
              <div className="border-t border-[var(--border-subtle)] w-full" />
            </div>

            <GoogleAuthButton mode="signin" />
          </div>

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
        </div>
      </main>

      <footer className="py-5 px-6 text-center text-xs text-[var(--text-muted)]">
        <Link to="/terms" className="hover:text-[var(--text-primary)] transition-colors">
          {t('legal.termsTitle')}
        </Link>
        {' · '}
        <Link to="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
          {t('legal.privacyTitle')}
        </Link>
        {' · '}
        <Link to="/contact" className="hover:text-[var(--text-primary)] transition-colors">
          {t('footer.contact')}
        </Link>
      </footer>

      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title={t('auth.forgotModalTitle')}
        subtitle={t('auth.forgotModalSubtitle')}
        size="md"
      >
        {forgotSent ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              {t('auth.forgotModalSent', { email: forgotEmail })}
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setForgotOpen(false)}>{t('common.confirm')}</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <Input
              type="email"
              required
              label={t('auth.emailLabel')}
              placeholder={t('auth.emailPlaceholder')}
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setForgotOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('auth.forgotModalSubmit')}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
