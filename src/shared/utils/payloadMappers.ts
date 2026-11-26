import type {
  CreatePlayerPayload,
  CreateTransferPayload,
  CurrentClub,
  MarketValuation,
  TransferType,
  UpdatePlayerPayload,
  UpdateTransferPayload,
} from '../types/domain.types';

export interface PlayerFormValues {
  player_id: string;
  player_name: string;
  date_of_birth: string;
  nationality: string;
  position: string;
  sub_position: string;
  foot: string;
  height_cm: string;
  club_id: string;
  club_name: string;
  joined_date: string;
  contract_expiry: string;
  current_market_value_eur: string;
  highest_market_value_eur: string;
  market_valuations: Array<{ date: string; market_value_eur: string }>;
}

export interface TransferFormValues {
  player_id: string;
  season: string;
  competition_id: string;
  position: string;
  from_club_id: string;
  from_club_name: string;
  to_club_id: string;
  to_club_name: string;
  transfer_date: string;
  transfer_fee_eur: string;
  market_value_at_transfer_eur: string;
  transfer_type: TransferType | '';
}

function parseOptionalInt(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined;
}

function parseOptionalNumber(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalString(raw: string): string | undefined {
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildCurrentClub(values: PlayerFormValues): CurrentClub | undefined {
  const clubId = parseOptionalInt(values.club_id);
  const clubName = parseOptionalString(values.club_name);
  if (!clubId || !clubName) return undefined;

  const club: CurrentClub = {
    club_id: clubId,
    club_name: clubName,
  };
  const joined = parseOptionalString(values.joined_date);
  const expiry = parseOptionalString(values.contract_expiry);
  if (joined) club.joined_date = joined;
  if (expiry) club.contract_expiry = expiry;
  return club;
}

function buildMarketValuations(
  rows: Array<{ date: string; market_value_eur: string }>,
): MarketValuation[] | undefined {
  const valid = rows
    .filter((r) => r.date.trim() !== '' && r.market_value_eur.trim() !== '')
    .map((r) => ({
      date: r.date.trim(),
      market_value_eur: Number(r.market_value_eur),
    }))
    .filter((r) => Number.isFinite(r.market_value_eur) && r.market_value_eur >= 0);

  return valid.length > 0 ? valid : undefined;
}

/**
 * Maps form state to a clean CreatePlayerDto payload without non-whitelisted fields.
 */
export function toCreatePlayerPayload(values: PlayerFormValues): CreatePlayerPayload {
  const payload: CreatePlayerPayload = {
    player_id: Number(values.player_id),
    player_name: values.player_name.trim(),
  };

  const dob = parseOptionalString(values.date_of_birth);
  const nationality = parseOptionalString(values.nationality);
  const position = parseOptionalString(values.position);
  const subPosition = parseOptionalString(values.sub_position);
  const foot = parseOptionalString(values.foot);
  const height = parseOptionalNumber(values.height_cm);
  const currentClub = buildCurrentClub(values);
  const valuations = buildMarketValuations(values.market_valuations);
  const highestValue = parseOptionalNumber(values.highest_market_value_eur);
  const currentValue = parseOptionalNumber(values.current_market_value_eur);

  if (dob) payload.date_of_birth = dob;
  if (nationality) payload.nationality = nationality;
  if (position) payload.position = position;
  if (subPosition) payload.sub_position = subPosition;
  if (foot) payload.foot = foot;
  if (height !== undefined) payload.height_cm = height;
  if (currentClub) payload.current_club = currentClub;
  if (valuations) payload.market_valuations = valuations;
  if (highestValue !== undefined) payload.highest_market_value_eur = highestValue;
  if (currentValue !== undefined) payload.current_market_value_eur = currentValue;

  return payload;
}

export function toUpdatePlayerPayload(values: PlayerFormValues): UpdatePlayerPayload {
  const { player_id: _omittedId, ...rest } = toCreatePlayerPayload(values);
  return rest;
}

/**
 * Maps form state to a clean CreateTransferDto payload without non-whitelisted fields.
 */
export function toCreateTransferPayload(values: TransferFormValues): CreateTransferPayload {
  const payload: CreateTransferPayload = {
    player_id: Number(values.player_id),
    season: Number(values.season),
    competition_id: values.competition_id.trim(),
  };

  const position = parseOptionalString(values.position);
  const fromClubId = parseOptionalInt(values.from_club_id);
  const fromClubName = parseOptionalString(values.from_club_name);
  const toClubId = parseOptionalInt(values.to_club_id);
  const toClubName = parseOptionalString(values.to_club_name);
  const transferDate = parseOptionalString(values.transfer_date);
  const fee = parseOptionalNumber(values.transfer_fee_eur);
  const marketValue = parseOptionalNumber(values.market_value_at_transfer_eur);

  if (position) payload.position = position;
  if (fromClubId !== undefined) payload.from_club_id = fromClubId;
  if (fromClubName) payload.from_club_name = fromClubName;
  if (toClubId !== undefined) payload.to_club_id = toClubId;
  if (toClubName) payload.to_club_name = toClubName;
  if (transferDate) payload.transfer_date = transferDate;
  if (fee !== undefined) payload.transfer_fee_eur = fee;
  if (marketValue !== undefined) payload.market_value_at_transfer_eur = marketValue;
  if (values.transfer_type) payload.transfer_type = values.transfer_type;

  return payload;
}

export function toUpdateTransferPayload(values: TransferFormValues): UpdateTransferPayload {
  return toCreateTransferPayload(values);
}
