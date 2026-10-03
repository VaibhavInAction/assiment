'use client';

import { Heart, Trash } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentGrid } from '@/components/content/ContentGrid';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { PageHeader } from '@/components/ui/PageHeader';
import { SkeletonGrid } from '@/components/ui/SkeletonGrid';
import { EmptyState } from '@/components/ui/StatusMessage';
import type { ContentFilter } from '@/lib/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearFavorites, selectAllFavorites } from '@/store/slices/favoritesSlice';
import { selectHydrated } from '@/store/slices/uiSlice';

export function FavoritesSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector(selectHydrated);
  const favorites = useAppSelector(selectAllFavorites);
  const [filter, setFilter] = useState<ContentFilter>('all');

  const visible = filter === 'all' ? favorites : favorites.filter((item) => item.type === filter);
  const filterOptions = (['all', 'news', 'movie', 'social'] as const).map((value) => ({
    value,
    label: t(`filters.${value}`),
  }));

  const onClearAll = () => {
    if (window.confirm(t('favorites.confirmClear'))) dispatch(clearFavorites());
  };

  return (
    <section>
      <PageHeader
        icon={Heart}
        title={t('favorites.title')}
        description={
          favorites.length > 0 ? t('favorites.count', { count: favorites.length }) : t('favorites.subtitle')
        }
        actions={
          favorites.length > 0 && (
            <button type="button" className="btn-secondary" onClick={onClearAll}>
              <Trash aria-hidden className="size-4" />
              {t('favorites.clearAll')}
            </button>
          )
        }
      />

      {!hydrated ? (
        <SkeletonGrid count={3} label={t('states.loading')} />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t('favorites.emptyTitle')}
          body={t('favorites.emptyBody')}
          action={
            <Link href="/" className="btn-primary">
              {t('favorites.browse')}
            </Link>
          }
        />
      ) : (
        <>
          <FilterTabs label={t('filters.label')} options={filterOptions} value={filter} onChange={setFilter} className="mb-6 w-fit" />
          {visible.length > 0 ? (
            <ContentGrid items={visible} label={t('favorites.title')} />
          ) : (
            <EmptyState icon={Heart} title={t('favorites.emptyFilteredTitle')} />
          )}
        </>
      )}
    </section>
  );
}
