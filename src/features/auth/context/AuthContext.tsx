import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppApiError, UNAUTHORIZED_EVENT } from '../../../shared/api/httpClient';
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '../../../shared/types/common.types';
import { googleLoginApi, loginApi, registerApi } from '../api/authApi';
import { useDemoMode } from '../../../shared/context/DemoModeContext';
import { useToast } from '../../../shared/context/ToastContext';
import { decodeJwtPayload } from '../../../shared/utils/jwtUtils';
import i18n from '../../../i18n';
import {
  buildCallbackSession,
  clearStoredSession,
  readStoredSession,
  saveStoredSession,
  type CallbackAuthParams,
} from '../utils/authSession';

interface GoogleIdClaims {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  loginWithGoogleCredential: (
    credential: string,
  ) => Promise<{ response: AuthResponse; clientFallback: boolean }>;
  loginWithGoogleDemo: () => Promise<AuthResponse>;
  loginFromCallback: (params: CallbackAuthParams) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isDemoMode } = useDemoMode();
  const { showToast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const persistSession = useCallback((res: AuthResponse) => {
    saveStoredSession(res);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const session = readStoredSession();
    setToken(session.token);
    setUser(session.user);
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      const hadSession = Boolean(tokenRef.current);
      logout();
      if (hadSession) {
        showToast(i18n.t('errors.sessionExpired'), 'error');
      }
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [logout, showToast]);

  const login = useCallback(
    async (payload: LoginPayload): Promise<AuthResponse> => {
      if (isDemoMode) {
        const mockRes: AuthResponse = {
          access_token: 'demo-jwt-token',
          user: {
            id: 'demo-user-1',
            email: payload.email.trim().toLowerCase(),
            role: payload.email.toLowerCase().includes('admin') ? 'admin' : 'user',
            provider: 'local',
          },
        };
        persistSession(mockRes);
        return mockRes;
      }
      const res = await loginApi(payload);
      const enriched: AuthResponse = { ...res, user: { ...res.user, provider: 'local' } };
      persistSession(enriched);
      return enriched;
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
            provider: 'local',
          },
        };
        persistSession(mockRes);
        return mockRes;
      }
      const res = await registerApi(payload);
      const enriched: AuthResponse = { ...res, user: { ...res.user, provider: 'local' } };
      persistSession(enriched);
      return enriched;
    },
    [isDemoMode, persistSession],
  );

  const loginWithGoogleCredential = useCallback(
    async (
      credential: string,
    ): Promise<{ response: AuthResponse; clientFallback: boolean }> => {
      const claims = decodeJwtPayload<GoogleIdClaims>(credential);
      const email = claims?.email?.toLowerCase() || 'google.analyst@mercatoiq.io';

      if (isDemoMode) {
        const demoRes: AuthResponse = {
          access_token: 'demo-google-jwt-token',
          user: {
            id: claims?.sub || 'google-demo-1',
            email,
            name: claims?.name || 'Google Analyst',
            avatarUrl: claims?.picture,
            role: 'user',
            provider: 'google',
          },
        };
        persistSession(demoRes);
        return { response: demoRes, clientFallback: false };
      }

      try {
        const res = await googleLoginApi({ id_token: credential });
        const enriched: AuthResponse = {
          ...res,
          user: {
            ...res.user,
            name: res.user.name || claims?.name,
            avatarUrl: res.user.avatarUrl || claims?.picture,
            provider: 'google',
          },
        };
        persistSession(enriched);
        return { response: enriched, clientFallback: false };
      } catch (err) {
        if (err instanceof AppApiError && (err.status === 404 || err.isNetworkError)) {
          const fallbackRes: AuthResponse = {
            access_token: `google-client-${credential.slice(0, 24)}`,
            user: {
              id: claims?.sub || 'google-client-1',
              email,
              name: claims?.name,
              avatarUrl: claims?.picture,
              role: 'user',
              provider: 'google',
            },
          };
          persistSession(fallbackRes);
          return { response: fallbackRes, clientFallback: true };
        }
        throw err;
      }
    },
    [isDemoMode, persistSession],
  );

  const loginWithGoogleDemo = useCallback(async (): Promise<AuthResponse> => {
    const demoRes: AuthResponse = {
      access_token: 'demo-google-jwt-token',
      user: {
        id: 'google-demo-analyst',
        email: 'scout.lead@mercatoiq.io',
        name: 'Alex Moreau',
        role: 'user',
        provider: 'google',
      },
    };
    persistSession(demoRes);
    return demoRes;
  }, [persistSession]);

  const loginFromCallback = useCallback(
    (params: CallbackAuthParams): boolean => {
      const session = buildCallbackSession(params);
      if (!session) return false;
      persistSession(session);
      return true;
    },
    [persistSession],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthLoading,
        isAuthenticated: Boolean(token && user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        loginWithGoogleCredential,
        loginWithGoogleDemo,
        loginFromCallback,
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
