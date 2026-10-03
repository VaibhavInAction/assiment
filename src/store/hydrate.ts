import { createAction } from '@reduxjs/toolkit';
import type { PersistedState } from './persistence';

/**
 * Dispatched once on the client after mount with whatever was saved in
 * localStorage. The server always renders defaults, so restoring state in an
 * effect (instead of at store creation) avoids hydration mismatches.
 */
export const hydrateFromStorage = createAction<PersistedState>('app/hydrateFromStorage');
