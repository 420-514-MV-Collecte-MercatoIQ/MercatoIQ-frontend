import { AlertTriangle, Database, RefreshCw, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppApiError } from '../../api/httpClient';
import { useDemoMode } from '../../context/DemoModeContext';
import { Button } from './Button';

export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 py-2" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-11 w-full rounded-2xl bg-[var(--bg-surface-elevated)] animate-pulse"
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title?: string;
  hint?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="h-12 w-12 rounded-2xl bg-[var(--bg-surface-elevated)] flex items-center justify-center text-[var(--text-muted)] mb-3">
        <Database className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        {title || t('common.noData')}
      </p>
      <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
        {hint || t('common.noDataHint')}
      </p>
    </div>
  );
}

export function ApiErrorBanner({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  const { isDemoMode, enableDemoMode } = useDemoMode();

  const apiError = error instanceof AppApiError ? error : null;
  const isNetwork = apiError?.isNetworkError || (error instanceof Error && error.message.includes('Network'));

  return (
    <div className="surface-card rounded-3xl p-5 border border-[var(--accent-negative)]/30 bg-[var(--accent-negative-soft)]/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[var(--accent-negative-soft)] text-[var(--accent-negative)] flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {isNetwork ? t('common.apiOfflineTitle') : apiError?.message || t('common.apiOfflineTitle')}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-2xl">
              {isNetwork
                ? t('common.apiOfflineDescription')
                : apiError?.details?.join(' · ') || t('common.apiOfflineDescription')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={onRetry}
            >
              {t('common.retry')}
            </Button>
          )}
          {!isDemoMode && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="h-3.5 w-3.5" />}
              onClick={enableDemoMode}
            >
              {t('common.enableDemo')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
