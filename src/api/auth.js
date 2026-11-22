import client, { USE_MOCKS } from './client';
import { mockLogin, mockRegister } from '../mocks/auth.mock';

// POST /auth/login → { access_token, user: { id, email, role } }
export async function login(credentials) {
    if (USE_MOCKS) return mockLogin(credentials);
    const { data } = await client.post('/auth/login', credentials);
    return data;
}

// POST /auth/register → 201 { access_token, user: { id, email, role } }
export async function register(credentials) {
    if (USE_MOCKS) return mockRegister(credentials);
    const { data } = await client.post('/auth/register', credentials);
    return data;
}