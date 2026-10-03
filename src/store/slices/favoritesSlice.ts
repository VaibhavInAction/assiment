import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ContentItem } from '@/lib/types';
import { hydrateFromStorage } from '../hydrate';
import type { RootState } from '../index';

export interface FavoriteItem extends ContentItem {
  savedAt: string;
}

/** Favorites keep the full item so the Favorites page works offline and without refetching. */
const favoritesAdapter = createEntityAdapter<FavoriteItem>({
  sortComparer: (a, b) => b.savedAt.localeCompare(a.savedAt),
});

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: favoritesAdapter.getInitialState(),
  reducers: {
    toggleFavorite: {
      reducer(state, action: PayloadAction<FavoriteItem>) {
        if (state.entities[action.payload.id]) {
          favoritesAdapter.removeOne(state, action.payload.id);
        } else {
          favoritesAdapter.addOne(state, action.payload);
        }
      },
      prepare(item: ContentItem) {
        return { payload: { ...item, savedAt: new Date().toISOString() } };
      },
    },
    removeFavorite: favoritesAdapter.removeOne,
    clearFavorites: favoritesAdapter.removeAll,
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateFromStorage, (state, action) => {
      if (action.payload.favorites) favoritesAdapter.setAll(state, action.payload.favorites);
    });
  },
});

export const { toggleFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;

export const {
  selectAll: selectAllFavorites,
  selectTotal: selectFavoritesCount,
  selectById: selectFavoriteById,
} = favoritesAdapter.getSelectors((state: RootState) => state.favorites);

export const selectIsFavorite = (state: RootState, id: string) => Boolean(state.favorites.entities[id]);
