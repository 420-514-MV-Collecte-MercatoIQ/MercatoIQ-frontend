import { describe, expect, it } from 'vitest';
import { toCompetitionOptions } from '../useCompetitionOptions';

describe('toCompetitionOptions', () => {
  it('keeps the frontend label for a known competition', () => {
    expect(toCompetitionOptions([{ competition_id: 'GB1', name: 'premier-league' }])).toEqual([
      { id: 'GB1', label: 'Premier League', country: 'England' },
    ]);
  });

  it('falls back to the API name for an unknown competition', () => {
    expect(
      toCompetitionOptions([{ competition_id: 'XX1', name: 'test-league', country_name: 'Nowhere' }]),
    ).toEqual([{ id: 'XX1', label: 'test-league', country: 'Nowhere' }]);
  });
});
