import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function resolveLocale(lang?: string): string {
  return lang?.startsWith('fr') ? 'fr-FR' : 'en-US';
}

export function formatEur(value: number | null | undefined, lang = 'en'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(resolveLocale(lang), {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactEur(value: number | null | undefined, lang = 'en'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const locale = resolveLocale(lang);

  if (abs >= 1_000_000_000) {
    return `${sign}€${(abs / 1_000_000_000).toLocaleString(locale, {
      maximumFractionDigits: 2,
    })}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}€${(abs / 1_000_000).toLocaleString(locale, {
      maximumFractionDigits: 1,
    })}M`;
  }
  if (abs >= 1_000) {
    return `${sign}€${(abs / 1_000).toLocaleString(locale, {
      maximumFractionDigits: 0,
    })}K`;
  }
  return formatEur(value, lang);
}

export function formatCompactNumber(value: number | null | undefined, lang = 'en'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(resolveLocale(lang), {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatInteger(value: number | null | undefined, lang = 'en'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(resolveLocale(lang)).format(Math.round(value));
}

/**
 * Normalizes ROI values that may be stored as a decimal ratio (e.g., 0.42 = 42%)
 * or already as a percentage.
 */
export function normalizeRoiPercent(value: number | null | undefined): number | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const pct = Math.abs(value) <= 10 ? value * 100 : value;
  return Math.round(pct * 10) / 10;
}

export function formatRoiPercent(value: number | null | undefined, lang = 'en'): string {
  const pct = normalizeRoiPercent(value);
  if (pct === null) return '—';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toLocaleString(resolveLocale(lang), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function formatRatio(value: number | null | undefined, suffix = 'x', lang = 'en'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value.toLocaleString(resolveLocale(lang), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}${suffix}`;
}

export function formatPer90(value: number | null | undefined, lang = 'en'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString(resolveLocale(lang), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatSignedDelta(value: number | null | undefined, lang = 'en'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString(resolveLocale(lang), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: string | Date | null | undefined, lang = 'en'): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(resolveLocale(lang), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function toDateInputValue(value?: string | Date): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function calculateAge(dob?: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

const CLUB_SHORT_NAME_PATTERNS: Array<[RegExp, string]> = [
  [/brighton/i, 'Brighton'],
  [/bayer.*leverkusen/i, 'Leverkusen'],
  [/paris saint-germain/i, 'PSG'],
  [/atl[eé]tico.*madrid/i, 'Atlético'],
  [/manchester city/i, 'Man City'],
  [/manchester united/i, 'Man Utd'],
  [/tottenham/i, 'Tottenham'],
  [/wolverhampton/i, 'Wolves'],
  [/nottingham forest/i, 'Nottm Forest'],
  [/real sociedad/i, 'Real Sociedad'],
  [/real betis/i, 'Real Betis'],
  [/real madrid/i, 'Real Madrid'],
  [/borussia dortmund/i, 'Dortmund'],
  [/bayern munich|fc bayern/i, 'Bayern'],
  [/fc barcelona|barcelona/i, 'Barcelona'],
  [/inter milan|fc internazionale/i, 'Inter'],
  [/ac milan/i, 'AC Milan'],
  [/olympique.*marseille/i, 'Marseille'],
  [/olympique.*lyon/i, 'Lyon'],
  [/as monaco/i, 'Monaco'],
  [/stade rennais/i, 'Rennes'],
  [/rb leipzig/i, 'RB Leipzig'],
  [/eintracht frankfurt/i, 'Frankfurt'],
];

/**
 * Produces concise, readable club labels for narrow chart X-axes without trailing punctuation.
 */
export function formatShortClubName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '—';

  for (const [pattern, shortName] of CLUB_SHORT_NAME_PATTERNS) {
    if (pattern.test(trimmed)) {
      return shortName;
    }
  }

  let cleaned = trimmed;
  if (cleaned.split(/\s+/).length > 1) {
    cleaned = cleaned.replace(
      /^(FC|CF|AC|AS|SC|SS|SV|US|VfB|VfL|UD|CD|CA|FK|SK|TSG|1\.\s*FC)\s+/i,
      '',
    );
  }
  if (cleaned.split(/\s+/).length > 1) {
    cleaned = cleaned.replace(/\s+(FC|CF|SC|AC|Calcio|04|1899|HSC|United)$/i, '');
  }
  cleaned = cleaned.replace(/[&\s-]+$/g, '').trim() || trimmed;

  return cleaned.length > 10 ? `${cleaned.slice(0, 9).trimEnd()}…` : cleaned;
}

/**
 * Keeps the first entry per unique key while preserving original ordering.
 */
export function deduplicateByKey<T>(items: T[], getKey: (item: T) => string | number): T[] {
  const seen = new Set<string | number>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Formats large ROI axis percentages compactly (e.g. 1200% -> 1.2k%).
 */
export function formatCompactRoiTick(val: number): string {
  return Math.abs(val) >= 1000 ? `${(val / 1000).toFixed(1)}k%` : `${val}%`;
}

/**
 * Appends season (or index) suffixes when multiple chart items share the same short label.
 */
export function disambiguateChartLabels<T extends { shortLabel?: string; season?: number }>(
  items: T[],
): T[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = item.shortLabel ?? '';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return items.map((item, idx) => {
    const key = item.shortLabel ?? '';
    if (!key || (counts.get(key) ?? 0) <= 1) {
      return item;
    }
    const suffix = item.season ? `'${String(item.season).slice(-2)}` : `#${idx + 1}`;
    return {
      ...item,
      shortLabel: `${key} ${suffix}`,
    };
  });
}
