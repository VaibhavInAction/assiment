import { combineReducers, configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { contentApi } from './api/contentApi';
import { savePersistedState, selectPersistedState } from './persistence';
import auth from './slices/authSlice';
import favorites from './slices/favoritesSlice';
import feed from './slices/feedSlice';
import preferences from './slices/preferencesSlice';
import search from './slices/searchSlice';
import ui from './slices/uiSlice';

export const rootReducer = combineReducers({
  preferences,
  favorites,
  feed,
  auth,
  search,
  ui,
  [contentApi.reducerPath]: contentApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/** Actions whose results must survive a reload. */
const PERSISTED_ACTIONS = [
  'preferences/',
  'favorites/',
  'auth/',
  'feed/reorderFeed',
  'feed/moveFeedItem',
  'feed/resetFeedOrder',
];

export const SAVE_DEBOUNCE_MS = 250;

/** Saves to localStorage after relevant actions, debounced so rapid drags write once. */
function createPersistenceListener() {
  const listener = createListenerMiddleware();
  listener.startListening({
    predicate: (action, currentState) =>
      // Never save before hydration, or defaults would overwrite the user's data.
      (currentState as RootState).ui.hydrated && PERSISTED_ACTIONS.some((prefix) => action.type.startsWith(prefix)),
    effect: async (_action, api) => {
      api.cancelActiveListeners();
      await api.delay(SAVE_DEBOUNCE_MS);
      savePersistedState(selectPersistedState(api.getState() as RootState));
    },
  });
  return listener;
}

export function makeStore(preloadedState?: Partial<RootState>) {
  const persistence = createPersistenceListener();
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(persistence.middleware).concat(contentApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
