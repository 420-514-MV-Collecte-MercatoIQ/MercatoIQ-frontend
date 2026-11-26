import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { StripedBarChart } from '../../../shared/components/charts/StripedBarChart';
import { ChartTooltipCard } from '../../../shared/components/charts/ChartTooltip';
import {
  AnalyticsFilterBar,
  type AnalyticsFiltersState,
} from '../../analytics/components/AnalyticsFilterBar';
import { useClubRoiQuery } from '../../analytics/hooks/useAnalyticsQueries';
import type { GoldClubTransferRoi } from '../../../shared/types/domain.types';
import {
  formatCompactEur,
  formatPer90,
  formatRoiPercent,
} from '../../../shared/utils/formatters';
import { getCompetitionLabel } from '../../../shared/types/constants';

export function ClubRoiPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [filters, setFilters] = useState<AnalyticsFiltersState>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const query = useClubRoiQuery({
    season: filters.season,
    competition_id: filters.competition_id,
    club_id: filters.club_id,
    page,
    limit,
  });

  const rows = query.data?.data ?? [];

  const handleFilterChange = (next: AnalyticsFiltersState) => {
    setFilters(next);
    setPage(1);
  };

  const roiBarData = rows.slice(0, 8).map((c) => {
    const numericRoi = c.roi ?? 0;
    const pct = Math.abs(numericRoi) <= 10 ? numericRoi * 100 : numericRoi;
    return {
      label: c.club_name,
      shortLabel: c.club_name.split(' ').slice(0, 2).join(' '),
      value: Math.round(pct * 10) / 10,
      displayValue: formatRoiPercent(c.roi, lang),
      subLabel: `${getCompetitionLabel(c.competition_id)} · ${c.season}`,
    };
  });

  const spendVsGainData = rows.slice(0, 8).map((c) => ({
    name: c.club_name.split(' ').slice(0, 2).join(' '),
    fullName: c.club_name,
    fees: Math.round((c.total_fees_paid_eur || 0) / 1_000_000),
    gain: Math.round((c.total_value_gain_eur || 0) / 1_000_000),
  }));

  const columns: DataColumn<GoldClubTransferRoi>[] = [
    {
      key: 'club',
      header: t('clubRoi.columns.club'),
      render: (r) => (
        <div>
          <div className="font-semibold text-[var(--text-primary)]">{r.club_name}</div>
          <div className="text-[11px] font-mono-num text-[var(--text-muted)]">#{r.club_id}</div>
        </div>
      ),
    },
    {
      key: 'season',
      header: t('clubRoi.columns.season'),
      render: (r) => <span className="font-mono-num">{r.season}</span>,
    },
    {
      key: 'league',
      header: t('clubRoi.columns.league'),
      render: (r) => <Badge tone="neutral">{getCompetitionLabel(r.competition_id)}</Badge>,
    },
    {
      key: 'bought',
      header: t('clubRoi.columns.bought'),
      align: 'right',
      render: (r) => <span className="font-mono-num">{r.players_bought ?? '—'}</span>,
    },
    {
      key: 'fees',
      header: t('clubRoi.columns.feesPaid'),
      align: 'right',
      render: (r) => (
        <span className="font-mono-num">{formatCompactEur(r.total_fees_paid_eur, lang)}</span>
      ),
    },
    {
      key: 'gain',
      header: t('clubRoi.columns.valueGain'),
      align: 'right',
      render: (r) => (
        <span
          className={
            r.total_value_gain_eur >= 0
              ? 'font-mono-num font-semibold text-[var(--accent-positive)]'
              : 'font-mono-num font-semibold text-[var(--accent-negative)]'
          }
        >
          {formatCompactEur(r.total_value_gain_eur, lang)}
        </span>
      ),
    },
    {
      key: 'roi',
      header: t('clubRoi.columns.roi'),
      align: 'right',
      render: (r) => (
        <Badge tone={(r.roi ?? 0) >= 0 ? 'positive' : 'negative'} className="font-mono-num">
          {formatRoiPercent(r.roi, lang)}
        </Badge>
      ),
    },
    {
      key: 'ga',
      header: t('clubRoi.columns.ga'),
      align: 'right',
      render: (r) => (
        <span className="font-mono-num text-xs text-[var(--text-secondary)]">
          {r.total_goals ?? 0} / {r.total_assists ?? 0} ({r.total_ga ?? 0})
        </span>
      ),
    },
    {
      key: 'gaPerM',
      header: t('clubRoi.columns.gaPerMillion'),
      align: 'right',
      render: (r) => <span className="font-mono-num">{formatPer90(r.ga_per_m_eur, lang)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('clubRoi.title')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('clubRoi.subtitle')}</p>
      </div>

      <AnalyticsFilterBar
        filters={filters}
        onChange={handleFilterChange}
        showPosition={false}
      />

      {query.isError && <ApiErrorBanner error={query.error} onRetry={() => void query.refetch()} />}

      {rows.length > 0 && (
        <div className="grid xl:grid-cols-2 gap-5">
          <Card>
            <CardHeader kicker="Q1 · ROI" title={t('clubRoi.chartRoiTitle')} />
            <StripedBarChart
              data={roiBarData}
              height={260}
              valueLabel="ROI"
              tickFormatter={(v) => `${v}%`}
            />
          </Card>

          <Card>
            <CardHeader kicker="Q1 · CAPITAL" title={t('clubRoi.chartFeesVsGainTitle')} />
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendVsGainData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
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
                    tickFormatter={(v) => `€${v}M`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as (typeof spendVsGainData)[number];
                      return (
                        <ChartTooltipCard
                          title={d.fullName}
                          rows={[
                            { label: t('clubRoi.columns.feesPaid'), value: `€${d.fees}M` },
                            {
                              label: t('clubRoi.columns.valueGain'),
                              value: `€${d.gain}M`,
                              tone: d.gain >= 0 ? 'positive' : 'negative',
                            },
                          ]}
                        />
                      );
                    }}
                  />
                  <Bar dataKey="fees" fill="var(--accent-secondary)" radius={[8, 8, 4, 4]} />
                  <Bar dataKey="gain" fill="var(--accent-primary)" radius={[8, 8, 4, 4]} />
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
          rowKey={(r) => `${r.club_id}-${r.season}`}
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
