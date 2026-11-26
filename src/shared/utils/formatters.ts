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
 * Formats ROI or ratio values.
 * Note: Backend `roi` values may be stored as ratio (e.g., 0.42 = +42%) or percentage depending
 * on pipeline output. If |value| <= 10 we treat as decimal ratio (x100%), otherwise direct percentage.
 */
export function formatRoiPercent(value: number | null | undefined, lang = 'en'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const pct = Math.abs(value) <= 10 ? value * 100 : value;
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
