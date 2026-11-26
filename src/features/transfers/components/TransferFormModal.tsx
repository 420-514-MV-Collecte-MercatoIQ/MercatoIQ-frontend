import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../shared/components/ui/Modal';
import { Input, Select } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { COMPETITIONS, POSITIONS, TRANSFER_TYPES } from '../../../shared/types/constants';
import type { SilverTransfer, TransferType } from '../../../shared/types/domain.types';
import { toDateInputValue } from '../../../shared/utils/formatters';
import {
  toCreateTransferPayload,
  toUpdateTransferPayload,
  type TransferFormValues,
} from '../../../shared/utils/payloadMappers';
import {
  useCreateTransferMutation,
  useUpdateTransferMutation,
} from '../hooks/useTransfersQueries';
import { useToast } from '../../../shared/context/ToastContext';
import { AppApiError } from '../../../shared/api/httpClient';

interface TransferFormModalProps {
  open: boolean;
  onClose: () => void;
  editingTransfer: SilverTransfer | null;
}

function buildInitialValues(tr: SilverTransfer | null): TransferFormValues {
  if (!tr) {
    return {
      player_id: '',
      season: '2024',
      competition_id: 'ES1',
      position: '',
      from_club_id: '',
      from_club_name: '',
      to_club_id: '',
      to_club_name: '',
      transfer_date: '',
      transfer_fee_eur: '',
      market_value_at_transfer_eur: '',
      transfer_type: 'permanent',
    };
  }
  return {
    player_id: String(tr.player_id),
    season: String(tr.season),
    competition_id: tr.competition_id,
    position: tr.position ?? '',
    from_club_id: tr.from_club_id !== undefined ? String(tr.from_club_id) : '',
    from_club_name: tr.from_club_name ?? '',
    to_club_id: tr.to_club_id !== undefined ? String(tr.to_club_id) : '',
    to_club_name: tr.to_club_name ?? '',
    transfer_date: toDateInputValue(tr.transfer_date),
    transfer_fee_eur: tr.transfer_fee_eur !== undefined ? String(tr.transfer_fee_eur) : '',
    market_value_at_transfer_eur:
      tr.market_value_at_transfer_eur !== undefined ? String(tr.market_value_at_transfer_eur) : '',
    transfer_type: (tr.transfer_type as TransferType) ?? '',
  };
}

export function TransferFormModal({
  open,
  onClose,
  editingTransfer,
}: TransferFormModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createMutation = useCreateTransferMutation();
  const updateMutation = useUpdateTransferMutation();

  const [values, setValues] = useState<TransferFormValues>(() => buildInitialValues(editingTransfer));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(buildInitialValues(editingTransfer));
      setErrorMsg(null);
    }
  }, [open, editingTransfer]);

  const isEditing = Boolean(editingTransfer);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const setField = <K extends keyof TransferFormValues>(key: K, val: TransferFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!values.player_id.trim() || !values.season.trim() || !values.competition_id.trim()) {
      setErrorMsg(t('transfers.form.requiredError'));
      return;
    }

    try {
      if (isEditing && editingTransfer) {
        await updateMutation.mutateAsync({
          id: editingTransfer._id,
          payload: toUpdateTransferPayload(values),
        });
        showToast(t('transfers.updatedSuccess'), 'success');
      } else {
        await createMutation.mutateAsync(toCreateTransferPayload(values));
        showToast(t('transfers.createdSuccess'), 'success');
      }
      onClose();
    } catch (err) {
      const msg =
        err instanceof AppApiError
          ? err.details.join(' · ') || err.message
          : err instanceof Error
            ? err.message
            : 'Request failed';
      setErrorMsg(msg);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? t('transfers.editTransfer') : t('transfers.addTransfer')}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="rounded-2xl px-4 py-3 text-xs font-medium bg-[var(--accent-negative-soft)] text-[var(--accent-negative)]">
            {errorMsg}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            type="number"
            min={1}
            required
            label={t('transfers.form.playerId')}
            value={values.player_id}
            onChange={(e) => setField('player_id', e.target.value)}
            placeholder="342229"
          />
          <Input
            type="number"
            min={1990}
            required
            label={t('transfers.form.season')}
            value={values.season}
            onChange={(e) => setField('season', e.target.value)}
            placeholder="2024"
          />
          <Select
            required
            label={t('transfers.form.competitionId')}
            value={values.competition_id}
            onChange={(e) => setField('competition_id', e.target.value)}
          >
            {COMPETITIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} ({c.id})
              </option>
            ))}
          </Select>
          <Select
            label={t('transfers.form.position')}
            value={values.position}
            onChange={(e) => setField('position', e.target.value)}
          >
            <option value="">{t('common.unknown')}</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {t(`positions.${p}`)}
              </option>
            ))}
          </Select>

          <Input
            type="number"
            min={1}
            label={t('transfers.form.fromClubId')}
            value={values.from_club_id}
            onChange={(e) => setField('from_club_id', e.target.value)}
            placeholder="583"
          />
          <Input
            label={t('transfers.form.fromClubName')}
            value={values.from_club_name}
            onChange={(e) => setField('from_club_name', e.target.value)}
            placeholder="Paris Saint-Germain"
          />
          <Input
            type="number"
            min={1}
            label={t('transfers.form.toClubId')}
            value={values.to_club_id}
            onChange={(e) => setField('to_club_id', e.target.value)}
            placeholder="418"
          />
          <Input
            label={t('transfers.form.toClubName')}
            value={values.to_club_name}
            onChange={(e) => setField('to_club_name', e.target.value)}
            placeholder="Real Madrid"
          />

          <Input
            type="date"
            label={t('transfers.form.transferDate')}
            value={values.transfer_date}
            onChange={(e) => setField('transfer_date', e.target.value)}
          />
          <Select
            label={t('transfers.form.transferType')}
            value={values.transfer_type}
            onChange={(e) => setField('transfer_type', e.target.value as TransferType | '')}
          >
            <option value="">{t('common.unknown')}</option>
            {TRANSFER_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`transferTypes.${type}`)}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            min={0}
            label={t('transfers.form.feeEur')}
            value={values.transfer_fee_eur}
            onChange={(e) => setField('transfer_fee_eur', e.target.value)}
            placeholder="0"
          />
          <Input
            type="number"
            min={0}
            label={t('transfers.form.marketValueEur')}
            value={values.market_value_at_transfer_eur}
            onChange={(e) => setField('market_value_at_transfer_eur', e.target.value)}
            placeholder="180000000"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : isEditing ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
