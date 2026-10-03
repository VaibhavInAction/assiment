import { describe, expect, it } from 'vitest';
import { makeStore } from '@/store';
import { hydrateFromStorage } from '@/store/hydrate';
import { makeItem } from '@/test/fixtures';
import {
  liveItemReceived,
  moveFeedItem,
  reorderFeed,
  resetFeedOrder,
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

  it('restores the saved order on hydration', () => {
    const store = makeStore();
    store.dispatch(hydrateFromStorage({ feedOrder: ['x', 'y'] }));
    expect(store.getState().feed.order).toEqual(['x', 'y']);
  });
});
