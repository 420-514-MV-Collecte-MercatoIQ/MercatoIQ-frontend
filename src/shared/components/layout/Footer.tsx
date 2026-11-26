import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from './BrandLogo';
import { LanguageToggle } from '../ui/LanguageToggle';

export function Footer({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/70 py-4 px-4 sm:px-6 text-xs text-[var(--text-muted)]">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <span>
            © {year} MercatoIQ · {t('footer.rights')}
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/about" className="hover:text-[var(--text-primary)] transition-colors">
              {t('footer.about')}
            </Link>
            <Link to="/contact" className="hover:text-[var(--text-primary)] transition-colors">
              {t('footer.contact')}
            </Link>
            <Link to="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
              {t('legal.privacyTitle')}
            </Link>
            <Link to="/terms" className="hover:text-[var(--text-primary)] transition-colors">
              {t('legal.termsTitle')}
            </Link>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <BrandLogo to="/" />
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs">
              {t('common.tagline')}
            </p>
            <LanguageToggle />
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {t('footer.enginesHeading')}
            </h3>
            <ul className="space-y-2 text-xs font-medium text-[var(--text-secondary)]">
              <li>
                <Link to="/club-roi" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav.clubRoi')}
                </Link>
              </li>
              <li>
                <Link to="/scouting" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav.scouting')}
                </Link>
              </li>
              <li>
                <Link
                  to="/ucl-vs-domestic"
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  {t('nav.ucl')}
                </Link>
              </li>
              <li>
                <Link to="/super-subs" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav.superSubs')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {t('footer.platformHeading')}
            </h3>
            <ul className="space-y-2 text-xs font-medium text-[var(--text-secondary)]">
              <li>
                <Link to="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav.overview')}
                </Link>
              </li>
              <li>
                <Link to="/players" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav.players')}
                </Link>
              </li>
              <li>
                <Link to="/transfers" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav.transfers')}
                </Link>
              </li>
              <li>
                <Link to="/system" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav.system')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {t('footer.companyHeading')}
            </h3>
            <ul className="space-y-2 text-xs font-medium text-[var(--text-secondary)]">
              <li>
                <Link to="/about" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('legal.privacyTitle')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('legal.termsTitle')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <span>
            © {year} MercatoIQ. {t('footer.rights')}
          </span>
          <span className="font-mono-num">Bronze → Silver → Gold · UEFA &amp; Top 5 Leagues</span>
        </div>
      </div>
    </footer>
  );
}
