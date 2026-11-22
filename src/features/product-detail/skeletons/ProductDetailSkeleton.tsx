import { Skeleton } from '@/shared/components/ui/skeleton';

export function ProductDetailSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading product details"
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <span className="sr-only">Loading product details…</span>

      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-7 w-20" />
      </div>

      {/* Main Grid: Gallery & Details */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left Column: Gallery (7 cols on lg) */}
        <div className="space-y-4 lg:col-span-7">
          <Skeleton className="border-rewear-border aspect-[3/4] w-full rounded-lg border" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="border-rewear-border size-20 shrink-0 border"
              />
            ))}
          </div>
        </div>

        {/* Right Column: Actions & Details (5 cols on lg) */}
        <div className="flex flex-col space-y-6 lg:col-span-5">
          {/* Title & Price Header */}
          <div className="border-rewear-border space-y-3 border-b pb-5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-8 w-4/5 sm:h-9" />
            <div className="flex items-baseline gap-4 pt-1">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          {/* Quick specs pill */}
          <div className="border-rewear-border grid grid-cols-2 gap-4 rounded-lg border p-4">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>

          {/* CTA Action button */}
          <div className="pt-2">
            <Skeleton className="h-12 w-full rounded-md" />
          </div>

          {/* Seller preview card */}
          <div className="border-rewear-border rounded-lg border p-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="size-11 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </div>

          {/* Description & specs placeholders */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
