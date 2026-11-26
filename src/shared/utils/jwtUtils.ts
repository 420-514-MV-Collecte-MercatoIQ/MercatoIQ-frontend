interface BaseJwtClaims {
  exp?: number;
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  role?: string;
}

/**
 * Safely decodes the JSON payload of a JWT without throwing on malformed or demo tokens.
 */
export function decodeJwtPayload<T extends object = BaseJwtClaims>(token: string): T | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      Array.from(atob(padded))
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
    const parsed: unknown = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? (parsed as T) : null;
  } catch {
    return null;
  }
}

/**
 * Checks whether a stored JWT is expired. Demo or non-expiring tokens return false.
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  if (token.startsWith('demo-') || token.startsWith('google-client-')) return false;

  const claims = decodeJwtPayload<BaseJwtClaims>(token);
  if (!claims || typeof claims.exp !== 'number') return false;
  return claims.exp * 1000 <= Date.now();
}
