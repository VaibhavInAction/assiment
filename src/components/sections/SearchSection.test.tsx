import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeItem, makePage } from '@/test/fixtures';
import { API, http, HttpResponse, server } from '@/test/msw';
import { renderWithStore } from '@/test/render';
import { SearchSection } from './SearchSection';

const withQuery = (query: string) => ({ preloadedState: { search: { query, filter: 'all' as const } } });

describe('SearchSection (integration)', () => {
  it('invites the user to search when there is no query', () => {
    renderWithStore(<SearchSection />);
    expect(screen.getByText('Find anything')).toBeInTheDocument();
  });

  it('asks for more characters when the query is too short', () => {
    renderWithStore(<SearchSection />, withQuery('a'));
    expect(screen.getByText('Type at least 2 characters to search.')).toBeInTheDocument();
  });

  it('renders results across content types', async () => {
    server.use(
      http.get(`${API}/search`, ({ request }) =>
        new URL(request.url).searchParams.get('q') === 'space'
          ? HttpResponse.json(
              makePage([
                makeItem({ title: 'Space news' }),
                makeItem({ type: 'movie', title: 'Space movie' }),
                makeItem({ type: 'social', title: 'Space post' }),
              ]),
            )
          : HttpResponse.json(makePage([])),
      ),
    );

    renderWithStore(<SearchSection />, withQuery('space'));
    expect(await screen.findByRole('heading', { name: 'Space news' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Space movie' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Space post' })).toBeInTheDocument();
    expect(screen.getByText('3 results')).toBeInTheDocument();
  });

  it('filters by type through Redux and refetches', async () => {
    const types: Array<string | null> = [];
    server.use(
      http.get(`${API}/search`, ({ request }) => {
        const type = new URL(request.url).searchParams.get('type');
        types.push(type);
        return HttpResponse.json(makePage([makeItem({ type: 'movie', title: `Result for ${type}` })]));
      }),
    );

    const { user, store } = renderWithStore(<SearchSection />, withQuery('matrix'));
    await screen.findByRole('heading', { name: 'Result for all' });

    await user.click(screen.getByRole('button', { name: 'Movies' }));
    expect(store.getState().search.filter).toBe('movie');
    expect(await screen.findByRole('heading', { name: 'Result for movie' })).toBeInTheDocument();
    expect(types).toEqual(['all', 'movie']);
  });

  it('shows a helpful empty state when nothing matches', async () => {
    renderWithStore(<SearchSection />, withQuery('zzqx'));
    expect(await screen.findByText('No results found')).toBeInTheDocument();
    expect(screen.getByText(/Nothing matched “zzqx”/)).toBeInTheDocument();
  });

  it('shows an error state when the search API fails', async () => {
    server.use(http.get(`${API}/search`, () => HttpResponse.json({ error: 'down' }, { status: 503 })));
    renderWithStore(<SearchSection />, withQuery('anything'));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
