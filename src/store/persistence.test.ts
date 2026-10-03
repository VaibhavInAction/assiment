import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeItem } from '@/test/fixtures';
import { makeStore, SAVE_DEBOUNCE_MS } from './index';
import { hydrateFromStorage } from './hydrate';
import { loadPersistedState, sanitizePersistedState, savePersistedState, STORAGE_KEY } from './persistence';
import { login } from './slices/authSlice';
import { toggleFavorite } from './slices/favoritesSlice';
import { toggleCategory, toggleTheme } from './slices/preferencesSlice';

describe('sanitizePersistedState', () => {
  it('drops invalid values and keeps valid ones', () => {
    const state = sanitizePersistedState({
      preferences: {
        categories: ['technology', 'hacking', 42],
        theme: 'purple',
        language: 'hi',
        sources: { news: false, movie: false, social: false },
      },
      favorites: [{ ...makeItem(), savedAt: '2026-01-01' }, { id: 'broken' }, null],
      feedOrder: ['a', 5, 'b'],
      user: { name: 'Ana', email: 'ana@example.com', avatarColor: 'red; background:url(x)' },
    });

    expect(state.preferences).toEqual({ categories: ['technology'], language: 'hi' });
    expect(state.favorites).toHaveLength(1);
    expect(state.feedOrder).toEqual(['a', 'b']);
    expect(state.user).toMatchObject({ name: 'Ana', avatarColor: '#4f46e5', bio: '' });
  });

  it('returns an empty object for non-objects', () => {
    expect(sanitizePersistedState('nope')).toEqual({});
    expect(sanitizePersistedState(null)).toEqual({});
  });
});

describe('loadPersistedState', () => {
  it('survives corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    expect(loadPersistedState()).toEqual({});
  });

  it('round-trips saved state', () => {
    savePersistedState({ feedOrder: ['x', 'y'], preferences: { theme: 'dark' } });
    expect(loadPersistedState()).toEqual({ feedOrder: ['x', 'y'], preferences: { theme: 'dark' } });
  });
});

describe('persistence middleware', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const saved = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');

  it('does not write before hydration, so defaults never overwrite saved data', async () => {
    vi.useFakeTimers();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preferences: { theme: 'dark' } }));
    const store = makeStore();

    store.dispatch(toggleCategory('health'));
    await vi.advanceTimersByTimeAsync(SAVE_DEBOUNCE_MS * 2);

    expect(saved()).toEqual({ preferences: { theme: 'dark' } });
  });

  it('saves preferences, favorites and the user after hydration, debounced', async () => {
    vi.useFakeTimers();
    const store = makeStore();
    store.dispatch(hydrateFromStorage({}));

    store.dispatch(toggleTheme());
    store.dispatch(toggleFavorite(makeItem({ id: 'fav-1' })));
    store.dispatch(login({ name: 'Ana', email: 'ANA@example.com' }));
    expect(saved()).toBeNull();

    await vi.advanceTimersByTimeAsync(SAVE_DEBOUNCE_MS + 10);

    const data = saved();
    expect(data.preferences.theme).toBe('dark');
    expect(data.favorites.map((item: { id: string }) => item.id)).toEqual(['fav-1']);
    expect(data.user).toMatchObject({ name: 'Ana', email: 'ana@example.com' });
    expect(JSON.stringify(data)).not.toMatch(/password/i);
  });
});
