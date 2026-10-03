import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getNews, normalizeArticle } from './news';

const article = {
  source: { id: null, name: 'The Daily Test' },
  author: 'Ada',
  title: 'A real headline',
  description: 'Something happened',
  url: 'https://news.example.com/story',
  urlToImage: 'https://news.example.com/image.jpg',
  publishedAt: '2026-06-15T10:00:00Z',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('normalizeArticle', () => {
  it('maps a NewsAPI article to a content item', () => {
    expect(normalizeArticle(article, 'technology')).toMatchObject({
      type: 'news',
      title: 'A real headline',
      source: 'The Daily Test',
      category: 'technology',
      imageUrl: 'https://news.example.com/image.jpg',
    });
  });

  it('drops removed articles and unsafe URLs', () => {
    expect(normalizeArticle({ ...article, title: '[Removed]' }, 'general')).toBeNull();
    expect(normalizeArticle({ ...article, url: 'javascript:alert(1)' }, 'general')).toBeNull();
    expect(normalizeArticle({ ...article, urlToImage: 'javascript:x' }, 'general')?.imageUrl).toBeNull();
  });
});

describe('getNews', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    fetchMock.mockReset();
  });

  it('uses demo data without calling the API when no key is configured', async () => {
    vi.stubEnv('NEWS_API_KEY', '');
    const result = await getNews({ categories: ['science'], page: 1, pageSize: 3 });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.usingMockData).toBe(true);
    expect(result.items).toHaveLength(3);
  });

  it('calls NewsAPI with the key in a header, never in the URL', async () => {
    vi.stubEnv('NEWS_API_KEY', 'secret-key');
    vi.stubEnv('USE_MOCK_DATA', 'false');
    fetchMock.mockResolvedValue(jsonResponse({ status: 'ok', totalResults: 30, articles: [article] }));

    const result = await getNews({ categories: ['technology'], page: 1, pageSize: 4 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('top-headlines');
    expect(url).toContain('category=technology');
    expect(url).not.toContain('secret-key');
    expect(init.headers['X-Api-Key']).toBe('secret-key');
    expect(result).toMatchObject({ usingMockData: false, hasMore: true });
    expect(result.items[0].title).toBe('A real headline');
  });

  it('falls back to demo data when the API fails', async () => {
    vi.stubEnv('NEWS_API_KEY', 'secret-key');
    vi.stubEnv('USE_MOCK_DATA', 'false');
    fetchMock.mockResolvedValue(jsonResponse({ status: 'error', message: 'rateLimited' }, 429));

    const result = await getNews({ categories: ['sports'], page: 1, pageSize: 2 });
    expect(result.usingMockData).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);
    expect(console.warn).toHaveBeenCalled();
  });
});
