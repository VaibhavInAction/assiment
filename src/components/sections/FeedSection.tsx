'use client';

import { skipToken } from '@reduxjs/toolkit/query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, GripVertical, LayoutDashboard, Radio, RotateCcw, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadMore } from '@/components/content/LoadMore';
import { SortableFeedGrid } from '@/components/content/SortableFeedGrid';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { SkeletonGrid } from '@/components/ui/SkeletonGrid';
import { EmptyState, ErrorState } from '@/components/ui/StatusMessage';
import { useLiveSocialFeed } from '@/hooks/useLiveSocialFeed';
import { applyCustomOrder, moveId, moveIdBy } from '@/lib/feedOrder';
import { dedupeById } from '@/lib/utils';
import { useGetFeedInfiniteQuery } from '@/store/api/contentApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  moveFeedItem,
  reorderFeed,
  resetFeedOrder,
  selectFeedOrder,
  selectLiveItems,
  selectPendingLiveCount,
  showPendingLive,
} from '@/store/slices/feedSlice';
import { selectCategories, selectEnabledSources, selectLiveUpdates } from '@/store/slices/preferencesSlice';
import { selectHydrated } from '@/store/slices/uiSlice';

export function FeedSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector(selectHydrated);
  const categories = useAppSelector(selectCategories);
  const sources = useAppSelector(selectEnabledSources);
  const order = useAppSelector(selectFeedOrder);
  const liveItems = useAppSelector(selectLiveItems);
  const pendingCount = useAppSelector(selectPendingLiveCount);
  const liveUpdates = useAppSelector(selectLiveUpdates);
  const [announcement, setAnnouncement] = useState('');

  const socialEnabled = sources.includes('social');
  const liveActive = hydrated && liveUpdates && socialEnabled;
  useLiveSocialFeed(liveActive, categories);

  // Wait for saved preferences before fetching, so the first request is already personalized.
  const { data, isLoading, isError, refetch, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } =
    useGetFeedInfiniteQuery(hydrated ? { categories, sources } : skipToken);

  const items = useMemo(() => {
    const fetched = data?.pages.flatMap((page) => page.items) ?? [];
    const merged = dedupeById([...(socialEnabled ? liveItems : []), ...fetched]);
    return applyCustomOrder(merged, order);
  }, [data, liveItems, socialEnabled, order]);

  const visibleIds = useMemo(() => items.map((item) => item.id), [items]);
  const usingMockData = data?.pages.some((page) => page.usingMockData) ?? false;

  const announceMove = useCallback(
    (nextIds: string[], id: string) => {
      const title = items.find((item) => item.id === id)?.title ?? '';
      setAnnouncement(t('feed.moved', { title, position: nextIds.indexOf(id) + 1 }));
    },
    [items, t],
  );

  const handleReorder = useCallback(
    (fromId: string, toId: string) => {
      dispatch(reorderFeed({ visibleIds, fromId, toId }));
      announceMove(moveId(visibleIds, fromId, toId), fromId);
    },
    [dispatch, visibleIds, announceMove],
  );

  const handleMoveBy = useCallback(
    (id: string, delta: number) => {
      dispatch(moveFeedItem({ visibleIds, id, delta }));
      announceMove(moveIdBy(visibleIds, id, delta), id);
    },
    [dispatch, visibleIds, announceMove],
  );

  const showNewPosts = () => {
    dispatch(showPendingLive());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  return (
    <section>
      <PageHeader
        icon={LayoutDashboard}
        title={t('feed.title')}
        description={
          <div className="space-y-2">
            <p>{t('feed.subtitle')}</p>
            <ul className="flex flex-wrap gap-1.5" aria-label={t('nav.yourTopics')}>
              {categories.map((category) => (
                <li key={category} className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                  {t(`categories.${category}`)}
                </li>
              ))}
            </ul>
          </div>
        }
        actions={
          <>
            {usingMockData && <DemoDataBadge />}
            {liveActive && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-live">
                <Radio aria-hidden className="size-3.5 motion-safe:animate-pulse" />
                {t('feed.live')}
              </span>
            )}
            {order.length > 0 && (
              <button type="button" className="btn-secondary" onClick={() => dispatch(resetFeedOrder())}>
                <RotateCcw aria-hidden className="size-4" />
                {t('feed.resetOrder')}
              </button>
            )}
          </>
        }
      />
      <p className="mb-4 hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
        <GripVertical aria-hidden className="size-4" />
        {t('feed.dragHint')}
      </p>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <AnimatePresence>
        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="sticky top-20 z-10 mb-4 flex justify-center"
          >
            <button type="button" onClick={showNewPosts} className="btn-primary rounded-full shadow-lg" data-testid="new-posts-button">
              <ArrowUp aria-hidden className="size-4" />
              {t('feed.newPosts', { count: pendingCount })} · {t('feed.showNew')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!hydrated || isLoading ? (
        <SkeletonGrid count={6} label={t('states.loading')} />
      ) : isError && !data ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title={t('feed.emptyTitle')}
          body={t('feed.emptyBody')}
          action={
            <Link href="/settings" className="btn-primary">
              {t('feed.openSettings')}
            </Link>
          }
        />
      ) : (
        <>
          <SortableFeedGrid items={items} onReorder={handleReorder} onMoveBy={handleMoveBy} />
          <LoadMore
            hasMore={hasNextPage}
            isFetching={isFetchingNextPage}
            isError={isFetchNextPageError}
            onLoadMore={loadMore}
          />
        </>
      )}
    </section>
  );
}
