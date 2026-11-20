'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { useAddCartItem } from '@/modules/cart/hooks/use-cart';
import {
  useRemoveFromWishlist,
  useWishlist,
} from '@/modules/wishlist/hooks/use-wishlist';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { Badge } from '@/shared/components/ui/badge';
import { formatCondition, formatPrice } from '@/shared/utils/product';
import { Trash2 } from 'lucide-react';

import { WishlistSkeleton } from '../skeletons/WishlistSkeleton';

const availabilityLabels: Record<string, string> = {
  HELD: 'Temporarily reserved',
  SOLD: 'Sold',
  OWN_PRODUCT: 'Your item',
  UNAVAILABLE: 'No longer available',
};

export function WishlistPage() {
  const router = useRouter();
  const wishlist = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddCartItem();

  const data = wishlist.data?.data;
  const items = data?.items ?? [];

  const handleMoveToCart = (productId: string) => {
    addToCart.mutate(
      { productId, data: {} },
      {
        onSuccess: () => {
          removeFromWishlist.mutate({ productId });
        },
      },
    );
  };

  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh">
      <MarketplaceHeader
        cartAction={<CartLink />}
        search=""
        onSearch={(value) =>
          router.push(`/products?search=${encodeURIComponent(value)}`)
        }
      />

      <main
        id="main-content"
        className="mx-auto min-h-[60vh] max-w-[1280px] px-4 pt-4 pb-12 md:px-12 md:py-12"
      >
        <div className="border-rewear-border/60 flex flex-col gap-2 border-b pb-6 md:flex-row md:items-baseline md:justify-between">
          <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
            Wishlist
          </h1>
          {data && (
            <span className="text-rewear-muted text-sm font-semibold">
              {items.length}{' '}
              {items.length === 1 ? 'saved piece' : 'saved pieces'}
            </span>
          )}
        </div>

        {wishlist.isPending && <WishlistSkeleton />}

        {wishlist.isError && (
          <div role="alert" className="mt-8 space-y-3">
            <p>{getApiErrorMessage(wishlist.error)}</p>
            <button
              type="button"
              className="cursor-pointer underline"
              onClick={() => void wishlist.refetch()}
            >
              Try again
            </button>
          </div>
        )}

        {data && items.length === 0 && (
          <div className="bg-rewear-soft mt-8 p-8 md:p-12">
            <h2 className="text-xl font-bold tracking-tight">
              Your wishlist is empty
            </h2>
            <p className="text-rewear-muted mt-2 max-w-md text-sm leading-relaxed">
              Save unique pre-loved and vintage items you love to keep track of
              them and buy later.
            </p>
            <Link
              href="/products"
              className="bg-rewear-accent text-rewear-text mt-6 inline-flex h-11 items-center justify-center px-6 text-sm font-semibold transition-opacity hover:opacity-90"
            >
              Explore pieces
            </Link>
          </div>
        )}

        {data && items.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const product = item.product;
              const isAvailable = item.availability === 'AVAILABLE';

              return (
                <article
                  key={item.productId}
                  className="group border-rewear-border/60 flex flex-col justify-between border bg-white p-3 transition-shadow hover:shadow-sm sm:p-4"
                >
                  <div className="space-y-3">
                    <div className="bg-rewear-soft relative aspect-[278/348] w-full overflow-hidden">
                      <Link
                        href={`/products/${item.productId}`}
                        aria-label={`View ${product?.title ?? 'piece'}`}
                        className="block size-full"
                      >
                        <ProductPhoto
                          url={product?.coverUrl ?? null}
                          title={product?.title ?? null}
                          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                        />
                      </Link>

                      {/* Quick Remove Button */}
                      <button
                        type="button"
                        aria-label="Remove from wishlist"
                        disabled={removeFromWishlist.isPending}
                        onClick={() =>
                          removeFromWishlist.mutate({
                            productId: item.productId,
                          })
                        }
                        className="text-rewear-muted absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-xs transition-colors hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="size-4" />
                      </button>

                      {/* Status Badge */}
                      {!isAvailable && (
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="destructive" className="text-xs">
                            {availabilityLabels[item.availability] ??
                              item.availability}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      {product?.shop?.name && (
                        <p className="text-rewear-muted text-xs font-semibold tracking-wider uppercase">
                          {product.shop.name}
                        </p>
                      )}
                      <h3 className="line-clamp-2 text-sm leading-snug font-semibold group-hover:underline">
                        <Link href={`/products/${item.productId}`}>
                          {product?.title ?? 'Unavailable piece'}
                        </Link>
                      </h3>
                      {product && (
                        <p className="text-rewear-muted text-xs">
                          {[
                            product.size,
                            product.color,
                            formatCondition(product.condition),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                      {product && (
                        <p className="text-rewear-text pt-0.5 text-sm font-bold">
                          {formatPrice(product.price)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    {isAvailable ? (
                      <button
                        type="button"
                        disabled={
                          addToCart.isPending || removeFromWishlist.isPending
                        }
                        onClick={() => handleMoveToCart(item.productId)}
                        className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex h-10 w-full cursor-pointer items-center justify-center text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {addToCart.isPending &&
                        addToCart.variables?.productId === item.productId
                          ? 'Adding to cart…'
                          : 'Move to cart'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="bg-rewear-soft text-rewear-muted flex h-10 w-full cursor-not-allowed items-center justify-center text-xs font-semibold"
                      >
                        {availabilityLabels[item.availability] ?? 'Unavailable'}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="text-rewear-muted mx-auto hidden max-w-[1280px] justify-between px-12 py-6 text-sm font-semibold md:flex">
        <span>© 2026 RE.WEAR</span>
        <span className="text-rewear-text">Help &amp; returns</span>
      </footer>

      <MobileNavigation active="wishlist" />
    </div>
  );
}
