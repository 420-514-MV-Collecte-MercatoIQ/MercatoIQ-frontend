import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LogOut, ShieldCheck, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useDemoMode } from '../../context/DemoModeContext';
import { getHealthStatus } from '../../api/healthApi';
import { cn } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { LanguageToggle } from '../ui/LanguageToggle';
import { ThemeToggle } from '../ui/ThemeToggle';

export function UserSessionMenu() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const navigate = useNavigate();

  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: getHealthStatus,
    enabled: !isDemoMode,
    retry: false,
    refetchInterval: 60_000,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user ? (user.name || user.email).slice(0, 2).toUpperCase() : '';

  return (
    <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
      <button
        type="button"
        onClick={toggleDemoMode}
        className={cn(
          'hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0',
          isDemoMode
            ? 'bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary)] border-[var(--accent-secondary)]/30'
            : healthQuery.isSuccess
              ? 'bg-[var(--accent-positive-soft)] text-[var(--accent-positive)] border-[var(--accent-positive)]/30'
              : 'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
        )}
        title={isDemoMode ? t('common.disableDemo') : t('common.enableDemo')}
      >
        {isDemoMode ? (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('common.demoMode')}</span>
          </>
        ) : (
          <>
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                healthQuery.isSuccess
                  ? 'bg-[var(--accent-positive)]'
                  : healthQuery.isError
                    ? 'bg-[var(--accent-negative)]'
                    : 'bg-[var(--text-muted)]',
              )}
            />
            <span>{t('common.liveApi')}</span>
          </>
        )}
      </button>

      <LanguageToggle />
      <ThemeToggle />

      {isAuthenticated && user ? (
        <div className="flex items-center gap-2 pl-1">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-full p-1 pr-2.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors"
            title={t('nav.profile')}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || user.email}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="h-7 w-7 rounded-full bg-[var(--bg-pill-active)] text-[var(--text-pill-active)] text-[11px] font-bold flex items-center justify-center">
                {userInitials || <User className="h-3.5 w-3.5" />}
              </span>
            )}
            <div className="hidden xl:flex flex-col items-start leading-tight">
              <span className="text-xs font-semibold text-[var(--text-primary)] max-w-[120px] truncate">
                {user.name || user.email}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] inline-flex items-center gap-1">
                {user.role === 'admin' && (
                  <ShieldCheck className="h-3 w-3 text-[var(--accent-primary)]" />
                )}
                {user.role}
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="h-9 w-9 rounded-full inline-flex items-center justify-center bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-negative)] transition-colors cursor-pointer"
            title={t('common.signOut')}
            aria-label={t('common.signOut')}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Link to="/login" className="shrink-0">
          <Button size="sm" variant="secondary" className="whitespace-nowrap">
            {t('common.signIn')}
          </Button>
        </Link>
      )}
    </div>
  );
}
