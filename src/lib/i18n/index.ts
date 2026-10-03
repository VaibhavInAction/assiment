import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Language } from '@/lib/types';
import en from './locales/en';
import es from './locales/es';
import hi from './locales/hi';

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  es: 'Español',
};

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  es: { translation: es },
} as const;

if (!i18n.isInitialized) {
  // Synchronous init with English: the server always renders English, and the
  // saved language is applied on the client after hydration.
  void i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    initAsync: false,
    interpolation: { escapeValue: false }, // React already escapes output.
  });
}

export default i18n;
