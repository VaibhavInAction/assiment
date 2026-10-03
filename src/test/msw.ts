import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { TrendingResponse } from '@/lib/types';
import { makePage } from './fixtures';

export const API = 'http://localhost:3000/api';

/** Default handlers return empty data; each test overrides what it needs. */
export const server = setupServer(
  http.get(`${API}/feed`, () => HttpResponse.json(makePage([]))),
  http.get(`${API}/search`, () => HttpResponse.json(makePage([]))),
  http.get(`${API}/trending`, () =>
    HttpResponse.json({ news: [], movies: [], social: [], usingMockData: false } satisfies TrendingResponse),
  ),
);

export { http, HttpResponse };
