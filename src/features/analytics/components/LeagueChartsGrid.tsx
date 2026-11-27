import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { ChartCardSkeleton } from '../../../shared/components/ui/Loaders';
import type { LeagueSeriesResult } from '../hooks/useAnalyticsQueries';

interface LeagueChartsGridProps<T> {
  kicker: string;
  title: string;
  subtitle?: string;
  series: LeagueSeriesResult<T>[];
  selectedLeague?: string;
  onSelectLeague?: (leagueId?: string) => void;
  chartHeight?: number;
  renderChart: (items: T[], leagueId: string) => ReactNode;
}

export function LeagueChartsGrid<T>({
  kicker,
  title,
  subtitle,
  series,
  selectedLeague,
  onSelectLeague,
  chartHeight = 220,
  renderChart,
}: LeagueChartsGridProps<T>) {
  const { t } = useTranslation();

  const visibleSeries = selectedLeague
    ? series.filter((entry) => entry.league.id === selectedLeague)
    : series;

  const gridClass =
    visibleSeries.length === 1
      ? 'grid grid-cols-1 gap-5'
      : 'grid md:grid-cols-2 xl:grid-cols-3 gap-5';

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--accent-primary)]">
            {kicker}
          </span>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mt-0.5">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" className="font-mono-num">
            {visibleSeries.length} / {series.length} {t('analytics.leaguesShown')}
          </Badge>
          {selectedLeague && onSelectLeague && (
            <Button variant="secondary" size="sm" onClick={() => onSelectLeague(undefined)}>
              {t('analytics.showAllLeagues')}
            </Button>
          )}
        </div>
      </div>

      {visibleSeries.length === 0 ? (
        <Card className="py-10 text-center space-y-3">
          <div className="text-sm font-semibold text-[var(--text-primary)]">{t('common.noData')}</div>
          <p className="text-xs text-[var(--text-secondary)]">{t('common.noDataHint')}</p>
          {onSelectLeague && (
            <div className="pt-1">
              <Button variant="secondary" size="sm" onClick={() => onSelectLeague(undefined)}>
                {t('analytics.showAllLeagues')}
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className={gridClass}>
          {visibleSeries.map(({ league, data, isLoading }) => (
            <Card key={league.id} className="flex flex-col">
              <CardHeader
                kicker={`${league.id} · ${league.country.toUpperCase()}`}
                title={league.label}
                action={
                  onSelectLeague && !selectedLeague ? (
                    <button
                      type="button"
                      onClick={() => onSelectLeague(league.id)}
                      className="text-[11px] font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer"
                    >
                      {t('analytics.focusLeague')}
                    </button>
                  ) : (
                    <Badge tone="primary" className="font-mono-num">
                      {league.id}
                    </Badge>
                  )
                }
              />

              {isLoading ? (
                <ChartCardSkeleton height={chartHeight} />
              ) : data.length > 0 ? (
                renderChart(data, league.id)
              ) : (
                <div
                  style={{ height: chartHeight }}
                  className="flex items-center justify-center text-xs text-[var(--text-muted)] text-center px-4"
                >
                  {t('common.noData')}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
