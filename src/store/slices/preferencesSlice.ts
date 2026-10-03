import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { CATEGORIES, CONTENT_TYPES, type Category, type ContentType, type Language, type Theme } from '@/lib/types';
import { hydrateFromStorage } from '../hydrate';
import type { RootState } from '../index';

export interface PreferencesState {
  categories: Category[];
  theme: Theme;
  language: Language;
  /** Which content sources appear in the unified feed. */
  sources: Record<ContentType, boolean>;
  liveUpdates: boolean;
}

export const initialPreferences: PreferencesState = {
  categories: ['technology', 'business', 'sports'],
  theme: 'light',
  language: 'en',
  sources: { news: true, social: true },
  liveUpdates: true,
};

/** Keeps categories in one canonical order so equal selections share a cache entry. */
function canonical(categories: Category[]): Category[] {
  return CATEGORIES.filter((category) => categories.includes(category));
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: initialPreferences,
  reducers: {
    toggleCategory(state, action: PayloadAction<Category>) {
      const category = action.payload;
      if (state.categories.includes(category)) {
        // The feed needs at least one category to personalize against.
        if (state.categories.length > 1) {
          state.categories = state.categories.filter((item) => item !== category);
        }
      } else {
        state.categories = canonical([...state.categories, category]);
      }
    },
    setCategories(state, action: PayloadAction<Category[]>) {
      const next = canonical(action.payload);
      if (next.length > 0) state.categories = next;
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    toggleSource(state, action: PayloadAction<ContentType>) {
      const type = action.payload;
      const enabledCount = CONTENT_TYPES.filter((item) => state.sources[item]).length;
      // Never allow switching off the last source, or the feed would be empty.
      if (state.sources[type] && enabledCount === 1) return;
      state.sources[type] = !state.sources[type];
    },
    setLiveUpdates(state, action: PayloadAction<boolean>) {
      state.liveUpdates = action.payload;
    },
    resetPreferences(state) {
      return { ...initialPreferences, theme: state.theme };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateFromStorage, (state, action) => {
      const saved = action.payload.preferences;
      if (!saved) return;
      return {
        ...state,
        ...saved,
        sources: { ...state.sources, ...saved.sources },
        categories: saved.categories?.length ? canonical(saved.categories) : state.categories,
      };
    });
  },
});

export const {
  toggleCategory,
  setCategories,
  setTheme,
  toggleTheme,
  setLanguage,
  toggleSource,
  setLiveUpdates,
  resetPreferences,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;

export const selectPreferences = (state: RootState) => state.preferences;
export const selectCategories = (state: RootState) => state.preferences.categories;
export const selectTheme = (state: RootState) => state.preferences.theme;
export const selectLanguage = (state: RootState) => state.preferences.language;
export const selectLiveUpdates = (state: RootState) => state.preferences.liveUpdates;
export const selectEnabledSources = createSelector(
  [(state: RootState) => state.preferences.sources],
  (sources) => CONTENT_TYPES.filter((type) => sources[type]),
);
