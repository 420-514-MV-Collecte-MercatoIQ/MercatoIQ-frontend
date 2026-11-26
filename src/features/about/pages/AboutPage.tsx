import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Database, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { PublicNavbar } from '../../../shared/components/layout/PublicNavbar';
import { Footer } from '../../../shared/components/layout/Footer';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';

export function AboutPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('about.title'));

  const layers = [
    {
      badge: 'BRONZE',
      tone: 'secondary' as const,
      title: t('about.bronzeTitle'),
      desc: t('about.bronzeDesc'),
    },
    {
      badge: 'SILVER',
      tone: 'primary' as const,
      title: t('about.silverTitle'),
      desc: t('about.silverDesc'),
    },
    {
      badge: 'GOLD',
      tone: 'positive' as const,
      title: t('about.goldTitle'),
      desc: t('about.goldDesc'),
    },
  ];

  const formulas = [
    { code: 'Q1 · ROI', title: t('landing.pillar1Title'), formula: t('about.q1Formula') },
    { code: 'Q2 · ML', title: t('landing.pillar2Title'), formula: t('about.q2Formula') },
    { code: 'Q3 · UCL', title: t('landing.pillar3Title'), formula: t('about.q3Formula') },
    { code: 'Q4 · SUB', title: t('landing.pillar4Title'), formula: t('about.q4Formula') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        <section className="max-w-3xl space-y-4">
          <Badge tone="primary">{t('about.badge')}</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{t('about.title')}</h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">{t('about.subtitle')}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/dashboard">
              <Button rightIcon={<ArrowRight className="h-4 w-4" />}>{t('nav.openApp')}</Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary">{t('footer.contact')}</Button>
            </Link>
          </div>
        </section>

        {/* Medallion Architecture */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[var(--accent-primary)]" />
            <h2 className="text-2xl font-bold tracking-tight">{t('about.medallionTitle')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {layers.map((layer) => (
              <Card key={layer.badge} className="space-y-3">
                <Badge tone={layer.tone} className="font-mono-num">
                  {layer.badge}
                </Badge>
                <h3 className="text-lg font-bold">{layer.title}</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {layer.desc}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Analytical Methodology */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--accent-secondary)]" />
            <h2 className="text-2xl font-bold tracking-tight">{t('about.methodologyTitle')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {formulas.map((f) => (
              <Card key={f.code} className="space-y-2.5">
                <CardHeader kicker={f.code} title={f.title} className="mb-2" />
                <p className="text-xs font-mono-num text-[var(--text-secondary)] bg-[var(--bg-surface-elevated)] rounded-2xl p-3.5 border border-[var(--border-subtle)] leading-relaxed">
                  {f.formula}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Stack Guarantees */}
        <section className="grid md:grid-cols-2 gap-5">
          <Card className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Database className="h-4 w-4 text-[var(--accent-primary)]" />
              <span>{t('about.stackTitle')}</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {t('about.stackDesc')}
            </p>
          </Card>
          <Card className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold">
              <ShieldCheck className="h-4 w-4 text-[var(--accent-positive)]" />
              <span>{t('about.securityTitle')}</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {t('about.securityDesc')}
            </p>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
