import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContentPage, TrendingResponse } from '@/lib/types';
import { GET as getFeed } from './feed/route';
import { GET as getSearch } from './search/route';
import { GET as getTrending } from './trending/route';

const request = (path: string) => new NextRequest(new URL(path, 'http://localhost:3000'));

describe('API route handlers', () => {
  beforeEach(() => {
    vi.stubEnv('USE_MOCK_DATA', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('GET /api/feed returns a page of mixed content', async () => {
    const response = await getFeed(request('/api/feed?categories=technology&page=1'));
    const body = (await response.json()) as ContentPage;

    expect(response.status).toBe(200);
    expect(body.page).toBe(1);
    expect(body.items.length).toBeGreaterThan(0);
  });

  it('GET /api/feed tolerates hostile parameters', async () => {
    const response = await getFeed(request('/api/feed?categories=%3Cscript%3E&page=-1&sources=x&basedOn=..%2F'));
    expect(response.status).toBe(200);
  });

  it('GET /api/search rejects queries shorter than two characters', async () => {
    const response = await getSearch(request('/api/search?q=a'));
    expect(response.status).toBe(400);
  });

  it('GET /api/search returns matching results', async () => {
    const response = await getSearch(request('/api/search?q=matrix&type=movie'));
    const body = (await response.json()) as ContentPage;
    expect(body.items[0].title).toBe('The Matrix');
  });

  it('GET /api/trending returns all three groups', async () => {
    const response = await getTrending(request('/api/trending?category=all'));
    const body = (await response.json()) as TrendingResponse;
    expect(body.news.length).toBeGreaterThan(0);
    expect(body.movies.length).toBeGreaterThan(0);
    expect(body.social.length).toBeGreaterThan(0);
  });
});
