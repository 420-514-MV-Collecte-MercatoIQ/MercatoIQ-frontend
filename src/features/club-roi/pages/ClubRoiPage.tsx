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
import { Download } from 'lucide-react';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { DataTable, type DataColumn } from '../../../shared/components/ui/DataTable';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { ApiErrorBanner } from '../../../shared/components/ui/StateFeedback';
import { StripedBarChart } from '../../../shared/components/charts/StripedBarChart';
import { ChartTooltipCard } from '../../../shared/components/charts/ChartTooltip';
import {
  AnalyticsFilterBar,
  type AnalyticsFiltersState,
} from '../../analytics/components/AnalyticsFilterBar';
import {
  useClubRoiByLeagueQueries,
  useClubRoiQuery,
} from '../../analytics/hooks/useAnalyticsQueries';
import { LeagueChartsGrid } from '../../analytics/components/LeagueChartsGrid';
import type { GoldClubTransferRoi } from '../../../shared/types/domain.types';
import {
  formatCompactEur,
  formatPer90,
  formatRoiPercent,
  normalizeRoiPercent,
} from '../../../shared/utils/formatters';
import { getCompetitionLabel } from '../../../shared/types/constants';
import { exportToCsv } from '../../../shared/utils/exportCsv';
import { useToast } from '../../../shared/context/ToastContext';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';
import { usePagination } from '../../../shared/hooks/usePagination';

export function ClubRoiPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t('clubRoi.title'));
  const lang = i18n.language;
  const { showToast } = useToast();

  const [filters, setFilters] = useState<AnalyticsFiltersState>({});
  const { page, limit, setPage, setLimit, resetPage } = usePagination(20);

  const query = useClubRoiQuery({
    season: filters.season,
    competition_id: filters.competition_id,
    club_id: filters.club_id,
    page,
    limit,
  });

  const clubRoiByLeague = useClubRoiByLeagueQueries(
    { season: filters.season, club_id: filters.club_id },
    5,
  );

  const rows = query.data?.data ?? [];

  const handleFilterChange = (next: AnalyticsFiltersState) => {
    setFilters(next);
    resetPage();
  };

  const roiBarData = rows.slice(0, 8).map((c) => ({
    label: c.club_name,
    shortLabel: c.club_name.split(' ').slice(0, 2).join(' '),
    value: normalizeRoiPercent(c.roi) ?? 0,
    displayValue: formatRoiPercent(c.roi, lang),
    subLabel: `${getCompetitionLabel(c.competition_id)} · ${c.season}`,
  }));

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

  const handleExport = () => {
    exportToCsv(
      'mercatoiq-club-roi',
      ['Club ID', 'Club', 'Season', 'League', 'Signings', 'Fees Paid EUR', 'Value Gain EUR', 'ROI', 'G+A'],
      rows.map((r) => [
        r.club_id,
        r.club_name,
        r.season,
        r.competition_id,
        r.players_bought,
        r.total_fees_paid_eur,
        r.total_value_gain_eur,
        r.roi,
        r.total_ga,
      ]),
    );
    showToast(t('common.exportedSuccess'), 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('clubRoi.title')}
        subtitle={t('clubRoi.subtitle')}
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

      <LeagueChartsGrid
        kicker="Q1 · FIXED LEAGUE CHARTS"
        title={t('analytics.fixedLeagueRoiTitle')}
        subtitle={t('analytics.fixedLeagueRoiSubtitle')}
        series={clubRoiByLeague}
        selectedLeague={filters.competition_id}
        onSelectLeague={(competition_id) => handleFilterChange({ ...filters, competition_id })}
        chartHeight={220}
        renderChart={(items) => (
          <StripedBarChart
            data={items.map((c) => ({
              label: c.club_name,
              shortLabel: c.club_name.split(' ').slice(0, 2).join(' '),
              value: normalizeRoiPercent(c.roi) ?? 0,
              displayValue: formatRoiPercent(c.roi, lang),
              subLabel: `${c.season}`,
              extraRows: [
                { label: t('clubRoi.columns.feesPaid'), value: formatCompactEur(c.total_fees_paid_eur, lang) },
                {
                  label: t('clubRoi.columns.valueGain'),
                  value: formatCompactEur(c.total_value_gain_eur, lang),
                  tone: c.total_value_gain_eur >= 0 ? 'positive' : 'negative',
                },
              ],
            }))}
            height={220}
            valueLabel="ROI"
            tickFormatter={(v) => `${v}%`}
          />
        )}
      />

      <Card>
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(r) => `${r.club_id}-${r.season}`}
          isLoading={query.isLoading}
        />
        <Pagination meta={query.data?.meta} onPageChange={setPage} onLimitChange={setLimit} />
      </Card>
    </div>
  );
}
