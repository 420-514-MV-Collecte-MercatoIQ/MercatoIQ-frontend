import type { PaginationParams } from '../types/common.types';

/**
 * Strips undefined, null, empty strings, and NaN values so NestJS ValidationPipe
 * with `forbidNonWhitelisted` / `@IsInt()` never rejects blank filter controls.
 */
export function cleanQueryParams<T extends object>(
  params?: T,
): Record<string, string | number | boolean> {
  if (!params) return {};
  const cleaned: Record<string, string | number | boolean> = {};

  for (const [key, raw] of Object.entries(params as Record<string, unknown>)) {
    if (raw === undefined || raw === null || raw === '') continue;
    if (typeof raw === 'number' && Number.isNaN(raw)) continue;

    if (key === 'limit' && typeof raw === 'number') {
      cleaned[key] = Math.min(100, Math.max(1, Math.trunc(raw)));
      continue;
    }

    if (key === 'page' && typeof raw === 'number') {
      cleaned[key] = Math.max(1, Math.trunc(raw));
      continue;
    }

    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.length === 0) continue;
      cleaned[key] = trimmed;
      continue;
    }

    if (typeof raw === 'number' || typeof raw === 'boolean') {
      cleaned[key] = raw;
    }
  }

  return cleaned;
}

export function normalizePagination(params?: PaginationParams): { page: number; limit: number } {
  const page = params?.page && params.page >= 1 ? Math.trunc(params.page) : 1;
  const limit = params?.limit ? Math.min(100, Math.max(1, Math.trunc(params.limit))) : 20;
  return { page, limit };
}
