import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { DataTable, type DataColumn } from '../../../shared/components/ui/DataTable';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { ApiErrorBanner } from '../../../shared/components/ui/StateFeedback';
import { ChartTooltipCard } from '../../../shared/components/charts/ChartTooltip';
import {
  AnalyticsFilterBar,
  type AnalyticsFiltersState,
} from '../../analytics/components/AnalyticsFilterBar';
import {
  useUclVsDomesticByLeagueQueries,
  useUclVsDomesticQuery,
} from '../../analytics/hooks/useAnalyticsQueries';
import { LeagueChartsGrid } from '../../analytics/components/LeagueChartsGrid';
import type { GoldUclVsDomestic } from '../../../shared/types/domain.types';
import {
  disambiguateChartLabels,
  formatPer90,
  formatSignedDelta,
} from '../../../shared/utils/formatters';
import { getCompetitionLabel } from '../../../shared/types/constants';
import { exportToCsv } from '../../../shared/utils/exportCsv';
import { useToast } from '../../../shared/context/ToastContext';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';
import { usePagination } from '../../../shared/hooks/usePagination';

export function UclVsDomesticPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t('ucl.title'));
  const lang = i18n.language;
  const { showToast } = useToast();

  const [filters, setFilters] = useState<AnalyticsFiltersState>({});
  const { page, limit, setPage, setLimit, resetPage } = usePagination(20);

  const query = useUclVsDomesticQuery({
    season: filters.season,
    domestic_competition_id: filters.competition_id,
    position: filters.position,
    club_id: filters.club_id,
    page,
    limit,
  });

  const uclByLeague = useUclVsDomesticByLeagueQueries(
    { season: filters.season, position: filters.position, club_id: filters.club_id },
    6,
  );

  const rows = query.data?.data ?? [];

  const columns: DataColumn<GoldUclVsDomestic>[] = [
    {
      key: 'player',
      header: t('ucl.columns.player'),
      render: (r) => (
        <Link
          to={`/players/${r.player_id}`}
          className="font-semibold text-[var(--accent-primary)] hover:underline"
        >
          {r.player_name}
        </Link>
      ),
    },
    {
      key: 'club',
      header: t('ucl.columns.club'),
      render: (r) => <span>{r.club_name || '—'}</span>,
    },
    {
      key: 'league',
      header: t('ucl.columns.domesticLeague'),
      render: (r) => <Badge tone="neutral">{getCompetitionLabel(r.domestic_competition_id)}</Badge>,
    },
    {
      key: 'uclG90',
      header: t('ucl.columns.uclG90'),
      align: 'right',
      render: (r) => (
        <span className="font-mono-num font-semibold">{formatPer90(r.ucl_goals_per_90, lang)}</span>
      ),
    },
    {
      key: 'domG90',
      header: t('ucl.columns.domesticG90'),
      align: 'right',
      render: (r) => (
        <span className="font-mono-num">{formatPer90(r.domestic_goals_per_90, lang)}</span>
      ),
    },
    {
      key: 'delta',
      header: t('ucl.columns.goalsDelta'),
      align: 'right',
      render: (r) => {
        const val = r.goals_per_90_delta;
        return (
          <Badge
            tone={val === null ? 'neutral' : val >= 0 ? 'positive' : 'negative'}
            className="font-mono-num"
          >
            {formatSignedDelta(val, lang)}
          </Badge>
        );
      },
    },
    {
      key: 'gaDelta',
      header: t('ucl.columns.gaDelta'),
      align: 'right',
      render: (r) => (
        <span className="font-mono-num text-xs text-[var(--text-secondary)]">
          {formatSignedDelta(r.ga_per_90_delta, lang)}
        </span>
      ),
    },
    {
      key: 'mins',
      header: t('ucl.columns.minutesSplit'),
      align: 'right',
      render: (r) => (
        <span className="font-mono-num text-xs text-[var(--text-muted)]">
          {r.ucl_minutes_played} / {r.domestic_minutes_played}
        </span>
      ),
    },
  ];

  const handleExport = () => {
    exportToCsv(
      'mercatoiq-ucl-vs-domestic',
      ['Player ID', 'Player', 'Club', 'Domestic League', 'UCL G/90', 'Domestic G/90', 'Goals/90 Delta'],
      rows.map((r) => [
        r.player_id,
        r.player_name,
        r.club_name,
        r.domestic_competition_id,
        r.ucl_goals_per_90,
        r.domestic_goals_per_90,
        r.goals_per_90_delta,
      ]),
    );
    showToast(t('common.exportedSuccess'), 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('ucl.title')}
        subtitle={t('ucl.subtitle')}
        actions={
          <Button
            variant="secondary"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExport}
            disabled={rows.length === 0}
          >
            {t('common.exportCsv')}
          </Button>
        }
      />

      <AnalyticsFilterBar
        filters={filters}
        domesticOnly
        onChange={(next) => {
          setFilters(next);
          resetPage();
        }}
      />

      {query.isError && <ApiErrorBanner error={query.error} onRetry={() => void query.refetch()} />}

      <LeagueChartsGrid
        kicker="Q3 · FIXED LEAGUE CHARTS"
        title={t('analytics.fixedLeagueUclTitle')}
        subtitle={t('analytics.fixedLeagueUclSubtitle')}
        series={uclByLeague}
        selectedLeague={filters.competition_id}
        onSelectLeague={(competition_id) => {
          setFilters((prev) => ({ ...prev, competition_id }));
          resetPage();
        }}
        chartHeight={220}
        renderChart={(items) => {
          const pts = disambiguateChartLabels(
            items.map((r) => ({
              shortLabel: r.player_name.split(' ').slice(-1)[0],
              season: r.season,
              fullName: r.player_name,
              club: r.club_name || getCompetitionLabel(r.domestic_competition_id),
              delta: r.goals_per_90_delta ?? 0,
              uclG90: r.ucl_goals_per_90 ?? 0,
              domG90: r.domestic_goals_per_90 ?? 0,
            })),
          );
          return (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pts} margin={{ top: 10, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-line)" />
                  <XAxis
                    dataKey="shortLabel"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  />
                  <ReferenceLine y={0} stroke="var(--border-strong)" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as (typeof pts)[number];
                      return (
                        <ChartTooltipCard
                          title={d.fullName}
                          subtitle={`${d.club} · ${d.season}`}
                          rows={[
                            {
                              label: t('ucl.columns.goalsDelta'),
                              value: formatSignedDelta(d.delta, lang),
                              tone: d.delta >= 0 ? 'positive' : 'negative',
                            },
                            { label: t('ucl.columns.uclG90'), value: formatPer90(d.uclG90, lang) },
                            { label: t('ucl.columns.domesticG90'), value: formatPer90(d.domG90, lang) },
                          ]}
                        />
                      );
                    }}
                  />
                  <Bar dataKey="delta" maxBarSize={44} radius={[6, 6, 6, 6]}>
                    {pts.map((entry, idx) => (
                      <Cell
                        key={`${entry.fullName}-${idx}`}
                        fill={entry.delta >= 0 ? 'var(--accent-positive)' : 'var(--accent-negative)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        }}
      />

      <Card>
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(r) => `${r.player_id}-${r.season}`}
          isLoading={query.isLoading}
        />
        <Pagination meta={query.data?.meta} onPageChange={setPage} onLimitChange={setLimit} />
      </Card>
    </div>
  );
}
