import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  Radar,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { LanguageToggle } from '../ui/LanguageToggle';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useDemoMode } from '../../context/DemoModeContext';
import { getHealthStatus } from '../../api/healthApi';
import { cn } from '../../utils/formatters';

interface NavItem {
  to: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', labelKey: 'nav.overview', icon: LayoutDashboard },
  { to: '/club-roi', labelKey: 'nav.clubRoi', icon: BarChart3 },
  { to: '/scouting', labelKey: 'nav.scouting', icon: Radar },
  { to: '/ucl-vs-domestic', labelKey: 'nav.ucl', icon: Trophy },
  { to: '/super-subs', labelKey: 'nav.superSubs', icon: Zap },
  { to: '/players', labelKey: 'nav.players', icon: Users },
  { to: '/transfers', labelKey: 'nav.transfers', icon: ArrowLeftRight },
  { to: '/system', labelKey: 'nav.system', icon: Activity },
];

export function AppShell() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* Zentra-inspired Top Pill Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[var(--bg-surface)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden h-9 w-9 rounded-full inline-flex items-center justify-center bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <BrandLogo to="/dashboard" />
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'px-3.5 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-[var(--bg-pill-active)] text-[var(--text-pill-active)] shadow-[var(--shadow-pill)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]',
                  )
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Live / Demo Pill */}
            <button
              type="button"
              onClick={toggleDemoMode}
              className={cn(
                'hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer',
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
                <div className="hidden xl:flex flex-col items-end leading-tight">
                  <span className="text-xs font-semibold text-[var(--text-primary)] max-w-[140px] truncate">
                    {user.email}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] inline-flex items-center gap-1">
                    {user.role === 'admin' && <ShieldCheck className="h-3 w-3 text-[var(--accent-primary)]" />}
                    {user.role}
                  </span>
                </div>
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
              <Link to="/login">
                <Button size="sm" variant="secondary">
                  {t('common.signIn')}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all',
                      isActive
                        ? 'bg-[var(--bg-pill-active)] text-[var(--text-pill-active)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(item.labelKey)}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area with Check Box-inspired Floating Icon Rail */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 flex gap-6">
        <aside className="hidden lg:flex flex-col items-center gap-2.5 pt-2 shrink-0">
          <div className="sticky top-24 flex flex-col gap-2 p-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={t(item.labelKey)}
                  aria-label={t(item.labelKey)}
                  className={({ isActive }) =>
                    cn(
                      'h-10 w-10 rounded-full flex items-center justify-center transition-all',
                      isActive
                        ? 'bg-[var(--bg-pill-active)] text-[var(--text-pill-active)] shadow-[var(--shadow-pill)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                </NavLink>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
