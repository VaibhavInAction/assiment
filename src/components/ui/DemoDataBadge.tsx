'use client';

import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Tells the user (and reviewers) when bundled demo data is shown instead of live API data. */
export function DemoDataBadge() {
  const { t } = useTranslation();
  return (
    <span
      title={t('states.demoDataHint')}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground"
      data-testid="demo-data-badge"
    >
      <Sparkles aria-hidden className="size-3.5" />
      {t('states.demoData')}
      <span className="sr-only">: {t('states.demoDataHint')}</span>
    </span>
  );
}
