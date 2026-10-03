'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ContentItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsFavorite, toggleFavorite } from '@/store/slices/favoritesSlice';

export function FavoriteButton({ item }: { item: ContentItem }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const active = useAppSelector((state) => selectIsFavorite(state, item.id));

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.8 }}
      aria-pressed={active}
      aria-label={t('card.favorite')}
      title={t('card.favorite')}
      onClick={() => dispatch(toggleFavorite(item))}
      className={cn('icon-btn size-9', active ? 'text-danger' : 'text-muted-foreground hover:text-danger')}
    >
      <motion.span key={String(active)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="inline-flex">
        <Heart aria-hidden className={cn('size-5', active && 'fill-current')} />
      </motion.span>
    </motion.button>
  );
}
