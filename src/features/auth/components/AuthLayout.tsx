import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from '../../../shared/components/layout/BrandLogo';
import { LanguageToggle } from '../../../shared/components/ui/LanguageToggle';
import { ThemeToggle } from '../../../shared/components/ui/ThemeToggle';

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  belowCard?: ReactNode;
}

export function AuthLayout({ title, children, belowCard }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <BrandLogo to="/" />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[440px] space-y-6">
          <div className="surface-card rounded-2xl p-8 sm:p-10 space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h1>
            {children}
          </div>
          {belowCard}
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
    </div>
  );
}
