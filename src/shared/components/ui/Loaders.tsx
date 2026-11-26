import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/formatters';

export function Spinner({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dims =
    size === 'sm' ? 'h-3.5 w-3.5 border-2' : size === 'lg' ? 'h-8 w-8 border-[3px]' : 'h-5 w-5 border-2';

  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block rounded-full border-current border-t-transparent animate-spin shrink-0',
        dims,
        className,
      )}
    />
  );
}

export function TopProgressBar() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const active = isFetching > 0 || isMutating > 0;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none transition-opacity duration-200',
        active ? 'opacity-100' : 'opacity-0',
      )}
      aria-hidden={!active}
    >
      <div className="h-full w-full bg-[var(--accent-primary)]/20 overflow-hidden">
        <div
          className="h-full w-2/5 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-positive)] animate-[pulse_1s_ease-in-out_infinite] rounded-full"
          style={{ transform: 'translateX(75%)' }}
        />
      </div>
    </div>
  );
}

export function PageLoader({ label }: { label?: string }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 py-16">
      <div className="relative h-14 w-14 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl border-2 border-[var(--accent-primary)]/25 animate-ping" />
        <div className="h-12 w-12 rounded-2xl bg-[var(--bg-pill-active)] text-[var(--text-pill-active)] flex items-center justify-center shadow-lg">
          <Spinner size="md" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {label || t('loaders.preparingWorkspace')}
        </p>
        <p className="text-xs text-[var(--text-muted)]">{t('loaders.syncingIntelligence')}</p>
      </div>
    </div>
  );
}

export function KpiGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4" aria-busy="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="surface-card rounded-3xl p-5 space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded-full bg-[var(--bg-surface-elevated)]" />
            <div className="h-8 w-8 rounded-2xl bg-[var(--bg-surface-elevated)]" />
          </div>
          <div className="h-9 w-28 rounded-xl bg-[var(--bg-surface-elevated)]" />
          <div className="h-3 w-32 rounded-full bg-[var(--bg-surface-elevated)]" />
        </div>
      ))}
    </div>
  );
}

export function ChartCardSkeleton({ height = 260 }: { height?: number }) {
  const barHeights = [62, 85, 48, 92, 71, 56, 78, 64];
  return (
    <div
      className="w-full flex items-end gap-3 px-4 pt-6 pb-2 animate-pulse"
      style={{ height }}
      aria-busy="true"
    >
      {barHeights.map((pct, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-xl bg-[var(--bg-surface-elevated)]"
          style={{ height: `${pct}%` }}
        />
      ))}
    </div>
  );
}
