import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '../../../shared/components/ui/Modal';
import { ClubSelect } from '../../../shared/components/ui/ClubSelect';
import { Input, Select } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { FOOT_OPTIONS, POSITIONS } from '../../../shared/types/constants';
import type { SilverPlayer } from '../../../shared/types/domain.types';
import { toDateInputValue } from '../../../shared/utils/formatters';
import {
  toCreatePlayerPayload,
  toUpdatePlayerPayload,
  type PlayerFormValues,
} from '../../../shared/utils/payloadMappers';
import {
  parseIntInRange,
  parseNonNegativeNumber,
  parsePositiveInt,
} from '../../../shared/utils/validation';
import { useCreatePlayerMutation, useUpdatePlayerMutation } from '../hooks/usePlayersQueries';
import { useToast } from '../../../shared/context/ToastContext';
import { getApiErrorMessage } from '../../../shared/api/httpClient';

interface PlayerFormModalProps {
  open: boolean;
  onClose: () => void;
  editingPlayer: SilverPlayer | null;
}

function buildInitialValues(player: SilverPlayer | null): PlayerFormValues {
  if (!player) {
    return {
      player_id: '',
      player_name: '',
      date_of_birth: '',
      nationality: '',
      position: '',
      sub_position: '',
      foot: '',
      height_cm: '',
      club_id: '',
      club_name: '',
      joined_date: '',
      contract_expiry: '',
      current_market_value_eur: '',
      highest_market_value_eur: '',
      market_valuations: [],
    };
  }
  return {
    player_id: String(player.player_id),
    player_name: player.player_name,
    date_of_birth: toDateInputValue(player.date_of_birth),
    nationality: player.nationality ?? '',
    position: player.position ?? '',
    sub_position: player.sub_position ?? '',
    foot: player.foot ?? '',
    height_cm: player.height_cm !== undefined ? String(player.height_cm) : '',
    club_id: player.current_club?.club_id ? String(player.current_club.club_id) : '',
    club_name: player.current_club?.club_name ?? '',
    joined_date: toDateInputValue(player.current_club?.joined_date),
    contract_expiry: toDateInputValue(player.current_club?.contract_expiry),
    current_market_value_eur:
      player.current_market_value_eur !== undefined ? String(player.current_market_value_eur) : '',
    highest_market_value_eur:
      player.highest_market_value_eur !== undefined ? String(player.highest_market_value_eur) : '',
    market_valuations: (player.market_valuations ?? []).map((v) => ({
      date: toDateInputValue(v.date),
      market_value_eur: String(v.market_value_eur),
    })),
  };
}

