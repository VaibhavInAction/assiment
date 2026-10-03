import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { moveId, moveIdBy } from '@/lib/feedOrder';
import type { ContentItem } from '@/lib/types';
import { hydrateFromStorage } from '../hydrate';
import type { RootState } from '../index';
import type { FavoriteItem } from './favoritesSlice';

const MAX_SAVED_ORDER = 500;
const MAX_LIVE_ITEMS = 30;

export interface RecommendationSeed {
  /** TMDB movie id used for "because you liked..." recommendations. */
  id: string;
  title: string;
}

export interface FeedState {
  /** Card ids in the order the user arranged them with drag and drop. */
  order: string[];
  /** Picked once per session so favoriting a movie does not reload the whole feed. */
  recommendationSeed: RecommendationSeed | null;
  /** Live posts the user has chosen to show at the top of the feed. */
  liveItems: ContentItem[];
  /** Live posts received but not shown yet ("3 new posts" banner). */
  pendingLive: ContentItem[];
}

const initialState: FeedState = {
  order: [],
  recommendationSeed: null,
  liveItems: [],
  pendingLive: [],
};

export function seedFromFavorites(favorites: FavoriteItem[] = []): RecommendationSeed | null {
  const latestMovie = [...favorites]
    .filter((item) => item.type === 'movie' && /^movie-\d+$/.test(item.id))
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))[0];
  return latestMovie ? { id: latestMovie.id.replace('movie-', ''), title: latestMovie.title } : null;
}

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    reorderFeed(state, action: PayloadAction<{ visibleIds: string[]; fromId: string; toId: string }>) {
      const { visibleIds, fromId, toId } = action.payload;
      state.order = moveId(visibleIds, fromId, toId).slice(0, MAX_SAVED_ORDER);
    },
    moveFeedItem(state, action: PayloadAction<{ visibleIds: string[]; id: string; delta: number }>) {
      const { visibleIds, id, delta } = action.payload;
      state.order = moveIdBy(visibleIds, id, delta).slice(0, MAX_SAVED_ORDER);
    },
    resetFeedOrder(state) {
      state.order = [];
    },
    liveItemReceived(state, action: PayloadAction<ContentItem>) {
      const item = action.payload;
      const known = [...state.pendingLive, ...state.liveItems].some((existing) => existing.id === item.id);
      if (known) return;
      state.pendingLive = [item, ...state.pendingLive].slice(0, MAX_LIVE_ITEMS);
    },
    showPendingLive(state) {
      state.liveItems = [...state.pendingLive, ...state.liveItems].slice(0, MAX_LIVE_ITEMS);
      state.pendingLive = [];
    },
    setRecommendationSeed(state, action: PayloadAction<RecommendationSeed | null>) {
      state.recommendationSeed = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateFromStorage, (state, action) => {
      state.order = action.payload.feedOrder ?? [];
      state.recommendationSeed = seedFromFavorites(action.payload.favorites);
    });
  },
});

export const {
  reorderFeed,
  moveFeedItem,
  resetFeedOrder,
  liveItemReceived,
  showPendingLive,
  setRecommendationSeed,
} = feedSlice.actions;

export default feedSlice.reducer;

export const selectFeedOrder = (state: RootState) => state.feed.order;
export const selectRecommendationSeed = (state: RootState) => state.feed.recommendationSeed;
export const selectLiveItems = (state: RootState) => state.feed.liveItems;
export const selectPendingLiveCount = (state: RootState) => state.feed.pendingLive.length;
