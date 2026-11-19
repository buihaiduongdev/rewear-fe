export function ProductDetailSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Đang tải thông tin sản phẩm"
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
    >
      <span className="sr-only">Đang tải thông tin sản phẩm…</span>

      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-16 motion-safe:animate-pulse rounded bg-rewear-soft" />
          <div className="h-4 w-4 motion-safe:animate-pulse rounded bg-rewear-soft" />
          <div className="h-4 w-20 motion-safe:animate-pulse rounded bg-rewear-soft" />
          <div className="h-4 w-4 motion-safe:animate-pulse rounded bg-rewear-soft" />
          <div className="h-4 w-32 motion-safe:animate-pulse rounded bg-rewear-soft" />
        </div>
        <div className="h-7 w-20 motion-safe:animate-pulse rounded bg-rewear-soft" />
      </div>

      {/* Main Grid: Gallery & Details */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left Column: Gallery (7 cols on lg) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="aspect-[3/4] w-full motion-safe:animate-pulse rounded-lg border border-rewear-border bg-rewear-soft" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="size-20 shrink-0 motion-safe:animate-pulse rounded-md border border-rewear-border bg-rewear-soft"
              />
            ))}
          </div>
        </div>

        {/* Right Column: Actions & Details (5 cols on lg) */}
        <div className="flex flex-col space-y-6 lg:col-span-5">
          {/* Title & Price Header */}
          <div className="space-y-3 border-b border-rewear-border pb-5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 motion-safe:animate-pulse rounded bg-rewear-soft" />
              <div className="h-5 w-20 motion-safe:animate-pulse rounded-full bg-rewear-soft" />
            </div>
            <div className="h-8 w-4/5 motion-safe:animate-pulse rounded bg-rewear-soft sm:h-9" />
            <div className="flex items-baseline gap-4 pt-1">
              <div className="h-8 w-32 motion-safe:animate-pulse rounded bg-rewear-soft" />
              <div className="h-4 w-20 motion-safe:animate-pulse rounded bg-rewear-soft" />
            </div>
          </div>

          {/* Key Attributes Pills */}
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 motion-safe:animate-pulse rounded-lg border border-rewear-border bg-rewear-soft/30" />
            <div className="h-16 motion-safe:animate-pulse rounded-lg border border-rewear-border bg-rewear-soft/30" />
          </div>

          {/* Add to Cart Button */}
          <div className="pt-2">
            <div className="h-[52px] w-full motion-safe:animate-pulse bg-rewear-soft" />
          </div>

          {/* Shop Card */}
          <div className="h-20 motion-safe:animate-pulse rounded-lg border border-rewear-border bg-rewear-soft/30" />

          {/* Description Block */}
          <div className="space-y-2">
            <div className="h-4 w-28 motion-safe:animate-pulse rounded bg-rewear-soft" />
            <div className="h-4 w-full motion-safe:animate-pulse rounded bg-rewear-soft" />
            <div className="h-4 w-5/6 motion-safe:animate-pulse rounded bg-rewear-soft" />
            <div className="h-4 w-2/3 motion-safe:animate-pulse rounded bg-rewear-soft" />
          </div>

          {/* Measurements Specifications */}
          <div className="h-28 motion-safe:animate-pulse rounded-lg border border-rewear-border bg-rewear-soft/20" />
        </div>
      </div>
    </div>
  );
}
