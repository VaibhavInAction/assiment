'use client';

import { Languages } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_NAMES } from '@/lib/i18n';
import { isLanguage, LANGUAGES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectLanguage, setLanguage } from '@/store/slices/preferencesSlice';

export function LanguageSelect({ className, showLabel = false }: { className?: string; showLabel?: boolean }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const id = useId();

  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className={showLabel ? 'mb-1 block text-sm font-medium' : 'sr-only'}>
        {t('header.language')}
      </label>
      <div className="relative">
        <Languages aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <select
          id={id}
          value={language}
          onChange={(event) => {
            if (isLanguage(event.target.value)) dispatch(setLanguage(event.target.value));
          }}
          className="input h-10 w-auto cursor-pointer py-1 pl-8 pr-3"
          data-testid="language-select"
        >
          {LANGUAGES.map((code) => (
            <option key={code} value={code} lang={code}>
              {LANGUAGE_NAMES[code]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
