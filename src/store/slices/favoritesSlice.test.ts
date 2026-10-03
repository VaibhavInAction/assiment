import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeStore } from '@/store';
import { hydrateFromStorage } from '@/store/hydrate';
import { makeItem } from '@/test/fixtures';
import {
  clearFavorites,
  removeFavorite,
  selectAllFavorites,
  selectFavoritesCount,
  selectIsFavorite,
  toggleFavorite,
} from './favoritesSlice';

describe('favorites slice', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('toggles an item in and out of favorites', () => {
    const store = makeStore();
    const item = makeItem();

    store.dispatch(toggleFavorite(item));
    expect(selectIsFavorite(store.getState(), item.id)).toBe(true);
    expect(selectAllFavorites(store.getState())[0]).toMatchObject({ ...item, savedAt: expect.any(String) });

    store.dispatch(toggleFavorite(item));
    expect(selectIsFavorite(store.getState(), item.id)).toBe(false);
  });

  it('lists the most recently saved first', () => {
    vi.useFakeTimers();
    const store = makeStore();
    const first = makeItem({ title: 'first' });
    const second = makeItem({ title: 'second' });

    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
    store.dispatch(toggleFavorite(first));
    vi.setSystemTime(new Date('2026-01-01T11:00:00Z'));
    store.dispatch(toggleFavorite(second));

    expect(selectAllFavorites(store.getState()).map((item) => item.title)).toEqual(['second', 'first']);
  });

  it('removes one or all favorites', () => {
    const store = makeStore();
    const [a, b] = [makeItem(), makeItem()];
    store.dispatch(toggleFavorite(a));
    store.dispatch(toggleFavorite(b));

    store.dispatch(removeFavorite(a.id));
    expect(selectFavoritesCount(store.getState())).toBe(1);

    store.dispatch(clearFavorites());
    expect(selectFavoritesCount(store.getState())).toBe(0);
  });

  it('restores favorites from storage', () => {
    const store = makeStore();
    const saved = { ...makeItem(), savedAt: '2026-01-01T00:00:00.000Z' };
    store.dispatch(hydrateFromStorage({ favorites: [saved] }));
    expect(selectAllFavorites(store.getState())).toEqual([saved]);
  });
});
