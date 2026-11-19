export function CartSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Đang tải giỏ hàng"
      className="mt-8 space-y-6"
    >
      <span className="sr-only">Đang tải giỏ hàng…</span>

      {/* Cart Items list skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-rewear-border p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="size-20 shrink-0 motion-safe:animate-pulse rounded bg-rewear-soft" />
              <div className="space-y-2">
                <div className="h-5 w-48 motion-safe:animate-pulse rounded bg-rewear-soft" />
                <div className="h-4 w-28 motion-safe:animate-pulse rounded bg-rewear-soft" />
                <div className="h-5 w-20 motion-safe:animate-pulse rounded bg-rewear-soft" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-28 motion-safe:animate-pulse rounded bg-rewear-soft" />
              <div className="size-10 motion-safe:animate-pulse rounded bg-rewear-soft" />
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary skeleton */}
      <div className="border-t border-rewear-border pt-6 flex flex-col items-end gap-3">
        <div className="h-6 w-40 motion-safe:animate-pulse rounded bg-rewear-soft" />
        <div className="h-12 w-48 motion-safe:animate-pulse bg-rewear-soft" />
      </div>
    </div>
  );
}
