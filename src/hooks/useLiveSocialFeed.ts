import { useEffect } from 'react';
import { isContentItem, type Category } from '@/lib/types';
import { useAppDispatch } from '@/store/hooks';
import { liveItemReceived } from '@/store/slices/feedSlice';

/** Subscribes to the Server-Sent Events stream of new social posts. */
export function useLiveSocialFeed(enabled: boolean, categories: Category[]) {
  const dispatch = useAppDispatch();
  const categoryKey = categories.join(',');

  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') return;

    const source = new EventSource(`/api/social/stream?categories=${encodeURIComponent(categoryKey)}`);
    const onPost = (event: MessageEvent<string>) => {
      try {
        const item: unknown = JSON.parse(event.data);
        if (isContentItem(item)) dispatch(liveItemReceived(item));
      } catch {
        // Ignore malformed events; the stream keeps going.
      }
    };

    source.addEventListener('post', onPost);
    return () => {
      source.removeEventListener('post', onPost);
      source.close();
    };
  }, [enabled, categoryKey, dispatch]);
}