export function PlayerFormModal({ open, onClose, editingPlayer }: PlayerFormModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createMutation = useCreatePlayerMutation();
  const updateMutation = useUpdatePlayerMutation();

  const [values, setValues] = useState<PlayerFormValues>(() => buildInitialValues(editingPlayer));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(buildInitialValues(editingPlayer));
      setErrorMsg(null);
    }
  }, [open, editingPlayer]);

  const isEditing = Boolean(editingPlayer);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const setField = <K extends keyof PlayerFormValues>(key: K, val: PlayerFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);

    if (!values.player_id.trim() || !values.player_name.trim()) {
      setErrorMsg(t('players.form.requiredError'));
      return;
    }

    if (parsePositiveInt(values.player_id) === undefined) {
      setErrorMsg(t('players.form.invalidPlayerId'));
      return;
    }

    const hasClubId = Boolean(values.club_id.trim());
    const hasClubName = Boolean(values.club_name.trim());
    if (hasClubId !== hasClubName) {
      setErrorMsg(t('players.form.clubPairError'));
      return;
    }
    if (hasClubId && parsePositiveInt(values.club_id) === undefined) {
      setErrorMsg(t('players.form.invalidClubId'));
      return;
    }

    if (values.height_cm.trim() && parseIntInRange(values.height_cm, 100, 250) === undefined) {
      setErrorMsg(t('players.form.invalidHeight'));
      return;
    }

    if (
      (values.current_market_value_eur.trim() &&
        parseNonNegativeNumber(values.current_market_value_eur) === undefined) ||
      (values.highest_market_value_eur.trim() &&
        parseNonNegativeNumber(values.highest_market_value_eur) === undefined)
    ) {
      setErrorMsg(t('players.form.negativeValue'));
      return;
    }

    const hasBadValuationRow = values.market_valuations.some((row) => {
      const hasDate = row.date.trim().length > 0;
      const hasAmount = row.market_value_eur.trim().length > 0;
      if (!hasDate && !hasAmount) return false;
      return !hasDate || !hasAmount || parseNonNegativeNumber(row.market_value_eur) === undefined;
    });
    if (hasBadValuationRow) {
      setErrorMsg(t('players.form.invalidValuationRow'));
      return;
    }

    try {
      if (isEditing && editingPlayer) {
        await updateMutation.mutateAsync({
          playerId: editingPlayer.player_id,
          payload: toUpdatePlayerPayload(values),
        });
        showToast(t('players.updatedSuccess'), 'success');
      } else {
        await createMutation.mutateAsync(toCreatePlayerPayload(values));
        showToast(t('players.createdSuccess'), 'success');
      }
      onClose();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, t('errors.requestFailed')));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? t('players.editPlayer') : t('players.addPlayer')}
      size="xl"
      dismissible={!isSubmitting}
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div
            role="alert"
            className="rounded-2xl px-4 py-3 text-xs font-medium bg-[var(--accent-negative-soft)] text-[var(--accent-negative)]"
          >
            {errorMsg}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            type="number"
            min={1}
            required
            disabled={isEditing}
            label={t('players.form.playerId')}
            value={values.player_id}
            onChange={(e) => setField('player_id', e.target.value)}
            placeholder="342229"
          />
          <Input
            required
            label={t('players.form.playerName')}
            value={values.player_name}
            onChange={(e) => setField('player_name', e.target.value)}
            placeholder="Kylian Mbappé"
          />
          <Input
            type="date"
            label={t('players.form.dob')}
            value={values.date_of_birth}
            onChange={(e) => setField('date_of_birth', e.target.value)}
          />
          <Input
            label={t('players.form.nationality')}
            value={values.nationality}
            onChange={(e) => setField('nationality', e.target.value)}
            placeholder="France"
          />
          <Select
            label={t('players.form.position')}
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
            label={t('players.form.subPosition')}
            value={values.sub_position}
            onChange={(e) => setField('sub_position', e.target.value)}
            placeholder="Centre-Forward"
          />
          <Select
            label={t('players.form.foot')}
            value={values.foot}
            onChange={(e) => setField('foot', e.target.value)}
          >
            <option value="">{t('common.unknown')}</option>
            {FOOT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            min={100}
            label={t('players.form.height')}
            value={values.height_cm}
            onChange={(e) => setField('height_cm', e.target.value)}
            placeholder="178"
          />
          <Input
            type="number"
            min={0}
            label={t('players.form.currentValue')}
            value={values.current_market_value_eur}
            onChange={(e) => setField('current_market_value_eur', e.target.value)}
            placeholder="180000000"
          />
          <Input
            type="number"
            min={0}
            label={t('players.form.highestValue')}
            value={values.highest_market_value_eur}
            onChange={(e) => setField('highest_market_value_eur', e.target.value)}
            placeholder="200000000"
          />
        </div>

        {/* Embedded Current Club Section */}
        <div className="rounded-2xl p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {t('players.form.clubSection')}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <ClubSelect
                label={t('players.form.club')}
                value={
                  values.club_id
                    ? { club_id: Number(values.club_id), club_name: values.club_name }
                    : null
                }
                onChange={(club) => {
                  setField('club_id', club ? String(club.club_id) : '');
                  setField('club_name', club?.club_name ?? '');
                }}
              />
            </div>
            <Input
              type="date"
              label={t('players.form.joinedDate')}
              value={values.joined_date}
              onChange={(e) => setField('joined_date', e.target.value)}
            />
            <Input
              type="date"
              label={t('players.form.contractExpiry')}
              value={values.contract_expiry}
              onChange={(e) => setField('contract_expiry', e.target.value)}
            />
          </div>
        </div>

        {/* Market Valuations Array */}
        <div className="rounded-2xl p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('players.form.valuationsSection')}
            </p>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() =>
                setField('market_valuations', [
                  ...values.market_valuations,
                  { date: '', market_value_eur: '' },
                ])
              }
            >
              {t('players.form.addValuation')}
            </Button>
          </div>
          {values.market_valuations.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <Input
                type="date"
                label={t('players.form.valuationDate')}
                value={row.date}
                onChange={(e) => {
                  const next = [...values.market_valuations];
                  next[idx] = { ...next[idx], date: e.target.value };
                  setField('market_valuations', next);
                }}
              />
              <Input
                type="number"
                min={0}
                label={t('players.form.valuationAmount')}
                value={row.market_value_eur}
                onChange={(e) => {
                  const next = [...values.market_valuations];
                  next[idx] = { ...next[idx], market_value_eur: e.target.value };
                  setField('market_valuations', next);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setField(
                    'market_valuations',
                    values.market_valuations.filter((_, i) => i !== idx),
                  )
                }
                aria-label={t('common.delete')}
              >
                <Trash2 className="h-4 w-4 text-[var(--accent-negative)]" />
              </Button>
            </div>
          ))}
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
