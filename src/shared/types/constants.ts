import type { TransferType } from './domain.types';

export interface CompetitionOption {
  id: string;
  label: string;
  country: string;
}

export const COMPETITIONS: CompetitionOption[] = [
  { id: 'GB1', label: 'Premier League', country: 'England' },
  { id: 'ES1', label: 'LaLiga', country: 'Spain' },
  { id: 'IT1', label: 'Serie A', country: 'Italy' },
  { id: 'L1', label: 'Bundesliga', country: 'Germany' },
  { id: 'FR1', label: 'Ligue 1', country: 'France' },
  { id: 'CL', label: 'UEFA Champions League', country: 'Europe' },
];

export const TOP_FIVE_LEAGUE_IDS = ['GB1', 'ES1', 'IT1', 'L1', 'FR1'] as const;

export const TOP_FIVE_LEAGUES: CompetitionOption[] = COMPETITIONS.filter((c) =>
  (TOP_FIVE_LEAGUE_IDS as readonly string[]).includes(c.id),
);

export const DOMESTIC_COMPETITIONS: CompetitionOption[] = COMPETITIONS.filter(
  (c) => c.id !== 'CL',
);

export const POSITIONS = ['Attack', 'Midfield', 'Defender', 'Goalkeeper'] as const;

export const TRANSFER_TYPES: TransferType[] = [
  'permanent',
  'loan',
  'free',
  'end_of_loan',
];

export const FOOT_OPTIONS = ['right', 'left', 'both'] as const;

export const SEASONS: number[] = Array.from({ length: 14 }, (_, idx) => 2025 - idx);

export function getCompetitionLabel(id?: string): string {
  if (!id) return '—';
  return COMPETITIONS.find((c) => c.id === id)?.label ?? id;
}
