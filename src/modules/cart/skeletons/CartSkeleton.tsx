import { Skeleton } from '@/shared/components/ui/skeleton';

export function CartSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading shopping cart"
      className="mt-8 space-y-6"
    >
      <span className="sr-only">Loading shopping cart…</span>

      {/* Cart Items list skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-rewear-border flex flex-col gap-4 border p-4 sm:flex-row sm:items-center sm:justify-between"
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
      <div className="border-rewear-border flex flex-col items-end gap-3 border-t pt-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  );
}
