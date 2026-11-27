import { describe, expect, it } from 'vitest';
import {
  disambiguateChartLabels,
  formatCompactEur,
  formatPer90,
  formatRatio,
  formatRoiPercent,
  formatShortClubName,
  formatSignedDelta,
} from '../formatters';

describe('formatters', () => {
  it('formats compact EUR values and handles nullish and non-finite inputs safely', () => {
    expect(formatCompactEur(180_000_000, 'en')).toBe('€180M');
    expect(formatCompactEur(-32_000_000, 'en')).toBe('-€32M');
    expect(formatCompactEur(null, 'en')).toBe('—');
    expect(formatCompactEur(undefined, 'fr')).toBe('—');
    expect(formatCompactEur(Number.POSITIVE_INFINITY, 'en')).toBe('—');
    expect(formatCompactEur(Number.NaN, 'en')).toBe('—');
    expect(formatShortClubName(null)).toBe('—');
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

  it('shortens verbose club names cleanly without trailing punctuation', () => {
    expect(formatShortClubName('Brighton & Hove Albion')).toBe('Brighton');
    expect(formatShortClubName('Bayer 04 Leverkusen')).toBe('Leverkusen');
    expect(formatShortClubName('Paris Saint-Germain')).toBe('PSG');
    expect(formatShortClubName('Arsenal FC')).toBe('Arsenal');
    expect(formatShortClubName('Spezia Calcio')).toBe('Spezia');
    expect(formatShortClubName('US Sassuolo')).toBe('Sassuolo');
    expect(formatShortClubName('Huddersfield Town')).toBe('Huddersfi…');
  });

  it('disambiguates duplicate chart shortLabels by season or index', () => {
    const disambiguated = disambiguateChartLabels([
      { shortLabel: 'Arsenal', season: 2023 },
      { shortLabel: 'Arsenal', season: 2024 },
      { shortLabel: 'Liverpool', season: 2024 },
    ]);
    expect(disambiguated.map((d) => d.shortLabel)).toEqual([
      "Arsenal '23",
      "Arsenal '24",
      'Liverpool',
    ]);
  });
});
