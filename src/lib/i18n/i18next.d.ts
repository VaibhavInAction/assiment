import type en from './locales/en';

// Type-checked translation keys: t('feed.titel') is a compile error.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
  }
}
