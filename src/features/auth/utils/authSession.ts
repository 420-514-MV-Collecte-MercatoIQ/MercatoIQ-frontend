import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '../../../shared/api/httpClient';
import type { AuthResponse, AuthUser, UserRole } from '../../../shared/types/common.types';
import { decodeJwtPayload, isTokenExpired } from '../../../shared/utils/jwtUtils';
import {
  safeStorageGet,
  safeStorageRemove,
  safeStorageSet,
} from '../../../shared/utils/storage';

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

function isValidStoredUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.email === 'string' &&
    candidate.email.length > 0 &&
    (candidate.role === 'admin' || candidate.role === 'user')
  );
}

export function clearStoredSession(): void {
  safeStorageRemove(TOKEN_STORAGE_KEY);
  safeStorageRemove(USER_STORAGE_KEY);
}

export function saveStoredSession(res: AuthResponse): void {
  safeStorageSet(TOKEN_STORAGE_KEY, res.access_token);
  try {
    safeStorageSet(USER_STORAGE_KEY, JSON.stringify(res.user));
  } catch {
    // Ignore serialization failures when persisting user snapshot
  }
}

export function readStoredSession(): StoredSession {
  try {
    const storedToken = safeStorageGet(TOKEN_STORAGE_KEY);
    const rawUser = safeStorageGet(USER_STORAGE_KEY);
    if (!storedToken || !rawUser || isTokenExpired(storedToken)) {
      clearStoredSession();
      return { token: null, user: null };
    }
    const parsed: unknown = JSON.parse(rawUser);
    if (!isValidStoredUser(parsed)) {
      clearStoredSession();
      return { token: null, user: null };
    }
    return { token: storedToken, user: parsed };
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
