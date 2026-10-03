import 'server-only';
import { getMockMovies, getMockTrendingMovies } from '@/lib/mock/movies';
import type { Category, ContentItem } from '@/lib/types';
import { fetchJson, isMockMode, logFallback } from './http';
import type { SourceResult } from './sourceResult';

const TMDB_API = 'https://api.themoviedb.org/3';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w780';
/** TMDB serves at most 500 pages for any list. */
const TMDB_MAX_PAGES = 500;

/** Maps dashboard categories to TMDB genre ids so movie picks follow the user's interests. */
export const CATEGORY_GENRES: Record<Category, number[]> = {
  technology: [878], // Science Fiction
  business: [80, 18], // Crime, Drama
  sports: [18, 36], // Drama, History
  entertainment: [35, 16, 10751], // Comedy, Animation, Family
  science: [99, 878], // Documentary, Science Fiction
  health: [99, 18], // Documentary, Drama
  general: [28, 12], // Action, Adventure
};

interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  release_date?: string;
  vote_average: number;
  genre_ids?: number[];
}

interface TmdbListResponse {
  page: number;
  total_pages: number;
  results: TmdbMovie[];
}

function categoryForGenres(genreIds: number[] = [], preferred: Category[]): Category {
  const match = preferred.find((category) => CATEGORY_GENRES[category].some((genre) => genreIds.includes(genre)));
  return match ?? 'entertainment';
}

export function normalizeMovie(movie: TmdbMovie, preferred: Category[] = []): ContentItem {
  const image = movie.backdrop_path ?? movie.poster_path;
  const released = movie.release_date ? new Date(movie.release_date) : null;
  return {
    id: `movie-${movie.id}`,
    type: 'movie',
    title: movie.title,
    description: movie.overview,
    imageUrl: image ? `${TMDB_IMAGE}${image}` : null,
    url: `https://www.themoviedb.org/movie/${movie.id}`,
    source: 'TMDB',
    category: categoryForGenres(movie.genre_ids, preferred),
    publishedAt: released && !Number.isNaN(released.getTime()) ? released.toISOString() : new Date(0).toISOString(),
    rating: Math.round(movie.vote_average * 10) / 10,
  };
}

async function requestTmdb(path: string, params: Record<string, string | number>): Promise<TmdbListResponse> {
  const key = process.env.TMDB_API_KEY ?? '';
  const url = new URL(`${TMDB_API}${path}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));

  // Supports both a v4 "Read Access Token" (a JWT) and a classic v3 API key.
  const headers: Record<string, string> = {};
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
  else url.searchParams.set('api_key', key);

  return fetchJson<TmdbListResponse>(url.toString(), { headers });
}

export interface MovieOptions {
  categories: Category[];
  page: number;
  pageSize: number;
  query?: string;
  /** TMDB id of a movie the user liked; recommendations are based on it. */
  basedOn?: string;
}

export async function getMovies(options: MovieOptions): Promise<SourceResult> {
  const { categories, page, pageSize, query, basedOn } = options;
  if (!process.env.TMDB_API_KEY || isMockMode()) {
    return { ...getMockMovies(options), usingMockData: true };
  }

  try {
    const common = { language: 'en-US', include_adult: 'false', page };
    let data: TmdbListResponse;
    if (query) {
      data = await requestTmdb('/search/movie', { ...common, query });
    } else if (basedOn) {
      data = await requestTmdb(`/movie/${basedOn}/recommendations`, common);
      // A movie with no recommendations falls back to genre-based discovery.
      if (data.results.length === 0) data = await discover(categories, page);
    } else {
      data = await discover(categories, page);
    }

    const items = data.results.slice(0, pageSize).map((movie) => normalizeMovie(movie, categories));
    const hasMore = data.page < Math.min(data.total_pages, TMDB_MAX_PAGES);
    return { items, hasMore, usingMockData: false };
  } catch (error) {
    logFallback('movies', error);
    return { ...getMockMovies(options), usingMockData: true };
  }
}

function discover(categories: Category[], page: number) {
  const genres = [...new Set(categories.flatMap((category) => CATEGORY_GENRES[category]))];
  return requestTmdb('/discover/movie', {
    language: 'en-US',
    include_adult: 'false',
    sort_by: 'popularity.desc',
    'vote_count.gte': 200,
    // A pipe means OR in TMDB: movies in any of the user's genres.
    with_genres: genres.join('|'),
    page,
  });
}

export async function getTrendingMovies(limit: number): Promise<SourceResult> {
  const fallback = (): SourceResult => ({ items: getMockTrendingMovies(limit), hasMore: false, usingMockData: true });
  if (!process.env.TMDB_API_KEY || isMockMode()) return fallback();

  try {
    const data = await requestTmdb('/trending/movie/week', { language: 'en-US' });
    return { items: data.results.slice(0, limit).map((movie) => normalizeMovie(movie)), hasMore: false, usingMockData: false };
  } catch (error) {
    logFallback('movies', error);
    return fallback();
  }
}
