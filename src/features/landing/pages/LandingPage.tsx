import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Database,
  Radar,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { PublicNavbar } from '../../../shared/components/layout/PublicNavbar';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { useDemoMode } from '../../../shared/context/DemoModeContext';

export function LandingPage() {
  const { t } = useTranslation();
  const { enableDemoMode } = useDemoMode();
  const navigate = useNavigate();

  const handleTryDemo = () => {
    enableDemoMode();
    navigate('/dashboard');
  };

  const pillars = [
    {
      to: '/club-roi',
      icon: BarChart3,
      title: t('landing.pillar1Title'),
      desc: t('landing.pillar1Desc'),
      tag: '/club-roi',
      metric: '+182.4%',
      metricLabel: 'Leverkusen ROI',
    },
    {
      to: '/scouting',
      icon: Radar,
      title: t('landing.pillar2Title'),
      desc: t('landing.pillar2Desc'),
      tag: '/scouting-u23',
      metric: '1.71x',
      metricLabel: 'ML Undervalue',
    },
    {
      to: '/ucl-vs-domestic',
      icon: Trophy,
      title: t('landing.pillar3Title'),
      desc: t('landing.pillar3Desc'),
      tag: '/ucl-vs-domestic',
      metric: '+0.41',
      metricLabel: 'UCL G/90 Δ',
    },
    {
      to: '/super-subs',
      icon: Zap,
      title: t('landing.pillar4Title'),
      desc: t('landing.pillar4Desc'),
      tag: '/super-subs',
      metric: '94.2',
      metricLabel: 'Impact Index',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
        {/* Wollo-inspired Editorial Hero Card */}
        <section className="relative overflow-hidden rounded-[2.25rem] p-8 sm:p-14 bg-gradient-to-br from-[#4f22d8] via-[#2563eb] to-[#111317] text-white shadow-2xl">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#b8ff3b]/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-[#ff8a00]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 bg-white/12 border border-white/20 text-xs font-semibold tracking-wide backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-[#b8ff3b]" />
                <span>{t('landing.badge')}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.08]">
                {t('landing.heroTitle')}
              </h1>

              <p className="text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
                {t('landing.heroSubtitle')}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="!bg-white !text-[#111317] hover:!bg-white/90"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    {t('landing.ctaPrimary')}
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleTryDemo}
                  className="!bg-[#b8ff3b] !text-[#090a0c] !border-transparent hover:!opacity-95"
                  leftIcon={<Sparkles className="h-4 w-4" />}
                >
                  {t('landing.ctaDemo')}
                </Button>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="!text-white hover:!bg-white/10"
                  >
                    {t('landing.ctaSecondary')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Interactive Snapshot Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#090a0c]/75 border border-white/15 backdrop-blur-xl p-6 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs uppercase tracking-[0.14em] text-white/60">
                    GOLD INTELLIGENCE SNAPSHOT
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b8ff3b]">
                    <span className="h-2 w-2 rounded-full bg-[#b8ff3b]" />
                    2012–2026
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/6 p-4 border border-white/10">
                    <div className="text-[11px] uppercase tracking-wider text-white/60">
                      {t('dashboard.appearancesAnalyzed')}
                    </div>
                    <div className="font-display text-3xl font-bold mt-1 tabular-nums">48.6K</div>
                  </div>
                  <div className="rounded-2xl bg-white/6 p-4 border border-white/10">
                    <div className="text-[11px] uppercase tracking-wider text-white/60">
                      {t('dashboard.topRoiClub')}
                    </div>
                    <div className="font-display text-3xl font-bold text-[#b8ff3b] mt-1 tabular-nums">
                      +182%
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: 'Q1 · Club ROI', pct: 88, color: 'bg-[#b8ff3b]' },
                    { label: 'Q2 · U23 ML Fair Value', pct: 76, color: 'bg-[#60a5fa]' },
                    { label: 'Q3 · UCL Step-Up Delta', pct: 68, color: 'bg-[#ff8a00]' },
                  ].map((bar) => (
                    <div key={bar.label} className="space-y-1">
                      <div className="flex justify-between text-xs text-white/80">
                        <span>{bar.label}</span>
                        <span className="font-mono-num">{bar.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Four Gold Analytical Engines */}
        <section id="pillars" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {t('landing.pillarsTitle')}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
                {t('landing.pillarsSubtitle')}
              </p>
            </div>
            <Link to="/dashboard">
              <Button variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                {t('nav.openApp')}
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Link key={pillar.to} to={pillar.to} className="group">
                  <Card className="h-full flex flex-col justify-between gap-5 group-hover:border-[var(--accent-primary)] transition-all">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-2xl bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-mono-num text-[11px] px-2.5 py-1 rounded-full bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary)] font-semibold">
                          {pillar.tag}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-baseline justify-between">
                      <span className="font-display text-2xl font-bold text-[var(--text-primary)] tabular-nums">
                        {pillar.metric}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">{pillar.metricLabel}</span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Backend Architecture Capabilities */}
        <section id="architecture" className="space-y-6 pb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {t('landing.stackTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <Database className="h-5 w-5 text-[var(--accent-primary)]" />
                <Badge tone="primary">/players · /transfers</Badge>
              </div>
              <h3 className="text-base font-bold">{t('landing.stackCard1Title')}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('landing.stackCard1Desc')}
              </p>
            </Card>
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <ShieldCheck className="h-5 w-5 text-[var(--accent-positive)]" />
                <Badge tone="positive">/auth/login · /register</Badge>
              </div>
              <h3 className="text-base font-bold">{t('landing.stackCard2Title')}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('landing.stackCard2Desc')}
              </p>
            </Card>
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <Activity className="h-5 w-5 text-[var(--accent-secondary)]" />
                <Badge tone="secondary">/health · /admin</Badge>
              </div>
              <h3 className="text-base font-bold">{t('landing.stackCard3Title')}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('landing.stackCard3Desc')}
              </p>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
