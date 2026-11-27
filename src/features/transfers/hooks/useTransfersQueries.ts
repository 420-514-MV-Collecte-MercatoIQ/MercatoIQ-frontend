import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDemoMode } from '../../../shared/context/DemoModeContext';
import type {
  CreateTransferPayload,
  TransferQueryParams,
  UpdateTransferPayload,
} from '../../../shared/types/domain.types';
import {
  createTransfer,
  deleteTransfer,
  getTransfers,
  updateTransfer,
} from '../api/transfersApi';

export function useTransfersQuery(query: TransferQueryParams, enabled = true) {
  const { isDemoMode } = useDemoMode();
  return useQuery({
    queryKey: ['transfers', isDemoMode, query],
    queryFn: () => getTransfers(query),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCreateTransferMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransferPayload) => createTransfer(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transfers'] });
      void qc.invalidateQueries({ queryKey: ['analytics', 'kpis'] });
    },
  });
}

export function useUpdateTransferMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransferPayload }) =>
      updateTransfer(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transfers'] });
      void qc.invalidateQueries({ queryKey: ['analytics', 'kpis'] });
    },
  });
}

export function useDeleteTransferMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransfer(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transfers'] });
      void qc.invalidateQueries({ queryKey: ['analytics', 'kpis'] });
    },
  });
}
