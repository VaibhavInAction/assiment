import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type RootState } from '@/store';
import { hydrateFromStorage } from '@/store/hydrate';
import type { PersistedState } from '@/store/persistence';

interface Options extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  /** State to restore as if it came from localStorage. */
  persisted?: PersistedState;
  /** Set false to render the pre-hydration (server) state. */
  hydrate?: boolean;
}

export function renderWithStore(ui: ReactElement, { preloadedState, persisted = {}, hydrate = true, ...options }: Options = {}) {
  const store = makeStore(preloadedState);
  if (hydrate) store.dispatch(hydrateFromStorage(persisted));
  const user = userEvent.setup();
  const result = render(<Provider store={store}>{ui}</Provider>, options);
  return { store, user, ...result };
}
