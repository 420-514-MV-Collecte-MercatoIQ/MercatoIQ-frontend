import { httpClient } from '../../../shared/api/httpClient';
import { cleanQueryParams } from '../../../shared/api/queryParams';
import { isDemoModeActive } from '../../../shared/context/DemoModeContext';
import { demoDataService } from '../../../shared/mocks/demoData';
import type { PaginatedResponse } from '../../../shared/types/common.types';
import type {
  ClubRoiQueryParams,
  GoldClubTransferRoi,
  GoldKpisResponse,
  GoldSuperSubs,
  GoldUclVsDomestic,
  GoldUndervaluedScouting,
  KpisQueryParams,
  ScoutingU23QueryParams,
  SuperSubsQueryParams,
  UclVsDomesticQueryParams,
} from '../../../shared/types/domain.types';

export async function getAnalyticsKpis(query: KpisQueryParams): Promise<GoldKpisResponse> {
  if (isDemoModeActive()) {
    return demoDataService.getKpis(query);
  }
  const { data } = await httpClient.get<GoldKpisResponse>('/analytics/kpis', {
    params: cleanQueryParams(query as Record<string, unknown>),
  });
  return data;
}

export async function getClubRoi(
  query: ClubRoiQueryParams,
): Promise<PaginatedResponse<GoldClubTransferRoi>> {
  if (isDemoModeActive()) {
    return demoDataService.getClubRoi(query);
  }
  const { data } = await httpClient.get<PaginatedResponse<GoldClubTransferRoi>>(
    '/analytics/club-roi',
    { params: cleanQueryParams(query as Record<string, unknown>) },
  );
  return data;
}

export async function getScoutingU23(
  query: ScoutingU23QueryParams,
): Promise<PaginatedResponse<GoldUndervaluedScouting>> {
  if (isDemoModeActive()) {
    return demoDataService.getScoutingU23(query);
  }
  const { data } = await httpClient.get<PaginatedResponse<GoldUndervaluedScouting>>(
    '/analytics/scouting-u23',
    { params: cleanQueryParams(query as Record<string, unknown>) },
  );
  return data;
}

export async function getUclVsDomestic(
  query: UclVsDomesticQueryParams,
): Promise<PaginatedResponse<GoldUclVsDomestic>> {
  if (isDemoModeActive()) {
    return demoDataService.getUclVsDomestic(query);
  }
  const { data } = await httpClient.get<PaginatedResponse<GoldUclVsDomestic>>(
    '/analytics/ucl-vs-domestic',
    { params: cleanQueryParams(query as Record<string, unknown>) },
  );
  return data;
}

export async function getSuperSubs(
  query: SuperSubsQueryParams,
): Promise<PaginatedResponse<GoldSuperSubs>> {
  if (isDemoModeActive()) {
    return demoDataService.getSuperSubs(query);
  }
  const { data } = await httpClient.get<PaginatedResponse<GoldSuperSubs>>(
    '/analytics/super-subs',
    { params: cleanQueryParams(query as Record<string, unknown>) },
  );
  return data;
}
