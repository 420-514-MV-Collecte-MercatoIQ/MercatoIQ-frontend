import { cn } from '../../utils/formatters';

interface StripedProgressBarProps {
  label: string;
  valueLabel: string;
  percentage: number;
  tone?: 'primary' | 'positive' | 'secondary' | 'negative';
  subLabel?: string;
}

export function StripedProgressBar({
  label,
  valueLabel,
  percentage,
  tone = 'primary',
  subLabel,
}: StripedProgressBarProps) {
  const clamped = Math.max(4, Math.min(100, Math.round(percentage)));

  const fillClass =
    tone === 'positive'
      ? 'striped-bar-positive'
      : tone === 'secondary'
        ? 'striped-bar-secondary'
        : tone === 'negative'
          ? 'striped-bar-negative'
          : 'striped-bar-primary';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-[var(--text-secondary)] truncate">{label}</span>
        <span className="font-mono-num font-bold text-[var(--text-primary)]">{valueLabel}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden p-0.5">
        <div
          className={cn('h-full rounded-full transition-all duration-500', fillClass)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {subLabel && <p className="text-[11px] text-[var(--text-muted)]">{subLabel}</p>}
    </div>
  );
}
