import { describe, expect, it } from 'vitest';
import { decodeJwtPayload, isTokenExpired } from '../jwtUtils';

function buildUnsignedJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${body}.signature`;
}

describe('jwtUtils', () => {
  it('decodes valid JWT payloads and handles malformed strings safely', () => {
    const token = buildUnsignedJwt({ sub: '123', email: 'scout@mercatoiq.io', role: 'admin' });
    expect(decodeJwtPayload(token)).toEqual({
      sub: '123',
      email: 'scout@mercatoiq.io',
      role: 'admin',
    });
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(decodeJwtPayload('')).toBeNull();
  });

  it('detects expired vs active JWTs and treats demo tokens as active', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const futureExp = Math.floor(Date.now() / 1000) + 3600;

    expect(isTokenExpired(buildUnsignedJwt({ exp: pastExp }))).toBe(true);
    expect(isTokenExpired(buildUnsignedJwt({ exp: futureExp }))).toBe(false);
    expect(isTokenExpired('demo-jwt-token')).toBe(false);
    expect(isTokenExpired(null)).toBe(true);
  });
});
