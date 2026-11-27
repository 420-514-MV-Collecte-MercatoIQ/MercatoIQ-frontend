import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { getApiErrorMessage } from '../../../shared/api/httpClient';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';
import { LoadingSkeleton } from '../../../shared/components/ui/StateFeedback';
import type { SilverTransfer } from '../../../shared/types/domain.types';
import { getCompetitionLabel } from '../../../shared/types/constants';
import { formatCompactEur, formatDate } from '../../../shared/utils/formatters';

interface PlayerTransferHistoryProps {
  transfers: SilverTransfer[];
  isLoading: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function PlayerTransferHistory({
  transfers,
  isLoading,
  isError,
  error,
  onRetry,
}: PlayerTransferHistoryProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <Card className="xl:col-span-5">
      <CardHeader kicker="MOVEMENTS" title={t('players.detail.transferHistoryTitle')} />
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : isError ? (
        <div
          role="alert"
          className="rounded-2xl p-4 border border-[var(--accent-negative)]/30 bg-[var(--accent-negative-soft)]/20 flex flex-col items-center text-center gap-2.5 py-8"
        >
          <AlertTriangle className="h-5 w-5 text-[var(--accent-negative)]" />
          <p className="text-xs font-semibold text-[var(--text-primary)]">
            {t('errors.transferHistoryError')}
          </p>
          {Boolean(error) && (
            <p className="text-[11px] text-[var(--text-secondary)] max-w-xs">
              {getApiErrorMessage(error, t('common.apiOfflineTitle'))}
            </p>
          )}
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
        </div>
      ) : transfers.length > 0 ? (
        <div className="space-y-3">
          {transfers.map((tr) => (
            <div
              key={tr._id}
              className="rounded-2xl p-3.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {tr.from_club_name || '—'} → {tr.to_club_name || '—'}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  {tr.season} · {getCompetitionLabel(tr.competition_id)} ·{' '}
                  {tr.transfer_date ? formatDate(tr.transfer_date, lang) : '—'}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono-num text-sm font-bold text-[var(--text-primary)]">
                  {formatCompactEur(tr.transfer_fee_eur, lang)}
                </div>
                {tr.transfer_type && (
                  <Badge tone="neutral" className="mt-1">
                    {t(`transferTypes.${tr.transfer_type}`, { defaultValue: tr.transfer_type })}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-56 flex items-center justify-center text-sm text-[var(--text-muted)] text-center px-4">
          {t('players.detail.transferEmpty')}
        </div>
      )}
    </Card>
  );
}
