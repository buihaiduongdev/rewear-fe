'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { useSession } from 'next-auth/react';
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from '../hooks/use-wishlist';

export function SaveToWishlistButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const params = useSearchParams();
  const wishlist = useWishlist();
  const add = useAddToWishlist();
  const remove = useRemoveFromWishlist();

  const isSaved = wishlist.data?.data.items.some(
    (item) => item.productId === productId,
  );

  if (status !== 'authenticated' || session?.error) {
    const callbackUrl = `${pathname}${params.size ? `?${params}` : ''}`;
    return (
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        className={
          className ??
          'flex h-[52px] w-full items-center justify-center gap-2 border border-rewear-border bg-white px-5 text-sm font-semibold text-rewear-text hover:bg-rewear-soft'
        }
      >
        <Bookmark className="size-4" />
        <span>Save for later</span>
      </Link>
    );
  }

  const isPending = add.isPending || remove.isPending;

  const handleToggle = () => {
    if (isSaved) {
      remove.mutate({ productId });
    } else {
      add.mutate({ productId, data: {} });
    }
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      className={
        className ??
        `flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 border transition-colors text-sm font-semibold ${
          isSaved
            ? 'border-rewear-text bg-rewear-text text-white hover:bg-rewear-text/90'
            : 'border-rewear-border bg-white text-rewear-text hover:bg-rewear-soft'
        } disabled:opacity-50`
      }
    >
      <Bookmark
        className={`size-4 ${isSaved ? 'fill-current text-white' : ''}`}
      />
      <span>
        {isPending
          ? 'Updating…'
          : isSaved
            ? 'Saved for later'
            : 'Save for later'}
      </span>
    </button>
  );
}
