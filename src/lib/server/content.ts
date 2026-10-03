import 'server-only';
import { getMockSocialPosts, getMockTrendingSocial, searchMockSocialPosts } from '@/lib/mock/social';
import { CATEGORIES, type Category, type ContentFilter, type ContentPage, type ContentType, type TrendingResponse } from '@/lib/types';
import { dedupeById, interleave } from '@/lib/utils';
import { getMovies, getTrendingMovies } from './movies';
import { getNews, getTrendingNews } from './news';
import { MAX_PAGES } from './params';
import { EMPTY_SOURCE, type SourceResult } from './sourceResult';

/** How many items each source contributes to one page of the unified feed. */
export const FEED_PAGE_MIX: Record<ContentType, number> = { news: 4, movie: 3, social: 3 };

function toPage(page: number, results: SourceResult[]): ContentPage {
  const used = results.filter((result) => result !== EMPTY_SOURCE);
  return {
    items: dedupeById(interleave(...results.map((result) => result.items))),
    page,
    hasMore: page < MAX_PAGES && results.some((result) => result.hasMore),
    usingMockData: used.some((result) => result.usingMockData),
  };
}

export interface FeedOptions {
  categories: Category[];
  sources: ContentType[];
  page: number;
  basedOn?: string;
}

/** One page of the personalized feed: news, movies and social posts mixed together. */
export async function getFeedPage({ categories, sources, page, basedOn }: FeedOptions): Promise<ContentPage> {
  const [news, movies, social] = await Promise.all([
    sources.includes('news')
      ? getNews({ categories, page, pageSize: FEED_PAGE_MIX.news })
      : EMPTY_SOURCE,
    sources.includes('movie')
      ? getMovies({ categories, page, pageSize: FEED_PAGE_MIX.movie, basedOn })
      : EMPTY_SOURCE,
    sources.includes('social')
      ? { ...getMockSocialPosts({ categories, page, pageSize: FEED_PAGE_MIX.social }), usingMockData: false }
      : EMPTY_SOURCE,
  ]);
  return toPage(page, [news, movies, social]);
}

export interface SearchOptions {
  query: string;
  type: ContentFilter;
  page: number;
}

/** Searches across every source, or a single one when `type` is set. */
export async function searchContent({ query, type, page }: SearchOptions): Promise<ContentPage> {
  // Searching one type returns a full page of it; "all" mixes a few of each.
  const pageSize = type === 'all' ? 6 : 18;
  const allCategories = [...CATEGORIES];
  const wants = (source: ContentType) => type === 'all' || type === source;

  const [news, movies, social] = await Promise.all([
    wants('news') ? getNews({ categories: allCategories, page, pageSize, query }) : EMPTY_SOURCE,
    wants('movie') ? getMovies({ categories: allCategories, page, pageSize, query }) : EMPTY_SOURCE,
    wants('social')
      ? { ...searchMockSocialPosts({ query, page, pageSize }), usingMockData: false }
      : EMPTY_SOURCE,
  ]);
  return toPage(page, [news, movies, social]);
}

export async function getTrending(category: Category | 'all'): Promise<TrendingResponse> {
  const limit = 6;
  const [news, movies] = await Promise.all([getTrendingNews(category, limit), getTrendingMovies(limit)]);
  const social = getMockTrendingSocial(category === 'all' ? [...CATEGORIES] : [category], limit);
  return {
    news: news.items,
    movies: movies.items,
    social,
    usingMockData: news.usingMockData || movies.usingMockData,
  };
}
