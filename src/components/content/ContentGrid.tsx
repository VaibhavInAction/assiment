'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ContentItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ContentCard } from './ContentCard';

interface ContentGridProps {
  items: ContentItem[];
  /** Number the cards (#1, #2...) for ranked lists like Trending. */
  ranked?: boolean;
  label?: string;
  className?: string;
}

/** Responsive card grid with enter/exit animations. */
export function ContentGrid({ items, ranked = false, label, className }: ContentGridProps) {
  return (
    <ul aria-label={label} className={cn('grid gap-5 sm:grid-cols-2 xl:grid-cols-3', className)}>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <ContentCard item={item} rank={ranked ? index + 1 : undefined} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
