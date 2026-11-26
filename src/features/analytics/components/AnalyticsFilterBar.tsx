import { useTranslation } from 'react-i18next';
import { FilterBar } from '../../../shared/components/ui/FilterBar';
import { Input, Select } from '../../../shared/components/ui/Input';
import {
  COMPETITIONS,
  DOMESTIC_COMPETITIONS,
  POSITIONS,
  SEASONS,
} from '../../../shared/types/constants';

export interface AnalyticsFiltersState {
  season?: number;
  competition_id?: string;
  position?: string;
  club_id?: number;
}

interface AnalyticsFilterBarProps {
  filters: AnalyticsFiltersState;
  onChange: (next: AnalyticsFiltersState) => void;
  showPosition?: boolean;
  showClubId?: boolean;
  domesticOnly?: boolean;
}

export function AnalyticsFilterBar({
  filters,
  onChange,
  showPosition = true,
  showClubId = true,
  domesticOnly = false,
}: AnalyticsFilterBarProps) {
  const { t } = useTranslation();
  const leagues = domesticOnly ? DOMESTIC_COMPETITIONS : COMPETITIONS;

  const hasActive = Boolean(
    filters.season || filters.competition_id || filters.position || filters.club_id,
  );

  return (
    <FilterBar
      hasActiveFilters={hasActive}
      onReset={() => onChange({})}
    >
      <div className="w-36">
        <Select
          label={t('filters.season')}
          value={filters.season ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              season: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        >
          <option value="">{t('filters.allSeasons')}</option>
          {SEASONS.map((s) => (
            <option key={s} value={s}>
              {s}/{String(s + 1).slice(-2)}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-48">
        <Select
          label={domesticOnly ? t('filters.domesticLeague') : t('filters.competition')}
          value={filters.competition_id ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              competition_id: e.target.value || undefined,
            })
          }
        >
          <option value="">{t('filters.allLeagues')}</option>
          {leagues.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} ({c.id})
            </option>
          ))}
        </Select>
      </div>

      {showPosition && (
        <div className="w-40">
          <Select
            label={t('filters.position')}
            value={filters.position ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                position: e.target.value || undefined,
              })
            }
          >
            <option value="">{t('filters.allPositions')}</option>
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {t(`positions.${pos}`)}
              </option>
            ))}
          </Select>
        </div>
      )}

      {showClubId && (
        <div className="w-32">
          <Input
            type="number"
            min={1}
            label={t('filters.clubId')}
            placeholder={t('filters.clubIdPlaceholder')}
            value={filters.club_id ?? ''}
            onChange={(e) => {
              const val = e.target.value.trim();
              onChange({
                ...filters,
                club_id: val ? Number(val) : undefined,
              });
            }}
          />
        </div>
      )}
    </FilterBar>
  );
}
