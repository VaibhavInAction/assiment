import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNavigation, mockRouter } from '@/test/navigation';
import { renderWithStore } from '@/test/render';
import { SEARCH_DEBOUNCE_MS, SearchBar } from './SearchBar';

function setup() {
  const result = renderWithStore(<SearchBar />);
  const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
  // Record every distinct committed query to prove keystrokes are batched.
  const committed: string[] = [];
  result.store.subscribe(() => {
    const query = result.store.getState().search.query;
    if (committed.at(-1) !== query) committed.push(query);
  });
  return { ...result, user, committed, input: screen.getByRole('searchbox', { name: /search content/i }) };
}

describe('SearchBar (debounced search)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Testing Library only advances fake timers when it detects a `jest` global.
    vi.stubGlobal('jest', { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('commits the query once, only after typing pauses', async () => {
    const { user, store, committed, input } = setup();

    await user.type(input, 'space');
    expect(input).toHaveValue('space');
    expect(store.getState().search.query).toBe('');

    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1));
    expect(store.getState().search.query).toBe('');

    act(() => vi.advanceTimersByTime(1));
    expect(store.getState().search.query).toBe('space');
    expect(committed).toEqual(['space']);
    expect(mockRouter.push).toHaveBeenCalledWith('/search');
  });

  it('does not navigate for queries shorter than two characters', async () => {
    const { user, input } = setup();
    await user.type(input, 'a');
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('does not navigate again when already on the search page', async () => {
    mockNavigation.pathname = '/search';
    const { user, store, input } = setup();
    await user.type(input, 'matrix');
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(store.getState().search.query).toBe('matrix');
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('searches immediately on Enter, without a later reset from the debounce', async () => {
    const { user, store, committed, input } = setup();
    await user.type(input, 'news{Enter}');
    expect(store.getState().search.query).toBe('news');

    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(store.getState().search.query).toBe('news');
    expect(committed).toEqual(['news']);
  });

  it('clears with Escape and with the clear button', async () => {
    const { user, store, input } = setup();
    await user.type(input, 'cricket{Enter}');
    await user.keyboard('{Escape}');
    expect(input).toHaveValue('');
    expect(store.getState().search.query).toBe('');

    await user.type(input, 'f1');
    await user.click(screen.getByRole('button', { name: /clear search/i }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
  });
});
