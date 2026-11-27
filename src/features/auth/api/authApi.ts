import { AppApiError, assertObjectPayload, httpClient } from '../../../shared/api/httpClient';
import type {
  AuthResponse,
  GoogleAuthPayload,
  LoginPayload,
  RegisterPayload,
} from '../../../shared/types/common.types';

function assertAuthResponse(data: unknown, endpoint: string): AuthResponse {
  const parsed = assertObjectPayload<Partial<AuthResponse>>(data, endpoint);
  if (typeof parsed.access_token !== 'string' || !parsed.access_token || !parsed.user) {
    throw new AppApiError(`Unexpected authentication response from ${endpoint}.`, {
      status: 200,
      code: 'MALFORMED_RESPONSE',
    });
  }
  return parsed as AuthResponse;
}

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/auth/login', payload);
  return assertAuthResponse(data, '/auth/login');
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/auth/register', payload);
  return assertAuthResponse(data, '/auth/register');
}

export async function googleLoginApi(payload: GoogleAuthPayload): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/auth/google', payload);
  return assertAuthResponse(data, '/auth/google');
}
