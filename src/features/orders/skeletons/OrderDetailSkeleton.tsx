import { Skeleton } from '@/shared/components/ui/skeleton';

interface OrderDetailSkeletonProps {
  fullPage?: boolean;
}

export function OrderDetailSkeleton({
  fullPage = false,
}: OrderDetailSkeletonProps) {
  const content = (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading order details"
      className="space-y-6"
    >
      <span className="sr-only">Loading order…</span>

      {/* Header Info (Title & Order code) */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48 md:h-11 md:w-64" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Mobile status heading */}
      <div className="space-y-2 md:hidden">
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Timeline Skeleton */}
      <div className="hidden grid-cols-4 gap-2 py-2 md:grid">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className="flex min-w-0 flex-col items-center gap-2 text-center"
          >
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Delivery address skeleton */}
      <div className="bg-rewear-soft space-y-2 px-5 py-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-3/4 max-w-sm" />
        <Skeleton className="h-4 w-1/2 max-w-xs" />
      </div>

      {/* Grid: Items & Order Summary */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,416px)]">
        {/* Left Column: Items */}
        <section className="space-y-7" aria-label="Items loading">
          {[1, 2].map((i) => (
            <article key={i} className="flex gap-4 sm:gap-6">
              <Skeleton className="h-[150px] w-[120px] shrink-0 sm:h-[185px] sm:w-[148px]" />
              <div className="min-w-0 flex-1 space-y-4">
                <Skeleton className="h-6 w-4/5 sm:h-7" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-24 sm:h-7" />
              </div>
            </article>
          ))}
        </section>

        {/* Right Column: Order Summary */}
        <aside className="bg-rewear-soft h-fit space-y-6 p-6">
          <Skeleton className="h-8 w-36" />
          <div className="space-y-6">
            <div className="flex justify-between gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between gap-4 pt-2">
              <Skeleton className="h-6 w-16 sm:h-7" />
              <Skeleton className="h-6 w-28 sm:h-7" />
            </div>
          </div>
          <Skeleton className="h-11 w-full" />
        </aside>
      </div>
    </div>
  );

  if (!fullPage) {
    return content;
  }

  return (
    <div className="bg-rewear-surface text-rewear-text flex min-h-dvh flex-col">
      {/* Mock Header skeleton */}
      <header className="border-rewear-border border-b">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-12">
          <Skeleton className="h-6 w-28" />
          <div className="flex items-center gap-4">
            <Skeleton className="hidden h-9 w-64 md:block" />
            <Skeleton className="size-9" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] flex-1 space-y-6 px-4 py-8 md:px-12 md:py-12">
        <Skeleton className="h-4 w-28" />
        {content}
      </main>
    </div>
  );
}
