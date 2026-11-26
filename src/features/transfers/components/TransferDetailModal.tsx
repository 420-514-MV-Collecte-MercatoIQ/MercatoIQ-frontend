import { useTranslation } from 'react-i18next';
import { Modal } from '../../../shared/components/ui/Modal';
import { getCompetitionLabel } from '../../../shared/types/constants';
import type { SilverTransfer } from '../../../shared/types/domain.types';
import { formatDate, formatEur } from '../../../shared/utils/formatters';

interface TransferDetailModalProps {
  transfer: SilverTransfer | null;
  onClose: () => void;
}

export function TransferDetailModal({ transfer, onClose }: TransferDetailModalProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <Modal
      open={Boolean(transfer)}
      onClose={onClose}
      title={t('transfers.detailTitle')}
      size="md"
    >
      {transfer && (
        <div className="space-y-3 text-sm">
          {[
            [t('transfers.columns.playerId'), `#${transfer.player_id}`],
            [
              t('transfers.columns.route'),
              `${transfer.from_club_name || '—'} → ${transfer.to_club_name || '—'}`,
            ],
            [t('transfers.columns.season'), String(transfer.season)],
            [t('transfers.columns.league'), getCompetitionLabel(transfer.competition_id)],
            [
              t('transfers.columns.type'),
              transfer.transfer_type
                ? t(`transferTypes.${transfer.transfer_type}`, {
                    defaultValue: transfer.transfer_type,
                  })
                : '—',
            ],
            [t('transfers.columns.date'), formatDate(transfer.transfer_date, lang)],
            [t('transfers.columns.fee'), formatEur(transfer.transfer_fee_eur, lang)],
            [
              t('transfers.columns.marketValue'),
              formatEur(transfer.market_value_at_transfer_eur, lang),
            ],
          ].map(([label, val]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 py-2 border-b border-[var(--border-subtle)]"
            >
              <span className="text-[var(--text-secondary)]">{label}</span>
              <span className="font-mono-num font-semibold text-[var(--text-primary)]">{val}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
