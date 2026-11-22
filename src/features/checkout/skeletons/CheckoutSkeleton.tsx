import { Skeleton } from '@/shared/components/ui/skeleton';

export function CheckoutSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading checkout page"
      className="bg-rewear-surface text-rewear-text min-h-dvh"
    >
      <span className="sr-only">Loading checkout page…</span>

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

      {/* Main Checkout Layout skeleton */}
      <main className="mx-auto max-w-[1280px] space-y-6 px-4 py-4 md:space-y-8 md:px-12 md:py-12">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 md:h-11 md:w-64" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Items & Address (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Delivery Address Card Skeleton */}
            <div className="border-rewear-border space-y-3 border p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Item List Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-rewear-soft/50 border-rewear-border flex items-center gap-4 border p-4"
                >
                  <Skeleton className="size-5" />
                  <Skeleton className="size-16 shrink-0" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton className="h-5 w-20 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="border-rewear-border space-y-5 border p-6">
              <Skeleton className="h-6 w-36" />

              <div className="border-rewear-border space-y-3 border-y py-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              <div className="flex justify-between pt-1">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>

              <Skeleton className="h-[52px] w-full rounded-none" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
