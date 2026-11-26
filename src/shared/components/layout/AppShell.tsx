import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, User, X } from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { cn } from '../../utils/formatters';
import { BrandLogo } from './BrandLogo';
import { Footer } from './Footer';
import { UserSessionMenu } from './UserSessionMenu';
import { APP_NAV_ITEMS, TOP_NAV_ITEMS } from './navigationConfig';

export function AppShell() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
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

          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {TOP_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
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

          <UserSessionMenu />
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 space-y-1">
            {APP_NAV_ITEMS.map((item) => {
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
            {isAuthenticated && (
              <NavLink
                to="/profile"
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
                <User className="h-4 w-4" />
                <span>{t('nav.profile')}</span>
              </NavLink>
            )}
          </div>
        )}
      </header>

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 flex gap-6">
        <aside className="hidden lg:flex flex-col items-center gap-2.5 pt-2 shrink-0">
          <div className="sticky top-24 flex flex-col gap-2 p-2 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
            {APP_NAV_ITEMS.map((item) => {
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

      <Footer compact />
    </div>
  );
}
