import { useTranslation } from 'react-i18next';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { LoadingSkeleton } from '../../../shared/components/ui/StateFeedback';
import type { SilverTransfer } from '../../../shared/types/domain.types';
import { getCompetitionLabel } from '../../../shared/types/constants';
import { formatCompactEur, formatDate } from '../../../shared/utils/formatters';

interface PlayerTransferHistoryProps {
  transfers: SilverTransfer[];
  isLoading: boolean;
}

export function PlayerTransferHistory({ transfers, isLoading }: PlayerTransferHistoryProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <Card className="xl:col-span-5">
      <CardHeader kicker="MOVEMENTS" title={t('players.detail.transferHistoryTitle')} />
      {isLoading ? (
        <LoadingSkeleton rows={4} />
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
