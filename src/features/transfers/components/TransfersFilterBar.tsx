import { useTranslation } from 'react-i18next';
import { FilterBar } from '../../../shared/components/ui/FilterBar';
import { Input, Select } from '../../../shared/components/ui/Input';
import { useCompetitionOptions } from '../../../shared/hooks/useCompetitionOptions';
import { POSITIONS, SEASONS } from '../../../shared/types/constants';

export interface TransfersFiltersState {
  clubSearch: string;
  season: string;
  competitionId: string;
  position: string;
  playerId: string;
}

interface TransfersFilterBarProps {
  filters: TransfersFiltersState;
  onChange: (next: TransfersFiltersState) => void;
  onReset: () => void;
}

export function TransfersFilterBar({ filters, onChange, onReset }: TransfersFilterBarProps) {
  const { t } = useTranslation();
  const competitions = useCompetitionOptions();

  const hasActiveFilters = Boolean(
    filters.clubSearch ||
      filters.season ||
      filters.competitionId ||
      filters.position ||
      filters.playerId,
  );

  const update = <K extends keyof TransfersFiltersState>(
    key: K,
    value: TransfersFiltersState[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <FilterBar hasActiveFilters={hasActiveFilters} onReset={onReset}>
      <div className="w-56">
        <Input
          label={t('common.search')}
          placeholder={t('filters.clubSearchPlaceholder')}
          value={filters.clubSearch}
          onChange={(e) => update('clubSearch', e.target.value)}
        />
      </div>
      <div className="w-36">
        <Select
          label={t('filters.season')}
          value={filters.season}
          onChange={(e) => update('season', e.target.value)}
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
          value={filters.competitionId}
          onChange={(e) => update('competitionId', e.target.value)}
        >
          <option value="">{t('filters.allLeagues')}</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} ({c.id})
            </option>
          ))}
        </Select>
      </div>
      <div className="w-36">
        <Select
          label={t('filters.position')}
          value={filters.position}
          onChange={(e) => update('position', e.target.value)}
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
          value={filters.playerId}
          onChange={(e) => update('playerId', e.target.value)}
        />
      </div>
    </FilterBar>
  );
}
