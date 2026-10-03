'use client';

import { Compass } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <Compass aria-hidden className="size-12 text-primary" />
      <h1 className="text-2xl font-bold">{t('notFound.title')}</h1>
      <p className="text-muted-foreground">{t('notFound.body')}</p>
      <Link href="/" className="btn-primary">
        {t('notFound.home')}
      </Link>
    </main>
  );
}
