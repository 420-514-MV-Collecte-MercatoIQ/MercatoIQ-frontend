import { normalizePagination } from '../api/queryParams';
import { COMPETITIONS } from '../types/constants';
import type { PaginatedResponse } from '../types/common.types';
import type {
  ClubQueryParams,
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
  ReferenceClub,
  ReferenceCompetition,
  ScoutingU23QueryParams,
  SilverPlayer,
  SilverTransfer,
  SuperSubsQueryParams,
  TransferQueryParams,
  UclVsDomesticQueryParams,
  UpdatePlayerPayload,
  UpdateTransferPayload,
} from '../types/domain.types';
import {
  DEMO_CLUB_ROI,
  DEMO_SCOUTING_U23,
  DEMO_SUPER_SUBS,
  DEMO_UCL_VS_DOMESTIC,
} from './analyticsFixtures';
import { DEMO_CLUBS } from './referenceFixtures';
import { INITIAL_DEMO_PLAYERS, INITIAL_DEMO_TRANSFERS } from './silverFixtures';

let demoPlayersStore: SilverPlayer[] = [...INITIAL_DEMO_PLAYERS];
let demoTransfersStore: SilverTransfer[] = [...INITIAL_DEMO_TRANSFERS];

function paginateItems<T>(items: T[], page: number, limit: number): PaginatedResponse<T> {
  const total = items.length;
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
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

  getCompetitions(): ReferenceCompetition[] {
    return COMPETITIONS.map((c) => ({
      competition_id: c.id,
      name: c.label,
      country_name: c.country,
    }));
  },

  getClubs(query: ClubQueryParams): PaginatedResponse<ReferenceClub> {
    const { page, limit } = normalizePagination(query);
    const search = query.search?.trim().toLowerCase();
    const filtered = DEMO_CLUBS.filter((c) => {
      if (query.competition_id && c.domestic_competition_id !== query.competition_id) return false;
      if (search && !c.name.toLowerCase().includes(search)) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
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

  getTransfer(id: string): SilverTransfer | null {
    return demoTransfersStore.find((t) => t._id === id) ?? null;
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
