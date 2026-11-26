import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppApiError, getApiErrorMessage } from '../../api/httpClient';
import { normalizeRoiPercent } from '../formatters';
import { useDebounce } from '../../hooks/useDebounce';
import { getRedirectPath } from '../../../features/auth/utils/authSession';

describe('clean code helpers', () => {
  it('extracts concise messages from AppApiError, Error, and unknown values', () => {
    const apiErr = new AppApiError('Fallback', {
      status: 400,
      details: ['season must be an integer', 'limit must not exceed 100'],
    });
    expect(getApiErrorMessage(apiErr)).toBe('season must be an integer · limit must not exceed 100');
    expect(getApiErrorMessage(new Error('Network down'))).toBe('Network down');
    expect(getApiErrorMessage('unknown', 'Default msg')).toBe('Default msg');
  });

  it('normalizes decimal ROI ratios and percentage ROIs consistently', () => {
    expect(normalizeRoiPercent(1.824)).toBe(182.4);
    expect(normalizeRoiPercent(-0.173)).toBe(-17.3);
    expect(normalizeRoiPercent(45.5)).toBe(45.5);
    expect(normalizeRoiPercent(null)).toBeNull();
  });

  it('extracts safe redirect paths from router location state', () => {
    expect(getRedirectPath({ from: { pathname: '/players/342229' } })).toBe('/players/342229');
    expect(getRedirectPath(null)).toBe('/dashboard');
    expect(getRedirectPath(undefined, '/home')).toBe('/home');
  });

  it('debounces rapid state updates cleanly', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'Mb' },
    });

    expect(result.current).toBe('Mb');
    rerender({ val: 'Mbappé' });
    expect(result.current).toBe('Mb');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('Mbappé');
    vi.useRealTimers();
  });
});
