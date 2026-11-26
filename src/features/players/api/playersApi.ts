import { AppApiError, httpClient } from '../../../shared/api/httpClient';
import { cleanQueryParams } from '../../../shared/api/queryParams';
import { isDemoModeActive } from '../../../shared/context/DemoModeContext';
import { demoDataService } from '../../../shared/mocks/demoData';
import type { PaginatedResponse } from '../../../shared/types/common.types';
import type {
  CreatePlayerPayload,
  PlayerQueryParams,
  SilverPlayer,
  UpdatePlayerPayload,
} from '../../../shared/types/domain.types';

export async function getPlayers(
  query: PlayerQueryParams,
): Promise<PaginatedResponse<SilverPlayer>> {
  if (isDemoModeActive()) {
    return demoDataService.getPlayers(query);
  }
  const { data } = await httpClient.get<PaginatedResponse<SilverPlayer>>('/players', {
    params: cleanQueryParams(query as Record<string, unknown>),
  });
  return data;
}

export async function getPlayerById(playerId: number): Promise<SilverPlayer> {
  if (isDemoModeActive()) {
    const found = demoDataService.getPlayer(playerId);
    if (!found) {
      throw new AppApiError(`Player #${playerId} not found`, { status: 404 });
    }
    return found;
  }
  const { data } = await httpClient.get<SilverPlayer>(`/players/${playerId}`);
  return data;
}

export async function createPlayer(payload: CreatePlayerPayload): Promise<SilverPlayer> {
  if (isDemoModeActive()) {
    return demoDataService.createPlayer(payload);
  }
  const { data } = await httpClient.post<SilverPlayer>('/players', payload);
  return data;
}

export async function updatePlayer(
  playerId: number,
  payload: UpdatePlayerPayload,
): Promise<SilverPlayer> {
  if (isDemoModeActive()) {
    const updated = demoDataService.updatePlayer(playerId, payload);
    if (!updated) {
      throw new AppApiError(`Player #${playerId} not found`, { status: 404 });
    }
    return updated;
  }
  const { data } = await httpClient.patch<SilverPlayer>(`/players/${playerId}`, payload);
  return data;
}

export async function deletePlayer(playerId: number): Promise<{ deleted: boolean; player_id: number }> {
  if (isDemoModeActive()) {
    return demoDataService.removePlayer(playerId);
  }
  const { data } = await httpClient.delete<{ deleted: boolean; player_id: number }>(
    `/players/${playerId}`,
  );
  return data;
}
