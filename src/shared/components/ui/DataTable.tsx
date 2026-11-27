import type { ReactNode } from 'react';
import { cn } from '../../utils/formatters';
import { EmptyState, LoadingSkeleton } from './StateFeedback';

export interface DataColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyHint?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading,
  isError,
  onRowClick,
  emptyTitle,
  emptyHint,
}: DataTableProps<T>) {
  const safeData = Array.isArray(data) ? data : [];

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  if (isError && safeData.length === 0) {
    return null;
  }

  if (safeData.length === 0) {
    return <EmptyState title={emptyTitle} hint={emptyHint} />;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'py-3 px-2.5 xl:px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)] whitespace-nowrap',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {safeData.map((row, idx) => (
            <tr
              key={rowKey(row, idx)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'transition-colors',
                onRowClick
                  ? 'cursor-pointer hover:bg-[var(--bg-surface-elevated)]'
                  : 'hover:bg-[var(--bg-surface-elevated)]/60',
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'py-3.5 px-2.5 xl:px-3 text-sm text-[var(--text-primary)] whitespace-nowrap',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.className,
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
