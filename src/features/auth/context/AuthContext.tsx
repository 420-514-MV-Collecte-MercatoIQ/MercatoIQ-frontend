import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '../../../shared/api/httpClient';
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../../../shared/types/common.types';
import { loginApi, registerApi } from '../api/authApi';
import { useDemoMode } from '../../../shared/context/DemoModeContext';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isDemoMode } = useDemoMode();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const persistSession = useCallback((res: AuthResponse) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, res.access_token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload): Promise<AuthResponse> => {
      if (isDemoMode) {
        const mockRes: AuthResponse = {
          access_token: 'demo-jwt-token',
          user: {
            id: 'demo-user-1',
            email: payload.email.trim().toLowerCase(),
            role: payload.email.toLowerCase().includes('admin') ? 'admin' : 'user',
          },
        };
        persistSession(mockRes);
        return mockRes;
      }
      const res = await loginApi(payload);
      persistSession(res);
      return res;
    },
    [isDemoMode, persistSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<AuthResponse> => {
      if (isDemoMode) {
        const mockRes: AuthResponse = {
          access_token: 'demo-jwt-token',
          user: {
            id: 'demo-user-2',
            email: payload.email.trim().toLowerCase(),
            role: 'user',
          },
        };
        persistSession(mockRes);
        return mockRes;
      }
      const res = await registerApi(payload);
      persistSession(res);
      return res;
    },
    [isDemoMode, persistSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
