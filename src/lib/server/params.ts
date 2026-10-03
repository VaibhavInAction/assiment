import { CATEGORIES, CONTENT_TYPES, isCategory, isContentType, type Category, type ContentFilter, type ContentType } from '@/lib/types';

/** Hard cap so a client cannot page forever (and burn API quota). */
export const MAX_PAGES = 10;
const MAX_QUERY_LENGTH = 100;
const DEFAULT_CATEGORIES: Category[] = ['general'];

export function parsePage(value: string | null): number {
  const page = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, MAX_PAGES);
}

/** Comma-separated list -> unique, valid categories in canonical order. */
export function parseCategories(value: string | null): Category[] {
  const requested = new Set((value ?? '').split(',').map((part) => part.trim().toLowerCase()));
  const categories = CATEGORIES.filter((category) => requested.has(category));
  return categories.length > 0 ? categories : DEFAULT_CATEGORIES;
}

export function parseSources(value: string | null): ContentType[] {
  if (value === null) return [...CONTENT_TYPES];
  const requested = new Set(value.split(',').map((part) => part.trim()));
  const sources = CONTENT_TYPES.filter((type) => requested.has(type));
  return sources.length > 0 ? sources : [...CONTENT_TYPES];
}

export function parseQuery(value: string | null): string {
  return (value ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY_LENGTH);
}

export function parseFilter(value: string | null): ContentFilter {
  return isContentType(value) ? value : 'all';
}

export function parseCategoryOrAll(value: string | null): Category | 'all' {
  return isCategory(value) ? value : 'all';
}
