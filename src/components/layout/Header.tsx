'use client';

import { Menu, Settings } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LanguageSelect } from './LanguageSelect';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <button type="button" className="icon-btn lg:hidden" onClick={onOpenMenu} aria-label={t('header.openMenu')}>
          <Menu aria-hidden className="size-5" />
        </button>
        <SearchBar className="min-w-0 flex-1 md:max-w-xl" />
        <div className="ml-auto flex items-center gap-1">
          <LanguageSelect className="hidden md:block" />
          <ThemeToggle />
          <Link href="/settings" className="icon-btn hidden sm:inline-flex" aria-label={t('header.settings')} title={t('header.settings')}>
            <Settings aria-hidden className="size-5" />
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
