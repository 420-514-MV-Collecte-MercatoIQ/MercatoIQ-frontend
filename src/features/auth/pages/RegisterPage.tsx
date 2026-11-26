import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { PublicNavbar } from '../../../shared/components/layout/PublicNavbar';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../../../shared/context/ToastContext';
import { AppApiError } from '../../../shared/api/httpClient';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';

export function RegisterPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('common.register'));

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const state = location.state as { from?: { pathname?: string } } | null;
  const redirectTarget = state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.includes('@')) {
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
      await register({ email: email.trim(), password });
      showToast(t('auth.registerSuccess'), 'success');
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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)]">
      <PublicNavbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <Card padding="lg" className="space-y-6">
            <div className="space-y-1.5">
              <span className="font-display text-xs uppercase tracking-[0.16em] text-[var(--accent-primary)]">
                MercatoIQ
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                {t('auth.registerTitle')}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">{t('auth.registerSubtitle')}</p>
            </div>

            <GoogleAuthButton />

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[var(--border-subtle)] w-full" />
              <span className="px-3 text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] bg-[var(--bg-surface)] whitespace-nowrap">
                {t('googleAuth.orDivider')}
              </span>
              <div className="border-t border-[var(--border-subtle)] w-full" />
            </div>

            {errorMsg && (
              <div className="rounded-2xl px-4 py-3 text-xs font-medium bg-[var(--accent-negative-soft)] text-[var(--accent-negative)] border border-[var(--accent-negative)]/30">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="email"
                  label={t('auth.emailLabel')}
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
                <Mail className="h-4 w-4 text-[var(--text-muted)] absolute right-3.5 top-9 pointer-events-none" />
              </div>

              <div className="relative">
                <Input
                  type="password"
                  label={t('auth.passwordLabel')}
                  placeholder={t('auth.passwordPlaceholder')}
                  hint={t('auth.passwordHint')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                />
                <Lock className="h-4 w-4 text-[var(--text-muted)] absolute right-3.5 top-9 pointer-events-none" />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={submitting}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {submitting ? t('common.loading') : t('auth.submitRegister')}
              </Button>
            </form>

            <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col gap-2 text-center text-xs">
              <p className="text-[var(--text-secondary)]">
                {t('auth.hasAccount')}{' '}
                <Link to="/login" className="font-bold text-[var(--accent-primary)] hover:underline">
                  {t('auth.goToLogin')}
                </Link>
              </p>
              <Link
                to="/dashboard"
                className="font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {t('auth.continueGuest')}
              </Link>
              <p className="text-[11px] text-[var(--text-muted)] pt-1">
                <Link to="/terms" className="hover:underline">
                  {t('legal.termsTitle')}
                </Link>
                {' · '}
                <Link to="/privacy" className="hover:underline">
                  {t('legal.privacyTitle')}
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
