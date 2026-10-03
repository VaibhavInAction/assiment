'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogIn, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, selectUser, type User } from '@/store/slices/authSlice';

export function Avatar({ user, size = 32 }: { user: User; size?: number }) {
  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: user.avatarColor, fontSize: size * 0.4 }}
    >
      {initials || '?'}
    </span>
  );
}

/** Account info in the header: a sign-in link, or the user's menu when signed in. */
export function UserMenu() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) {
    return (
      <Link href="/login" className="btn-primary ml-1 px-3">
        <LogIn aria-hidden className="size-4" />
        <span className="hidden sm:inline">{t('header.signIn')}</span>
        <span className="sr-only sm:hidden">{t('header.signIn')}</span>
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative ml-1">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-muted"
        data-testid="user-menu-button"
      >
        <span className="sr-only">{t('header.account')}: </span>
        <Avatar user={user} />
        <span className="hidden max-w-32 truncate text-sm font-medium md:inline">{user.name}</span>
        <ChevronDown aria-hidden className="size-4 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="card-surface absolute right-0 z-40 mt-2 w-64 origin-top-right p-2 shadow-xl"
          >
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar user={user} size={40} />
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <hr className="my-1 border-border" />
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted"
            >
              <Settings aria-hidden className="size-4" />
              {t('header.settings')}
            </Link>
            <button
              type="button"
              onClick={() => {
                dispatch(logout());
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"
            >
              <LogOut aria-hidden className="size-4" />
              {t('header.signOut')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
