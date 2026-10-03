'use client';

import { MotionConfig } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import i18n from '@/lib/i18n';
import { makeStore } from '@/store';
import { hydrateFromStorage } from '@/store/hydrate';
import { useAppSelector } from '@/store/hooks';
import { readInitialClientState, savePersistedState, selectPersistedState } from '@/store/persistence';
import { selectLanguage, selectTheme } from '@/store/slices/preferencesSlice';
import { selectHydrated } from '@/store/slices/uiSlice';

/** Mirrors theme and language from Redux onto <html> and i18next. */
function PreferenceSync() {
  const theme = useAppSelector(selectTheme);
  const language = useAppSelector(selectLanguage);
  const hydrated = useAppSelector(selectHydrated);

  useEffect(() => {
    // Before hydration the inline script in <head> already set the right theme.
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }, [theme, hydrated]);

  useEffect(() => {
    document.documentElement.lang = language;
    if (i18n.language !== language) void i18n.changeLanguage(language);
  }, [language]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  // One store per browser tab (and per request on the server).
  const [store] = useState(makeStore);

  useEffect(() => {
    store.dispatch(hydrateFromStorage(readInitialClientState()));

    // Saves are debounced; flush on unload so a quick reload never loses the latest change.
    const flush = () => {
      if (store.getState().ui.hydrated) savePersistedState(selectPersistedState(store.getState()));
    };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [store]);

  return (
    <Provider store={store}>
      <MotionConfig reducedMotion="user">
        <PreferenceSync />
        {children}
      </MotionConfig>
    </Provider>
  );
}
