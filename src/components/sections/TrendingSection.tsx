'use client';

import { Film, Flame, MessageCircle, Newspaper, TrendingUp, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentGrid } from '@/components/content/ContentGrid';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { PageHeader } from '@/components/ui/PageHeader';
import { SkeletonGrid } from '@/components/ui/SkeletonGrid';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState, ErrorState } from '@/components/ui/StatusMessage';
import { CATEGORIES, type Category, type ContentItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useGetTrendingQuery } from '@/store/api/contentApi';

export function TrendingSection() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<Category | 'all'>('all');
  const { data, isLoading, isFetching, isError, refetch } = useGetTrendingQuery(category);

  const options = [
    { value: 'all' as const, label: t('trending.allTopics') },
    ...CATEGORIES.map((value) => ({ value, label: t(`categories.${value}`) })),
  ];

  const groups: Array<{ id: string; title: string; icon: LucideIcon; items: ContentItem[] }> = data
    ? [
        { id: 'trending-news', title: t('trending.news'), icon: Newspaper, items: data.news },
        { id: 'trending-movies', title: t('trending.movies'), icon: Film, items: data.movies },
        { id: 'trending-social', title: t('trending.social'), icon: MessageCircle, items: data.social },
      ]
    : [];

  return (
    <section>
      <PageHeader
        icon={TrendingUp}
        title={t('trending.title')}
        description={t('trending.subtitle')}
        actions={
          <>
            {isFetching && !isLoading && <Spinner label={t('states.loading')} />}
            {data?.usingMockData && <DemoDataBadge />}
          </>
        }
      />

      <FilterTabs label={t('trending.categoryLabel')} options={options} value={category} onChange={setCategory} className="mb-8" />

      {isLoading ? (
        <SkeletonGrid count={6} label={t('states.loading')} />
      ) : isError && !data ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <div className={cn('space-y-10 transition-opacity', isFetching && 'opacity-60')}>
          {groups.map(({ id, title, icon: Icon, items }) => (
            <section key={id} aria-labelledby={id}>
              <h2 id={id} className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Icon aria-hidden className="size-5 text-primary" />
                {title}
                <Flame aria-hidden className="size-4 text-movie" />
              </h2>
              {items.length > 0 ? (
                <ContentGrid items={items} ranked label={title} />
              ) : (
                <EmptyState icon={Icon} title={t('feed.emptyTitle')} />
              )}
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
