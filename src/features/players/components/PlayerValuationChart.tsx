import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { ErrorBoundary } from '../../../shared/components/ui/ErrorBoundary';
import { ChartTooltipCard } from '../../../shared/components/charts/ChartTooltip';
import type { MarketValuation } from '../../../shared/types/domain.types';
import { formatDate, formatEur } from '../../../shared/utils/formatters';

interface PlayerValuationChartProps {
  valuations: MarketValuation[];
}

export function PlayerValuationChart({ valuations }: PlayerValuationChartProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const safeValuations = Array.isArray(valuations) ? valuations : [];
  const data = safeValuations
    .filter(
      (v) =>
        v &&
        !Number.isNaN(new Date(v.date).getTime()) &&
        typeof v.market_value_eur === 'number' &&
        Number.isFinite(v.market_value_eur),
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((v) => ({
      dateLabel: formatDate(v.date, lang),
      valueM: Math.round((v.market_value_eur / 1_000_000) * 10) / 10,
      rawEur: v.market_value_eur,
    }));

  return (
    <Card className="xl:col-span-7">
      <CardHeader kicker="SILVER PROFILE" title={t('players.detail.valuationChartTitle')} />
      {data.length > 0 ? (
        <ErrorBoundary variant="section" resetKeys={[data.length]}>
          <div style={{ width: '100%', height: 270 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-line)" />
              <XAxis
                dataKey="dateLabel"
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
                  const d = payload[0].payload as (typeof data)[number];
                  return (
                    <ChartTooltipCard
                      title={d.dateLabel}
                      rows={[
                        {
                          label: t('players.columns.currentValue'),
                          value: formatEur(d.rawEur, lang),
                          tone: 'positive',
                        },
                      ]}
                    />
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="valueM"
                stroke="var(--accent-primary)"
                strokeWidth={2.5}
                fill="url(#valGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        </ErrorBoundary>
      ) : (
        <div className="h-56 flex items-center justify-center text-sm text-[var(--text-muted)]">
          {t('players.detail.valuationEmpty')}
        </div>
      )}
    </Card>
  );
}
