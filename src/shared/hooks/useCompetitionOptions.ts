import { useQuery } from '@tanstack/react-query';
import { getCompetitions } from '../api/referenceApi';
import { isDemoModeActive } from '../context/DemoModeContext';
import { COMPETITIONS, type CompetitionOption } from '../types/constants';
import type { ReferenceCompetition } from '../types/domain.types';

// Libellés lisibles du frontend, liste fournie par l'API
export function toCompetitionOptions(items: ReferenceCompetition[]): CompetitionOption[] {
  return items.map(
    (c) =>
      COMPETITIONS.find((o) => o.id === c.competition_id) ?? {
        id: c.competition_id,
        label: c.name,
        country: c.country_name ?? '',
      },
  );
}

export function useCompetitionOptions(): CompetitionOption[] {
  const { data } = useQuery({
    queryKey: ['reference', 'competitions', isDemoModeActive()],
    queryFn: getCompetitions,
    select: toCompetitionOptions,
    staleTime: 60 * 60_000,
  });
  return data ?? COMPETITIONS;
}
