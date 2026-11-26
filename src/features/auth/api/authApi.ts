import { httpClient } from '../../../shared/api/httpClient';
import type {
  AuthResponse,
  GoogleAuthPayload,
  LoginPayload,
  RegisterPayload,
} from '../../../shared/types/common.types';

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function googleLoginApi(payload: GoogleAuthPayload): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>('/auth/google', payload);
  return data;
}
