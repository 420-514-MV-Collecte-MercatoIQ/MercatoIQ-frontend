import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import { useDemoMode } from '../../../shared/context/DemoModeContext';
import { TOP_FIVE_LEAGUES, type CompetitionOption } from '../../../shared/types/constants';
import type {
  AnalyticsFilterParams,
  ClubRoiQueryParams,
  GoldClubTransferRoi,
  GoldSuperSubs,
  GoldUclVsDomestic,
  GoldUndervaluedScouting,
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

export interface LeagueSeriesResult<T> {
  league: CompetitionOption;
  data: T[];
  isLoading: boolean;
  isError: boolean;
}

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

export function useClubRoiByLeagueQueries(
  filters: Pick<AnalyticsFilterParams, 'season' | 'club_id'>,
  limit = 5,
): LeagueSeriesResult<GoldClubTransferRoi>[] {
  const { isDemoMode } = useDemoMode();
  const results = useQueries({
    queries: TOP_FIVE_LEAGUES.map((league) => ({
      queryKey: ['analytics', 'club-roi', 'by-league', league.id, isDemoMode, filters, limit],
      queryFn: () =>
        getClubRoi({
          season: filters.season,
          club_id: filters.club_id,
          competition_id: league.id,
          page: 1,
          limit,
        }),
      placeholderData: keepPreviousData,
    })),
  });

  return TOP_FIVE_LEAGUES.map((league, idx) => ({
    league,
    data: results[idx]?.data?.data ?? [],
    isLoading: Boolean(results[idx]?.isLoading),
    isError: Boolean(results[idx]?.isError),
  }));
}

export function useScoutingU23ByLeagueQueries(
  filters: Pick<AnalyticsFilterParams, 'season' | 'position' | 'club_id'>,
  limit = 8,
): LeagueSeriesResult<GoldUndervaluedScouting>[] {
  const { isDemoMode } = useDemoMode();
  const results = useQueries({
    queries: TOP_FIVE_LEAGUES.map((league) => ({
      queryKey: ['analytics', 'scouting-u23', 'by-league', league.id, isDemoMode, filters, limit],
      queryFn: () =>
        getScoutingU23({
          season: filters.season,
          position: filters.position,
          club_id: filters.club_id,
          competition_id: league.id,
          page: 1,
          limit,
        }),
      placeholderData: keepPreviousData,
    })),
  });

  return TOP_FIVE_LEAGUES.map((league, idx) => ({
    league,
    data: results[idx]?.data?.data ?? [],
    isLoading: Boolean(results[idx]?.isLoading),
    isError: Boolean(results[idx]?.isError),
  }));
}

export function useUclVsDomesticByLeagueQueries(
  filters: Pick<AnalyticsFilterParams, 'season' | 'position' | 'club_id'>,
  limit = 6,
): LeagueSeriesResult<GoldUclVsDomestic>[] {
  const { isDemoMode } = useDemoMode();
  const results = useQueries({
    queries: TOP_FIVE_LEAGUES.map((league) => ({
      queryKey: ['analytics', 'ucl-vs-domestic', 'by-league', league.id, isDemoMode, filters, limit],
      queryFn: () =>
        getUclVsDomestic({
          season: filters.season,
          position: filters.position,
          club_id: filters.club_id,
          domestic_competition_id: league.id,
          page: 1,
          limit,
        }),
      placeholderData: keepPreviousData,
    })),
  });

  return TOP_FIVE_LEAGUES.map((league, idx) => ({
    league,
    data: results[idx]?.data?.data ?? [],
    isLoading: Boolean(results[idx]?.isLoading),
    isError: Boolean(results[idx]?.isError),
  }));
}

export function useSuperSubsByLeagueQueries(
  filters: Pick<AnalyticsFilterParams, 'season' | 'position' | 'club_id'>,
  limit = 5,
): LeagueSeriesResult<GoldSuperSubs>[] {
  const { isDemoMode } = useDemoMode();
  const results = useQueries({
    queries: TOP_FIVE_LEAGUES.map((league) => ({
      queryKey: ['analytics', 'super-subs', 'by-league', league.id, isDemoMode, filters, limit],
      queryFn: () =>
        getSuperSubs({
          season: filters.season,
          position: filters.position,
          club_id: filters.club_id,
          competition_id: league.id,
          page: 1,
          limit,
        }),
      placeholderData: keepPreviousData,
    })),
  });

  return TOP_FIVE_LEAGUES.map((league, idx) => ({
    league,
    data: results[idx]?.data?.data ?? [],
    isLoading: Boolean(results[idx]?.isLoading),
    isError: Boolean(results[idx]?.isError),
  }));
}
