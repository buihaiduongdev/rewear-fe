import { Skeleton } from '@/shared/components/ui/skeleton';

export function CatalogSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading clothing catalog"
      className="mx-auto max-w-[1280px] space-y-8 px-4 py-6 md:px-12 md:py-12"
    >
      <span className="sr-only">Loading clothing items…</span>

      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-9 w-48 md:h-11 md:w-64" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>

      {/* Filter / Search mock bar */}
      <div className="border-rewear-border flex flex-wrap items-center gap-3 border-y py-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[278/348] w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
