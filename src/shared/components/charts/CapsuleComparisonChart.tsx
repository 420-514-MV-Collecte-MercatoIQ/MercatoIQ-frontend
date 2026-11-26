import { cn } from '../../utils/formatters';

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
 * (e.g. Substitute G+A/90 vs Starter G+A/90).
 */
export function CapsuleComparisonChart({
  items,
  primaryLegend,
  secondaryLegend,
}: CapsuleComparisonChartProps) {
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

      <div className="space-y-3 dot-matrix-bg rounded-2xl p-4 border border-[var(--border-subtle)]">
        {items.map((item) => {
          const pPct = Math.min(100, Math.max(8, ((item.primaryValue ?? 0) / maxVal) * 100));
          const sPct = Math.min(100, Math.max(8, ((item.secondaryValue ?? 0) / maxVal) * 100));

          return (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-[var(--text-primary)] truncate">
                    {item.label}
                  </span>
                  {item.subLabel && (
                    <span className="text-[11px] text-[var(--text-muted)] truncate">
                      {item.subLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-mono-num shrink-0">
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
