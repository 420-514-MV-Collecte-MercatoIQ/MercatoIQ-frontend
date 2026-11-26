import axios, { AxiosError } from 'axios';
import type { ApiErrorPayload } from '../types/common.types';

export const TOKEN_STORAGE_KEY = 'mercatoiq_token';
export const USER_STORAGE_KEY = 'mercatoiq_user';
export const UNAUTHORIZED_EVENT = 'mercatoiq:unauthorized';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString().trim() || 'http://localhost:3000/api/v1';

export class AppApiError extends Error {
  readonly status: number;
  readonly details: string[];
  readonly isNetworkError: boolean;

  constructor(
    message: string,
    options: { status?: number; details?: string[]; isNetworkError?: boolean } = {},
  ) {
    super(message);
    this.name = 'AppApiError';
    this.status = options.status ?? 0;
    this.details = options.details ?? [];
    this.isNetworkError = options.isNetworkError ?? false;
  }
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    if (!error.response) {
      return Promise.reject(
        new AppApiError(error.message || 'Network error: API server is unreachable.', {
          status: 0,
          isNetworkError: true,
        }),
      );
    }

    const { status, data } = error.response;
    const reqUrl = error.config?.url || '';
    if (status === 401 && !reqUrl.includes('/auth/')) {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    const rawMsg = data?.message;
    const details = Array.isArray(rawMsg)
      ? rawMsg.map(String)
      : rawMsg
        ? [String(rawMsg)]
        : [error.message];

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
