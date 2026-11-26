import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { fr } from './locales/fr';

export const LANG_STORAGE_KEY = 'mercatoiq_lang';

const savedLang =
  typeof window !== 'undefined' ? localStorage.getItem(LANG_STORAGE_KEY) : null;

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
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANG_STORAGE_KEY, lng);
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export default i18n;
