'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, GripVertical } from 'lucide-react';
import { memo, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import type { ContentItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ContentCard } from './ContentCard';

const CARD_TYPE = 'feed-card';

interface DragItem {
  id: string;
}

interface SortableFeedGridProps {
  items: ContentItem[];
  /** Drop `fromId` onto the position of `toId`. */
  onReorder: (fromId: string, toId: string) => void;
  /** Keyboard/touch alternative to dragging: move one step earlier or later. */
  onMoveBy: (id: string, delta: number) => void;
}

/**
 * The feed grid. Cards can be dragged (React DnD, HTML5 backend) and each
 * card also has "move earlier/later" buttons so reordering works with a
 * keyboard and on touch screens. Framer Motion animates cards into place.
 */
export function SortableFeedGrid({ items, onReorder, onMoveBy }: SortableFeedGridProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" data-testid="feed-grid">
        {items.map((item, index) => (
          <SortableCard
            key={item.id}
            item={item}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            onReorder={onReorder}
            onMoveBy={onMoveBy}
          />
        ))}
      </ul>
    </DndProvider>
  );
}

interface SortableCardProps {
  item: ContentItem;
  isFirst: boolean;
  isLast: boolean;
  onReorder: (fromId: string, toId: string) => void;
  onMoveBy: (id: string, delta: number) => void;
}

const SortableCard = memo(function SortableCard({ item, isFirst, isLast, onReorder, onMoveBy }: SortableCardProps) {
  const { t } = useTranslation();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: CARD_TYPE,
      item: { id: item.id } satisfies DragItem,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [item.id],
  );

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>(
    () => ({
      accept: CARD_TYPE,
      drop: (dragged) => {
        if (dragged.id !== item.id) onReorder(dragged.id, item.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver() && monitor.getItem<DragItem>()?.id !== item.id,
      }),
    }),
    [item.id, onReorder],
  );

  // A callback ref connects the same element as drag source and drop target.
  const connect = useCallback(
    (node: HTMLLIElement | null) => {
      drag(drop(node));
    },
    [drag, drop],
  );

  const toolbar = (
    <div className="flex items-center gap-0.5 rounded-xl bg-card/95 p-1 shadow-sm transition-opacity lg:opacity-0 lg:group-hover/sortable:opacity-100 lg:group-focus-within/sortable:opacity-100">
      <span aria-hidden title={t('card.dragHandle')} className="hidden cursor-grab px-1 text-muted-foreground lg:inline-flex">
        <GripVertical className="size-4" />
      </span>
      <button
        type="button"
        className="icon-btn size-8"
        onClick={() => onMoveBy(item.id, -1)}
        disabled={isFirst}
        aria-label={t('card.moveEarlier')}
        title={t('card.moveEarlier')}
      >
        <ArrowLeft aria-hidden className="size-4" />
      </button>
      <button
        type="button"
        className="icon-btn size-8"
        onClick={() => onMoveBy(item.id, 1)}
        disabled={isLast}
        aria-label={t('card.moveLater')}
        title={t('card.moveLater')}
      >
        <ArrowRight aria-hidden className="size-4" />
      </button>
    </div>
  );

  return (
    <motion.li
      ref={connect}
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      className={cn(
        'group/sortable relative cursor-grab rounded-2xl active:cursor-grabbing',
        isOver && 'ring-2 ring-primary ring-offset-4 ring-offset-background',
      )}
      data-testid="feed-item"
      data-id={item.id}
    >
      <ContentCard item={item} toolbar={toolbar} />
    </motion.li>
  );
});
