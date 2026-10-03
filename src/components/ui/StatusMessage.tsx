'use client';

import { TriangleAlert, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, body, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface flex flex-col items-center gap-3 px-6 py-14 text-center"
      data-testid="empty-state"
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Icon aria-hidden className="size-7" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      {body && <p className="max-w-md text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
}

interface ErrorStateProps {
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({ onRetry, compact = false }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      data-testid="error-state"
      className={
        compact
          ? 'flex flex-wrap items-center justify-center gap-3 py-6 text-sm'
          : 'card-surface flex flex-col items-center gap-3 px-6 py-14 text-center'
      }
    >
      <TriangleAlert aria-hidden className="size-7 text-danger" />
      <div>
        <p className="font-semibold">{t('states.errorTitle')}</p>
        {!compact && <p className="mt-1 max-w-md text-sm text-muted-foreground">{t('states.errorBody')}</p>}
      </div>
      {onRetry && (
        <button type="button" className="btn-secondary" onClick={onRetry}>
          {t('states.retry')}
        </button>
      )}
    </div>
  );
}
