import { CATEGORIES, isContentItem, isLanguage, type Theme } from '@/lib/types';
import type { RootState } from './index';
import type { User } from './slices/authSlice';
import type { FavoriteItem } from './slices/favoritesSlice';
import type { PreferencesState } from './slices/preferencesSlice';

export const STORAGE_KEY = 'pulseboard:v1';

/** The subset of Redux state that survives a page reload. */
export interface PersistedState {
  preferences?: Partial<PreferencesState>;
  favorites?: FavoriteItem[];
  feedOrder?: string[];
  user?: User | null;
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    // Accessing localStorage throws when the browser blocks site data.
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizePreferences(value: unknown): Partial<PreferencesState> | undefined {
  if (!isRecord(value)) return undefined;
  const result: Partial<PreferencesState> = {};

  if (Array.isArray(value.categories)) {
    const categories = CATEGORIES.filter((category) => (value.categories as unknown[]).includes(category));
    if (categories.length > 0) result.categories = categories;
  }
  if (value.theme === 'light' || value.theme === 'dark') result.theme = value.theme;
  if (isLanguage(value.language)) result.language = value.language;
  if (typeof value.liveUpdates === 'boolean') result.liveUpdates = value.liveUpdates;
  if (isRecord(value.sources)) {
    const { news, social } = value.sources;
    if (typeof news === 'boolean' && typeof social === 'boolean' && (news || social)) {
      result.sources = { news, social };
    }
  }
  return result;
}

function sanitizeUser(value: unknown): User | null {
  if (!isRecord(value)) return null;
  const { name, email, bio, avatarColor } = value;
  if (typeof name !== 'string' || typeof email !== 'string') return null;
  return {
    name: name.slice(0, 60),
    email: email.slice(0, 120),
    bio: typeof bio === 'string' ? bio.slice(0, 280) : '',
    avatarColor: typeof avatarColor === 'string' && /^#[0-9a-f]{6}$/i.test(avatarColor) ? avatarColor : '#4f46e5',
  };
}

/** Validates anything read from storage: it may be stale, hand-edited or corrupted. */
export function sanitizePersistedState(value: unknown): PersistedState {
  if (!isRecord(value)) return {};
  const state: PersistedState = {};

  const preferences = sanitizePreferences(value.preferences);
  if (preferences) state.preferences = preferences;

  if (Array.isArray(value.favorites)) {
    state.favorites = value.favorites
      .filter((item): item is FavoriteItem => isContentItem(item) && typeof (item as FavoriteItem).savedAt === 'string')
      .slice(0, 500);
  }
  if (Array.isArray(value.feedOrder)) {
    state.feedOrder = value.feedOrder.filter((id): id is string => typeof id === 'string').slice(0, 500);
  }
  if ('user' in value) state.user = sanitizeUser(value.user);
  return state;
}

export function loadPersistedState(storage = getStorage()): PersistedState {
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? sanitizePersistedState(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

export function systemTheme(): Theme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Saved state plus the OS colour scheme for first-time visitors. */
export function readInitialClientState(storage = getStorage()): PersistedState {
  const saved = loadPersistedState(storage);
  return { ...saved, preferences: { theme: systemTheme(), ...saved.preferences } };
}

export function selectPersistedState(state: RootState): PersistedState {
  return {
    preferences: state.preferences,
    favorites: Object.values(state.favorites.entities).filter((item): item is FavoriteItem => Boolean(item)),
    feedOrder: state.feed.order,
    user: state.auth.user,
  };
}

export function savePersistedState(state: PersistedState, storage = getStorage()): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or storage disabled: the app keeps working in memory.
  }
}

export function clearPersistedState(storage = getStorage()): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // Ignore: nothing we can do if storage is unavailable.
  }
}
