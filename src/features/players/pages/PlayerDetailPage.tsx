import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, Calendar, Pencil, Trash2 } from 'lucide-react';
import { getApiErrorMessage } from '../../../shared/api/httpClient';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { ConfirmDialog } from '../../../shared/components/ui/Modal';
import { ApiErrorBanner, LoadingSkeleton } from '../../../shared/components/ui/StateFeedback';
import { useToast } from '../../../shared/context/ToastContext';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';
import {
  calculateAge,
  formatCompactEur,
  formatDate,
} from '../../../shared/utils/formatters';
import { useTransfersQuery } from '../../transfers/hooks/useTransfersQueries';
import { PlayerFormModal } from '../components/PlayerFormModal';
import { PlayerTransferHistory } from '../components/PlayerTransferHistory';
import { PlayerValuationChart } from '../components/PlayerValuationChart';
import {
  useDeletePlayerMutation,
  usePlayerDetailQuery,
} from '../hooks/usePlayersQueries';

export function PlayerDetailPage() {
  const { id } = useParams();
  const playerId = Number(id);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const playerQuery = usePlayerDetailQuery(playerId);
  const transfersQuery = useTransfersQuery({ player_id: playerId, page: 1, limit: 20 });
  const deleteMutation = useDeletePlayerMutation();

  const player = playerQuery.data;
  useDocumentTitle(player?.player_name || t('players.title'));

  const handleDelete = async () => {
    if (!player) return;
    try {
      await deleteMutation.mutateAsync(player.player_id);
      showToast(t('players.deletedSuccess'), 'success');
      navigate('/players');
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Delete failed'), 'error');
    }
  };

  if (playerQuery.isLoading) {
    return (
      <Card>
        <LoadingSkeleton rows={6} />
      </Card>
    );
  }

  if (playerQuery.isError || !player) {
    return (
      <div className="space-y-4">
        <Link
          to="/players"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('common.backToList')}
        </Link>
        <ApiErrorBanner error={playerQuery.error} onRetry={() => void playerQuery.refetch()} />
      </div>
    );
  }

  const age = calculateAge(player.date_of_birth);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Link
            to="/players"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('common.backToList')}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{player.player_name}</h1>
            <Badge tone="neutral" className="font-mono-num">
              #{player.player_id}
            </Badge>
            {player.position && (
              <Badge tone="primary">
                {t(`positions.${player.position}`, { defaultValue: player.position })}
              </Badge>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {[player.nationality, player.sub_position].filter(Boolean).join(' · ') ||
              t('common.unknown')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            leftIcon={<Pencil className="h-4 w-4" />}
            onClick={() => setEditOpen(true)}
          >
            {t('common.edit')}
          </Button>
          <Button
            variant="danger"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={() => setDeleteOpen(true)}
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('players.columns.currentValue')}
          value={formatCompactEur(player.current_market_value_eur, lang)}
          sublabel={`${t('players.columns.highestValue')}: ${formatCompactEur(player.highest_market_value_eur, lang)}`}
        />
        <StatCard
          label={t('players.columns.club')}
          value={player.current_club?.club_name || '—'}
          sublabel={
            player.current_club?.contract_expiry
              ? `${t('players.detail.contractUntil')} ${formatDate(player.current_club.contract_expiry, lang)}`
              : undefined
          }
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          label={t('players.detail.age')}
          value={age !== null ? t('players.detail.years', { count: age }) : '—'}
          sublabel={player.date_of_birth ? formatDate(player.date_of_birth, lang) : undefined}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          label={t('players.detail.foot')}
          value={player.foot ? player.foot.toUpperCase() : '—'}
          sublabel={
            player.height_cm
              ? t('players.detail.heightUnit', { count: player.height_cm })
              : undefined
          }
        />
      </div>

      <div className="grid xl:grid-cols-12 gap-5">
        <PlayerValuationChart valuations={player.market_valuations ?? []} />
        <PlayerTransferHistory
          transfers={transfersQuery.data?.data ?? []}
          isLoading={transfersQuery.isLoading}
        />
      </div>

      <PlayerFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editingPlayer={player}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        title={t('players.deleteTitle')}
        description={t('players.deleteConfirm', {
          name: player.player_name,
          id: player.player_id,
        })}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
