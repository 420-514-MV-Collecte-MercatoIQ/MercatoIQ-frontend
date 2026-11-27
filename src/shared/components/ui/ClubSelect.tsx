import { useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { getClubs } from '../../api/referenceApi';
import { isDemoModeActive } from '../../context/DemoModeContext';
import { useDebounce } from '../../hooks/useDebounce';
import type { ClubOption, ReferenceClub } from '../../types/domain.types';
import { cn } from '../../utils/formatters';

const MIN_SEARCH_LENGTH = 2;
const RESULT_LIMIT = 10;

interface ClubSelectProps {
  label: string;
  value: ClubOption | null;
  onChange: (club: ClubOption | null) => void;
  competitionId?: string;
}

const fieldClass =
  'h-10 w-full rounded-2xl px-3.5 py-2 text-sm leading-[22px] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]';

export function ClubSelect({ label, value, onChange, competitionId }: ClubSelectProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const term = useDebounce(search.trim(), 300);
  const canSearch = open && term.length >= MIN_SEARCH_LENGTH;

  const { data, isFetching, isError } = useQuery({
    queryKey: ['reference', 'clubs', isDemoModeActive(), term, competitionId],
    queryFn: () => getClubs({ search: term, competition_id: competitionId, limit: RESULT_LIMIT }),
    enabled: canSearch,
    staleTime: 5 * 60_000,
  });

  const select = (club: ReferenceClub) => {
    onChange({ club_id: club.club_id, club_name: club.name });
    setSearch('');
    setOpen(false);
  };

  if (value) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-[var(--text-secondary)]">{label}</span>
        <div className={cn(fieldClass, 'flex items-center justify-between gap-2')}>
          <span className="truncate">{value.club_name}</span>
          <button
            type="button"
            aria-label={t('clubSelect.clear', { club: value.club_name })}
            onClick={() => onChange(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  const clubs = data?.data ?? [];

  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs font-semibold text-[var(--text-secondary)]">
        {label}
      </label>
      <input
        id={inputId}
        role="combobox"
        aria-expanded={canSearch}
        aria-controls={`${inputId}-list`}
        aria-autocomplete="list"
        autoComplete="off"
        value={search}
        placeholder={t('clubSelect.placeholder')}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className={cn(
          fieldClass,
          'placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)]',
        )}
      />
      {canSearch && (
        <ul
          id={`${inputId}-list`}
          role="listbox"
          className="absolute top-full z-20 mt-1 w-full max-h-60 overflow-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] py-1 shadow-lg"
        >
          {isFetching && <li className="px-3.5 py-2 text-sm text-[var(--text-muted)]">{t('clubSelect.searching')}</li>}
          {!isFetching && isError && (
            <li className="px-3.5 py-2 text-sm text-[var(--accent-negative)]">{t('clubSelect.error')}</li>
          )}
          {!isFetching && !isError && clubs.length === 0 && (
            <li className="px-3.5 py-2 text-sm text-[var(--text-muted)]">{t('clubSelect.noResults')}</li>
          )}
          {!isFetching &&
            clubs.map((club) => (
              <li
                key={club.club_id}
                role="option"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(club)}
                className="flex cursor-pointer items-center justify-between px-3.5 py-2 text-sm hover:bg-[var(--bg-surface-muted)]"
              >
                <span>{club.name}</span>
                <span className="text-xs text-[var(--text-muted)]">{club.domestic_competition_id}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
