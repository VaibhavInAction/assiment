import { describe, expect, it } from 'vitest';
import { createLivePost, getMockSocialPosts, searchMockSocialPosts, socialPoolSize } from './social';

const NOW = new Date('2026-06-15T12:00:00Z').getTime();

describe('mock social API', () => {
  it('is deterministic for the same request', () => {
    const first = getMockSocialPosts({ categories: ['technology'], page: 1, pageSize: 3, now: NOW });
    const second = getMockSocialPosts({ categories: ['technology'], page: 1, pageSize: 3, now: NOW });
    expect(second).toEqual(first);
  });

  it('pages through every post without repeating, then stops', () => {
    const categories = ['technology', 'sports'] as const;
    const total = socialPoolSize([...categories]);
    const seen = new Set<string>();
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const result = getMockSocialPosts({ categories: [...categories], page, pageSize: 5, now: NOW });
      result.items.forEach((item) => seen.add(item.id));
      hasMore = result.hasMore;
      page += 1;
    }
    expect(seen.size).toBe(total);
  });

  it('only returns posts from the requested categories', () => {
    const { items } = getMockSocialPosts({ categories: ['health'], page: 1, pageSize: 4, now: NOW });
    expect(items.every((item) => item.category === 'health' && item.type === 'social')).toBe(true);
  });

  it('searches text and hashtags case-insensitively', () => {
    const { items } = searchMockSocialPosts({ query: 'VENUS', page: 1, pageSize: 10, now: NOW });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => /venus/i.test(item.title) || item.hashtags?.some((tag) => /venus/i.test(tag)))).toBe(true);
  });

  it('creates unique live posts', () => {
    const a = createLivePost(['science'], NOW);
    const b = createLivePost(['science'], NOW);
    expect(a.id).not.toBe(b.id);
    expect(a.category).toBe('science');
  });
});
