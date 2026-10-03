import type { ContentItem } from '@/lib/types';

/** What every content source (news, movies, social) returns to the aggregator. */
export interface SourceResult {
  items: ContentItem[];
  hasMore: boolean;
  usingMockData: boolean;
}

export const EMPTY_SOURCE: SourceResult = { items: [], hasMore: false, usingMockData: false };
