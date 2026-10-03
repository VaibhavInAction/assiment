'use client';

import { motion } from 'framer-motion';
import { ExternalLink, MessageCircle, Newspaper, ThumbsUp, type LucideIcon } from 'lucide-react';
import { memo, useId, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { ContentItem, ContentType } from '@/lib/types';
import { cn, formatCompactNumber, formatRelativeTime } from '@/lib/utils';
import { FavoriteButton } from './FavoriteButton';

const TYPE_STYLES: Record<ContentType, { icon: LucideIcon; text: string; fallback: string }> = {
  news: { icon: Newspaper, text: 'text-news', fallback: 'bg-news/15 text-news' },
  social: { icon: MessageCircle, text: 'text-social', fallback: 'bg-social/15 text-social' },
};

export interface ContentCardProps {
  item: ContentItem;
  /** Shows a "#1" badge, used by the Trending section. */
  rank?: number;
  /** Extra controls rendered over the image (drag-and-drop tools in the feed). */
  toolbar?: ReactNode;
}

export const ContentCard = memo(function ContentCard({ item, rank, toolbar }: ContentCardProps) {
  const { t, i18n } = useTranslation();
  const titleId = useId();
  const [imageFailed, setImageFailed] = useState(false);
  const dateLabel = formatRelativeTime(item.publishedAt, i18n.language);
  const { icon: TypeIcon, text, fallback } = TYPE_STYLES[item.type];
  const cta = item.type === 'news' ? t('card.readMore') : t('card.viewPost');

  return (
    <motion.article
      aria-labelledby={titleId}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="group card-surface flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10"
      data-testid="content-card"
      data-card-id={item.id}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {item.imageUrl && !imageFailed ? (
          // Plain <img>: news images come from thousands of domains we cannot allow-list for next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={cn('flex size-full items-center justify-center', fallback)} data-testid="image-fallback">
            <TypeIcon aria-hidden className="size-10 opacity-70" />
          </div>
        )}

        <span
          className={cn(
            'absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-xs font-semibold shadow-sm',
            text,
          )}
        >
          <TypeIcon aria-hidden className="size-3.5" />
          {t(`types.${item.type}`)}
        </span>

        {rank !== undefined && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-primary px-2 py-0.5 text-sm font-bold text-primary-foreground shadow">
            <span className="sr-only">{t('card.rank', { rank })}</span>
            <span aria-hidden>#{rank}</span>
          </span>
        )}

        {toolbar && <div className="absolute right-2 top-2">{toolbar}</div>}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/80">{item.type === 'social' ? item.author ?? item.source : item.source}</span>
          {dateLabel && (
            <>
              <span aria-hidden>·</span>
              <time dateTime={item.publishedAt}>{dateLabel}</time>
            </>
          )}
        </p>

        <h3 id={titleId} className="line-clamp-3 text-base font-semibold leading-snug">
          {item.title}
        </h3>

        {item.description && <p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>}

        {item.hashtags && item.hashtags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {item.hashtags.map((tag) => (
              <li key={tag} className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-primary px-3.5">
            <ExternalLink aria-hidden className="size-4" />
            {cta}
            <span className="sr-only">
              : {item.title} {t('card.newTab')}
            </span>
          </a>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {item.likes !== undefined && (
              <span className="mr-1 inline-flex items-center gap-1">
                <ThumbsUp aria-hidden className="size-3.5" />
                <span className="sr-only">{t('card.likes', { count: item.likes })}</span>
                <span aria-hidden>{formatCompactNumber(item.likes, i18n.language)}</span>
              </span>
            )}
            <FavoriteButton item={item} />
          </div>
        </div>
      </div>
    </motion.article>
  );
});
