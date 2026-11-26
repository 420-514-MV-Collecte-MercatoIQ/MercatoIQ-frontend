import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '../../../shared/api/httpClient';
import type { AuthResponse, AuthUser, UserRole } from '../../../shared/types/common.types';
import { decodeJwtPayload, isTokenExpired } from '../../../shared/utils/jwtUtils';

export interface StoredSession {
  token: string | null;
  user: AuthUser | null;
}

export interface CallbackAuthParams {
  token: string;
  email?: string;
  role?: UserRole;
  name?: string;
  avatarUrl?: string;
}

export function clearStoredSession(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function saveStoredSession(res: AuthResponse): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, res.access_token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
}

export function readStoredSession(): StoredSession {
  try {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!storedToken || !rawUser || isTokenExpired(storedToken)) {
      clearStoredSession();
      return { token: null, user: null };
    }
    return { token: storedToken, user: JSON.parse(rawUser) as AuthUser };
  } catch {
    clearStoredSession();
    return { token: null, user: null };
  }
}

export function buildCallbackSession(params: CallbackAuthParams): AuthResponse | null {
  if (!params.token || isTokenExpired(params.token)) return null;

  const claims = decodeJwtPayload<{
    sub?: string;
    email?: string;
    role?: string;
    name?: string;
    picture?: string;
  }>(params.token);

  const email = params.email || claims?.email;
  if (!email) return null;

  const role: UserRole =
    params.role === 'admin' || claims?.role === 'admin' ? 'admin' : 'user';

  return {
    access_token: params.token,
    user: {
      id: claims?.sub || 'oauth-user',
      email,
      role,
      name: params.name || claims?.name,
      avatarUrl: params.avatarUrl || claims?.picture,
      provider: 'google',
    },
  };
}

export function getRedirectPath(locationState: unknown, fallback = '/dashboard'): string {
  const state = locationState as { from?: { pathname?: string } } | null;
  return state?.from?.pathname || fallback;
}
