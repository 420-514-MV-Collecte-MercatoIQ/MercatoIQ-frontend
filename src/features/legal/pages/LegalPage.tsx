import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PublicNavbar } from '../../../shared/components/layout/PublicNavbar';
import { Footer } from '../../../shared/components/layout/Footer';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';

export function LegalPage({ mode }: { mode: 'privacy' | 'terms' }) {
  const { t } = useTranslation();
  const isPrivacy = mode === 'privacy';
  const title = isPrivacy ? t('legal.privacyTitle') : t('legal.termsTitle');
  useDocumentTitle(title);

  const sections = isPrivacy
    ? [
        { heading: t('legal.privacy.s1Title'), body: t('legal.privacy.s1Body') },
        { heading: t('legal.privacy.s2Title'), body: t('legal.privacy.s2Body') },
        { heading: t('legal.privacy.s3Title'), body: t('legal.privacy.s3Body') },
      ]
    : [
        { heading: t('legal.terms.s1Title'), body: t('legal.terms.s1Body') },
        { heading: t('legal.terms.s2Title'), body: t('legal.terms.s2Body') },
        { heading: t('legal.terms.s3Title'), body: t('legal.terms.s3Body') },
      ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
        <div className="space-y-2">
          <Badge tone="neutral">{t('legal.updatedLabel')}</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        </div>

        <Card padding="lg" className="space-y-6">
          {sections.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="text-base font-bold text-[var(--text-primary)]">{section.heading}</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{section.body}</p>
            </section>
          ))}

          <div className="pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            {t('legal.contactPrompt')}{' '}
            <Link to="/contact" className="font-semibold text-[var(--accent-primary)] hover:underline">
              {t('footer.contact')}
            </Link>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
