import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { hashString } from '@/lib/utils';
import { hydrateFromStorage } from '../hydrate';
import type { RootState } from '../index';

/**
 * Mock authentication (a bonus feature). Only a display profile is stored:
 * passwords are validated in the form and never kept in state or storage.
 */
export interface User {
  name: string;
  email: string;
  bio: string;
  avatarColor: string;
}

export interface AuthState {
  user: User | null;
}

export const AVATAR_COLORS = ['#4338ca', '#0e7490', '#be185d', '#c2410c', '#15803d', '#6d28d9'] as const;

function avatarColorFor(email: string): string {
  return AVATAR_COLORS[parseInt(hashString(email.toLowerCase()), 36) % AVATAR_COLORS.length];
}

const initialState: AuthState = { user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ name: string; email: string }>) {
      const { name, email } = action.payload;
      state.user = { name: name.trim(), email: email.trim().toLowerCase(), bio: '', avatarColor: avatarColorFor(email) };
    },
    logout(state) {
      state.user = null;
    },
    updateProfile(state, action: PayloadAction<Partial<Pick<User, 'name' | 'bio' | 'avatarColor'>>>) {
      if (state.user) Object.assign(state.user, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateFromStorage, (state, action) => {
      state.user = action.payload.user ?? null;
    });
  },
});

export const { login, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;

export const selectUser = (state: RootState) => state.auth.user;
