import { createSlice } from '@reduxjs/toolkit';
import { hydrateFromStorage } from '../hydrate';
import type { RootState } from '../index';

export interface UiState {
  /** False until saved preferences have been restored on the client. */
  hydrated: boolean;
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: { hydrated: false } as UiState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(hydrateFromStorage, (state) => {
      state.hydrated = true;
    });
  },
});

export default uiSlice.reducer;

export const selectHydrated = (state: RootState) => state.ui.hydrated;
