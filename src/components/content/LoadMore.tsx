'use client';

import { CircleCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/StatusMessage';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface LoadMoreProps {
  hasMore: boolean;
  isFetching: boolean;
  isError: boolean;
  onLoadMore: () => void;
}

/** Infinite-scroll sentinel with a visible "Load more" button as a fallback. */
export function LoadMore({ hasMore, isFetching, isError, onLoadMore }: LoadMoreProps) {
  const { t } = useTranslation();
  const sentinelRef = useInfiniteScroll({ onLoadMore, enabled: hasMore && !isFetching && !isError });

  if (!hasMore) {
    return (
      <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground" data-testid="end-of-feed">
        <CircleCheck aria-hidden className="size-4" />
        {t('feed.endOfFeed')}
      </p>
    );
  }

  return (
    <div ref={sentinelRef} className="flex justify-center py-10" data-testid="load-more">
      {isFetching ? (
        <Spinner label={t('feed.loadingMore')} showLabel />
      ) : isError ? (
        <ErrorState compact onRetry={onLoadMore} />
      ) : (
        <button type="button" className="btn-secondary" onClick={onLoadMore}>
          {t('feed.loadMore')}
        </button>
      )}
    </div>
  );
}
