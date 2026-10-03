import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeItem } from '@/test/fixtures';
import { renderWithStore } from '@/test/render';
import { FavoritesSection } from './FavoritesSection';

const saved = (overrides: Parameters<typeof makeItem>[0], savedAt: string) => ({ ...makeItem(overrides), savedAt });

const favorites = [
  saved({ title: 'Saved article' }, '2026-01-03T00:00:00Z'),
  saved({ type: 'movie', title: 'Saved movie' }, '2026-01-02T00:00:00Z'),
  saved({ type: 'social', title: 'Saved post' }, '2026-01-01T00:00:00Z'),
];

describe('FavoritesSection', () => {
  it('shows an empty state with a link back to the feed', () => {
    renderWithStore(<FavoritesSection />);
    expect(screen.getByText('No favorites yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse your feed' })).toHaveAttribute('href', '/');
  });

  it('lists saved items, newest first', () => {
    renderWithStore(<FavoritesSection />, { persisted: { favorites } });
    const headings = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);
    expect(headings).toEqual(['Saved article', 'Saved movie', 'Saved post']);
    expect(screen.getByText('3 saved items')).toBeInTheDocument();
  });

  it('filters by type', async () => {
    const { user } = renderWithStore(<FavoritesSection />, { persisted: { favorites } });
    await user.click(screen.getByRole('button', { name: 'Movies' }));
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Saved article' })).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Saved movie' })).toBeInTheDocument();
  });

  it('removes an item when its heart is toggled off', async () => {
    const { user, store } = renderWithStore(<FavoritesSection />, { persisted: { favorites: favorites.slice(0, 1) } });
    await user.click(screen.getByRole('button', { name: 'Favorite', pressed: true }));
    expect(store.getState().favorites.ids).toEqual([]);
    expect(await screen.findByText('No favorites yet')).toBeInTheDocument();
  });

  it('clears everything after confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { user, store } = renderWithStore(<FavoritesSection />, { persisted: { favorites } });
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(confirm).toHaveBeenCalled();
    expect(store.getState().favorites.ids).toEqual([]);
  });

  it('keeps everything when the confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { user, store } = renderWithStore(<FavoritesSection />, { persisted: { favorites } });
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(store.getState().favorites.ids).toHaveLength(3);
  });
});
