import { AppApiError, httpClient } from '../../../shared/api/httpClient';
import { cleanQueryParams } from '../../../shared/api/queryParams';
import { isDemoModeActive } from '../../../shared/context/DemoModeContext';
import { demoDataService } from '../../../shared/mocks/demoData';
import type { PaginatedResponse } from '../../../shared/types/common.types';
import type {
  CreateTransferPayload,
  SilverTransfer,
  TransferQueryParams,
  UpdateTransferPayload,
} from '../../../shared/types/domain.types';

export async function getTransfers(
  query: TransferQueryParams,
): Promise<PaginatedResponse<SilverTransfer>> {
  if (isDemoModeActive()) {
    return demoDataService.getTransfers(query);
  }
  const { data } = await httpClient.get<PaginatedResponse<SilverTransfer>>('/transfers', {
    params: cleanQueryParams(query as Record<string, unknown>),
  });
  return data;
}

export async function createTransfer(payload: CreateTransferPayload): Promise<SilverTransfer> {
  if (isDemoModeActive()) {
    return demoDataService.createTransfer(payload);
  }
  const { data } = await httpClient.post<SilverTransfer>('/transfers', payload);
  return data;
}

export async function updateTransfer(
  id: string,
  payload: UpdateTransferPayload,
): Promise<SilverTransfer> {
  if (isDemoModeActive()) {
    const updated = demoDataService.updateTransfer(id, payload);
    if (!updated) {
      throw new AppApiError(`Transfer #${id} not found`, { status: 404 });
    }
    return updated;
  }
  const { data } = await httpClient.patch<SilverTransfer>(`/transfers/${id}`, payload);
  return data;
}

export async function deleteTransfer(id: string): Promise<{ deleted: boolean; id: string }> {
  if (isDemoModeActive()) {
    return demoDataService.removeTransfer(id);
  }
  const { data } = await httpClient.delete<{ deleted: boolean; id: string }>(`/transfers/${id}`);
  return data;
}
