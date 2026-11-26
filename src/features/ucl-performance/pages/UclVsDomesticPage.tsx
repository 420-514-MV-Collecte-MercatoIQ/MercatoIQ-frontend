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
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { DataTable, type DataColumn } from '../../../shared/components/ui/DataTable';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { ApiErrorBanner } from '../../../shared/components/ui/StateFeedback';
import { ChartTooltipCard } from '../../../shared/components/charts/ChartTooltip';
import {
  AnalyticsFilterBar,
  type AnalyticsFiltersState,
} from '../../analytics/components/AnalyticsFilterBar';
import { useUclVsDomesticQuery } from '../../analytics/hooks/useAnalyticsQueries';
import type { GoldUclVsDomestic } from '../../../shared/types/domain.types';
import { formatPer90, formatSignedDelta } from '../../../shared/utils/formatters';
import { getCompetitionLabel } from '../../../shared/types/constants';

export function UclVsDomesticPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [filters, setFilters] = useState<AnalyticsFiltersState>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const query = useUclVsDomesticQuery({
    season: filters.season,
    domestic_competition_id: filters.competition_id,
    position: filters.position,
    club_id: filters.club_id,
    page,
    limit,
  });

  const rows = query.data?.data ?? [];

  const chartData = rows.slice(0, 8).map((r) => ({
    name: r.player_name.split(' ').slice(-1)[0],
    fullName: r.player_name,
    club: r.club_name || getCompetitionLabel(r.domestic_competition_id),
    delta: r.goals_per_90_delta ?? 0,
    uclG90: r.ucl_goals_per_90 ?? 0,
    domG90: r.domestic_goals_per_90 ?? 0,
  }));

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('ucl.title')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('ucl.subtitle')}</p>
      </div>

      <AnalyticsFilterBar
        filters={filters}
        domesticOnly
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      {query.isError && <ApiErrorBanner error={query.error} onRetry={() => void query.refetch()} />}

      {rows.length > 0 && (
        <div className="grid xl:grid-cols-2 gap-5">
          <Card>
            <CardHeader kicker="Q3 · STEP-UP DELTA" title={t('ucl.deltaChartTitle')} />
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-line)" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  />
                  <ReferenceLine y={0} stroke="var(--border-strong)" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as (typeof chartData)[number];
                      return (
                        <ChartTooltipCard
                          title={d.fullName}
                          subtitle={d.club}
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
                  <Bar dataKey="delta" radius={[8, 8, 8, 8]}>
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={`${entry.fullName}-${idx}`}
                        fill={entry.delta >= 0 ? 'var(--accent-positive)' : 'var(--accent-negative)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader kicker="Q3 · PER 90 SPLIT" title={t('ucl.comparisonTitle')} />
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-line)" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as (typeof chartData)[number];
                      return (
                        <ChartTooltipCard
                          title={d.fullName}
                          subtitle={d.club}
                          rows={[
                            { label: t('ucl.columns.uclG90'), value: formatPer90(d.uclG90, lang) },
                            { label: t('ucl.columns.domesticG90'), value: formatPer90(d.domG90, lang) },
                          ]}
                        />
                      );
                    }}
                  />
                  <Bar dataKey="uclG90" fill="var(--accent-primary)" radius={[8, 8, 4, 4]} />
                  <Bar dataKey="domG90" fill="var(--accent-secondary)" radius={[8, 8, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(r) => `${r.player_id}-${r.season}`}
          isLoading={query.isLoading}
        />
        <Pagination
          meta={query.data?.meta}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </Card>
    </div>
  );
}
