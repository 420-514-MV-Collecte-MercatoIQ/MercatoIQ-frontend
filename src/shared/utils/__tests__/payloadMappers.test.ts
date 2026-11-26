import { describe, expect, it } from 'vitest';
import { cleanQueryParams } from '../../api/queryParams';
import {
  toCreatePlayerPayload,
  toCreateTransferPayload,
  toUpdatePlayerPayload,
  type PlayerFormValues,
  type TransferFormValues,
} from '../payloadMappers';

describe('cleanQueryParams', () => {
  it('strips blank strings, undefined, null, and clamps limit to 1..100', () => {
    const cleaned = cleanQueryParams({
      season: 2024,
      competition_id: '',
      club_id: undefined,
      position: null,
      name: '  Mbappé  ',
      limit: 500,
      page: 0,
    });

    expect(cleaned).toEqual({
      season: 2024,
      name: 'Mbappé',
      limit: 100,
      page: 1,
    });
  });
});

describe('payloadMappers', () => {
  const basePlayerForm: PlayerFormValues = {
    player_id: '342229',
    player_name: ' Kylian Mbappé ',
    date_of_birth: '',
    nationality: 'France',
    position: 'Attack',
    sub_position: '',
    foot: '',
    height_cm: '178',
    club_id: '418',
    club_name: 'Real Madrid',
    joined_date: '',
    contract_expiry: '',
    current_market_value_eur: '180000000',
    highest_market_value_eur: '',
    market_valuations: [{ date: '', market_value_eur: '' }],
  };

  it('builds CreatePlayerPayload omitting empty optional fields', () => {
    const payload = toCreatePlayerPayload(basePlayerForm);
    expect(payload).toEqual({
      player_id: 342229,
      player_name: 'Kylian Mbappé',
      nationality: 'France',
      position: 'Attack',
      height_cm: 178,
      current_club: { club_id: 418, club_name: 'Real Madrid' },
      current_market_value_eur: 180000000,
    });
    expect('date_of_birth' in payload).toBe(false);
    expect('market_valuations' in payload).toBe(false);
  });

  it('omits player_id on UpdatePlayerPayload', () => {
    const payload = toUpdatePlayerPayload(basePlayerForm);
    expect('player_id' in payload).toBe(false);
    expect(payload.player_name).toBe('Kylian Mbappé');
  });

  it('builds CreateTransferPayload omitting blank optional fields', () => {
    const form: TransferFormValues = {
      player_id: '342229',
      season: '2024',
      competition_id: 'ES1',
      position: 'Attack',
      from_club_id: '583',
      from_club_name: 'Paris Saint-Germain',
      to_club_id: '418',
      to_club_name: 'Real Madrid',
      transfer_date: '2024-07-01',
      transfer_fee_eur: '0',
      market_value_at_transfer_eur: '',
      transfer_type: 'free',
    };

    const payload = toCreateTransferPayload(form);
    expect(payload).toEqual({
      player_id: 342229,
      season: 2024,
      competition_id: 'ES1',
      position: 'Attack',
      from_club_id: 583,
      from_club_name: 'Paris Saint-Germain',
      to_club_id: 418,
      to_club_name: 'Real Madrid',
      transfer_date: '2024-07-01',
      transfer_fee_eur: 0,
      transfer_type: 'free',
    });
    expect('market_value_at_transfer_eur' in payload).toBe(false);
  });
});
