import { useEffect, useRef, useState } from 'react';

interface Options {
  onLoadMore: () => void;
  /** Pass false while a page is loading or when there is nothing more to load. */
  enabled: boolean;
  rootMargin?: string;
}

/**
 * Calls `onLoadMore` when the returned sentinel element scrolls into view.
 * Re-enabling re-observes, so a short page that leaves the sentinel visible
 * keeps loading until the screen is full.
 */
export function useInfiniteScroll({ onLoadMore, enabled, rootMargin = '600px' }: Options) {
  const [sentinel, setSentinel] = useState<Element | null>(null);
  const callbackRef = useRef(onLoadMore);

  useEffect(() => {
    callbackRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!sentinel || !enabled || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) callbackRef.current();
      },
      { rootMargin },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, enabled, rootMargin]);

  return setSentinel;
}
