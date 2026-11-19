export function CatalogSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Đang tải danh sách đồ thời trang"
      className="mx-auto max-w-[1280px] space-y-8 px-4 py-6 md:px-12 md:py-12"
    >
      <span className="sr-only">Đang tải danh sách quần áo…</span>

      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-9 w-48 motion-safe:animate-pulse rounded bg-rewear-soft md:h-11 md:w-64" />
        <div className="h-5 w-80 max-w-full motion-safe:animate-pulse rounded bg-rewear-soft" />
      </div>

      {/* Filter / Search mock bar */}
      <div className="flex flex-wrap items-center gap-3 border-y border-rewear-border py-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-9 w-24 motion-safe:animate-pulse rounded bg-rewear-soft"
          />
        ))}
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[278/348] w-full motion-safe:animate-pulse rounded bg-rewear-soft" />
            <div className="h-4 w-4/5 motion-safe:animate-pulse rounded bg-rewear-soft" />
            <div className="h-3 w-1/2 motion-safe:animate-pulse rounded bg-rewear-soft" />
            <div className="h-4 w-1/3 motion-safe:animate-pulse rounded bg-rewear-soft" />
          </div>
        ))}
      </div>
    </div>
  );
}
