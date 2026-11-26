import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Download, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { FilterBar } from '../../../shared/components/ui/FilterBar';
import { Input, Select } from '../../../shared/components/ui/Input';
import { DataTable, type DataColumn } from '../../../shared/components/ui/DataTable';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { ConfirmDialog, Modal } from '../../../shared/components/ui/Modal';
import { ApiErrorBanner } from '../../../shared/components/ui/StateFeedback';
import { COMPETITIONS, POSITIONS, SEASONS, getCompetitionLabel } from '../../../shared/types/constants';
import type { SilverTransfer } from '../../../shared/types/domain.types';
import { formatCompactEur, formatDate, formatEur } from '../../../shared/utils/formatters';
import {
  useDeleteTransferMutation,
  useTransfersQuery,
} from '../hooks/useTransfersQueries';
import { TransferFormModal } from '../components/TransferFormModal';
import { useToast } from '../../../shared/context/ToastContext';
import { AppApiError } from '../../../shared/api/httpClient';
import { exportToCsv } from '../../../shared/utils/exportCsv';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';

export function TransfersPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t('transfers.title'));
  const lang = i18n.language;
  const { showToast } = useToast();

  const [clubSearch, setClubSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [season, setSeason] = useState('');
  const [competitionId, setCompetitionId] = useState('');
  const [position, setPosition] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<SilverTransfer | null>(null);
  const [viewingTransfer, setViewingTransfer] = useState<SilverTransfer | null>(null);
  const [deletingTransfer, setDeletingTransfer] = useState<SilverTransfer | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(clubSearch);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [clubSearch]);

  const query = useTransfersQuery({
    name: debouncedSearch || undefined,
    season: season ? Number(season) : undefined,
    competition_id: competitionId || undefined,
    position: position || undefined,
    player_id: playerId ? Number(playerId) : undefined,
    page,
    limit,
  });

  const deleteMutation = useDeleteTransferMutation();

  const handleConfirmDelete = async () => {
    if (!deletingTransfer) return;
    try {
      await deleteMutation.mutateAsync(deletingTransfer._id);
      showToast(t('transfers.deletedSuccess'), 'success');
      setDeletingTransfer(null);
    } catch (err) {
      const msg = err instanceof AppApiError ? err.message : 'Delete failed';
      showToast(msg, 'error');
    }
  };

  const hasActiveFilters = Boolean(clubSearch || season || competitionId || position || playerId);

  const columns: DataColumn<SilverTransfer>[] = [
    {
      key: 'playerId',
      header: t('transfers.columns.playerId'),
      render: (tr) => (
        <Link
          to={`/players/${tr.player_id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-mono-num font-semibold text-[var(--accent-primary)] hover:underline"
        >
          #{tr.player_id}
        </Link>
      ),
    },
    {
      key: 'route',
      header: t('transfers.columns.route'),
      render: (tr) => (
        <div className="inline-flex items-center gap-2 font-medium">
          <span className="text-[var(--text-secondary)]">{tr.from_club_name || '—'}</span>
          <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
          <span className="font-semibold text-[var(--text-primary)]">{tr.to_club_name || '—'}</span>
        </div>
      ),
    },
    {
      key: 'season',
      header: t('transfers.columns.season'),
      render: (tr) => <span className="font-mono-num">{tr.season}</span>,
    },
    {
      key: 'league',
      header: t('transfers.columns.league'),
      render: (tr) => <Badge tone="neutral">{getCompetitionLabel(tr.competition_id)}</Badge>,
    },
    {
      key: 'type',
      header: t('transfers.columns.type'),
      render: (tr) =>
        tr.transfer_type ? (
          <Badge tone={tr.transfer_type === 'free' ? 'positive' : 'primary'}>
            {t(`transferTypes.${tr.transfer_type}`, { defaultValue: tr.transfer_type })}
          </Badge>
        ) : (
          <span>—</span>
        ),
    },
    {
      key: 'date',
      header: t('transfers.columns.date'),
      render: (tr) => (
        <span className="text-xs text-[var(--text-secondary)]">{formatDate(tr.transfer_date, lang)}</span>
      ),
    },
    {
      key: 'fee',
      header: t('transfers.columns.fee'),
      align: 'right',
      render: (tr) => (
        <span className="font-mono-num font-bold text-[var(--text-primary)]">
          {formatCompactEur(tr.transfer_fee_eur, lang)}
        </span>
      ),
    },
    {
      key: 'mv',
      header: t('transfers.columns.marketValue'),
      align: 'right',
      render: (tr) => (
        <span className="font-mono-num text-xs text-[var(--text-secondary)]">
          {formatCompactEur(tr.market_value_at_transfer_eur, lang)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'right',
      render: (tr) => (
        <div
          className="inline-flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewingTransfer(tr)}
            aria-label={t('common.view')}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingTransfer(tr);
              setFormOpen(true);
            }}
            aria-label={t('common.edit')}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingTransfer(tr)}
            aria-label={t('common.delete')}
          >
            <Trash2 className="h-3.5 w-3.5 text-[var(--accent-negative)]" />
          </Button>
        </div>
      ),
    },
  ];

  const transfers = query.data?.data ?? [];

  const handleExport = () => {
    exportToCsv(
      'mercatoiq-transfers',
      ['Player ID', 'From Club', 'To Club', 'Season', 'League', 'Type', 'Date', 'Fee EUR', 'Market Value EUR'],
      transfers.map((tr) => [
        tr.player_id,
        tr.from_club_name,
        tr.to_club_name,
        tr.season,
        tr.competition_id,
        tr.transfer_type,
        tr.transfer_date,
        tr.transfer_fee_eur,
        tr.market_value_at_transfer_eur,
      ]),
    );
    showToast(t('common.exportedSuccess'), 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('transfers.title')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('transfers.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExport}
            disabled={transfers.length === 0}
          >
            {t('common.exportCsv')}
          </Button>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingTransfer(null);
              setFormOpen(true);
            }}
          >
            {t('transfers.addTransfer')}
          </Button>
        </div>
      </div>

      <FilterBar
        hasActiveFilters={hasActiveFilters}
        onReset={() => {
          setClubSearch('');
          setDebouncedSearch('');
          setSeason('');
          setCompetitionId('');
          setPosition('');
          setPlayerId('');
          setPage(1);
        }}
      >
        <div className="w-56">
          <Input
            label={t('common.search')}
            placeholder={t('filters.clubSearchPlaceholder')}
            value={clubSearch}
            onChange={(e) => setClubSearch(e.target.value)}
          />
        </div>
        <div className="w-36">
          <Select
            label={t('filters.season')}
            value={season}
            onChange={(e) => {
              setSeason(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t('filters.allSeasons')}</option>
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                {s}/{String(s + 1).slice(-2)}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-44">
          <Select
            label={t('filters.competition')}
            value={competitionId}
            onChange={(e) => {
              setCompetitionId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t('filters.allLeagues')}</option>
            {COMPETITIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} ({c.id})
              </option>
            ))}
          </Select>
        </div>
        <div className="w-36">
          <Select
            label={t('filters.position')}
            value={position}
            onChange={(e) => {
              setPosition(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t('filters.allPositions')}</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {t(`positions.${p}`)}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-32">
          <Input
            type="number"
            min={1}
            label={t('filters.playerId')}
            placeholder={t('filters.playerIdPlaceholder')}
            value={playerId}
            onChange={(e) => {
              setPlayerId(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </FilterBar>

      {query.isError && <ApiErrorBanner error={query.error} onRetry={() => void query.refetch()} />}

      <Card>
        <DataTable
          columns={columns}
          data={query.data?.data ?? []}
          rowKey={(tr) => tr._id}
          isLoading={query.isLoading}
          onRowClick={(tr) => setViewingTransfer(tr)}
        />
        <Pagination
          meta={query.data?.meta}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </Card>

      <TransferFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editingTransfer={editingTransfer}
      />

      <Modal
        open={Boolean(viewingTransfer)}
        onClose={() => setViewingTransfer(null)}
        title={t('transfers.detailTitle')}
        size="md"
      >
        {viewingTransfer && (
          <div className="space-y-3 text-sm">
            {[
              [t('transfers.columns.playerId'), `#${viewingTransfer.player_id}`],
              [
                t('transfers.columns.route'),
                `${viewingTransfer.from_club_name || '—'} → ${viewingTransfer.to_club_name || '—'}`,
              ],
              [t('transfers.columns.season'), String(viewingTransfer.season)],
              [t('transfers.columns.league'), getCompetitionLabel(viewingTransfer.competition_id)],
              [
                t('transfers.columns.type'),
                viewingTransfer.transfer_type
                  ? t(`transferTypes.${viewingTransfer.transfer_type}`, {
                      defaultValue: viewingTransfer.transfer_type,
                    })
                  : '—',
              ],
              [t('transfers.columns.date'), formatDate(viewingTransfer.transfer_date, lang)],
              [t('transfers.columns.fee'), formatEur(viewingTransfer.transfer_fee_eur, lang)],
              [
                t('transfers.columns.marketValue'),
                formatEur(viewingTransfer.market_value_at_transfer_eur, lang),
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

      <ConfirmDialog
        open={Boolean(deletingTransfer)}
        onClose={() => setDeletingTransfer(null)}
        onConfirm={() => void handleConfirmDelete()}
        title={t('transfers.deleteTitle')}
        description={t('transfers.deleteConfirm')}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
