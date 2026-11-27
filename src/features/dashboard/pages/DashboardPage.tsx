import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  ArrowLeftRight,
  Clock,
  Trophy,
  Users,
} from 'lucide-react';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { Badge } from '../../../shared/components/ui/Badge';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { ApiErrorBanner } from '../../../shared/components/ui/StateFeedback';
import { KpiGridSkeleton } from '../../../shared/components/ui/Loaders';
import { StripedBarChart } from '../../../shared/components/charts/StripedBarChart';
import { StripedProgressBar } from '../../../shared/components/charts/StripedProgressBar';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';
import {
  deduplicateByKey,
  disambiguateChartLabels,
  formatCompactEur,
  formatCompactNumber,
  formatCompactRoiTick,
  formatDate,
  formatPer90,
  formatRatio,
  formatRoiPercent,
  formatShortClubName,
  formatSignedDelta,
  normalizeRoiPercent,
} from '../../../shared/utils/formatters';
import {
  AnalyticsFilterBar,
  type AnalyticsFiltersState,
} from '../../analytics/components/AnalyticsFilterBar';
import {
  useClubRoiByLeagueQueries,
  useKpisQuery,
  useScoutingU23Query,
  useSuperSubsQuery,
} from '../../analytics/hooks/useAnalyticsQueries';
import { LeagueChartsGrid } from '../../analytics/components/LeagueChartsGrid';
import { DashboardPreviewCards } from '../components/DashboardPreviewCards';
import { ExplorerCommandBar } from '../components/ExplorerCommandBar';

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t('dashboard.title'));
  const lang = i18n.language;

  const [filters, setFilters] = useState<AnalyticsFiltersState>({});

  const kpisQuery = useKpisQuery(filters);
  const clubRoiByLeague = useClubRoiByLeagueQueries(
    { season: filters.season, club_id: filters.club_id },
    5,
  );
  const scoutingQuery = useScoutingU23Query({ ...filters, page: 1, limit: 4 });
  const superSubsQuery = useSuperSubsQuery({ ...filters, page: 1, limit: 4 });

  const kpis = kpisQuery.data;
  const scoutingRows = scoutingQuery.data?.data ?? [];
  const subRows = superSubsQuery.data?.data ?? [];

  const visibleLeagueRoiRows = clubRoiByLeague.flatMap((entry) =>
    !filters.competition_id || entry.league.id === filters.competition_id ? entry.data : [],
  );
  const totalFeesSample = visibleLeagueRoiRows.reduce(
    (acc, r) => acc + (r.total_fees_paid_eur || 0),
    0,
  );
  const totalGainSample = visibleLeagueRoiRows.reduce(
    (acc, r) => acc + (r.total_value_gain_eur || 0),
    0,
  );
  const avgUndervalue =
    scoutingRows.length > 0
      ? scoutingRows.reduce((acc, r) => acc + r.undervalue_ratio, 0) / scoutingRows.length
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        actions={
          <Badge tone="neutral" className="py-1.5 px-3">
            <Clock className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
            <span>{t('dashboard.lastUpdated')}:</span>
            <span className="font-mono-num text-[var(--text-primary)]">
              {kpis?.last_updated ? formatDate(kpis.last_updated, lang) : t('dashboard.notComputedYet')}
            </span>
          </Badge>
        }
      />

      <AnalyticsFilterBar filters={filters} onChange={setFilters} showClubId={false} />

      {kpisQuery.isError && (
        <ApiErrorBanner error={kpisQuery.error} onRetry={() => void kpisQuery.refetch()} />
      )}

      {kpisQuery.isLoading ? (
        <KpiGridSkeleton count={5} />
      ) : (
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
      )}

      <LeagueChartsGrid
        kicker={t('analytics.kickers.top5')}
        title={t('analytics.fixedLeagueRoiTitle')}
        subtitle={t('analytics.fixedLeagueRoiSubtitle')}
        series={clubRoiByLeague}
        selectedLeague={filters.competition_id}
        onSelectLeague={(competition_id) => setFilters((prev) => ({ ...prev, competition_id }))}
        chartHeight={235}
        renderChart={(items) => {
          const chartItems = filters.season
            ? items
            : deduplicateByKey(items, (c) => c.club_id);
          return (
            <StripedBarChart
              data={disambiguateChartLabels(
                chartItems.map((c) => ({
                  label: c.club_name,
                  shortLabel: formatShortClubName(c.club_name),
                  season: c.season,
                  value: normalizeRoiPercent(c.roi) ?? 0,
                  displayValue: formatRoiPercent(c.roi, lang),
                  subLabel: `${c.season}`,
                  extraRows: [
                    { label: t('dashboard.feesPaid'), value: formatCompactEur(c.total_fees_paid_eur, lang) },
                    {
                      label: t('dashboard.valueGain'),
                      value: formatCompactEur(c.total_value_gain_eur, lang),
                      tone: (c.total_value_gain_eur >= 0 ? 'positive' : 'negative') as
                        | 'positive'
                        | 'negative',
                    },
                  ],
                })),
              )}
              height={235}
              valueLabel="ROI"
              tickFormatter={formatCompactRoiTick}
            />
          );
        }}
      />

      <div className="grid xl:grid-cols-12 gap-5">
        <Card className="xl:col-span-7 flex flex-col justify-center">
          <ExplorerCommandBar />
        </Card>

        <Card className="xl:col-span-5 flex flex-col justify-between gap-6">
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

      <DashboardPreviewCards
        scoutingRows={scoutingRows}
        scoutingLoading={scoutingQuery.isLoading}
        superSubRows={subRows}
        superSubLoading={superSubsQuery.isLoading}
      />
    </div>
  );
}
