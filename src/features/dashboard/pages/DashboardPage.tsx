import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Sparkles,
  Trophy,
  Users,
  ArrowLeftRight,
} from 'lucide-react';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { Badge } from '../../../shared/components/ui/Badge';
import { ApiErrorBanner, LoadingSkeleton } from '../../../shared/components/ui/StateFeedback';
import { StripedBarChart } from '../../../shared/components/charts/StripedBarChart';
import { StripedProgressBar } from '../../../shared/components/charts/StripedProgressBar';
import {
  AnalyticsFilterBar,
  type AnalyticsFiltersState,
} from '../../analytics/components/AnalyticsFilterBar';
import {
  useClubRoiQuery,
  useKpisQuery,
  useScoutingU23Query,
  useSuperSubsQuery,
} from '../../analytics/hooks/useAnalyticsQueries';
import {
  formatCompactEur,
  formatCompactNumber,
  formatDate,
  formatPer90,
  formatRatio,
  formatRoiPercent,
  formatSignedDelta,
} from '../../../shared/utils/formatters';
import { getCompetitionLabel } from '../../../shared/types/constants';

const EXPLORE_PILLS = [
  { cmd: '/club-roi', to: '/club-roi' },
  { cmd: '/scouting-u23', to: '/scouting' },
  { cmd: '/ucl-vs-domestic', to: '/ucl-vs-domestic' },
  { cmd: '/super-subs', to: '/super-subs' },
  { cmd: '/players', to: '/players' },
  { cmd: '/transfers', to: '/transfers' },
];

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();

  const [filters, setFilters] = useState<AnalyticsFiltersState>({});
  const [exploreQuery, setExploreQuery] = useState('');

  const kpisQuery = useKpisQuery(filters);
  const clubRoiQuery = useClubRoiQuery({ ...filters, page: 1, limit: 6 });
  const scoutingQuery = useScoutingU23Query({ ...filters, page: 1, limit: 4 });
  const superSubsQuery = useSuperSubsQuery({ ...filters, page: 1, limit: 4 });

  const handleExploreSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = exploreQuery.trim().toLowerCase();
    if (!q) {
      navigate('/club-roi');
      return;
    }
    const matched = EXPLORE_PILLS.find((p) => p.cmd.includes(q) || p.to.includes(q));
    if (matched) {
      navigate(matched.to);
      return;
    }
    navigate(`/players?name=${encodeURIComponent(exploreQuery.trim())}`);
  };

  const kpis = kpisQuery.data;
  const roiRows = clubRoiQuery.data?.data ?? [];
  const scoutingRows = scoutingQuery.data?.data ?? [];
  const subRows = superSubsQuery.data?.data ?? [];

  const roiChartData = roiRows.map((c) => ({
    label: c.club_name,
    shortLabel: c.club_name.split(' ').slice(0, 2).join(' '),
    value: Math.round((Math.abs(c.roi ?? 0) <= 10 ? (c.roi ?? 0) * 100 : c.roi ?? 0) * 10) / 10,
    displayValue: formatRoiPercent(c.roi, lang),
    subLabel: `${getCompetitionLabel(c.competition_id)} · ${c.season}`,
    extraRows: [
      { label: t('dashboard.feesPaid'), value: formatCompactEur(c.total_fees_paid_eur, lang) },
      {
        label: t('dashboard.valueGain'),
        value: formatCompactEur(c.total_value_gain_eur, lang),
        tone: (c.total_value_gain_eur >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
      },
    ],
  }));

  const totalFeesSample = roiRows.reduce((acc, r) => acc + (r.total_fees_paid_eur || 0), 0);
  const totalGainSample = roiRows.reduce((acc, r) => acc + (r.total_value_gain_eur || 0), 0);
  const avgUndervalue =
    scoutingRows.length > 0
      ? scoutingRows.reduce((acc, r) => acc + r.undervalue_ratio, 0) / scoutingRows.length
      : null;

  return (
    <div className="space-y-6">
      {/* Page Title & Freshness */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {t('dashboard.title')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('dashboard.subtitle')}</p>
        </div>

        <Badge tone="neutral" className="self-start sm:self-auto py-1.5 px-3">
          <Clock className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
          <span>{t('dashboard.lastUpdated')}:</span>
          <span className="font-mono-num text-[var(--text-primary)]">
            {kpis?.last_updated ? formatDate(kpis.last_updated, lang) : t('dashboard.notComputedYet')}
          </span>
        </Badge>
      </div>

      {/* Global Analytics Filters */}
      <AnalyticsFilterBar filters={filters} onChange={setFilters} showClubId={false} />

      {kpisQuery.isError && (
        <ApiErrorBanner error={kpisQuery.error} onRetry={() => void kpisQuery.refetch()} />
      )}

      {/* Top KPI Bento Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          label={t('dashboard.appearancesAnalyzed')}
          value={kpis ? formatCompactNumber(kpis.total_appearances_analysed, lang) : '—'}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          label={t('dashboard.trackedPlayers')}
          value={kpis ? formatCompactNumber(kpis.total_players, lang) : '—'}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label={t('dashboard.recordedTransfers')}
          value={kpis ? formatCompactNumber(kpis.total_transfers, lang) : '—'}
          icon={<ArrowLeftRight className="h-4 w-4" />}
        />
        <StatCard
          label={t('dashboard.topRoiClub')}
          value={kpis?.top_roi_club ? formatRoiPercent(kpis.top_roi_club.roi, lang) : '—'}
          sublabel={kpis?.top_roi_club?.club_name || t('dashboard.notComputedYet')}
          badge={kpis?.top_roi_club?.competition_id}
          badgeTone="positive"
        />
        <StatCard
          label={t('dashboard.topUclPlayer')}
          value={
            kpis?.top_ucl_step_up_player
              ? formatSignedDelta(kpis.top_ucl_step_up_player.goals_per_90_delta, lang)
              : '—'
          }
          sublabel={kpis?.top_ucl_step_up_player?.player_name || t('dashboard.notComputedYet')}
          badge="G/90 Δ"
          badgeTone="secondary"
          icon={<Trophy className="h-4 w-4" />}
        />
      </div>

      {/* Zentra Main Split: Featured Striped ROI Chart + Explore Bar | Right Market Summary */}
      <div className="grid xl:grid-cols-12 gap-5">
        <Card className="xl:col-span-8 flex flex-col justify-between gap-5">
          <div>
            <CardHeader
              kicker="Q1 · GOLD ANALYTICS"
              title={t('dashboard.roiChartTitle')}
              subtitle={t('dashboard.roiChartSubtitle')}
              action={
                <Link
                  to="/club-roi"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
                >
                  {t('dashboard.exploreAll')}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              }
            />

            {clubRoiQuery.isLoading ? (
              <LoadingSkeleton rows={5} />
            ) : roiChartData.length > 0 ? (
              <StripedBarChart
                data={roiChartData}
                height={280}
                valueLabel={t('dashboard.roiRatio')}
                tickFormatter={(v) => `${v}%`}
              />
            ) : (
              <div className="h-56 flex items-center justify-center text-sm text-[var(--text-muted)]">
                {t('common.noData')}
              </div>
            )}
          </div>

          {/* Zentra Signature Interactive Frosted Explorer Prompt */}
          <div
            className="rounded-2xl p-4 border border-[var(--border-subtle)] backdrop-blur-md space-y-3"
            style={{ backgroundColor: 'var(--frosted-bg)' }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" />
                <span>{t('dashboard.explorerPrompt')}</span>
              </div>
              <div className="hidden sm:flex flex-wrap gap-1.5">
                {EXPLORE_PILLS.map((pill) => (
                  <Link
                    key={pill.cmd}
                    to={pill.to}
                    className="font-mono-num text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary)] hover:opacity-85 transition-opacity"
                  >
                    {pill.cmd}
                  </Link>
                ))}
              </div>
            </div>

            <form onSubmit={handleExploreSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={exploreQuery}
                onChange={(e) => setExploreQuery(e.target.value)}
                placeholder={t('dashboard.explorerPlaceholder')}
                className="flex-1 h-10 rounded-2xl px-4 text-sm bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-2xl bg-[var(--bg-pill-active)] text-[var(--text-pill-active)] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:opacity-90"
              >
                <span>{t('common.search')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </Card>

        {/* Zentra Right Summary Card */}
        <Card className="xl:col-span-4 flex flex-col justify-between gap-6">
          <div>
            <CardHeader
              kicker="SNAPSHOT"
              title={t('dashboard.volumeCardTitle')}
              subtitle={t('dashboard.volumeCardSubtitle')}
            />
            <div className="space-y-1">
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                {t('dashboard.valueGain')}
              </span>
              <div className="font-display text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tabular-nums">
                {formatCompactEur(totalGainSample, lang)}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {t('dashboard.feesPaid')}: {formatCompactEur(totalFeesSample, lang)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <StripedProgressBar
              label={t('dashboard.avgUndervalue')}
              valueLabel={formatRatio(avgUndervalue, 'x', lang)}
              percentage={avgUndervalue ? Math.min(100, avgUndervalue * 45) : 15}
              tone="positive"
            />
            <StripedProgressBar
              label={t('dashboard.topSuperSubScore')}
              valueLabel={formatPer90(subRows[0]?.super_sub_score, lang)}
              percentage={subRows[0]?.super_sub_score ? Math.min(100, subRows[0].super_sub_score) : 15}
              tone="primary"
            />
            <StripedProgressBar
              label={t('dashboard.topUclPlayer')}
              valueLabel={
                kpis?.top_ucl_step_up_player
                  ? `${formatSignedDelta(kpis.top_ucl_step_up_player.goals_per_90_delta, lang)} G/90`
                  : '—'
              }
              percentage={72}
              tone="secondary"
            />
          </div>
        </Card>
      </div>

      {/* Lower Bento Previews: U23 Scouting & Super-Subs */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader
            kicker="Q2 · MACHINE LEARNING"
            title={t('dashboard.scoutingPreviewTitle')}
            action={
              <Link
                to="/scouting"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
              >
                {t('dashboard.exploreAll')}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {scoutingQuery.isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="space-y-2.5">
              {scoutingRows.map((p) => (
                <Link
                  key={`${p.player_id}-${p.season}`}
                  to={`/players/${p.player_id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 bg-[var(--bg-surface-elevated)] hover:border-[var(--accent-primary)] border border-transparent transition-all"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {p.player_name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] truncate">
                      {p.club_name || p.competition_id} · {p.age ? `${p.age}y` : 'U23'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-mono-num text-[var(--text-secondary)]">
                        {formatCompactEur(p.market_value_eur, lang)} →{' '}
                        <span className="font-bold text-[var(--text-primary)]">
                          {formatCompactEur(p.estimated_value_eur, lang)}
                        </span>
                      </div>
                    </div>
                    <Badge tone="positive" className="font-mono-num">
                      {formatRatio(p.undervalue_ratio, 'x', lang)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            kicker="Q4 · BENCH IMPACT"
            title={t('dashboard.superSubsPreviewTitle')}
            action={
              <Link
                to="/super-subs"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-primary)] hover:underline"
              >
                {t('dashboard.exploreAll')}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {superSubsQuery.isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="space-y-2.5">
              {subRows.map((s) => (
                <Link
                  key={`${s.player_id}-${s.season}-${s.competition_id}`}
                  to={`/players/${s.player_id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 bg-[var(--bg-surface-elevated)] hover:border-[var(--accent-primary)] border border-transparent transition-all"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {s.player_name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] truncate">
                      {s.club_name || s.competition_id} · {s.sub_appearances} apps
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono-num text-[var(--text-secondary)]">
                      {formatPer90(s.sub_goal_contributions_per_90, lang)} G+A/90
                    </span>
                    <Badge tone="primary" className="font-mono-num">
                      {formatPer90(s.super_sub_score, lang)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
