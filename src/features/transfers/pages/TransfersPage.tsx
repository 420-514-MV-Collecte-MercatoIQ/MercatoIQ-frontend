import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Download, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { getApiErrorMessage } from '../../../shared/api/httpClient';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { DataTable, type DataColumn } from '../../../shared/components/ui/DataTable';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { ConfirmDialog } from '../../../shared/components/ui/Modal';
import { ApiErrorBanner } from '../../../shared/components/ui/StateFeedback';
import { useToast } from '../../../shared/context/ToastContext';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';
import { usePagination } from '../../../shared/hooks/usePagination';
import { getCompetitionLabel } from '../../../shared/types/constants';
import type { SilverTransfer } from '../../../shared/types/domain.types';
import { exportToCsv } from '../../../shared/utils/exportCsv';
import { formatCompactEur, formatDate } from '../../../shared/utils/formatters';
import { parsePositiveInt } from '../../../shared/utils/validation';
import { TransferDetailModal } from '../components/TransferDetailModal';
import { TransferFormModal } from '../components/TransferFormModal';
import {
  TransfersFilterBar,
  type TransfersFiltersState,
} from '../components/TransfersFilterBar';
import {
  useDeleteTransferMutation,
  useTransfersQuery,
} from '../hooks/useTransfersQueries';

const INITIAL_FILTERS: TransfersFiltersState = {
  clubSearch: '',
  season: '',
  competitionId: '',
  position: '',
  playerId: '',
};

export function TransfersPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t('transfers.title'));
  const lang = i18n.language;
  const { showToast } = useToast();

  const [filters, setFilters] = useState<TransfersFiltersState>(INITIAL_FILTERS);
  const debouncedSearch = useDebounce(filters.clubSearch, 300);
  const { page, limit, setPage, setLimit, resetPage } = usePagination(20);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<SilverTransfer | null>(null);
  const [viewingTransfer, setViewingTransfer] = useState<SilverTransfer | null>(null);
  const [deletingTransfer, setDeletingTransfer] = useState<SilverTransfer | null>(null);

  useEffect(() => {
    resetPage();
  }, [debouncedSearch, resetPage]);

  const query = useTransfersQuery({
    name: debouncedSearch || undefined,
    season: parsePositiveInt(filters.season),
    competition_id: filters.competitionId || undefined,
    position: filters.position || undefined,
    player_id: parsePositiveInt(filters.playerId),
    page,
    limit,
  });

  const deleteMutation = useDeleteTransferMutation();
  const transfers = query.data?.data ?? [];

  const handleConfirmDelete = async () => {
    if (!deletingTransfer) return;
    try {
      await deleteMutation.mutateAsync(deletingTransfer._id);
      showToast(t('transfers.deletedSuccess'), 'success');
      setDeletingTransfer(null);
    } catch (err) {
      showToast(getApiErrorMessage(err, t('errors.deleteFailed')), 'error');
    }
  };

  const handleExport = () => {
    try {
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
    } catch {
      showToast(t('errors.exportFailed'), 'error');
    }
  };

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
        <div
          className="inline-flex items-center gap-1.5 font-medium max-w-[200px]"
          title={`${tr.from_club_name || '—'} → ${tr.to_club_name || '—'}`}
        >
          <span className="text-[var(--text-secondary)] truncate">{tr.from_club_name || '—'}</span>
          <ArrowRight className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
          <span className="font-semibold text-[var(--text-primary)] truncate">{tr.to_club_name || '—'}</span>
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
        <div className="inline-flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="px-1.5"
            onClick={() => setViewingTransfer(tr)}
            aria-label={t('common.view')}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-1.5"
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
            className="px-1.5"
            onClick={() => setDeletingTransfer(tr)}
            aria-label={t('common.delete')}
          >
            <Trash2 className="h-3.5 w-3.5 text-[var(--accent-negative)]" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('transfers.title')}
        subtitle={t('transfers.subtitle')}
        actions={
          <>
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
          </>
        }
      />

      <TransfersFilterBar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          if (next.clubSearch === filters.clubSearch) {
            resetPage();
          }
        }}
        onReset={() => {
          setFilters(INITIAL_FILTERS);
          resetPage();
        }}
      />

      {query.isError && <ApiErrorBanner error={query.error} onRetry={() => void query.refetch()} />}

      <Card>
        <DataTable
          columns={columns}
          data={transfers}
          rowKey={(tr) => tr._id}
          isLoading={query.isLoading}
          isError={query.isError}
          onRowClick={(tr) => setViewingTransfer(tr)}
        />
        <Pagination meta={query.data?.meta} onPageChange={setPage} onLimitChange={setLimit} />
      </Card>

      <TransferFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editingTransfer={editingTransfer}
      />

      <TransferDetailModal
        transfer={viewingTransfer}
        onClose={() => setViewingTransfer(null)}
      />

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
