import 'server-only';
import { getMockNews, getMockNewsByCategory } from '@/lib/mock/news';
import type { Category, ContentItem } from '@/lib/types';
import { dedupeById, hashString } from '@/lib/utils';
import { fetchJson, logFallback, isMockMode } from './http';
import type { SourceResult } from './sourceResult';

const NEWS_API = 'https://newsapi.org/v2';
/** The NewsAPI free plan never returns more than 100 results per query. */
const MAX_RESULTS = 100;

interface NewsApiArticle {
  source: { id: string | null; name: string | null } | null;
  author: string | null;
  title: string | null;
  description: string | null;
  url: string | null;
  urlToImage: string | null;
  publishedAt: string | null;
}

interface NewsApiResponse {
  status: 'ok' | 'error';
  totalResults?: number;
  articles?: NewsApiArticle[];
  message?: string;
}

export function normalizeArticle(article: NewsApiArticle, category: Category): ContentItem | null {
  // NewsAPI replaces deleted articles with "[Removed]" placeholders.
  if (!article.title || article.title === '[Removed]' || !article.url) return null;
  if (!/^https?:\/\//.test(article.url)) return null;

  return {
    id: `news-${hashString(article.url)}`,
    type: 'news',
    title: article.title,
    description: article.description ?? '',
    imageUrl: article.urlToImage && /^https?:\/\//.test(article.urlToImage) ? article.urlToImage : null,
    url: article.url,
    source: article.source?.name ?? 'News',
    category,
    publishedAt: article.publishedAt ?? new Date().toISOString(),
    author: article.author ?? undefined,
  };
}

async function requestNews(path: string, params: Record<string, string | number>): Promise<NewsApiResponse> {
  const url = new URL(`${NEWS_API}/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  // The key travels in a header, not the URL, so it never appears in logs.
  const data = await fetchJson<NewsApiResponse>(url.toString(), {
    headers: { 'X-Api-Key': process.env.NEWS_API_KEY ?? '' },
  });
  if (data.status !== 'ok') throw new Error(data.message ?? 'NewsAPI returned an error');
  return data;
}

function hasMoreResults(total: number | undefined, page: number, pageSize: number): boolean {
  return page * pageSize < Math.min(total ?? 0, MAX_RESULTS);
}

export interface NewsOptions {
  categories: Category[];
  page: number;
  pageSize: number;
  query?: string;
}

/** Latest headlines for the given categories, or articles matching `query`. */
export async function getNews(options: NewsOptions): Promise<SourceResult> {
  const { categories, page, pageSize, query } = options;
  if (!process.env.NEWS_API_KEY || isMockMode()) {
    return { ...getMockNews(options), usingMockData: true };
  }

  try {
    if (query) {
      const data = await requestNews('everything', {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        searchIn: 'title,description',
        page,
        pageSize,
      });
      const items = (data.articles ?? [])
        .map((article) => normalizeArticle(article, 'general'))
        .filter((item): item is ContentItem => item !== null);
      return { items: dedupeById(items), hasMore: hasMoreResults(data.totalResults, page, pageSize), usingMockData: false };
    }

    // top-headlines accepts one category per request, so fetch them in parallel.
    const perCategory = Math.max(1, Math.ceil(pageSize / categories.length));
    const responses = await Promise.all(
      categories.map((category) =>
        requestNews('top-headlines', { country: 'us', category, page, pageSize: perCategory }).then((data) => ({
          category,
          data,
        })),
      ),
    );
    const items = responses
      .flatMap(({ category, data }) =>
        (data.articles ?? []).map((article) => normalizeArticle(article, category)),
      )
      .filter((item): item is ContentItem => item !== null)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    const hasMore = responses.some(({ data }) => hasMoreResults(data.totalResults, page, perCategory));

    if (items.length === 0 && page === 1) throw new Error('NewsAPI returned no articles');
    return { items: dedupeById(items), hasMore, usingMockData: false };
  } catch (error) {
    logFallback('news', error);
    return { ...getMockNews(options), usingMockData: true };
  }
}

export async function getTrendingNews(category: Category | 'all', limit: number): Promise<SourceResult> {
  const fallback = (): SourceResult => ({
    items: (category === 'all'
      ? (['general', 'technology', 'sports'] as Category[]).flatMap((c) => getMockNewsByCategory(c).slice(0, 2))
      : getMockNewsByCategory(category)
    ).slice(0, limit),
    hasMore: false,
    usingMockData: true,
  });
  if (!process.env.NEWS_API_KEY || isMockMode()) return fallback();

  try {
    const params: Record<string, string | number> = { country: 'us', pageSize: limit };
    if (category !== 'all') params.category = category;
    const data = await requestNews('top-headlines', params);
    const items = (data.articles ?? [])
      .map((article) => normalizeArticle(article, category === 'all' ? 'general' : category))
      .filter((item): item is ContentItem => item !== null);
    if (items.length === 0) throw new Error('NewsAPI returned no articles');
    return { items: dedupeById(items).slice(0, limit), hasMore: false, usingMockData: false };
  } catch (error) {
    logFallback('news', error);
    return fallback();
  }
}
