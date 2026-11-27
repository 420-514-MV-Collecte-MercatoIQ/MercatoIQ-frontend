import axios, { AxiosError } from 'axios';
import type { ApiErrorPayload, PaginatedResponse } from '../types/common.types';
import { safeStorageGet } from '../utils/storage';

export const TOKEN_STORAGE_KEY = 'mercatoiq_token';
export const USER_STORAGE_KEY = 'mercatoiq_user';
export const UNAUTHORIZED_EVENT = 'mercatoiq:unauthorized';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString().trim() || 'http://localhost:3000/api/v1';

export type ApiErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION'
  | 'RATE_LIMITED'
  | 'SERVER'
  | 'MALFORMED_RESPONSE'
  | 'UNKNOWN';

export function classifyApiErrorCode(
  status: number,
  isNetworkError: boolean,
  isTimeout: boolean,
): ApiErrorCode {
  if (isTimeout) return 'TIMEOUT';
  if (isNetworkError || status === 0) return 'NETWORK';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 400 || status === 422) return 'VALIDATION';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'SERVER';
  return 'UNKNOWN';
}

export class AppApiError extends Error {
  readonly status: number;
  readonly details: string[];
  readonly isNetworkError: boolean;
  readonly isTimeout: boolean;
  readonly code: ApiErrorCode;

  constructor(
    message: string,
    options: {
      status?: number;
      details?: string[];
      isNetworkError?: boolean;
      isTimeout?: boolean;
      code?: ApiErrorCode;
    } = {},
  ) {
    super(message);
    this.name = 'AppApiError';
    this.status = options.status ?? 0;
    this.details = options.details ?? [];
    this.isTimeout = options.isTimeout ?? false;
    this.isNetworkError = options.isNetworkError ?? false;
    this.code =
      options.code ?? classifyApiErrorCode(this.status, this.isNetworkError, this.isTimeout);
  }
}

export function isRetryableApiError(error: unknown): boolean {
  if (!(error instanceof AppApiError)) return false;
  if (error.code === 'NETWORK' || error.code === 'TIMEOUT') return true;
  if (error.code === 'SERVER') {
    return error.status === 500 || error.status === 502 || error.status === 503 || error.status === 504;
  }
  return false;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'An unexpected error occurred.',
): string {
  if (error instanceof AppApiError) {
    return error.details.join(' · ') || error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function assertObjectPayload<T extends object>(data: unknown, endpoint?: string): T {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new AppApiError(
      endpoint
        ? `Unexpected response format from ${endpoint}.`
        : 'Unexpected response format from server.',
      { status: 200, code: 'MALFORMED_RESPONSE' },
    );
  }
  return data as T;
}

export function assertPaginatedPayload<T>(
  data: unknown,
  endpoint?: string,
): PaginatedResponse<T> {
  const obj = assertObjectPayload<{ data?: unknown }>(data, endpoint);
  if (!Array.isArray(obj.data)) {
    throw new AppApiError(
      endpoint
        ? `Unexpected paginated response format from ${endpoint}.`
        : 'Unexpected paginated response format from server.',
      { status: 200, code: 'MALFORMED_RESPONSE' },
    );
  }
  return data as PaginatedResponse<T>;
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const token = safeStorageGet(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';

    if (!error.response) {
      if (isTimeout) {
        return Promise.reject(
          new AppApiError('Request timed out. The server took too long to respond.', {
            status: 0,
            isNetworkError: true,
            isTimeout: true,
            code: 'TIMEOUT',
          }),
        );
      }

      return Promise.reject(
        new AppApiError(error.message || 'Network error: API server is unreachable.', {
          status: 0,
          isNetworkError: true,
          code: 'NETWORK',
        }),
      );
    }

    const { status, data } = error.response;
    const reqUrl = error.config?.url || '';
    if (status === 401 && !reqUrl.includes('/auth/')) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    const rawMsg = data && typeof data === 'object' ? data.message : undefined;
    const details = Array.isArray(rawMsg)
      ? rawMsg.map((item) => String(item).trim()).filter(Boolean)
      : rawMsg && typeof rawMsg === 'string' && rawMsg.trim().length > 0
        ? [rawMsg.trim()]
        : [];

    const primaryMessage = details[0] || `HTTP ${status}`;

    return Promise.reject(
      new AppApiError(primaryMessage, {
        status,
        details,
        isNetworkError: false,
      }),
    );
  },
);
