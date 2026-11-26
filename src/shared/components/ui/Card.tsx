import type { ReactNode } from 'react';
import { cn } from '../../utils/formatters';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const padClass =
    padding === 'none'
      ? ''
      : padding === 'sm'
        ? 'p-4'
        : padding === 'lg'
          ? 'p-7'
          : 'p-5 sm:p-6';

  return <div className={cn('surface-card rounded-3xl transition-colors', padClass, className)}>{children}</div>;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, kicker, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-5', className)}>
      <div className="min-w-0">
        {kicker && (
          <p className="font-display text-xs uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1">
            {kicker}
          </p>
        )}
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] truncate">
          {title}
        </h2>
        {subtitle && <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
