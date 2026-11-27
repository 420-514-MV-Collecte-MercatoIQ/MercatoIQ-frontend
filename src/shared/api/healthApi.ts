import { assertObjectPayload, httpClient } from './httpClient';
import type { HealthResponse } from '../types/common.types';

export async function getHealthStatus(): Promise<HealthResponse & { latencyMs: number }> {
  const start = performance.now();
  const { data } = await httpClient.get<HealthResponse>('/health');
  const validated = assertObjectPayload<HealthResponse>(data, '/health');
  const latencyMs = Math.round(performance.now() - start);
  return { ...validated, latencyMs };
}
