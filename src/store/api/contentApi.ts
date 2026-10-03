import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Category, ContentFilter, ContentPage, ContentType, TrendingResponse } from '@/lib/types';

export interface FeedArgs {
  categories: Category[];
  sources: ContentType[];
  basedOn?: string;
}

export interface SearchArgs {
  q: string;
  type: ContentFilter;
}

// An absolute base URL keeps fetch happy in non-browser environments (tests).
const baseUrl = typeof window === 'undefined' ? '/api/' : new URL('/api/', window.location.origin).toString();

const nextPage = (lastPage: ContentPage, _allPages: ContentPage[], lastPageParam: number) =>
  lastPage.hasMore ? lastPageParam + 1 : undefined;

/**
 * All content goes through our own Next.js route handlers, which hold the API
 * keys. RTK Query handles caching, request de-duplication and pagination.
 */
export const contentApi = createApi({
  reducerPath: 'contentApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  // Keep pages for 5 minutes so switching sections feels instant.
  keepUnusedDataFor: 300,
  endpoints: (build) => ({
    getFeed: build.infiniteQuery<ContentPage, FeedArgs, number>({
      infiniteQueryOptions: { initialPageParam: 1, getNextPageParam: nextPage },
      query: ({ queryArg, pageParam }) => ({
        url: 'feed',
        params: {
          categories: queryArg.categories.join(','),
          sources: queryArg.sources.join(','),
          page: pageParam,
          ...(queryArg.basedOn ? { basedOn: queryArg.basedOn } : {}),
        },
      }),
    }),
    searchContent: build.infiniteQuery<ContentPage, SearchArgs, number>({
      infiniteQueryOptions: { initialPageParam: 1, getNextPageParam: nextPage },
      query: ({ queryArg, pageParam }) => ({
        url: 'search',
        params: { q: queryArg.q, type: queryArg.type, page: pageParam },
      }),
    }),
    getTrending: build.query<TrendingResponse, Category | 'all'>({
      query: (category) => ({ url: 'trending', params: { category } }),
    }),
  }),
});

export const { useGetFeedInfiniteQuery, useSearchContentInfiniteQuery, useGetTrendingQuery } = contentApi;
