import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from './BrandLogo';
import { LanguageToggle } from '../ui/LanguageToggle';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { useAuth } from '../../../features/auth/context/AuthContext';

export function PublicNavbar() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-surface)]/85 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <BrandLogo to="/" />

        <nav className="hidden md:flex items-center gap-1 rounded-full px-2 py-1.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <Link
            to="/dashboard"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('nav.overview')}
          </Link>
          <Link
            to="/about"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('nav.about')}
          </Link>
          <Link
            to="/players"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('nav.players')}
          </Link>
          <Link
            to="/contact"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('nav.contact')}
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <LanguageToggle />
          <ThemeToggle />
          {!isAuthenticated && (
            <Link
              to="/login"
              className="hidden sm:inline-flex text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2"
            >
              {t('common.signIn')}
            </Link>
          )}
          <Link to="/dashboard">
            <Button size="sm" variant="primary">
              {t('nav.openApp')}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
