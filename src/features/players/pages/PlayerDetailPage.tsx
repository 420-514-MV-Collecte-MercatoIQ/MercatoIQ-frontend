import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowLeft, Building2, Calendar, Pencil, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { StatCard } from '../../../shared/components/ui/StatCard';
import { ConfirmDialog } from '../../../shared/components/ui/Modal';
import { ApiErrorBanner, LoadingSkeleton } from '../../../shared/components/ui/StateFeedback';
import { ChartTooltipCard } from '../../../shared/components/charts/ChartTooltip';
import {
  useDeletePlayerMutation,
  usePlayerDetailQuery,
} from '../hooks/usePlayersQueries';
import { useTransfersQuery } from '../../transfers/hooks/useTransfersQueries';
import { PlayerFormModal } from '../components/PlayerFormModal';
import {
  calculateAge,
  formatCompactEur,
  formatDate,
  formatEur,
} from '../../../shared/utils/formatters';
import { useToast } from '../../../shared/context/ToastContext';
import { AppApiError } from '../../../shared/api/httpClient';
import { getCompetitionLabel } from '../../../shared/types/constants';

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

  const handleDelete = async () => {
    if (!player) return;
    try {
      await deleteMutation.mutateAsync(player.player_id);
      showToast(t('players.deletedSuccess'), 'success');
      navigate('/players');
    } catch (err) {
      const msg = err instanceof AppApiError ? err.message : 'Delete failed';
      showToast(msg, 'error');
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
        <Link to="/players" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('common.backToList')}
        </Link>
        <ApiErrorBanner error={playerQuery.error} onRetry={() => void playerQuery.refetch()} />
      </div>
    );
  }

  const age = calculateAge(player.date_of_birth);
  const valuationData = [...(player.market_valuations ?? [])]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((v) => ({
      dateLabel: formatDate(v.date, lang),
      valueM: Math.round((v.market_value_eur / 1_000_000) * 10) / 10,
      rawEur: v.market_value_eur,
    }));

  const transfers = transfersQuery.data?.data ?? [];

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
            {[player.nationality, player.sub_position].filter(Boolean).join(' · ') || t('common.unknown')}
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

      {/* Key Profile Cards */}
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
            player.height_cm ? t('players.detail.heightUnit', { count: player.height_cm }) : undefined
          }
        />
      </div>

      <div className="grid xl:grid-cols-12 gap-5">
        {/* Valuation Curve */}
        <Card className="xl:col-span-7">
          <CardHeader kicker="SILVER PROFILE" title={t('players.detail.valuationChartTitle')} />
          {valuationData.length > 0 ? (
            <div style={{ width: '100%', height: 270 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={valuationData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-line)" />
                  <XAxis
                    dataKey="dateLabel"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    tickFormatter={(v) => `€${v}M`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as (typeof valuationData)[number];
                      return (
                        <ChartTooltipCard
                          title={d.dateLabel}
                          rows={[
                            {
                              label: t('players.columns.currentValue'),
                              value: formatEur(d.rawEur, lang),
                              tone: 'positive',
                            },
                          ]}
                        />
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="valueM"
                    stroke="var(--accent-primary)"
                    strokeWidth={2.5}
                    fill="url(#valGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-sm text-[var(--text-muted)]">
              {t('players.detail.valuationEmpty')}
            </div>
          )}
        </Card>

        {/* Transfer History */}
        <Card className="xl:col-span-5">
          <CardHeader kicker="MOVEMENTS" title={t('players.detail.transferHistoryTitle')} />
          {transfersQuery.isLoading ? (
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
