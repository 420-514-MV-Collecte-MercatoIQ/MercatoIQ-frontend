import type { ReactNode } from 'react';
import { Card } from './Card';
import { Badge, type BadgeTone } from './Badge';
import { cn } from '../../utils/formatters';

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  badge?: string;
  badgeTone?: BadgeTone;
  icon?: ReactNode;
  accent?: 'primary' | 'positive' | 'secondary' | 'neutral';
  className?: string;
}

export function StatCard({
  label,
  value,
  sublabel,
  badge,
  badgeTone = 'neutral',
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('flex flex-col justify-between gap-3', className)} padding="md">
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {label}
        </span>
        {icon && (
          <div className="h-8 w-8 rounded-2xl bg-[var(--bg-surface-elevated)] flex items-center justify-center text-[var(--text-secondary)]">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <span className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] tabular-nums">
          {value}
        </span>
        {badge && <Badge tone={badgeTone}>{badge}</Badge>}
      </div>
      {sublabel && <p className="text-xs text-[var(--text-secondary)] truncate">{sublabel}</p>}
    </Card>
  );
}
