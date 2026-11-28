import { isDemoModeActive } from '../context/DemoModeContext';
import { demoDataService } from '../mocks/demoData';
import type { PaginatedResponse } from '../types/common.types';
import type { ClubQueryParams, ReferenceClub, ReferenceCompetition } from '../types/domain.types';
import { AppApiError, assertPaginatedPayload, httpClient } from './httpClient';
import { cleanQueryParams } from './queryParams';

export async function getCompetitions(): Promise<ReferenceCompetition[]> {
  if (isDemoModeActive()) {
    return demoDataService.getCompetitions();
  }
  const { data } = await httpClient.get<ReferenceCompetition[]>('/competitions');
  if (!Array.isArray(data)) {
    throw new AppApiError('Unexpected response format from /competitions.', {
      status: 200,
      code: 'MALFORMED_RESPONSE',
    });
  }
  return data;
}

export async function getClubs(
  query: ClubQueryParams,
): Promise<PaginatedResponse<ReferenceClub>> {
  if (isDemoModeActive()) {
    return demoDataService.getClubs(query);
  }
  const { data } = await httpClient.get<PaginatedResponse<ReferenceClub>>('/clubs', {
    params: cleanQueryParams(query),
  });
  return assertPaginatedPayload<ReferenceClub>(data, '/clubs');
}
