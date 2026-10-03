'use client';

import { motion } from 'framer-motion';
import { useId } from 'react';
import { cn } from '@/lib/utils';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface FilterTabsProps<T extends string> {
  label: string;
  options: Array<FilterOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** A segmented control. Each option is a toggle button with aria-pressed. */
export function FilterTabs<T extends string>({ label, options, value, onChange, className }: FilterTabsProps<T>) {
  const groupId = useId();
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative shrink-0 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-colors',
              active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId={`${groupId}-active`}
                className="absolute inset-0 rounded-xl bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
