import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Mail, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { LanguageToggle } from '../../../shared/components/ui/LanguageToggle';
import { ThemeToggle } from '../../../shared/components/ui/ThemeToggle';
import { useAuth } from '../../auth/context/AuthContext';
import { useDemoMode } from '../../../shared/context/DemoModeContext';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';

export function ProfilePage() {
  const { t } = useTranslation();
  useDocumentTitle(t('profile.title'));

  const { user, isAdmin, logout } = useAuth();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('profile.title')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('profile.subtitle')}</p>
      </div>

      <Card padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || user.email}
              className="h-16 w-16 rounded-2xl object-cover border border-[var(--border-subtle)]"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-[var(--bg-pill-active)] text-[var(--text-pill-active)] font-display text-2xl font-bold flex items-center justify-center">
              {initials}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{user.name || user.email.split('@')[0]}</h2>
              <Badge tone={isAdmin ? 'positive' : 'primary'}>
                <ShieldCheck className="h-3 w-3" />
                <span>{user.role}</span>
              </Badge>
              <Badge tone="neutral">
                {user.provider === 'google' ? 'Google OAuth' : t('profile.emailProvider')}
              </Badge>
            </div>
            <p className="text-sm text-[var(--text-secondary)] inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        <Button
          variant="danger"
          leftIcon={<LogOut className="h-4 w-4" />}
          onClick={handleSignOut}
        >
          {t('common.signOut')}
        </Button>
      </Card>

      <div className="grid md:grid-cols-2 gap-5">
        <Card className="space-y-4">
          <CardHeader kicker="SESSION" title={t('profile.accountDetails')} />
          <div className="space-y-2.5 text-sm">
            {[
              [t('profile.userId'), user.id],
              [t('profile.roleLabel'), user.role],
              [
                t('profile.providerLabel'),
                user.provider === 'google' ? 'Google Identity' : t('profile.emailProvider'),
              ],
              [t('profile.statusLabel'), t('profile.activeSession')],
            ].map(([label, val]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 py-2 border-b border-[var(--border-subtle)]"
              >
                <span className="text-[var(--text-secondary)]">{label}</span>
                <span className="font-mono-num text-xs font-semibold text-[var(--text-primary)] truncate max-w-[60%]">
                  {val}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <CardHeader kicker="PREFERENCES" title={t('profile.preferencesTitle')} />
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4 py-1.5">
              <span className="text-[var(--text-secondary)]">{t('common.language')}</span>
              <LanguageToggle />
            </div>
            <div className="flex items-center justify-between gap-4 py-1.5">
              <span className="text-[var(--text-secondary)]">{t('profile.appearance')}</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between gap-4 py-1.5">
              <span className="text-[var(--text-secondary)]">{t('system.dataSourceTitle')}</span>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={
                  isDemoMode ? <UserCheck className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />
                }
                onClick={toggleDemoMode}
              >
                {isDemoMode ? t('common.demoMode') : t('common.liveApi')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
