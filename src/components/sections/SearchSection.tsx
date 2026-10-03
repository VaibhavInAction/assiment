'use client';

import { skipToken } from '@reduxjs/toolkit/query';
import { Search, SearchX } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentGrid } from '@/components/content/ContentGrid';
import { LoadMore } from '@/components/content/LoadMore';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { PageHeader } from '@/components/ui/PageHeader';
import { SkeletonGrid } from '@/components/ui/SkeletonGrid';
import { EmptyState, ErrorState } from '@/components/ui/StatusMessage';
import { dedupeById } from '@/lib/utils';
import { useSearchContentInfiniteQuery } from '@/store/api/contentApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MIN_QUERY_LENGTH, selectSearchFilter, selectSearchQuery, setSearchFilter } from '@/store/slices/searchSlice';

export function SearchSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectSearchQuery);
  const filter = useAppSelector(selectSearchFilter);
  const canSearch = query.length >= MIN_QUERY_LENGTH;

  const { data, isLoading, isError, refetch, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useSearchContentInfiniteQuery(canSearch ? { q: query, type: filter } : skipToken);

  const items = useMemo(() => dedupeById(data?.pages.flatMap((page) => page.items) ?? []), [data]);
  const usingMockData = data?.pages.some((page) => page.usingMockData) ?? false;
  const loadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  const filterOptions = (['all', 'news', 'social'] as const).map((value) => ({
    value,
    label: t(`filters.${value}`),
  }));

  return (
    <section>
      <PageHeader
        icon={Search}
        title={t('search.title')}
        description={canSearch ? t('search.resultsFor', { query }) : t('search.idleBody')}
        actions={usingMockData && <DemoDataBadge />}
      />

      <FilterTabs
        label={t('filters.label')}
        options={filterOptions}
        value={filter}
        onChange={(value) => dispatch(setSearchFilter(value))}
        className="mb-6 w-fit"
      />

      <p aria-live="polite" className="sr-only">
        {canSearch && !isLoading && data ? t('search.resultCount', { count: items.length }) : ''}
      </p>

      <div>
        {!query ? (
          <EmptyState icon={Search} title={t('search.idleTitle')} body={t('search.idleBody')} />
        ) : !canSearch ? (
          <p className="text-sm text-muted-foreground">{t('search.tooShort', { count: MIN_QUERY_LENGTH })}</p>
        ) : isLoading ? (
          <SkeletonGrid count={6} label={t('states.loading')} />
        ) : isError && !data ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : items.length === 0 ? (
          <EmptyState icon={SearchX} title={t('search.noResultsTitle')} body={t('search.noResultsBody', { query })} />
        ) : (
          <>
            <ContentGrid items={items} label={t('search.resultsFor', { query })} />
            <LoadMore
              hasMore={hasNextPage}
              isFetching={isFetchingNextPage}
              isError={isFetchNextPageError}
              onLoadMore={loadMore}
            />
          </>
        )}
      </div>
    </section>
  );
}
