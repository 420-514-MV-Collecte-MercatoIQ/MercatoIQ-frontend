import { describe, expect, it } from 'vitest';
import {
  formatCompactEur,
  formatPer90,
  formatRatio,
  formatRoiPercent,
  formatSignedDelta,
} from '../formatters';

describe('formatters', () => {
  it('formats compact EUR values and handles nullish inputs safely', () => {
    expect(formatCompactEur(180_000_000, 'en')).toBe('€180M');
    expect(formatCompactEur(-32_000_000, 'en')).toBe('-€32M');
    expect(formatCompactEur(null, 'en')).toBe('—');
    expect(formatCompactEur(undefined, 'fr')).toBe('—');
  });

  it('formats ROI ratios and percentages with sign', () => {
    expect(formatRoiPercent(1.824, 'en')).toBe('+182.4%');
    expect(formatRoiPercent(-0.173, 'en')).toBe('-17.3%');
    expect(formatRoiPercent(null, 'en')).toBe('—');
  });

  it('formats per-90, ratios, and signed deltas', () => {
    expect(formatRatio(1.71, 'x', 'en')).toBe('1.71x');
    expect(formatPer90(0.97, 'en')).toBe('0.97');
    expect(formatSignedDelta(0.41, 'en')).toBe('+0.41');
    expect(formatSignedDelta(-0.13, 'en')).toBe('-0.13');
    expect(formatSignedDelta(null, 'fr')).toBe('—');
  });
});
