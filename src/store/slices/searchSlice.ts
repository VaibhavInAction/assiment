import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ContentFilter } from '@/lib/types';
import type { RootState } from '../index';

export const MIN_QUERY_LENGTH = 2;

export interface SearchState {
  /** The debounced query; the input keeps its own keystroke-level state. */
  query: string;
  filter: ContentFilter;
}

const initialState: SearchState = { query: '', filter: 'all' };

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload.trim();
    },
    setSearchFilter(state, action: PayloadAction<ContentFilter>) {
      state.filter = action.payload;
    },
  },
});

export const { setQuery, setSearchFilter } = searchSlice.actions;
export default searchSlice.reducer;

export const selectSearchQuery = (state: RootState) => state.search.query;
export const selectSearchFilter = (state: RootState) => state.search.filter;
