import type { ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

interface FilterBarProps {
  children: ReactNode;
  onReset?: () => void;
  hasActiveFilters?: boolean;
}

export function FilterBar({ children, onReset, hasActiveFilters }: FilterBarProps) {
  const { t } = useTranslation();

  return (
    <div className="surface-card rounded-3xl p-3.5 sm:p-4 flex flex-wrap items-end gap-3">
      <div className="flex-1 flex flex-wrap items-end gap-3">{children}</div>
      {onReset && hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          onClick={onReset}
        >
          {t('common.reset')}
        </Button>
      )}
    </div>
  );
}
