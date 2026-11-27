import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { DataTable, type DataColumn } from '../../../shared/components/ui/DataTable';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { ApiErrorBanner } from '../../../shared/components/ui/StateFeedback';
import { CapsuleComparisonChart } from '../../../shared/components/charts/CapsuleComparisonChart';
import {
  AnalyticsFilterBar,
  type AnalyticsFiltersState,
} from '../../analytics/components/AnalyticsFilterBar';
import {
  useSuperSubsByLeagueQueries,
  useSuperSubsQuery,
} from '../../analytics/hooks/useAnalyticsQueries';
import { LeagueChartsGrid } from '../../analytics/components/LeagueChartsGrid';
import type { GoldSuperSubs } from '../../../shared/types/domain.types';
import { formatPer90 } from '../../../shared/utils/formatters';
import { getCompetitionLabel } from '../../../shared/types/constants';
import { exportToCsv } from '../../../shared/utils/exportCsv';
import { useToast } from '../../../shared/context/ToastContext';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';
import { usePagination } from '../../../shared/hooks/usePagination';

export function SuperSubsPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t('superSubs.title'));
  const lang = i18n.language;
  const { showToast } = useToast();

  const [filters, setFilters] = useState<AnalyticsFiltersState>({});
  const { page, limit, setPage, setLimit, resetPage } = usePagination(20);

  const query = useSuperSubsQuery({
    ...filters,
    page,
    limit,
  });

  const superSubsByLeague = useSuperSubsByLeagueQueries(
    { season: filters.season, position: filters.position, club_id: filters.club_id },
    4,
  );

  const rows = query.data?.data ?? [];

  const columns: DataColumn<GoldSuperSubs>[] = [
    {
      key: 'player',
      header: t('superSubs.columns.player'),
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
      header: t('superSubs.columns.club'),
      render: (r) => <span>{r.club_name || '—'}</span>,
    },
    {
      key: 'league',
      header: t('superSubs.columns.league'),
      render: (r) => <Badge tone="neutral">{getCompetitionLabel(r.competition_id)}</Badge>,
    },
    {
      key: 'position',
      header: t('superSubs.columns.position'),
      render: (r) => (
        <span>{r.position ? t(`positions.${r.position}`, { defaultValue: r.position }) : '—'}</span>
      ),
    },
    {
      key: 'subStats',
      header: t('superSubs.columns.subStats'),
      align: 'right',
      render: (r) => (
        <span className="font-mono-num text-xs text-[var(--text-secondary)]">
          {r.sub_appearances} ({r.sub_goals + r.sub_assists})
        </span>
      ),
    },
    {
      key: 'subPer90',
      header: t('superSubs.columns.subPer90'),
      align: 'right',
      render: (r) => (
        <span className="font-mono-num font-bold text-[var(--accent-primary)]">
          {formatPer90(r.sub_goal_contributions_per_90, lang)}
        </span>
      ),
    },
    {
      key: 'starterPer90',
      header: t('superSubs.columns.starterPer90'),
      align: 'right',
      render: (r) => (
        <span className="font-mono-num">
          {formatPer90(r.starter_goal_contributions_per_90, lang)}
        </span>
      ),
    },
    {
      key: 'score',
      header: t('superSubs.columns.score'),
      align: 'right',
      render: (r) => (
        <Badge tone="positive" className="font-mono-num">
          {formatPer90(r.super_sub_score, lang)}
        </Badge>
      ),
    },
  ];

  const handleExport = () => {
    try {
      exportToCsv(
        'mercatoiq-super-subs',
        ['Player ID', 'Player', 'Club', 'League', 'Sub Apps', 'Sub G+A/90', 'Starter G+A/90', 'Super-Sub Score'],
        rows.map((r) => [
          r.player_id,
          r.player_name,
          r.club_name,
          r.competition_id,
          r.sub_appearances,
          r.sub_goal_contributions_per_90,
          r.starter_goal_contributions_per_90,
          r.super_sub_score,
        ]),
      );
      showToast(t('common.exportedSuccess'), 'success');
    } catch {
      showToast(t('errors.exportFailed'), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('superSubs.title')}
        subtitle={t('superSubs.subtitle')}
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
        kicker={t('analytics.kickers.q4')}
        title={t('analytics.fixedLeagueSuperSubsTitle')}
        subtitle={t('analytics.fixedLeagueSuperSubsSubtitle')}
        series={superSubsByLeague}
        selectedLeague={filters.competition_id}
        onSelectLeague={(competition_id) => {
          setFilters((prev) => ({ ...prev, competition_id }));
          resetPage();
        }}
        chartHeight={220}
        renderChart={(items) => (
          <CapsuleComparisonChart
            items={items.map((r) => ({
              id: `${r.player_id}-${r.season}-${r.competition_id}`,
              label: r.player_name,
              subLabel: r.club_name || getCompetitionLabel(r.competition_id),
              primaryValue: r.sub_goal_contributions_per_90,
              secondaryValue: r.starter_goal_contributions_per_90,
              primaryDisplay: formatPer90(r.sub_goal_contributions_per_90, lang),
              secondaryDisplay: formatPer90(r.starter_goal_contributions_per_90, lang),
            }))}
            primaryLegend={t('superSubs.columns.subPer90')}
            secondaryLegend={t('superSubs.columns.starterPer90')}
          />
        )}
      />

      <Card>
        <DataTable
          columns={columns}
          data={rows}
          rowKey={(r) => `${r.player_id}-${r.season}-${r.competition_id}`}
          isLoading={query.isLoading}
          isError={query.isError}
        />
        <Pagination meta={query.data?.meta} onPageChange={setPage} onLimitChange={setLimit} />
      </Card>
    </div>
  );
}
