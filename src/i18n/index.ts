import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { fr } from './locales/fr';

import { safeStorageGet, safeStorageSet } from '../shared/utils/storage';

export const LANG_STORAGE_KEY = 'mercatoiq_lang';

const savedLang = safeStorageGet(LANG_STORAGE_KEY);

const initialLang = savedLang === 'fr' ? 'fr' : 'en';

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  safeStorageSet(LANG_STORAGE_KEY, lng);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export default i18n;
