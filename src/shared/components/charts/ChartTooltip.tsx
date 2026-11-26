import type { ReactNode } from 'react';

interface TooltipRow {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'negative' | 'secondary';
}

export function ChartTooltipCard({
  title,
  subtitle,
  rows,
  footer,
}: {
  title: string;
  subtitle?: string;
  rows: TooltipRow[];
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-2xl px-3.5 py-2.5 shadow-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 backdrop-blur-md text-xs min-w-[180px]">
      <div className="font-bold text-[var(--text-primary)]">{title}</div>
      {subtitle && <div className="text-[11px] text-[var(--text-muted)] mb-1.5">{subtitle}</div>}
      <div className="space-y-1 mt-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <span className="text-[var(--text-secondary)]">{row.label}</span>
            <span
              className={
                row.tone === 'positive'
                  ? 'font-mono-num font-semibold text-[var(--accent-positive)]'
                  : row.tone === 'negative'
                    ? 'font-mono-num font-semibold text-[var(--accent-negative)]'
                    : row.tone === 'secondary'
                      ? 'font-mono-num font-semibold text-[var(--accent-secondary)]'
                      : 'font-mono-num font-semibold text-[var(--text-primary)]'
              }
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
      {footer && <div className="mt-2 pt-1.5 border-t border-[var(--border-subtle)]">{footer}</div>}
    </div>
  );
}
