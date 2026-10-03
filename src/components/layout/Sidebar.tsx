'use client';

import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Heart, LayoutDashboard, Search, Settings, TrendingUp, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { selectFavoritesCount } from '@/store/slices/favoritesSlice';
import { selectCategories } from '@/store/slices/preferencesSlice';

const NAV_ITEMS = [
  { href: '/', key: 'feed', icon: LayoutDashboard },
  { href: '/trending', key: 'trending', icon: TrendingUp },
  { href: '/favorites', key: 'favorites', icon: Heart },
  { href: '/search', key: 'search', icon: Search },
  { href: '/settings', key: 'settings', icon: Settings },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const favoritesCount = useAppSelector(selectFavoritesCount);
  const categories = useAppSelector(selectCategories);

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
          <Zap aria-hidden className="size-5" />
        </span>
        <span>
          <span className="block text-lg font-bold leading-tight">{t('app.name')}</span>
          <span className="block text-xs text-muted-foreground">{t('app.tagline')}</span>
        </span>
      </Link>

      <nav aria-label={t('nav.label')}>
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active ? 'text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-accent"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon aria-hidden className="relative size-5" />
                  <span className="relative flex-1">{t(`nav.${key}`)}</span>
                  {key === 'favorites' && favoritesCount > 0 && (
                    <span className="relative rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="card-surface mt-auto p-4 shadow-none">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('nav.yourTopics')}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <li key={category} className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
              {t(`categories.${category}`)}
            </li>
          ))}
        </ul>
        <Link href="/settings" onClick={onNavigate} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          {t('nav.editTopics')}
        </Link>
      </div>
    </div>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

/** Fixed sidebar on large screens, slide-in drawer on small screens. */
export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card lg:block">
        <LayoutGroup id="sidebar-desktop">
          <SidebarContent />
        </LayoutGroup>
      </aside>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav"
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.label')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border bg-card shadow-2xl"
            >
              <button
                type="button"
                onClick={onClose}
                className="icon-btn absolute right-3 top-3 z-10"
                aria-label={t('header.closeMenu')}
                autoFocus
              >
                <X aria-hidden className="size-5" />
              </button>
              <LayoutGroup id="sidebar-mobile">
                <SidebarContent onNavigate={onClose} />
              </LayoutGroup>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
