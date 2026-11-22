export function ProductDetailSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading product details"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 pb-8 lg:pb-16 font-sans space-y-16"
    >
      <span className="sr-only">Loading product details…</span>

      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-4 text-sm font-semibold">
        <div className="h-4 w-12 motion-safe:animate-pulse bg-rewear-soft" />
        <span className="text-rewear-muted">/</span>
        <div className="h-4 w-20 motion-safe:animate-pulse bg-rewear-soft" />
        <span className="text-rewear-muted">/</span>
        <div className="h-4 w-32 motion-safe:animate-pulse bg-rewear-soft" />
      </div>

      {/* Main Grid: Gallery & Details (12-column responsive layout) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-14 items-start">
        {/* Left Column: Gallery (7 cols on lg) */}
        <div className="space-y-4 md:col-span-6 lg:col-span-7">
          <div className="aspect-[3/4] w-full motion-safe:animate-pulse border border-rewear-border bg-rewear-soft" />
          <div className="flex gap-[15px] overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="size-[100px] sm:size-[120px] shrink-0 motion-safe:animate-pulse border border-rewear-border bg-rewear-soft"
              />
            ))}
          </div>
        </div>

        {/* Right Column: Actions & Details (5 cols on lg) */}
        <div className="flex flex-col space-y-6 md:col-span-6 lg:col-span-5">
          {/* Title & Price Header */}
          <div className="space-y-4">
            <div className="h-4 w-24 motion-safe:animate-pulse bg-rewear-soft" />
            <div className="h-10 w-4/5 motion-safe:animate-pulse bg-rewear-soft" />
            <div className="h-10 w-36 motion-safe:animate-pulse bg-rewear-soft" />
          </div>

          {/* Size and Condition */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <div className="h-4 w-12 motion-safe:animate-pulse bg-rewear-soft" />
              <div className="h-5 w-20 motion-safe:animate-pulse bg-rewear-soft" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-16 motion-safe:animate-pulse bg-rewear-soft" />
              <div className="h-5 w-24 motion-safe:animate-pulse bg-rewear-soft" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="h-[52px] w-full motion-safe:animate-pulse bg-rewear-soft" />
            <div className="h-[52px] w-full motion-safe:animate-pulse bg-rewear-soft/60" />
          </div>

          {/* Delivery link */}
          <div className="pt-1">
            <div className="h-4 w-36 motion-safe:animate-pulse bg-rewear-soft" />
          </div>

          {/* Seller Card */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full motion-safe:animate-pulse bg-rewear-soft shrink-0" />
              <div className="space-y-1.5">
                <div className="h-7 w-44 motion-safe:animate-pulse bg-rewear-soft" />
                <div className="h-4 w-32 motion-safe:animate-pulse bg-rewear-soft" />
              </div>
            </div>
            <div className="flex items-center gap-8 pt-1">
              <div className="h-4 w-24 motion-safe:animate-pulse bg-rewear-soft" />
              <div className="h-4 w-28 motion-safe:animate-pulse bg-rewear-soft" />
            </div>
          </div>

          {/* About this piece */}
          <div className="space-y-3 pt-2">
            <div className="h-7 w-40 motion-safe:animate-pulse bg-rewear-soft" />
            <div className="h-4 w-full motion-safe:animate-pulse bg-rewear-soft" />
            <div className="h-4 w-4/5 motion-safe:animate-pulse bg-rewear-soft" />
            <div className="h-4 w-28 motion-safe:animate-pulse bg-rewear-soft pt-1" />
          </div>
        </div>
      </div>

      {/* Measurements skeleton */}
      <div className="bg-rewear-soft p-8 sm:p-10">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <div className="h-8 w-44 motion-safe:animate-pulse bg-white/60" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between py-1">
                <div className="h-4 w-20 motion-safe:animate-pulse bg-white/60" />
                <div className="h-4 w-16 motion-safe:animate-pulse bg-white/60" />
              </div>
            ))}
          </div>
          <div className="h-4 w-48 motion-safe:animate-pulse bg-white/60" />
          <div className="h-4 w-32 motion-safe:animate-pulse bg-white/60" />
        </div>
      </div>
    </div>
  );
}
