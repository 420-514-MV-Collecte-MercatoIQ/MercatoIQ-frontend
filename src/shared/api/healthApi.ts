import { httpClient } from './httpClient';
import type { HealthResponse } from '../types/common.types';

export async function getHealthStatus(): Promise<HealthResponse & { latencyMs: number }> {
  const start = performance.now();
  const { data } = await httpClient.get<HealthResponse>('/health');
  const latencyMs = Math.round(performance.now() - start);
  return { ...data, latencyMs };
}
