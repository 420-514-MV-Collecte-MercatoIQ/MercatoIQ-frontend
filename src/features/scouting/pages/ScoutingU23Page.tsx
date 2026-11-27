import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
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
  useScoutingU23ByLeagueQueries,
  useScoutingU23Query,
} from '../../analytics/hooks/useAnalyticsQueries';
import { LeagueChartsGrid } from '../../analytics/components/LeagueChartsGrid';
import type { GoldUndervaluedScouting } from '../../../shared/types/domain.types';
import {
  formatCompactEur,
  formatInteger,
  formatPer90,
  formatRatio,
} from '../../../shared/utils/formatters';
import { getCompetitionLabel } from '../../../shared/types/constants';
import { exportToCsv } from '../../../shared/utils/exportCsv';
import { useToast } from '../../../shared/context/ToastContext';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';
import { usePagination } from '../../../shared/hooks/usePagination';

export function ScoutingU23Page() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t('scouting.title'));
  const lang = i18n.language;
  const { showToast } = useToast();

  const [filters, setFilters] = useState<AnalyticsFiltersState>({});
  const { page, limit, setPage, setLimit, resetPage } = usePagination(20);

  const query = useScoutingU23Query({
    ...filters,
    page,
    limit,
  });

  const scoutingByLeague = useScoutingU23ByLeagueQueries(
    { season: filters.season, position: filters.position, club_id: filters.club_id },
    8,
  );

  const rows = query.data?.data ?? [];

  const columns: DataColumn<GoldUndervaluedScouting>[] = [
    {
      key: 'player',
      header: t('scouting.columns.player'),
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
      key: 'age',
      header: t('scouting.columns.age'),
      align: 'center',
      render: (r) => <span className="font-mono-num">{r.age ?? '—'}</span>,
    },
    {
      key: 'club',
      header: t('scouting.columns.club'),
      render: (r) => <span>{r.club_name || '—'}</span>,
    },
    {
      key: 'league',
      header: t('scouting.columns.league'),
      render: (r) => <Badge tone="neutral">{getCompetitionLabel(r.competition_id)}</Badge>,
    },
    {
      key: 'position',
      header: t('scouting.columns.position'),
      render: (r) => (
        <span>{r.position ? t(`positions.${r.position}`, { defaultValue: r.position }) : '—'}</span>
      ),
    },
    {
      key: 'market',
      header: t('scouting.columns.marketValue'),
      align: 'right',
      render: (r) => (
        <span className="font-mono-num">{formatCompactEur(r.market_value_eur, lang)}</span>
      ),
    },
    {
      key: 'estimated',
      header: t('scouting.columns.estimatedValue'),
      align: 'right',
      render: (r) => (
        <span className="font-mono-num font-bold text-[var(--text-primary)]">
          {formatCompactEur(r.estimated_value_eur, lang)}
        </span>
      ),
    },
    {
      key: 'ratio',
      header: t('scouting.columns.ratio'),
      align: 'right',
      render: (r) => (
        <Badge tone={r.undervalue_ratio >= 1.2 ? 'positive' : 'neutral'} className="font-mono-num">
          {formatRatio(r.undervalue_ratio, 'x', lang)}
        </Badge>
      ),
    },
    {
      key: 'per90',
      header: t('scouting.columns.per90'),
      align: 'right',
      render: (r) => (
        <span className="font-mono-num text-xs text-[var(--text-secondary)]">
          {formatPer90(r.goals_per_90, lang)} · {formatPer90(r.assists_per_90, lang)}
        </span>
      ),
    },
    {
      key: 'mins',
      header: t('scouting.columns.minutes'),
      align: 'right',
      render: (r) => <span className="font-mono-num">{formatInteger(r.minutes_played, lang)}</span>,
    },
  ];

  const handleExport = () => {
    exportToCsv(
      'mercatoiq-scouting-u23',
      ['Player ID', 'Player', 'Age', 'Club', 'League', 'Position', 'Market Value EUR', 'ML Fair Value EUR', 'Undervalue Ratio'],
      rows.map((r) => [
        r.player_id,
        r.player_name,
        r.age,
        r.club_name,
        r.competition_id,
        r.position,
        r.market_value_eur,
        r.estimated_value_eur,
        r.undervalue_ratio,
      ]),
    );
    showToast(t('common.exportedSuccess'), 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('scouting.title')}
        subtitle={t('scouting.subtitle')}
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
        onChange={(next) => {
          setFilters(next);
          resetPage();
        }}
      />

      {query.isError && <ApiErrorBanner error={query.error} onRetry={() => void query.refetch()} />}

      <LeagueChartsGrid
        kicker={t('analytics.kickers.q2')}
        title={t('analytics.fixedLeagueScoutingTitle')}
        subtitle={t('analytics.fixedLeagueScoutingSubtitle')}
        series={scoutingByLeague}
        selectedLeague={filters.competition_id}
        onSelectLeague={(competition_id) => {
          setFilters((prev) => ({ ...prev, competition_id }));
          resetPage();
        }}
        chartHeight={220}
        renderChart={(items) => {
          const pts = items.map((p) => ({
            name: p.player_name,
            club: p.club_name || p.competition_id,
            marketM: Math.round((p.market_value_eur / 1_000_000) * 10) / 10,
            estimatedM: Math.round((p.estimated_value_eur / 1_000_000) * 10) / 10,
            ratio: p.undervalue_ratio,
          }));
          return (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 12, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" />
                  <XAxis
                    type="number"
                    dataKey="marketM"
                    tickFormatter={(v) => `€${v}M`}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="estimatedM"
                    tickFormatter={(v) => `€${v}M`}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  />
                  <ZAxis type="number" dataKey="ratio" range={[60, 220]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as (typeof pts)[number];
                      return (
                        <ChartTooltipCard
                          title={d.name}
                          subtitle={d.club}
                          rows={[
                            { label: t('scouting.columns.marketValue'), value: `€${d.marketM}M` },
                            {
                              label: t('scouting.columns.estimatedValue'),
                              value: `€${d.estimatedM}M`,
                              tone: 'positive',
                            },
                            { label: t('scouting.columns.ratio'), value: `${d.ratio.toFixed(2)}x` },
                          ]}
                        />
                      );
                    }}
                  />
                  <Scatter data={pts} fill="var(--accent-primary)" />
                </ScatterChart>
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
