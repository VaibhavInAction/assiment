'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectTheme, toggleTheme } from '@/store/slices/preferencesSlice';
import { selectHydrated } from '@/store/slices/uiSlice';

export function ThemeToggle() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const hydrated = useAppSelector(selectHydrated);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={t('header.darkMode')}
      title={t('header.darkMode')}
      onClick={() => dispatch(toggleTheme())}
      className="icon-btn overflow-hidden"
      data-testid="theme-toggle"
    >
      {/* The saved theme is unknown until hydration, so the icon waits for it. */}
      {hydrated && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
          >
            {isDark ? <Moon aria-hidden className="size-5" /> : <Sun aria-hidden className="size-5" />}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  );
}
