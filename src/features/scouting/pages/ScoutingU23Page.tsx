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
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { DataTable, type DataColumn } from '../../../shared/components/ui/DataTable';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { ApiErrorBanner } from '../../../shared/components/ui/StateFeedback';
import { StripedProgressBar } from '../../../shared/components/charts/StripedProgressBar';
import { ChartTooltipCard } from '../../../shared/components/charts/ChartTooltip';
import {
  AnalyticsFilterBar,
  type AnalyticsFiltersState,
} from '../../analytics/components/AnalyticsFilterBar';
import { useScoutingU23Query } from '../../analytics/hooks/useAnalyticsQueries';
import type { GoldUndervaluedScouting } from '../../../shared/types/domain.types';
import {
  formatCompactEur,
  formatInteger,
  formatPer90,
  formatRatio,
} from '../../../shared/utils/formatters';
import { getCompetitionLabel } from '../../../shared/types/constants';

export function ScoutingU23Page() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [filters, setFilters] = useState<AnalyticsFiltersState>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const query = useScoutingU23Query({
    ...filters,
    page,
    limit,
  });

  const rows = query.data?.data ?? [];

  const scatterData = rows.map((p) => ({
    name: p.player_name,
    club: p.club_name || p.competition_id,
    marketM: Math.round((p.market_value_eur / 1_000_000) * 10) / 10,
    estimatedM: Math.round((p.estimated_value_eur / 1_000_000) * 10) / 10,
    ratio: p.undervalue_ratio,
  }));

  const maxRatio = Math.max(2, ...rows.map((r) => r.undervalue_ratio));

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('scouting.title')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('scouting.subtitle')}</p>
      </div>

      <AnalyticsFilterBar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      {query.isError && <ApiErrorBanner error={query.error} onRetry={() => void query.refetch()} />}

      {rows.length > 0 && (
        <div className="grid xl:grid-cols-12 gap-5">
          <Card className="xl:col-span-7">
            <CardHeader
              kicker="Q2 · ML VALUATION"
              title={t('scouting.scatterTitle')}
              subtitle={t('scouting.scatterSubtitle')}
            />
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" />
                  <XAxis
                    type="number"
                    dataKey="marketM"
                    name={t('scouting.columns.marketValue')}
                    tickFormatter={(v) => `€${v}M`}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="estimatedM"
                    name={t('scouting.columns.estimatedValue')}
                    tickFormatter={(v) => `€${v}M`}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  />
                  <ZAxis type="number" dataKey="ratio" range={[80, 320]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as (typeof scatterData)[number];
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
                  <Scatter data={scatterData} fill="var(--accent-primary)" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="xl:col-span-5">
            <CardHeader kicker="TOP TARGETS" title={t('scouting.topRatioTitle')} />
            <div className="space-y-4">
              {rows.slice(0, 5).map((item) => (
                <StripedProgressBar
                  key={`${item.player_id}-${item.season}`}
                  label={`${item.player_name} (${item.club_name || item.competition_id})`}
                  valueLabel={formatRatio(item.undervalue_ratio, 'x', lang)}
                  percentage={(item.undervalue_ratio / maxRatio) * 100}
                  tone="positive"
                  subLabel={`${formatCompactEur(item.market_value_eur, lang)} → ${formatCompactEur(item.estimated_value_eur, lang)}`}
                />
              ))}
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
