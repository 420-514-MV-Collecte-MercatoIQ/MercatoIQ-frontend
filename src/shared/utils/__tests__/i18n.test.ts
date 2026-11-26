import { describe, expect, it } from 'vitest';
import i18n from '../../../i18n';
import { en } from '../../../i18n/locales/en';
import { fr } from '../../../i18n/locales/fr';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, val]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      return flattenKeys(val as Record<string, unknown>, fullKey);
    }
    return [fullKey];
  });
}

describe('i18n EN / FR parity', () => {
  it('has identical translation keys in English and French', () => {
    const enKeys = flattenKeys(en).sort();
    const frKeys = flattenKeys(fr).sort();
    expect(frKeys).toEqual(enKeys);
  });

  it('defaults to English and switches to French cleanly', async () => {
    expect(i18n.language).toBe('en');
    expect(i18n.t('nav.overview')).toBe('Overview');

    await i18n.changeLanguage('fr');
    expect(i18n.language).toBe('fr');
    expect(i18n.t('nav.overview')).toBe('Vue d’ensemble');

    await i18n.changeLanguage('en');
  });
});
