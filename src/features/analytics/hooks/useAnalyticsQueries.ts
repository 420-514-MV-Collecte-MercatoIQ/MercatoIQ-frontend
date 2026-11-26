import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDemoMode } from '../../../shared/context/DemoModeContext';
import type {
  ClubRoiQueryParams,
  KpisQueryParams,
  ScoutingU23QueryParams,
  SuperSubsQueryParams,
  UclVsDomesticQueryParams,
} from '../../../shared/types/domain.types';
import {
  getAnalyticsKpis,
  getClubRoi,
  getScoutingU23,
  getSuperSubs,
  getUclVsDomestic,
} from '../api/analyticsApi';

export function useKpisQuery(query: KpisQueryParams) {
  const { isDemoMode } = useDemoMode();
  return useQuery({
    queryKey: ['analytics', 'kpis', isDemoMode, query],
    queryFn: () => getAnalyticsKpis(query),
    placeholderData: keepPreviousData,
  });
}

export function useClubRoiQuery(query: ClubRoiQueryParams) {
  const { isDemoMode } = useDemoMode();
  return useQuery({
    queryKey: ['analytics', 'club-roi', isDemoMode, query],
    queryFn: () => getClubRoi(query),
    placeholderData: keepPreviousData,
  });
}

export function useScoutingU23Query(query: ScoutingU23QueryParams) {
  const { isDemoMode } = useDemoMode();
  return useQuery({
    queryKey: ['analytics', 'scouting-u23', isDemoMode, query],
    queryFn: () => getScoutingU23(query),
    placeholderData: keepPreviousData,
  });
}

export function useUclVsDomesticQuery(query: UclVsDomesticQueryParams) {
  const { isDemoMode } = useDemoMode();
  return useQuery({
    queryKey: ['analytics', 'ucl-vs-domestic', isDemoMode, query],
    queryFn: () => getUclVsDomestic(query),
    placeholderData: keepPreviousData,
  });
}

export function useSuperSubsQuery(query: SuperSubsQueryParams) {
  const { isDemoMode } = useDemoMode();
  return useQuery({
    queryKey: ['analytics', 'super-subs', isDemoMode, query],
    queryFn: () => getSuperSubs(query),
    placeholderData: keepPreviousData,
  });
}
