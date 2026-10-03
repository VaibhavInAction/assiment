export const CATEGORIES = [
  'technology',
  'business',
  'sports',
  'entertainment',
  'science',
  'health',
  'general',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONTENT_TYPES = ['news', 'movie', 'social'] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

/** Filter used by search and favorites: a single content type or everything. */
export type ContentFilter = 'all' | ContentType;

export const LANGUAGES = ['en', 'hi', 'es'] as const;

export type Language = (typeof LANGUAGES)[number];

export type Theme = 'light' | 'dark';

/** One normalized piece of content, whatever API it came from. */
export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  imageUrl: string | null;
  url: string;
  source: string;
  category: Category;
  publishedAt: string;
  author?: string;
  /** Movies: TMDB vote average out of 10. */
  rating?: number;
  /** Social posts: like count. */
  likes?: number;
  hashtags?: string[];
}

export interface ContentPage {
  items: ContentItem[];
  page: number;
  hasMore: boolean;
  /** True when at least one source fell back to bundled demo data. */
  usingMockData: boolean;
}

export interface TrendingResponse {
  news: ContentItem[];
  movies: ContentItem[];
  social: ContentItem[];
  usingMockData: boolean;
}

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value);
}

export function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && (CONTENT_TYPES as readonly string[]).includes(value);
}

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/** Runtime check for items that arrive from storage or the live stream. */
export function isContentItem(value: unknown): value is ContentItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    isContentType(item.type) &&
    typeof item.title === 'string' &&
    typeof item.url === 'string' &&
    typeof item.publishedAt === 'string' &&
    isCategory(item.category)
  );
}
