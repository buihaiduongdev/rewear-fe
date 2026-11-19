import { Skeleton } from '@/shared/components/ui/skeleton';

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
              <Skeleton className="size-20 shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="size-10" />
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary skeleton */}
      <div className="border-t border-rewear-border pt-6 flex flex-col items-end gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  );
}
