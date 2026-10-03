import type { ContentItem, ContentPage } from '@/lib/types';

let counter = 0;

export function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  counter += 1;
  return {
    id: `news-test-${counter}`,
    type: 'news',
    title: `Test headline ${counter}`,
    description: `Description for item ${counter}`,
    imageUrl: null,
    url: `https://example.com/article/${counter}`,
    source: 'Test Source',
    category: 'technology',
    publishedAt: new Date('2026-01-01T10:00:00Z').toISOString(),
    ...overrides,
  };
}

export function makePage(items: ContentItem[], overrides: Partial<ContentPage> = {}): ContentPage {
  return { items, page: 1, hasMore: false, usingMockData: false, ...overrides };
}
