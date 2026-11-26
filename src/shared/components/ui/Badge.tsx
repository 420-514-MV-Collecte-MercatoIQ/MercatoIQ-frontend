import type { ReactNode } from 'react';
import { cn } from '../../utils/formatters';

export type BadgeTone = 'neutral' | 'primary' | 'positive' | 'negative' | 'secondary' | 'dark';

const toneClasses: Record<BadgeTone, string> = {
  neutral:
    'bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  primary: 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]',
  positive: 'bg-[var(--accent-positive-soft)] text-[var(--accent-positive)]',
  negative: 'bg-[var(--accent-negative-soft)] text-[var(--accent-negative)]',
  secondary: 'bg-[var(--accent-secondary-soft)] text-[var(--accent-secondary)]',
  dark: 'bg-[var(--bg-pill-active)] text-[var(--text-pill-active)]',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-tight whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
