import { cn } from '@/lib/utils';

function SkeletonCard() {
  return (
    <div aria-hidden className="card-surface overflow-hidden" data-testid="skeleton-card">
      <div className="aspect-video bg-muted motion-safe:animate-pulse" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-muted motion-safe:animate-pulse" />
        <div className="h-4 w-11/12 rounded bg-muted motion-safe:animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-muted motion-safe:animate-pulse" />
        <div className="h-9 w-28 rounded-xl bg-muted motion-safe:animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, label, className }: { count?: number; label: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn('grid gap-5 sm:grid-cols-2 xl:grid-cols-3', className)}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
