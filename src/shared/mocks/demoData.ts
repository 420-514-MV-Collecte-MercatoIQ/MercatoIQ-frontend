import type { PaginatedResponse } from '../types/common.types';
import type {
  ClubRoiQueryParams,
  CreatePlayerPayload,
  CreateTransferPayload,
  GoldClubTransferRoi,
  GoldKpisResponse,
  GoldSuperSubs,
  GoldUclVsDomestic,
  GoldUndervaluedScouting,
  KpisQueryParams,
  PlayerQueryParams,
  ScoutingU23QueryParams,
  SilverPlayer,
  SilverTransfer,
  SuperSubsQueryParams,
  TransferQueryParams,
  UclVsDomesticQueryParams,
  UpdatePlayerPayload,
  UpdateTransferPayload,
} from '../types/domain.types';
import { normalizePagination } from '../api/queryParams';

const DEMO_CLUB_ROI: GoldClubTransferRoi[] = [
  {
    _id: 'roi-1',
    club_id: 281,
    club_name: 'Bayer 04 Leverkusen',
    season: 2024,
    competition_id: 'L1',
    total_fees_paid_eur: 54_000_000,
    total_value_gain_eur: 98_500_000,
    roi: 1.824,
    players_bought: 6,
    total_goals: 41,
    total_assists: 29,
    total_ga: 70,
    ga_per_m_eur: 1.3,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'roi-2',
    club_id: 1237,
    club_name: 'Brighton & Hove Albion',
    season: 2024,
    competition_id: 'GB1',
    total_fees_paid_eur: 68_000_000,
    total_value_gain_eur: 105_000_000,
    roi: 1.544,
    players_bought: 7,
    total_goals: 34,
    total_assists: 25,
    total_ga: 59,
    ga_per_m_eur: 0.87,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'roi-3',
    club_id: 418,
    club_name: 'Real Madrid',
    season: 2024,
    competition_id: 'ES1',
    total_fees_paid_eur: 49_000_000,
    total_value_gain_eur: 68_000_000,
    roi: 1.388,
    players_bought: 4,
    total_goals: 46,
    total_assists: 24,
    total_ga: 70,
    ga_per_m_eur: 1.43,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'roi-4',
    club_id: 46,
    club_name: 'Inter Milan',
    season: 2024,
    competition_id: 'IT1',
    total_fees_paid_eur: 62_000_000,
    total_value_gain_eur: 71_000_000,
    roi: 1.145,
    players_bought: 6,
    total_goals: 38,
    total_assists: 22,
    total_ga: 60,
    ga_per_m_eur: 0.97,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'roi-5',
    club_id: 583,
    club_name: 'Paris Saint-Germain',
    season: 2024,
    competition_id: 'FR1',
    total_fees_paid_eur: 145_000_000,
    total_value_gain_eur: 112_000_000,
    roi: 0.772,
    players_bought: 6,
    total_goals: 52,
    total_assists: 34,
    total_ga: 86,
    ga_per_m_eur: 0.59,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'roi-6',
    club_id: 11,
    club_name: 'Arsenal FC',
    season: 2024,
    competition_id: 'GB1',
    total_fees_paid_eur: 108_000_000,
    total_value_gain_eur: 74_000_000,
    roi: 0.685,
    players_bought: 5,
    total_goals: 31,
    total_assists: 21,
    total_ga: 52,
    ga_per_m_eur: 0.48,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'roi-7',
    club_id: 131,
    club_name: 'FC Barcelona',
    season: 2024,
    competition_id: 'ES1',
    total_fees_paid_eur: 58_000_000,
    total_value_gain_eur: 69_000_000,
    roi: 1.19,
    players_bought: 3,
    total_goals: 36,
    total_assists: 27,
    total_ga: 63,
    ga_per_m_eur: 1.09,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'roi-8',
    club_id: 985,
    club_name: 'Manchester United',
    season: 2024,
    competition_id: 'GB1',
    total_fees_paid_eur: 185_000_000,
    total_value_gain_eur: -32_000_000,
    roi: -0.173,
    players_bought: 6,
    total_goals: 19,
    total_assists: 11,
    total_ga: 30,
    ga_per_m_eur: 0.16,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
];

const DEMO_SCOUTING_U23: GoldUndervaluedScouting[] = [
  {
    _id: 'u23-1',
    player_id: 811779,
    player_name: 'João Neves',
    season: 2024,
    competition_id: 'FR1',
    position: 'Midfield',
    market_value_eur: 55_000_000,
    estimated_value_eur: 89_400_000,
    undervalue_ratio: 1.63,
    goals_per_90: 0.19,
    assists_per_90: 0.31,
    minutes_played: 2740,
    age: 20,
    club_id: 583,
    club_name: 'Paris Saint-Germain',
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'u23-2',
    player_id: 743595,
    player_name: 'Désiré Doué',
    season: 2024,
    competition_id: 'FR1',
    position: 'Attack',
    market_value_eur: 40_000_000,
    estimated_value_eur: 68_500_000,
    undervalue_ratio: 1.71,
    goals_per_90: 0.44,
    assists_per_90: 0.38,
    minutes_played: 2150,
    age: 19,
    club_id: 583,
    club_name: 'Paris Saint-Germain',
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'u23-3',
    player_id: 804471,
    player_name: 'Carlos Baleba',
    season: 2024,
    competition_id: 'GB1',
    position: 'Midfield',
    market_value_eur: 35_000_000,
    estimated_value_eur: 58_200_000,
    undervalue_ratio: 1.66,
    goals_per_90: 0.14,
    assists_per_90: 0.18,
    minutes_played: 2510,
    age: 20,
    club_id: 1237,
    club_name: 'Brighton & Hove Albion',
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'u23-4',
    player_id: 937958,
    player_name: 'Pau Cubarsí',
    season: 2024,
    competition_id: 'ES1',
    position: 'Defender',
    market_value_eur: 45_000_000,
    estimated_value_eur: 71_000_000,
    undervalue_ratio: 1.58,
    goals_per_90: 0.03,
    assists_per_90: 0.11,
    minutes_played: 2890,
    age: 18,
    club_id: 131,
    club_name: 'FC Barcelona',
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'u23-5',
    player_id: 683840,
    player_name: 'Pedri González',
    season: 2024,
    competition_id: 'ES1',
    position: 'Midfield',
    market_value_eur: 80_000_000,
    estimated_value_eur: 118_000_000,
    undervalue_ratio: 1.48,
    goals_per_90: 0.23,
    assists_per_90: 0.36,
    minutes_played: 2680,
    age: 22,
    club_id: 131,
    club_name: 'FC Barcelona',
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'u23-6',
    player_id: 676318,
    player_name: 'Piero Hincapié',
    season: 2024,
    competition_id: 'L1',
    position: 'Defender',
    market_value_eur: 40_000_000,
    estimated_value_eur: 57_600_000,
    undervalue_ratio: 1.44,
    goals_per_90: 0.08,
    assists_per_90: 0.12,
    minutes_played: 2640,
    age: 22,
    club_id: 281,
    club_name: 'Bayer 04 Leverkusen',
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'u23-7',
    player_id: 745660,
    player_name: 'Kenan Yıldız',
    season: 2024,
    competition_id: 'IT1',
    position: 'Attack',
    market_value_eur: 45_000_000,
    estimated_value_eur: 62_900_000,
    undervalue_ratio: 1.4,
    goals_per_90: 0.39,
    assists_per_90: 0.24,
    minutes_played: 2320,
    age: 19,
    club_id: 506,
    club_name: 'Juventus FC',
    computed_at: '2026-11-20T14:30:00.000Z',
  },
];

const DEMO_UCL_VS_DOMESTIC: GoldUclVsDomestic[] = [
  {
    _id: 'ucl-1',
    player_id: 50202,
    player_name: 'Raphinha',
    season: 2024,
    position: 'Attack',
    club_id: 131,
    club_name: 'FC Barcelona',
    ucl_appearances: 14,
    ucl_goals: 13,
    ucl_assists: 8,
    ucl_minutes_played: 1210,
    ucl_goals_per_90: 0.97,
    ucl_ga_per_90: 1.56,
    domestic_competition_id: 'ES1',
    domestic_appearances: 33,
    domestic_goals: 17,
    domestic_assists: 9,
    domestic_minutes_played: 2740,
    domestic_goals_per_90: 0.56,
    domestic_ga_per_90: 0.85,
    goals_per_90_delta: 0.41,
    ga_per_90_delta: 0.71,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'ucl-2',
    player_id: 371998,
    player_name: 'Vinícius Júnior',
    season: 2024,
    position: 'Attack',
    club_id: 418,
    club_name: 'Real Madrid',
    ucl_appearances: 12,
    ucl_goals: 9,
    ucl_assists: 4,
    ucl_minutes_played: 1020,
    ucl_goals_per_90: 0.79,
    ucl_ga_per_90: 1.15,
    domestic_competition_id: 'ES1',
    domestic_appearances: 29,
    domestic_goals: 14,
    domestic_assists: 8,
    domestic_minutes_played: 2410,
    domestic_goals_per_90: 0.52,
    domestic_ga_per_90: 0.82,
    goals_per_90_delta: 0.27,
    ga_per_90_delta: 0.33,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'ucl-3',
    player_id: 406625,
    player_name: 'Lautaro Martínez',
    season: 2024,
    position: 'Attack',
    club_id: 46,
    club_name: 'Inter Milan',
    ucl_appearances: 13,
    ucl_goals: 9,
    ucl_assists: 2,
    ucl_minutes_played: 1060,
    ucl_goals_per_90: 0.76,
    ucl_ga_per_90: 0.93,
    domestic_competition_id: 'IT1',
    domestic_appearances: 31,
    domestic_goals: 15,
    domestic_assists: 4,
    domestic_minutes_played: 2490,
    domestic_goals_per_90: 0.54,
    domestic_ga_per_90: 0.69,
    goals_per_90_delta: 0.22,
    ga_per_90_delta: 0.24,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'ucl-4',
    player_id: 342229,
    player_name: 'Kylian Mbappé',
    season: 2024,
    position: 'Attack',
    club_id: 418,
    club_name: 'Real Madrid',
    ucl_appearances: 13,
    ucl_goals: 8,
    ucl_assists: 2,
    ucl_minutes_played: 1120,
    ucl_goals_per_90: 0.64,
    ucl_ga_per_90: 0.8,
    domestic_competition_id: 'ES1',
    domestic_appearances: 33,
    domestic_goals: 24,
    domestic_assists: 5,
    domestic_minutes_played: 2820,
    domestic_goals_per_90: 0.77,
    domestic_ga_per_90: 0.93,
    goals_per_90_delta: -0.13,
    ga_per_90_delta: -0.13,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'ucl-5',
    player_id: 418560,
    player_name: 'Erling Haaland',
    season: 2024,
    position: 'Attack',
    club_id: 281,
    club_name: 'Manchester City',
    ucl_appearances: 9,
    ucl_goals: 8,
    ucl_assists: 0,
    ucl_minutes_played: 780,
    ucl_goals_per_90: 0.92,
    ucl_ga_per_90: 0.92,
    domestic_competition_id: 'GB1',
    domestic_appearances: 31,
    domestic_goals: 22,
    domestic_assists: 3,
    domestic_minutes_played: 2680,
    domestic_goals_per_90: 0.74,
    domestic_ga_per_90: 0.84,
    goals_per_90_delta: 0.18,
    ga_per_90_delta: 0.08,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'ucl-6',
    player_id: 581678,
    player_name: 'Jude Bellingham',
    season: 2024,
    position: 'Midfield',
    club_id: 418,
    club_name: 'Real Madrid',
    ucl_appearances: 12,
    ucl_goals: 4,
    ucl_assists: 4,
    ucl_minutes_played: 1050,
    ucl_goals_per_90: 0.34,
    ucl_ga_per_90: 0.69,
    domestic_competition_id: 'ES1',
    domestic_appearances: 31,
    domestic_goals: 12,
    domestic_assists: 7,
    domestic_minutes_played: 2650,
    domestic_goals_per_90: 0.41,
    domestic_ga_per_90: 0.65,
    goals_per_90_delta: -0.07,
    ga_per_90_delta: 0.04,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
];

const DEMO_SUPER_SUBS: GoldSuperSubs[] = [
  {
    _id: 'sub-1',
    player_id: 616400,
    player_name: 'Jhon Durán',
    season: 2024,
    competition_id: 'GB1',
    position: 'Attack',
    club_id: 405,
    club_name: 'Aston Villa',
    sub_appearances: 18,
    sub_goals: 8,
    sub_assists: 1,
    sub_minutes_played: 430,
    sub_goal_contributions_per_90: 1.88,
    starter_appearances: 6,
    starter_goals: 3,
    starter_assists: 0,
    starter_minutes_played: 440,
    starter_goal_contributions_per_90: 0.61,
    super_sub_score: 94.2,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'sub-2',
    player_id: 500740,
    player_name: 'Gonçalo Ramos',
    season: 2024,
    competition_id: 'FR1',
    position: 'Attack',
    club_id: 583,
    club_name: 'Paris Saint-Germain',
    sub_appearances: 16,
    sub_goals: 7,
    sub_assists: 2,
    sub_minutes_played: 495,
    sub_goal_contributions_per_90: 1.64,
    starter_appearances: 10,
    starter_goals: 5,
    starter_assists: 2,
    starter_minutes_played: 780,
    starter_goal_contributions_per_90: 0.81,
    super_sub_score: 89.6,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'sub-3',
    player_id: 486049,
    player_name: 'Alexander Sørloth',
    season: 2024,
    competition_id: 'ES1',
    position: 'Attack',
    club_id: 13,
    club_name: 'Atlético de Madrid',
    sub_appearances: 20,
    sub_goals: 9,
    sub_assists: 2,
    sub_minutes_played: 620,
    sub_goal_contributions_per_90: 1.6,
    starter_appearances: 14,
    starter_goals: 8,
    starter_assists: 1,
    starter_minutes_played: 1090,
    starter_goal_contributions_per_90: 0.74,
    super_sub_score: 88.4,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'sub-4',
    player_id: 660667,
    player_name: 'Davide Frattesi',
    season: 2024,
    competition_id: 'IT1',
    position: 'Midfield',
    club_id: 46,
    club_name: 'Inter Milan',
    sub_appearances: 21,
    sub_goals: 5,
    sub_assists: 3,
    sub_minutes_played: 590,
    sub_goal_contributions_per_90: 1.22,
    starter_appearances: 9,
    starter_goals: 2,
    starter_assists: 2,
    starter_minutes_played: 710,
    starter_goal_contributions_per_90: 0.51,
    super_sub_score: 82.9,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
  {
    _id: 'sub-5',
    player_id: 743595,
    player_name: 'Désiré Doué',
    season: 2024,
    competition_id: 'FR1',
    position: 'Attack',
    club_id: 583,
    club_name: 'Paris Saint-Germain',
    sub_appearances: 14,
    sub_goals: 4,
    sub_assists: 4,
    sub_minutes_played: 460,
    sub_goal_contributions_per_90: 1.57,
    starter_appearances: 16,
    starter_goals: 6,
    starter_assists: 5,
    starter_minutes_played: 1290,
    starter_goal_contributions_per_90: 0.77,
    super_sub_score: 85.1,
    computed_at: '2026-11-20T14:30:00.000Z',
  },
];

let demoPlayersStore: SilverPlayer[] = [
  {
    _id: 'p-342229',
    player_id: 342229,
    player_name: 'Kylian Mbappé',
    date_of_birth: '1998-12-20',
    nationality: 'France',
    position: 'Attack',
    sub_position: 'Centre-Forward',
    foot: 'right',
    height_cm: 178,
    current_club: {
      club_id: 418,
      club_name: 'Real Madrid',
      joined_date: '2024-07-01',
      contract_expiry: '2029-06-30',
    },
    market_valuations: [
      { date: '2022-06-01', market_value_eur: 160_000_000 },
      { date: '2023-06-01', market_value_eur: 180_000_000 },
      { date: '2024-06-01', market_value_eur: 180_000_000 },
      { date: '2025-03-01', market_value_eur: 170_000_000 },
    ],
    highest_market_value_eur: 200_000_000,
    current_market_value_eur: 170_000_000,
    ingested_at: '2026-11-20T14:00:00.000Z',
  },
  {
    _id: 'p-811779',
    player_id: 811779,
    player_name: 'João Neves',
    date_of_birth: '2004-09-27',
    nationality: 'Portugal',
    position: 'Midfield',
    sub_position: 'Central Midfield',
    foot: 'right',
    height_cm: 174,
    current_club: {
      club_id: 583,
      club_name: 'Paris Saint-Germain',
      joined_date: '2024-08-05',
      contract_expiry: '2029-06-30',
    },
    market_valuations: [
      { date: '2023-06-01', market_value_eur: 10_000_000 },
      { date: '2024-01-01', market_value_eur: 45_000_000 },
      { date: '2024-08-01', market_value_eur: 55_000_000 },
      { date: '2025-03-01', market_value_eur: 65_000_000 },
    ],
    highest_market_value_eur: 65_000_000,
    current_market_value_eur: 65_000_000,
    ingested_at: '2026-11-20T14:00:00.000Z',
  },
  {
    _id: 'p-581678',
    player_id: 581678,
    player_name: 'Jude Bellingham',
    date_of_birth: '2003-06-29',
    nationality: 'England',
    position: 'Midfield',
    sub_position: 'Attacking Midfield',
    foot: 'right',
    height_cm: 186,
    current_club: {
      club_id: 418,
      club_name: 'Real Madrid',
      joined_date: '2023-07-01',
      contract_expiry: '2029-06-30',
    },
    market_valuations: [
      { date: '2022-11-01', market_value_eur: 110_000_000 },
      { date: '2023-06-01', market_value_eur: 120_000_000 },
      { date: '2024-06-01', market_value_eur: 180_000_000 },
      { date: '2025-03-01', market_value_eur: 180_000_000 },
    ],
    highest_market_value_eur: 180_000_000,
    current_market_value_eur: 180_000_000,
    ingested_at: '2026-11-20T14:00:00.000Z',
  },
  {
    _id: 'p-743595',
    player_id: 743595,
    player_name: 'Désiré Doué',
    date_of_birth: '2005-06-03',
    nationality: 'France',
    position: 'Attack',
    sub_position: 'Right Winger',
    foot: 'right',
    height_cm: 181,
    current_club: {
      club_id: 583,
      club_name: 'Paris Saint-Germain',
      joined_date: '2024-08-17',
      contract_expiry: '2029-06-30',
    },
    market_valuations: [
      { date: '2023-06-01', market_value_eur: 15_000_000 },
      { date: '2024-06-01', market_value_eur: 30_000_000 },
      { date: '2024-12-01', market_value_eur: 40_000_000 },
      { date: '2025-03-01', market_value_eur: 60_000_000 },
    ],
    highest_market_value_eur: 60_000_000,
    current_market_value_eur: 60_000_000,
    ingested_at: '2026-11-20T14:00:00.000Z',
  },
  {
    _id: 'p-50202',
    player_id: 50202,
    player_name: 'Raphinha',
    date_of_birth: '1996-12-14',
    nationality: 'Brazil',
    position: 'Attack',
    sub_position: 'Left Winger',
    foot: 'left',
    height_cm: 176,
    current_club: {
      club_id: 131,
      club_name: 'FC Barcelona',
      joined_date: '2022-07-15',
      contract_expiry: '2027-06-30',
    },
    market_valuations: [
      { date: '2022-07-01', market_value_eur: 45_000_000 },
      { date: '2023-06-01', market_value_eur: 60_000_000 },
      { date: '2024-06-01', market_value_eur: 50_000_000 },
      { date: '2025-03-01', market_value_eur: 80_000_000 },
    ],
    highest_market_value_eur: 80_000_000,
    current_market_value_eur: 80_000_000,
    ingested_at: '2026-11-20T14:00:00.000Z',
  },
  {
    _id: 'p-937958',
    player_id: 937958,
    player_name: 'Pau Cubarsí',
    date_of_birth: '2007-01-22',
    nationality: 'Spain',
    position: 'Defender',
    sub_position: 'Centre-Back',
    foot: 'right',
    height_cm: 184,
    current_club: {
      club_id: 131,
      club_name: 'FC Barcelona',
      joined_date: '2024-01-20',
      contract_expiry: '2029-06-30',
    },
    market_valuations: [
      { date: '2024-03-01', market_value_eur: 25_000_000 },
      { date: '2024-10-01', market_value_eur: 40_000_000 },
      { date: '2025-03-01', market_value_eur: 70_000_000 },
    ],
    highest_market_value_eur: 70_000_000,
    current_market_value_eur: 70_000_000,
    ingested_at: '2026-11-20T14:00:00.000Z',
  },
];

let demoTransfersStore: SilverTransfer[] = [
  {
    _id: 'tr-101',
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
    market_value_at_transfer_eur: 180_000_000,
    transfer_type: 'free',
    ingested_at: '2026-11-20T14:00:00.000Z',
  },
  {
    _id: 'tr-102',
    player_id: 811779,
    season: 2024,
    competition_id: 'FR1',
    position: 'Midfield',
    from_club_id: 294,
    from_club_name: 'SL Benfica',
    to_club_id: 583,
    to_club_name: 'Paris Saint-Germain',
    transfer_date: '2024-08-05',
    transfer_fee_eur: 59_920_000,
    market_value_at_transfer_eur: 55_000_000,
    transfer_type: 'permanent',
    ingested_at: '2026-11-20T14:00:00.000Z',
  },
  {
    _id: 'tr-103',
    player_id: 743595,
    season: 2024,
    competition_id: 'FR1',
    position: 'Attack',
    from_club_id: 273,
    from_club_name: 'Stade Rennais FC',
    to_club_id: 583,
    to_club_name: 'Paris Saint-Germain',
    transfer_date: '2024-08-17',
    transfer_fee_eur: 50_000_000,
    market_value_at_transfer_eur: 30_000_000,
    transfer_type: 'permanent',
    ingested_at: '2026-11-20T14:00:00.000Z',
  },
  {
    _id: 'tr-104',
    player_id: 581678,
    season: 2023,
    competition_id: 'ES1',
    position: 'Midfield',
    from_club_id: 16,
    from_club_name: 'Borussia Dortmund',
    to_club_id: 418,
    to_club_name: 'Real Madrid',
    transfer_date: '2023-07-01',
    transfer_fee_eur: 113_000_000,
    market_value_at_transfer_eur: 120_000_000,
    transfer_type: 'permanent',
    ingested_at: '2026-11-20T14:00:00.000Z',
  },
  {
    _id: 'tr-105',
    player_id: 50202,
    season: 2022,
    competition_id: 'ES1',
    position: 'Attack',
    from_club_id: 399,
    from_club_name: 'Leeds United',
    to_club_id: 131,
    to_club_name: 'FC Barcelona',
    transfer_date: '2022-07-15',
    transfer_fee_eur: 58_000_000,
    market_value_at_transfer_eur: 45_000_000,
    transfer_type: 'permanent',
    ingested_at: '2026-11-20T14:00:00.000Z',
  },
];

function paginateItems<T>(items: T[], page: number, limit: number): PaginatedResponse<T> {
  const total = items.length;
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export const demoDataService = {
  getKpis(query: KpisQueryParams): GoldKpisResponse {
    const roiFiltered = DEMO_CLUB_ROI.filter((c) => {
      if (query.season && c.season !== query.season) return false;
      if (query.competition_id && c.competition_id !== query.competition_id) return false;
      if (query.club_id && c.club_id !== query.club_id) return false;
      return true;
    }).sort((a, b) => (b.roi ?? -999) - (a.roi ?? -999));

    const uclFiltered = DEMO_UCL_VS_DOMESTIC.filter((u) => {
      if (query.season && u.season !== query.season) return false;
      if (query.competition_id && u.domestic_competition_id !== query.competition_id) return false;
      if (query.position && u.position !== query.position) return false;
      if (query.club_id && u.club_id !== query.club_id) return false;
      return true;
    }).sort((a, b) => (b.goals_per_90_delta ?? -999) - (a.goals_per_90_delta ?? -999));

    return {
      total_appearances_analysed: 48620,
      total_players: demoPlayersStore.length * 412,
      total_transfers: demoTransfersStore.length * 365,
      top_roi_club: roiFiltered[0] ?? null,
      top_ucl_step_up_player: uclFiltered[0] ?? null,
      last_updated: '2026-11-20T14:30:00.000Z',
    };
  },

  getClubRoi(query: ClubRoiQueryParams): PaginatedResponse<GoldClubTransferRoi> {
    const { page, limit } = normalizePagination(query);
    const filtered = DEMO_CLUB_ROI.filter((item) => {
      if (query.season && item.season !== query.season) return false;
      if (query.competition_id && item.competition_id !== query.competition_id) return false;
      if (query.club_id && item.club_id !== query.club_id) return false;
      return true;
    }).sort((a, b) => (b.roi ?? -999) - (a.roi ?? -999));

    return paginateItems(filtered, page, limit);
  },

  getScoutingU23(query: ScoutingU23QueryParams): PaginatedResponse<GoldUndervaluedScouting> {
    const { page, limit } = normalizePagination(query);
    const filtered = DEMO_SCOUTING_U23.filter((item) => {
      if (query.season && item.season !== query.season) return false;
      if (query.competition_id && item.competition_id !== query.competition_id) return false;
      if (query.position && item.position !== query.position) return false;
      if (query.club_id && item.club_id !== query.club_id) return false;
      return true;
    }).sort((a, b) => b.undervalue_ratio - a.undervalue_ratio);

    return paginateItems(filtered, page, limit);
  },

  getUclVsDomestic(query: UclVsDomesticQueryParams): PaginatedResponse<GoldUclVsDomestic> {
    const { page, limit } = normalizePagination(query);
    const domesticComp = query.domestic_competition_id || query.competition_id;
    const filtered = DEMO_UCL_VS_DOMESTIC.filter((item) => {
      if (query.season && item.season !== query.season) return false;
      if (domesticComp && item.domestic_competition_id !== domesticComp) return false;
      if (query.position && item.position !== query.position) return false;
      if (query.club_id && item.club_id !== query.club_id) return false;
      return true;
    }).sort((a, b) => (b.goals_per_90_delta ?? -999) - (a.goals_per_90_delta ?? -999));

    return paginateItems(filtered, page, limit);
  },

  getSuperSubs(query: SuperSubsQueryParams): PaginatedResponse<GoldSuperSubs> {
    const { page, limit } = normalizePagination(query);
    const filtered = DEMO_SUPER_SUBS.filter((item) => {
      if (query.season && item.season !== query.season) return false;
      if (query.competition_id && item.competition_id !== query.competition_id) return false;
      if (query.position && item.position !== query.position) return false;
      if (query.club_id && item.club_id !== query.club_id) return false;
      return true;
    }).sort((a, b) => (b.super_sub_score ?? -999) - (a.super_sub_score ?? -999));

    return paginateItems(filtered, page, limit);
  },

  getPlayers(query: PlayerQueryParams): PaginatedResponse<SilverPlayer> {
    const { page, limit } = normalizePagination(query);
    const filtered = demoPlayersStore.filter((p) => {
      if (query.name && !p.player_name.toLowerCase().includes(query.name.toLowerCase())) return false;
      if (query.position && p.position !== query.position) return false;
      if (query.nationality && p.nationality?.toLowerCase() !== query.nationality.toLowerCase()) {
        return false;
      }
      if (query.club_id && p.current_club?.club_id !== query.club_id) return false;
      return true;
    });
    return paginateItems(filtered, page, limit);
  },

  getPlayer(playerId: number): SilverPlayer | null {
    return demoPlayersStore.find((p) => p.player_id === playerId) ?? null;
  },

  createPlayer(dto: CreatePlayerPayload): SilverPlayer {
    const created: SilverPlayer = {
      ...dto,
      _id: `p-${dto.player_id}`,
      market_valuations: dto.market_valuations ?? [],
      ingested_at: new Date().toISOString(),
    };
    demoPlayersStore = [created, ...demoPlayersStore.filter((p) => p.player_id !== dto.player_id)];
    return created;
  },

  updatePlayer(playerId: number, dto: UpdatePlayerPayload): SilverPlayer | null {
    const idx = demoPlayersStore.findIndex((p) => p.player_id === playerId);
    if (idx === -1) return null;
    const updated: SilverPlayer = { ...demoPlayersStore[idx], ...dto };
    demoPlayersStore[idx] = updated;
    return updated;
  },

  removePlayer(playerId: number): { deleted: boolean; player_id: number } {
    demoPlayersStore = demoPlayersStore.filter((p) => p.player_id !== playerId);
    return { deleted: true, player_id: playerId };
  },

  getTransfers(query: TransferQueryParams): PaginatedResponse<SilverTransfer> {
    const { page, limit } = normalizePagination(query);
    const filtered = demoTransfersStore.filter((t) => {
      if (query.season && t.season !== query.season) return false;
      if (query.competition_id && t.competition_id !== query.competition_id) return false;
      if (query.position && t.position !== query.position) return false;
      if (query.player_id && t.player_id !== query.player_id) return false;
      if (query.club_id && t.from_club_id !== query.club_id && t.to_club_id !== query.club_id) {
        return false;
      }
      if (query.name && !t.to_club_name?.toLowerCase().includes(query.name.toLowerCase())) {
        return false;
      }
      return true;
    });
    return paginateItems(filtered, page, limit);
  },

  createTransfer(dto: CreateTransferPayload): SilverTransfer {
    const created: SilverTransfer = {
      ...dto,
      _id: `tr-${Date.now()}`,
      ingested_at: new Date().toISOString(),
    };
    demoTransfersStore = [created, ...demoTransfersStore];
    return created;
  },

  updateTransfer(id: string, dto: UpdateTransferPayload): SilverTransfer | null {
    const idx = demoTransfersStore.findIndex((t) => t._id === id);
    if (idx === -1) return null;
    const updated: SilverTransfer = { ...demoTransfersStore[idx], ...dto };
    demoTransfersStore[idx] = updated;
    return updated;
  },

  removeTransfer(id: string): { deleted: boolean; id: string } {
    demoTransfersStore = demoTransfersStore.filter((t) => t._id !== id);
    return { deleted: true, id };
  },
};
