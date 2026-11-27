import { useId, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartTooltipCard } from './ChartTooltip';

export interface StripedBarDatum {
  label: string;
  shortLabel?: string;
  value: number;
  displayValue: string;
  subLabel?: string;
  extraRows?: Array<{ label: string; value: string; tone?: 'default' | 'positive' | 'negative' }>;
}

interface StripedBarChartProps {
  data: StripedBarDatum[];
  height?: number;
  valueLabel?: string;
  tickFormatter?: (val: number) => string;
}

export function StripedBarChart({
  data,
  height = 280,
  valueLabel = 'Value',
  tickFormatter,
}: StripedBarChartProps) {
  const uid = useId().replace(/:/g, '');
  const stripeId = `stripe-${uid}`;
  const solidId = `solid-${uid}`;
  const negId = `neg-${uid}`;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 14, right: 10, left: 0, bottom: 18 }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <pattern
              id={stripeId}
              width="10"
              height="10"
              patternTransform="rotate(42 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <rect width="10" height="10" fill="var(--accent-primary)" fillOpacity="0.82" />
              <line x1="0" y1="0" x2="0" y2="10" stroke="var(--bg-surface)" strokeWidth="2.5" strokeOpacity="0.55" />
            </pattern>
            <linearGradient id={solidId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0.72} />
            </linearGradient>
            <pattern
              id={negId}
              width="10"
              height="10"
              patternTransform="rotate(42 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <rect width="10" height="10" fill="var(--accent-negative)" fillOpacity="0.82" />
              <line x1="0" y1="0" x2="0" y2="10" stroke="var(--bg-surface)" strokeWidth="2.5" strokeOpacity="0.55" />
            </pattern>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-line)" />
          <XAxis
            dataKey="shortLabel"
            tickLine={false}
            axisLine={false}
            angle={-25}
            textAnchor="end"
            height={48}
            tickMargin={6}
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }}
            interval={0}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickFormatter={tickFormatter}
          />
          <Tooltip
            cursor={{ fill: 'var(--accent-primary-soft)', radius: 12 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload as StripedBarDatum;
              return (
                <ChartTooltipCard
                  title={item.label}
                  subtitle={item.subLabel}
                  rows={[
                    {
                      label: valueLabel,
                      value: item.displayValue,
                      tone: item.value >= 0 ? 'positive' : 'negative',
                    },
                    ...(item.extraRows ?? []),
                  ]}
                />
              );
            }}
          />
          <Bar
            dataKey="value"
            radius={[12, 12, 6, 6]}
            maxBarSize={44}
            minPointSize={3}
            onMouseEnter={(_, idx) => setActiveIndex(idx)}
          >
            {data.map((entry, idx) => {
              const isHighlighted = activeIndex === idx || (activeIndex === null && idx === 0);
              const fill =
                entry.value < 0
                  ? `url(#${negId})`
                  : isHighlighted
                    ? `url(#${solidId})`
                    : `url(#${stripeId})`;
              return <Cell key={`${entry.label}-${idx}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
