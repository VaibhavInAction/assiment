import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeItem, makePage } from '@/test/fixtures';
import { API, http, HttpResponse, server } from '@/test/msw';
import { renderWithStore } from '@/test/render';
import { FeedSection } from './FeedSection';

const cardTitles = () =>
  screen.getAllByTestId('feed-item').map((item) => within(item).getByRole('heading', { level: 3 }).textContent);

describe('FeedSection (integration)', () => {
  it('waits for saved preferences, then fetches a personalized feed', async () => {
    const requests: URL[] = [];
    server.use(
      http.get(`${API}/feed`, ({ request }) => {
        requests.push(new URL(request.url));
        return HttpResponse.json(makePage([makeItem({ title: 'Personal story' })]));
      }),
    );

    renderWithStore(<FeedSection />, {
      persisted: { preferences: { categories: ['science', 'health'], sources: { news: true, movie: false, social: true } } },
    });

    expect(await screen.findByRole('heading', { name: 'Personal story' })).toBeInTheDocument();
    expect(requests).toHaveLength(1);
    expect(requests[0].searchParams.get('categories')).toBe('science,health');
    expect(requests[0].searchParams.get('sources')).toBe('news,social');
    expect(requests[0].searchParams.get('page')).toBe('1');
  });

  it('shows a loading skeleton and makes no request before hydration', () => {
    renderWithStore(<FeedSection />, { hydrate: false });
    expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThan(0);
  });

  it('shows an empty state when there is no content', async () => {
    renderWithStore(<FeedSection />);
    expect(await screen.findByText('Nothing to show yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open settings' })).toHaveAttribute('href', '/settings');
  });

  it('shows an error with a working retry button', async () => {
    let calls = 0;
    server.use(
      http.get(`${API}/feed`, () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ error: 'boom' }, { status: 500 })
          : HttpResponse.json(makePage([makeItem({ title: 'Recovered' })]));
      }),
    );

    const { user } = renderWithStore(<FeedSection />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: 'Recovered' })).toBeInTheDocument();
  });

  it('loads the next page and appends it', async () => {
    server.use(
      http.get(`${API}/feed`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page'));
        return HttpResponse.json(
          makePage([makeItem({ title: `Page ${page} item` })], { page, hasMore: page < 2 }),
        );
      }),
    );

    const { user } = renderWithStore(<FeedSection />);
    await screen.findByRole('heading', { name: 'Page 1 item' });

    await user.click(screen.getByRole('button', { name: 'Load more' }));
    expect(await screen.findByRole('heading', { name: 'Page 2 item' })).toBeInTheDocument();
    expect(cardTitles()).toEqual(['Page 1 item', 'Page 2 item']);
    expect(screen.getByTestId('end-of-feed')).toHaveTextContent('You are all caught up!');
  });

  it('labels demo data so it is never mistaken for live content', async () => {
    server.use(http.get(`${API}/feed`, () => HttpResponse.json(makePage([makeItem()], { usingMockData: true }))));
    renderWithStore(<FeedSection />);
    expect(await screen.findByTestId('demo-data-badge')).toBeInTheDocument();
  });

  it('reorders cards with the keyboard buttons, saves the order and can reset it', async () => {
    server.use(
      http.get(`${API}/feed`, () =>
        HttpResponse.json(makePage(['First', 'Second', 'Third'].map((title) => makeItem({ title })))),
      ),
    );
    const { user, store } = renderWithStore(<FeedSection />);
    await screen.findByRole('heading', { name: 'First' });

    const firstCard = screen.getAllByTestId('feed-item')[0];
    expect(within(firstCard).getByRole('button', { name: 'Move earlier' })).toBeDisabled();
    await user.click(within(firstCard).getByRole('button', { name: 'Move later' }));

    await waitFor(() => expect(cardTitles()).toEqual(['Second', 'First', 'Third']));
    expect(store.getState().feed.order).toHaveLength(3);
    expect(screen.getByText('Moved “First” to position 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset order' }));
    await waitFor(() => expect(cardTitles()).toEqual(['First', 'Second', 'Third']));
  });

  it('restores a saved order on load', async () => {
    const items = ['a', 'b', 'c'].map((id) => makeItem({ id, title: `Card ${id}` }));
    server.use(http.get(`${API}/feed`, () => HttpResponse.json(makePage(items))));

    renderWithStore(<FeedSection />, { persisted: { feedOrder: ['c', 'a', 'b'] } });
    await screen.findByRole('heading', { name: 'Card a' });
    expect(cardTitles()).toEqual(['Card c', 'Card a', 'Card b']);
  });
});
