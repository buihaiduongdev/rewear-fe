'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

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
          'border-rewear-border text-rewear-text hover:bg-rewear-soft flex h-[52px] w-full items-center justify-center gap-2 border bg-white px-5 text-sm font-semibold'
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
        `flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 border text-sm font-semibold transition-colors ${
          isSaved
            ? 'border-rewear-text bg-rewear-text hover:bg-rewear-text/90 text-white'
            : 'border-rewear-border text-rewear-text hover:bg-rewear-soft bg-white'
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
