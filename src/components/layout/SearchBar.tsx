'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MIN_QUERY_LENGTH, selectSearchQuery, setQuery } from '@/store/slices/searchSlice';

export const SEARCH_DEBOUNCE_MS = 400;

/**
 * Header search. Keystrokes update local state instantly; the query is only
 * committed to Redux (which triggers the API call) once typing pauses.
 */
export function SearchBar({ className }: { className?: string }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const committedQuery = useAppSelector(selectSearchQuery);
  const [value, setValue] = useState(committedQuery);
  const debouncedValue = useDebouncedValue(value, SEARCH_DEBOUNCE_MS);
  const lastDebouncedValue = useRef(debouncedValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const commit = useCallback(
    (raw: string) => {
      const query = raw.trim();
      dispatch(setQuery(query));
      if (query.length >= MIN_QUERY_LENGTH && pathname !== '/search') router.push('/search');
    },
    [dispatch, pathname, router],
  );

  // React only to the debounced value changing. Enter and Clear commit
  // immediately, and must not be undone by a stale debounced value.
  useEffect(() => {
    if (debouncedValue === lastDebouncedValue.current) return;
    lastDebouncedValue.current = debouncedValue;
    commit(debouncedValue);
  }, [debouncedValue, commit]);

  // Press "/" anywhere to jump to the search box.
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest('input, textarea, select, [contenteditable="true"]');
      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const clear = () => {
    setValue('');
    dispatch(setQuery(''));
    inputRef.current?.focus();
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Enter skips the debounce wait.
    commit(value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && value) {
      event.preventDefault();
      clear();
    }
  };

  return (
    <form role="search" onSubmit={onSubmit} className={cn('relative', className)}>
      <label htmlFor={inputId} className="sr-only">
        {t('header.searchLabel')}
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t('header.searchPlaceholder')}
        autoComplete="off"
        maxLength={100}
        className="input h-10 rounded-xl pl-9 pr-16 [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {value ? (
          <button type="button" onClick={clear} className="icon-btn size-7 rounded-lg" aria-label={t('header.clearSearch')}>
            <X aria-hidden className="size-4" />
          </button>
        ) : (
          <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground md:inline">
            /
          </kbd>
        )}
      </div>
    </form>
  );
}
