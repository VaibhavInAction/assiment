import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FEED_PAGE_MIX, getFeedPage, getTrending, searchContent } from './content';
import { MAX_PAGES } from './params';

describe('content aggregation (demo mode)', () => {
  beforeEach(() => {
    vi.stubEnv('USE_MOCK_DATA', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('mixes news and social posts in one page', async () => {
    const page = await getFeedPage({ categories: ['technology', 'science'], sources: ['news', 'social'], page: 1 });
    const types = page.items.map((item) => item.type);

    expect(types.slice(0, 4)).toEqual(['news', 'social', 'news', 'social']);
    expect(page.items).toHaveLength(FEED_PAGE_MIX.news + FEED_PAGE_MIX.social);
    expect(page.usingMockData).toBe(true);
    expect(page.hasMore).toBe(true);
  });

  it('only includes the enabled sources', async () => {
    const page = await getFeedPage({ categories: ['sports'], sources: ['social'], page: 1 });
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((item) => item.type === 'social')).toBe(true);
  });

  it('never reports more pages past the hard cap', async () => {
    const page = await getFeedPage({ categories: ['general'], sources: ['social'], page: MAX_PAGES });
    expect(page.hasMore).toBe(false);
  });

  it('searches every source for a query', async () => {
    const result = await searchContent({ query: 'space', type: 'all', page: 1 });
    const types = new Set(result.items.map((item) => item.type));
    expect(types).toEqual(new Set(['news', 'social']));
  });

  it('can search a single type', async () => {
    const result = await searchContent({ query: 'space', type: 'social', page: 1 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((item) => item.type === 'social')).toBe(true);
  });

  it('returns trending groups for a category', async () => {
    const trending = await getTrending('sports');
    expect(trending.news.every((item) => item.category === 'sports')).toBe(true);
    // Social posts are ranked by likes.
    const likes = trending.social.map((item) => item.likes ?? 0);
    expect(likes).toEqual([...likes].sort((a, b) => b - a));
  });
});
