import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  label: string;
  className?: string;
  /** Visually show the label next to the spinner. */
  showLabel?: boolean;
}

export function Spinner({ label, className, showLabel = false }: SpinnerProps) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-muted-foreground', className)}>
      <LoaderCircle aria-hidden className="size-5 animate-spin text-primary" />
      <span className={showLabel ? 'text-sm' : 'sr-only'}>{label}</span>
    </span>
  );
}
