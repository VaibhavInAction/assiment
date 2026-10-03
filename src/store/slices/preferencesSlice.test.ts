import { describe, expect, it } from 'vitest';
import { makeStore } from '@/store';
import { hydrateFromStorage } from '@/store/hydrate';
import {
  initialPreferences,
  resetPreferences,
  selectEnabledSources,
  setCategories,
  setLanguage,
  toggleCategory,
  toggleSource,
  toggleTheme,
} from './preferencesSlice';

describe('preferences slice', () => {
  it('starts with sensible defaults', () => {
    expect(makeStore().getState().preferences).toEqual(initialPreferences);
  });

  it('adds and removes categories, keeping a canonical order', () => {
    const store = makeStore();
    store.dispatch(setCategories(['sports']));
    store.dispatch(toggleCategory('technology'));
    expect(store.getState().preferences.categories).toEqual(['technology', 'sports']);

    store.dispatch(toggleCategory('sports'));
    expect(store.getState().preferences.categories).toEqual(['technology']);
  });

  it('never removes the last category', () => {
    const store = makeStore();
    store.dispatch(setCategories(['health']));
    store.dispatch(toggleCategory('health'));
    expect(store.getState().preferences.categories).toEqual(['health']);
  });

  it('ignores an empty category list', () => {
    const store = makeStore();
    store.dispatch(setCategories([]));
    expect(store.getState().preferences.categories).toEqual(initialPreferences.categories);
  });

  it('never disables the last content source', () => {
    const store = makeStore();
    store.dispatch(toggleSource('news'));
    store.dispatch(toggleSource('movie'));
    store.dispatch(toggleSource('social'));
    expect(selectEnabledSources(store.getState())).toEqual(['social']);
  });

  it('toggles theme and sets language', () => {
    const store = makeStore();
    store.dispatch(toggleTheme());
    store.dispatch(setLanguage('hi'));
    expect(store.getState().preferences).toMatchObject({ theme: 'dark', language: 'hi' });
  });

  it('reset keeps the current theme', () => {
    const store = makeStore();
    store.dispatch(toggleTheme());
    store.dispatch(toggleCategory('health'));
    store.dispatch(resetPreferences());
    expect(store.getState().preferences).toEqual({ ...initialPreferences, theme: 'dark' });
  });

  it('merges saved preferences on hydration', () => {
    const store = makeStore();
    store.dispatch(
      hydrateFromStorage({ preferences: { categories: ['science', 'business'], sources: { news: false, movie: true, social: true } } }),
    );
    const { preferences } = store.getState();
    expect(preferences.categories).toEqual(['business', 'science']);
    expect(preferences.sources).toEqual({ news: false, movie: true, social: true });
    expect(preferences.language).toBe('en');
  });
});
