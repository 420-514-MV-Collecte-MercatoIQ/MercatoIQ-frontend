import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn, formatSignedDelta } from '../../utils/formatters';
import { ChartTooltipCard } from './ChartTooltip';

export interface CapsuleItem {
  id: string | number;
  label: string;
  subLabel?: string;
  primaryValue: number | null;
  secondaryValue: number | null;
  primaryDisplay: string;
  secondaryDisplay: string;
}

interface CapsuleComparisonChartProps {
  items: CapsuleItem[];
  primaryLegend: string;
  secondaryLegend: string;
}

/**
 * Check Box-inspired capsule/dumbbell comparison rows for dual-metric splits
 * (e.g. Substitute G+A/90 vs Starter G+A/90) with interactive hover tooltips.
 */
export function CapsuleComparisonChart({
  items,
  primaryLegend,
  secondaryLegend,
}: CapsuleComparisonChartProps) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  const maxVal = Math.max(
    0.5,
    ...items.flatMap((i) => [i.primaryValue ?? 0, i.secondaryValue ?? 0]),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[var(--accent-primary)]" />
          {primaryLegend}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[var(--accent-secondary)]" />
          {secondaryLegend}
        </span>
      </div>

      <div className="space-y-2.5 dot-matrix-bg rounded-2xl p-4 border border-[var(--border-subtle)]">
        {items.map((item) => {
          const pPct = Math.min(100, Math.max(8, ((item.primaryValue ?? 0) / maxVal) * 100));
          const sPct = Math.min(100, Math.max(8, ((item.secondaryValue ?? 0) / maxVal) * 100));
          const delta =
            item.primaryValue !== null && item.secondaryValue !== null
              ? item.primaryValue - item.secondaryValue
              : null;
          const isHovered = hoveredId === item.id;

          return (
            <div
              key={item.id}
              tabIndex={0}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(item.id)}
              onBlur={() => setHoveredId(null)}
              className="relative rounded-xl px-2 py-1.5 -mx-2 transition-colors hover:bg-[var(--bg-surface)]/80 focus:outline-none focus:bg-[var(--bg-surface)]/80 space-y-1.5 cursor-pointer"
            >
              {isHovered && (
                <div
                  role="tooltip"
                  className="absolute right-2 bottom-full mb-2 z-30 pointer-events-none"
                >
                  <ChartTooltipCard
                    title={item.label}
                    subtitle={item.subLabel}
                    rows={[
                      {
                        label: primaryLegend,
                        value: item.primaryDisplay,
                        tone: 'positive',
                      },
                      {
                        label: secondaryLegend,
                        value: item.secondaryDisplay,
                      },
                      ...(delta !== null
                        ? [
                            {
                              label: 'Δ',
                              value: formatSignedDelta(delta, lang),
                              tone: (delta >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>
              )}

              <div className="flex items-start justify-between gap-2 text-xs">
                <div className="min-w-0 flex-1 leading-tight">
                  <span
                    title={item.label}
                    className="block font-semibold text-[var(--text-primary)] truncate"
                  >
                    {item.label}
                  </span>
                  {item.subLabel && (
                    <span
                      title={item.subLabel}
                      className="block text-[11px] text-[var(--text-muted)] truncate mt-0.5"
                    >
                      {item.subLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 font-mono-num shrink-0 self-start pt-0.5">
                  <span className="text-[var(--accent-primary)] font-bold">
                    {item.primaryDisplay}
                  </span>
                  <span className="text-[var(--text-muted)]">/</span>
                  <span className="text-[var(--accent-secondary)] font-semibold">
                    {item.secondaryDisplay}
                  </span>
                </div>
              </div>

              <div className="relative h-7 rounded-full bg-[var(--bg-surface)]/85 border border-[var(--border-subtle)] flex items-center px-1.5 gap-1.5">
                <div
                  className={cn(
                    'h-4 rounded-full bg-[var(--accent-primary)] transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-mono-num font-bold text-[var(--text-pill-active)]',
                  )}
                  style={{ width: `${pPct}%` }}
                />
                <div
                  className="h-2.5 rounded-full bg-[var(--accent-secondary)] opacity-90 transition-all duration-500"
                  style={{ width: `${Math.max(6, sPct * 0.45)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
