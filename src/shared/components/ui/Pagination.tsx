import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PaginationMeta } from '../../types/common.types';
import { Button } from './Button';

interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function Pagination({ meta, onPageChange, onLimitChange }: PaginationProps) {
  const { t } = useTranslation();

  if (!meta || meta.total === 0) return null;

  const totalPages = Math.max(1, meta.totalPages || 1);
  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.total, meta.page * meta.limit);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
      <div className="flex items-center gap-3">
        <span className="tabular-nums">
          {t('common.showingRange', { from, to, total: meta.total })}
        </span>
        {onLimitChange && (
          <label className="inline-flex items-center gap-1.5">
            <span className="text-[var(--text-muted)]">{t('common.perPage')}:</span>
            <select
              value={meta.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-7 rounded-full px-2.5 py-0 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs leading-[26px] font-medium text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[var(--accent-primary)]"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="tabular-nums text-[var(--text-muted)] mr-1">
          {t('common.pageOf', { page: meta.page, totalPages })}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
        >
          {t('common.previous')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={meta.page >= totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
}
