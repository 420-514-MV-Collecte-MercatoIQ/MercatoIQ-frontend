import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { FilterBar } from '../../../shared/components/ui/FilterBar';
import { Input, Select } from '../../../shared/components/ui/Input';
import { DataTable, type DataColumn } from '../../../shared/components/ui/DataTable';
import { Pagination } from '../../../shared/components/ui/Pagination';
import { ConfirmDialog } from '../../../shared/components/ui/Modal';
import { ApiErrorBanner } from '../../../shared/components/ui/StateFeedback';
import { POSITIONS } from '../../../shared/types/constants';
import type { SilverPlayer } from '../../../shared/types/domain.types';
import { formatCompactEur } from '../../../shared/utils/formatters';
import {
  useDeletePlayerMutation,
  usePlayersQuery,
} from '../hooks/usePlayersQueries';
import { PlayerFormModal } from '../components/PlayerFormModal';
import { useToast } from '../../../shared/context/ToastContext';
import { AppApiError } from '../../../shared/api/httpClient';
import { exportToCsv } from '../../../shared/utils/exportCsv';
import { useDocumentTitle } from '../../../shared/hooks/useDocumentTitle';

export function PlayersPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t('players.title'));
  const lang = i18n.language;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [nameInput, setNameInput] = useState(searchParams.get('name') ?? '');
  const [debouncedName, setDebouncedName] = useState(searchParams.get('name') ?? '');
  const [position, setPosition] = useState('');
  const [nationality, setNationality] = useState('');
  const [clubId, setClubId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<SilverPlayer | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<SilverPlayer | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedName(nameInput);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [nameInput]);

  const query = usePlayersQuery({
    name: debouncedName || undefined,
    position: position || undefined,
    nationality: nationality || undefined,
    club_id: clubId ? Number(clubId) : undefined,
    page,
    limit,
  });

  const deleteMutation = useDeletePlayerMutation();

  const handleConfirmDelete = async () => {
    if (!deletingPlayer) return;
    try {
      await deleteMutation.mutateAsync(deletingPlayer.player_id);
      showToast(t('players.deletedSuccess'), 'success');
      setDeletingPlayer(null);
    } catch (err) {
      const msg = err instanceof AppApiError ? err.message : 'Delete failed';
      showToast(msg, 'error');
    }
  };

  const hasActiveFilters = Boolean(nameInput || position || nationality || clubId);

  const columns: DataColumn<SilverPlayer>[] = [
    {
      key: 'id',
      header: t('players.columns.id'),
      render: (p) => <span className="font-mono-num text-xs text-[var(--text-muted)]">#{p.player_id}</span>,
    },
    {
      key: 'player',
      header: t('players.columns.player'),
      render: (p) => (
        <Link
          to={`/players/${p.player_id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
        >
          {p.player_name}
        </Link>
      ),
    },
    {
      key: 'nationality',
      header: t('players.columns.nationality'),
      render: (p) => <span>{p.nationality || '—'}</span>,
    },
    {
      key: 'position',
      header: t('players.columns.position'),
      render: (p) =>
        p.position ? (
          <Badge tone="neutral">{t(`positions.${p.position}`, { defaultValue: p.position })}</Badge>
        ) : (
          <span>—</span>
        ),
    },
    {
      key: 'club',
      header: t('players.columns.club'),
      render: (p) => <span>{p.current_club?.club_name || '—'}</span>,
    },
    {
      key: 'currentValue',
      header: t('players.columns.currentValue'),
      align: 'right',
      render: (p) => (
        <span className="font-mono-num font-bold text-[var(--text-primary)]">
          {formatCompactEur(p.current_market_value_eur, lang)}
        </span>
      ),
    },
    {
      key: 'highestValue',
      header: t('players.columns.highestValue'),
      align: 'right',
      render: (p) => (
        <span className="font-mono-num text-xs text-[var(--text-secondary)]">
          {formatCompactEur(p.highest_market_value_eur, lang)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'right',
      render: (p) => (
        <div
          className="inline-flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/players/${p.player_id}`)}
            aria-label={t('common.view')}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingPlayer(p);
              setFormOpen(true);
            }}
            aria-label={t('common.edit')}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingPlayer(p)}
            aria-label={t('common.delete')}
          >
            <Trash2 className="h-3.5 w-3.5 text-[var(--accent-negative)]" />
          </Button>
        </div>
      ),
    },
  ];

  const players = query.data?.data ?? [];

  const handleExport = () => {
    exportToCsv(
      'mercatoiq-players',
      ['Player ID', 'Name', 'Nationality', 'Position', 'Current Club', 'Market Value EUR', 'Peak Value EUR'],
      players.map((p) => [
        p.player_id,
        p.player_name,
        p.nationality,
        p.position,
        p.current_club?.club_name,
        p.current_market_value_eur,
        p.highest_market_value_eur,
      ]),
    );
    showToast(t('common.exportedSuccess'), 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('players.title')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('players.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExport}
            disabled={players.length === 0}
          >
            {t('common.exportCsv')}
          </Button>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingPlayer(null);
              setFormOpen(true);
            }}
          >
            {t('players.addPlayer')}
          </Button>
        </div>
      </div>

      <FilterBar
        hasActiveFilters={hasActiveFilters}
        onReset={() => {
          setNameInput('');
          setDebouncedName('');
          setPosition('');
          setNationality('');
          setClubId('');
          setPage(1);
        }}
      >
        <div className="w-56">
          <Input
            label={t('common.search')}
            placeholder={t('filters.playerSearchPlaceholder')}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
        </div>
        <div className="w-40">
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
        <div className="w-40">
          <Input
            label={t('filters.nationality')}
            placeholder={t('filters.nationalityPlaceholder')}
            value={nationality}
            onChange={(e) => {
              setNationality(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-32">
          <Input
            type="number"
            min={1}
            label={t('filters.clubId')}
            placeholder={t('filters.clubIdPlaceholder')}
            value={clubId}
            onChange={(e) => {
              setClubId(e.target.value);
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
          rowKey={(p) => p.player_id}
          isLoading={query.isLoading}
          onRowClick={(p) => navigate(`/players/${p.player_id}`)}
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

      <PlayerFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editingPlayer={editingPlayer}
      />

      <ConfirmDialog
        open={Boolean(deletingPlayer)}
        onClose={() => setDeletingPlayer(null)}
        onConfirm={() => void handleConfirmDelete()}
        title={t('players.deleteTitle')}
        description={
          deletingPlayer
            ? t('players.deleteConfirm', {
                name: deletingPlayer.player_name,
                id: deletingPlayer.player_id,
              })
            : ''
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
