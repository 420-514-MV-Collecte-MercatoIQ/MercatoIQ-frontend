import type { PaginationParams } from './common.types';

export type TransferType = 'permanent' | 'loan' | 'free' | 'end_of_loan';

export interface CurrentClub {
  club_id: number;
  club_name: string;
  joined_date?: string;
  contract_expiry?: string;
}

export interface ClubOption {
  club_id: number;
  club_name: string;
}

export interface ReferenceClub {
  club_id: number;
  name: string;
  domestic_competition_id?: string;
}

export interface ReferenceCompetition {
  competition_id: string;
  name: string;
  country_name?: string;
}

export interface ClubQueryParams extends PaginationParams {
  search?: string;
  competition_id?: string;
}

export interface MarketValuation {
  date: string;
  market_value_eur: number;
}

export interface SilverPlayer {
  _id?: string;
  player_id: number;
  player_name: string;
  date_of_birth?: string;
  nationality?: string;
  position?: string;
  sub_position?: string;
  foot?: string;
  height_cm?: number;
  current_club?: CurrentClub;
  market_valuations: MarketValuation[];
  highest_market_value_eur?: number;
  current_market_value_eur?: number;
  ingested_at?: string;
}

export interface CreatePlayerPayload {
  player_id: number;
  player_name: string;
  date_of_birth?: string;
  nationality?: string;
  position?: string;
  sub_position?: string;
  foot?: string;
  height_cm?: number;
  current_club?: CurrentClub;
  market_valuations?: MarketValuation[];
  highest_market_value_eur?: number;
  current_market_value_eur?: number;
}

export type UpdatePlayerPayload = Partial<CreatePlayerPayload>;

export interface PlayerQueryParams extends PaginationParams {
  name?: string;
  position?: string;
  nationality?: string;
  club_id?: number;
  competition_id?: string;
  season?: number;
}

export interface SilverTransfer {
  _id: string;
  player_id: number;
  season: number;
  competition_id: string;
  position?: string;
  from_club_id?: number;
  from_club_name?: string;
  to_club_id?: number;
  to_club_name?: string;
  transfer_date?: string;
  transfer_fee_eur?: number;
  market_value_at_transfer_eur?: number;
  transfer_type?: TransferType;
  ingested_at?: string;
}

export interface CreateTransferPayload {
  player_id: number;
  season: number;
  competition_id: string;
  position?: string;
  from_club_id?: number;
  from_club_name?: string;
  to_club_id?: number;
  to_club_name?: string;
  transfer_date?: string;
  transfer_fee_eur?: number;
  market_value_at_transfer_eur?: number;
  transfer_type?: TransferType;
}

export type UpdateTransferPayload = Partial<CreateTransferPayload>;

export interface TransferQueryParams extends PaginationParams {
  season?: number;
  competition_id?: string;
  position?: string;
  club_id?: number;
  player_id?: number;
  name?: string;
}

export interface GoldClubTransferRoi {
  _id?: string;
  club_id: number;
  club_name: string;
  season: number;
  competition_id?: string;
  total_fees_paid_eur: number;
  total_value_gain_eur: number;
  roi: number | null;
  players_bought?: number;
  total_goals?: number;
  total_assists?: number;
  total_ga?: number;
  ga_per_m_eur?: number | null;
  computed_at?: string;
}

export interface GoldUndervaluedScouting {
  _id?: string;
  player_id: number;
  player_name: string;
  season: number;
  competition_id: string;
  position?: string;
  market_value_eur: number;
  estimated_value_eur: number;
  undervalue_ratio: number;
  goals_per_90?: number;
  assists_per_90?: number;
  minutes_played?: number;
  age?: number;
  club_id?: number;
  club_name?: string;
  computed_at?: string;
}

export interface GoldUclVsDomestic {
  _id?: string;
  player_id: number;
  player_name: string;
  season: number;
  position?: string;
  club_id?: number;
  club_name?: string;
  ucl_appearances: number;
  ucl_goals: number;
  ucl_assists: number;
  ucl_minutes_played: number;
  ucl_goals_per_90: number | null;
  ucl_ga_per_90?: number | null;
  domestic_competition_id: string;
  domestic_appearances: number;
  domestic_goals: number;
  domestic_assists: number;
  domestic_minutes_played: number;
  domestic_goals_per_90: number | null;
  domestic_ga_per_90?: number | null;
  goals_per_90_delta: number | null;
  ga_per_90_delta?: number | null;
  computed_at?: string;
}

export interface GoldSuperSubs {
  _id?: string;
  player_id: number;
  player_name: string;
  season: number;
  competition_id: string;
  position?: string;
  club_id?: number;
  club_name?: string;
  sub_appearances: number;
  sub_goals: number;
  sub_assists: number;
  sub_minutes_played: number;
  sub_goal_contributions_per_90: number | null;
  starter_appearances: number;
  starter_goals: number;
  starter_assists: number;
  starter_minutes_played: number;
  starter_goal_contributions_per_90: number | null;
  super_sub_score: number | null;
  computed_at?: string;
}

export interface GoldKpisResponse {
  total_appearances_analysed: number;
  total_players: number;
  total_transfers: number;
  top_roi_club: GoldClubTransferRoi | null;
  top_ucl_step_up_player: GoldUclVsDomestic | null;
  last_updated: string | null;
}

export interface AnalyticsFilterParams {
  season?: number;
  competition_id?: string;
  position?: string;
  club_id?: number;
}

export type KpisQueryParams = AnalyticsFilterParams;

export interface ClubRoiQueryParams extends PaginationParams {
  season?: number;
  competition_id?: string;
  club_id?: number;
}

export interface ScoutingU23QueryParams extends PaginationParams, AnalyticsFilterParams {}

export interface UclVsDomesticQueryParams extends PaginationParams, AnalyticsFilterParams {
  domestic_competition_id?: string;
}

export interface SuperSubsQueryParams extends PaginationParams, AnalyticsFilterParams {}
