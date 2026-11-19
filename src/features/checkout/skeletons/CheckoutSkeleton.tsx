export function CheckoutSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Đang tải trang thanh toán"
      className="bg-rewear-surface text-rewear-text min-h-dvh"
    >
      <span className="sr-only">Đang tải trang thanh toán…</span>

      {/* Mock Header skeleton */}
      <header className="border-b border-rewear-border">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-12">
          <div className="h-6 w-28 motion-safe:animate-pulse rounded bg-rewear-soft" />
          <div className="flex items-center gap-4">
            <div className="hidden h-9 w-64 motion-safe:animate-pulse rounded bg-rewear-soft md:block" />
            <div className="size-9 motion-safe:animate-pulse rounded bg-rewear-soft" />
          </div>
        </div>
      </header>

      {/* Main Checkout Layout skeleton */}
      <main className="mx-auto max-w-[1280px] space-y-6 px-4 py-4 md:space-y-8 md:px-12 md:py-12">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-9 w-48 motion-safe:animate-pulse rounded bg-rewear-soft md:h-11 md:w-64" />
          <div className="h-5 w-80 max-w-full motion-safe:animate-pulse rounded bg-rewear-soft" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Items & Address (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Delivery Address Card Skeleton */}
            <div className="border border-rewear-border p-4 space-y-3">
              <div className="h-4 w-32 motion-safe:animate-pulse rounded bg-rewear-soft" />
              <div className="h-5 w-3/4 motion-safe:animate-pulse rounded bg-rewear-soft" />
              <div className="h-4 w-1/2 motion-safe:animate-pulse rounded bg-rewear-soft" />
            </div>

            {/* Item List Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-28 motion-safe:animate-pulse rounded bg-rewear-soft" />
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-rewear-soft/50 border border-rewear-border flex items-center gap-4 p-4"
                >
                  <div className="size-5 motion-safe:animate-pulse rounded bg-rewear-soft" />
                  <div className="size-16 shrink-0 motion-safe:animate-pulse rounded bg-rewear-soft" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-5 w-4/5 motion-safe:animate-pulse rounded bg-rewear-soft" />
                    <div className="h-4 w-1/3 motion-safe:animate-pulse rounded bg-rewear-soft" />
                  </div>
                  <div className="h-5 w-20 shrink-0 motion-safe:animate-pulse rounded bg-rewear-soft" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="border border-rewear-border p-6 space-y-5">
              <div className="h-6 w-36 motion-safe:animate-pulse rounded bg-rewear-soft" />

              <div className="space-y-3 border-y border-rewear-border py-4">
                <div className="flex justify-between">
                  <div className="h-4 w-20 motion-safe:animate-pulse rounded bg-rewear-soft" />
                  <div className="h-4 w-24 motion-safe:animate-pulse rounded bg-rewear-soft" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-28 motion-safe:animate-pulse rounded bg-rewear-soft" />
                  <div className="h-4 w-20 motion-safe:animate-pulse rounded bg-rewear-soft" />
                </div>
              </div>

              <div className="flex justify-between pt-1">
                <div className="h-6 w-24 motion-safe:animate-pulse rounded bg-rewear-soft" />
                <div className="h-6 w-32 motion-safe:animate-pulse rounded bg-rewear-soft" />
              </div>

              <div className="h-[52px] w-full motion-safe:animate-pulse bg-rewear-soft" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
