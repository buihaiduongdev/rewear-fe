import { Skeleton } from '@/shared/components/ui/skeleton';

export function WishlistSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading wishlist"
      className="mt-8"
    >
      <span className="sr-only">Loading wishlist…</span>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="aspect-[278/348] w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
