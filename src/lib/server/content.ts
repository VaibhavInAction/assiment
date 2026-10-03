import 'server-only';
import { getMockSocialPosts, getMockTrendingSocial, searchMockSocialPosts } from '@/lib/mock/social';
import { CATEGORIES, type Category, type ContentFilter, type ContentPage, type ContentType, type TrendingResponse } from '@/lib/types';
import { dedupeById, interleave } from '@/lib/utils';
import { getNews, getTrendingNews } from './news';
import { MAX_PAGES } from './params';
import { EMPTY_SOURCE, type SourceResult } from './sourceResult';

/** How many items each source contributes to one page of the unified feed (9 = three full grid rows). */
export const FEED_PAGE_MIX: Record<ContentType, number> = { news: 5, social: 4 };

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
}

/** One page of the personalized feed: news and social posts mixed together. */
export async function getFeedPage({ categories, sources, page }: FeedOptions): Promise<ContentPage> {
  const news = sources.includes('news')
    ? await getNews({ categories, page, pageSize: FEED_PAGE_MIX.news })
    : EMPTY_SOURCE;
  const social = sources.includes('social')
    ? { ...getMockSocialPosts({ categories, page, pageSize: FEED_PAGE_MIX.social }), usingMockData: false }
    : EMPTY_SOURCE;
  return toPage(page, [news, social]);
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
  const wants = (source: ContentType) => type === 'all' || type === source;

  const news = wants('news') ? await getNews({ categories: [...CATEGORIES], page, pageSize, query }) : EMPTY_SOURCE;
  const social = wants('social')
    ? { ...searchMockSocialPosts({ query, page, pageSize }), usingMockData: false }
    : EMPTY_SOURCE;
  return toPage(page, [news, social]);
}

export async function getTrending(category: Category | 'all'): Promise<TrendingResponse> {
  const limit = 6;
  const news = await getTrendingNews(category, limit);
  const social = getMockTrendingSocial(category === 'all' ? [...CATEGORIES] : [category], limit);
  return { news: news.items, social, usingMockData: news.usingMockData };
}
