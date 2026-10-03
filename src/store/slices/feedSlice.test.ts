import { describe, expect, it } from 'vitest';
import { makeStore } from '@/store';
import { hydrateFromStorage } from '@/store/hydrate';
import { makeItem } from '@/test/fixtures';
import {
  liveItemReceived,
  moveFeedItem,
  reorderFeed,
  resetFeedOrder,
  seedFromFavorites,
  showPendingLive,
} from './feedSlice';

describe('feed slice', () => {
  it('saves the order after a drag and drop', () => {
    const store = makeStore();
    store.dispatch(reorderFeed({ visibleIds: ['a', 'b', 'c'], fromId: 'c', toId: 'a' }));
    expect(store.getState().feed.order).toEqual(['c', 'a', 'b']);

    store.dispatch(resetFeedOrder());
    expect(store.getState().feed.order).toEqual([]);
  });

  it('moves an item with the keyboard buttons', () => {
    const store = makeStore();
    store.dispatch(moveFeedItem({ visibleIds: ['a', 'b', 'c'], id: 'a', delta: 1 }));
    expect(store.getState().feed.order).toEqual(['b', 'a', 'c']);
  });

  it('queues live posts, ignores duplicates and shows them on demand', () => {
    const store = makeStore();
    const post = makeItem({ type: 'social' });

    store.dispatch(liveItemReceived(post));
    store.dispatch(liveItemReceived(post));
    expect(store.getState().feed.pendingLive).toHaveLength(1);
    expect(store.getState().feed.liveItems).toHaveLength(0);

    store.dispatch(showPendingLive());
    expect(store.getState().feed.liveItems).toEqual([post]);
    expect(store.getState().feed.pendingLive).toEqual([]);

    // Already shown, so it is not queued again.
    store.dispatch(liveItemReceived(post));
    expect(store.getState().feed.pendingLive).toHaveLength(0);
  });

  it('caps the number of live posts kept in memory', () => {
    const store = makeStore();
    for (let i = 0; i < 50; i += 1) store.dispatch(liveItemReceived(makeItem({ type: 'social' })));
    expect(store.getState().feed.pendingLive).toHaveLength(30);
  });

  it('picks the latest favorited TMDB movie as the recommendation seed', () => {
    const favorites = [
      { ...makeItem({ id: 'movie-11', type: 'movie', title: 'Older' }), savedAt: '2026-01-01T00:00:00Z' },
      { ...makeItem({ id: 'movie-22', type: 'movie', title: 'Newer' }), savedAt: '2026-02-01T00:00:00Z' },
      { ...makeItem({ id: 'movie-demo-3', type: 'movie', title: 'Demo' }), savedAt: '2026-03-01T00:00:00Z' },
    ];
    expect(seedFromFavorites(favorites)).toEqual({ id: '22', title: 'Newer' });
    expect(seedFromFavorites([])).toBeNull();

    const store = makeStore();
    store.dispatch(hydrateFromStorage({ favorites, feedOrder: ['x'] }));
    expect(store.getState().feed).toMatchObject({ order: ['x'], recommendationSeed: { id: '22' } });
  });
});
