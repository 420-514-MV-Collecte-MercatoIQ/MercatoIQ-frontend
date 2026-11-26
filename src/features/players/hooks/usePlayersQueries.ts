import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDemoMode } from '../../../shared/context/DemoModeContext';
import type {
  CreatePlayerPayload,
  PlayerQueryParams,
  UpdatePlayerPayload,
} from '../../../shared/types/domain.types';
import {
  createPlayer,
  deletePlayer,
  getPlayerById,
  getPlayers,
  updatePlayer,
} from '../api/playersApi';

export function usePlayersQuery(query: PlayerQueryParams) {
  const { isDemoMode } = useDemoMode();
  return useQuery({
    queryKey: ['players', isDemoMode, query],
    queryFn: () => getPlayers(query),
    placeholderData: keepPreviousData,
  });
}

export function usePlayerDetailQuery(playerId: number) {
  const { isDemoMode } = useDemoMode();
  return useQuery({
    queryKey: ['players', 'detail', isDemoMode, playerId],
    queryFn: () => getPlayerById(playerId),
    enabled: Number.isFinite(playerId) && playerId > 0,
  });
}

export function useCreatePlayerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlayerPayload) => createPlayer(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['players'] });
      void qc.invalidateQueries({ queryKey: ['analytics', 'kpis'] });
    },
  });
}

export function useUpdatePlayerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playerId, payload }: { playerId: number; payload: UpdatePlayerPayload }) =>
      updatePlayer(playerId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['players'] });
      void qc.invalidateQueries({ queryKey: ['players', 'detail'] });
      void qc.invalidateQueries({ queryKey: ['analytics', 'kpis'] });
    },
  });
}

export function useDeletePlayerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (playerId: number) => deletePlayer(playerId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['players'] });
      void qc.invalidateQueries({ queryKey: ['analytics', 'kpis'] });
    },
  });
}
