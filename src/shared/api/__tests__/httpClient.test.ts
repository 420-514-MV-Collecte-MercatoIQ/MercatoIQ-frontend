import { describe, expect, it, vi } from 'vitest';
import {
  AppApiError,
  assertObjectPayload,
  assertPaginatedPayload,
  classifyApiErrorCode,
  isRetryableApiError,
} from '../httpClient';
import { cleanQueryParams } from '../queryParams';
import { safeStorageGet, safeStorageRemove, safeStorageSet } from '../../utils/storage';
import {
  isValidEmail,
  parseIntInRange,
  parseNonNegativeNumber,
  parsePositiveInt,
} from '../../utils/validation';

describe('httpClient error classification & guards', () => {
  it('classifies HTTP, network, timeout, and validation status codes cleanly', () => {
    expect(classifyApiErrorCode(0, true, false)).toBe('NETWORK');
    expect(classifyApiErrorCode(0, true, true)).toBe('TIMEOUT');
    expect(classifyApiErrorCode(400, false, false)).toBe('VALIDATION');
    expect(classifyApiErrorCode(401, false, false)).toBe('UNAUTHORIZED');
    expect(classifyApiErrorCode(403, false, false)).toBe('FORBIDDEN');
    expect(classifyApiErrorCode(404, false, false)).toBe('NOT_FOUND');
    expect(classifyApiErrorCode(409, false, false)).toBe('CONFLICT');
    expect(classifyApiErrorCode(429, false, false)).toBe('RATE_LIMITED');
    expect(classifyApiErrorCode(503, false, false)).toBe('SERVER');
  });

  it('retries only transient network, timeout, and 5xx errors', () => {
    expect(isRetryableApiError(new AppApiError('Offline', { status: 0, isNetworkError: true }))).toBe(true);
    expect(isRetryableApiError(new AppApiError('Timeout', { status: 0, isTimeout: true, isNetworkError: true }))).toBe(true);
    expect(isRetryableApiError(new AppApiError('Gateway', { status: 502 }))).toBe(true);
    expect(isRetryableApiError(new AppApiError('Bad Request', { status: 400 }))).toBe(false);
    expect(isRetryableApiError(new AppApiError('Unauthorized', { status: 401 }))).toBe(false);
    expect(isRetryableApiError(new AppApiError('Forbidden', { status: 403 }))).toBe(false);
    expect(isRetryableApiError(new AppApiError('Not Found', { status: 404 }))).toBe(false);
    expect(isRetryableApiError(new AppApiError('Rate Limit', { status: 429 }))).toBe(false);
    expect(isRetryableApiError(new AppApiError('Malformed', { status: 200, code: 'MALFORMED_RESPONSE' }))).toBe(false);
    expect(isRetryableApiError(new Error('Generic'))).toBe(false);
  });

  it('validates object and paginated payloads strictly', () => {
    expect(assertObjectPayload<{ ok: boolean }>({ ok: true }, '/health')).toEqual({ ok: true });
    expect(() => assertObjectPayload('<html>502</html>', '/health')).toThrowError(AppApiError);
    expect(() => assertObjectPayload([], '/health')).toThrowError(AppApiError);

    const validPage = { data: [{ id: 1 }], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } };
    expect(assertPaginatedPayload(validPage, '/players')).toEqual(validPage);
    expect(() => assertPaginatedPayload({ data: 'not-an-array' }, '/players')).toThrowError(AppApiError);
  });
});

describe('queryParams & validation & storage resilience', () => {
  it('strips non-finite numbers and invalid positive IDs in cleanQueryParams', () => {
    expect(
      cleanQueryParams({
        club_id: 0,
        player_id: -5,
        season: Number.POSITIVE_INFINITY,
        name: '  ',
        limit: 20,
      }),
    ).toEqual({ limit: 20 });
  });

  it('validates emails and bounded numeric inputs strictly', () => {
    expect(isValidEmail('scout@mercatoiq.io')).toBe(true);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(parsePositiveInt('583')).toBe(583);
    expect(parsePositiveInt('0')).toBeUndefined();
    expect(parsePositiveInt('12.5')).toBeUndefined();
    expect(parseNonNegativeNumber('0')).toBe(0);
    expect(parseNonNegativeNumber('-1')).toBeUndefined();
    expect(parseIntInRange('2024', 1990, 2035)).toBe(2024);
    expect(parseIntInRange('1800', 1990, 2035)).toBeUndefined();
  });

  it('never throws when localStorage access throws SecurityError', () => {
    const spyGet = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });
    const spySet = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota', 'QuotaExceededError');
    });
    const spyRemove = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    expect(safeStorageGet('key')).toBeNull();
    expect(safeStorageSet('key', 'val')).toBe(false);
    expect(safeStorageRemove('key')).toBe(false);

    spyGet.mockRestore();
    spySet.mockRestore();
    spyRemove.mockRestore();
  });
});
