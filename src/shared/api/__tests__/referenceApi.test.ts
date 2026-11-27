import { afterEach, describe, expect, it, vi } from 'vitest';
import { getClubs, getCompetitions } from '../referenceApi';
import { httpClient } from '../httpClient';
import { safeStorageRemove, safeStorageSet } from '../../utils/storage';

const DEMO_KEY = 'mercatoiq_demo_mode';

describe('referenceApi.getClubs', () => {
  afterEach(() => {
    safeStorageRemove(DEMO_KEY);
    vi.restoreAllMocks();
  });

  it('calls GET /clubs with cleaned params in live mode', async () => {
    const payload = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    const get = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: payload });

    await expect(getClubs({ search: ' ars ', competition_id: '', limit: 10 })).resolves.toEqual(
      payload,
    );
    expect(get).toHaveBeenCalledWith('/clubs', { params: { search: 'ars', limit: 10 } });
  });

  it('filters demo clubs by competition and name in demo mode', async () => {
    safeStorageSet(DEMO_KEY, 'true');
    const get = vi.spyOn(httpClient, 'get');

    const result = await getClubs({ search: 'madrid', competition_id: 'ES1' });

    expect(get).not.toHaveBeenCalled();
    expect(result.data.map((c) => c.name)).toEqual(['Atlético de Madrid', 'Real Madrid']);
  });
});

describe('referenceApi.getCompetitions', () => {
  afterEach(() => {
    safeStorageRemove(DEMO_KEY);
    vi.restoreAllMocks();
  });

  it('calls GET /competitions in live mode', async () => {
    const payload = [{ competition_id: 'GB1', name: 'premier-league' }];
    const get = vi.spyOn(httpClient, 'get').mockResolvedValue({ data: payload });

    await expect(getCompetitions()).resolves.toEqual(payload);
    expect(get).toHaveBeenCalledWith('/competitions');
  });

  it('rejects a response that is not a list', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue({ data: { foo: 1 } });

    await expect(getCompetitions()).rejects.toMatchObject({ code: 'MALFORMED_RESPONSE' });
  });

  it('returns the 6 project competitions in demo mode', async () => {
    safeStorageSet(DEMO_KEY, 'true');

    const result = await getCompetitions();

    expect(result.map((c) => c.competition_id)).toEqual(['GB1', 'ES1', 'IT1', 'L1', 'FR1', 'CL']);
  });
});
