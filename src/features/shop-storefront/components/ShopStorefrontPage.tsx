'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { SellerVerifiedBadge } from '@/modules/shop/components/SellerVerifiedBadge';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { useProductControllerFindAll } from '@/shared/api/query-generated/products/products';
import { useShopControllerFindOne } from '@/shared/api/query-generated/shops/shops';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import { ProductCard } from '@/shared/components/marketplace/ProductCard';
import { useToastStore } from '@/shared/stores/toast.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Heart, Star, Store } from 'lucide-react';
import { useSession } from 'next-auth/react';

import {
  fetchPublicShopRatings,
  fetchShopFollowState,
  followShop,
  unfollowShop,
} from '../api/shop-storefront';

const PAGE_LIMIT = 12;

function getShopInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (name.trim().slice(0, 2) || 'RW').toUpperCase();
}

function formatJoinedDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function ShopStorefrontPage({ shopId }: { shopId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();
  const addToast = useToastStore((s) => s.addToast);
  const [page, setPage] = useState(1);

  const isAuthenticated = sessionStatus === 'authenticated' && !session?.error;

  const shopQuery = useShopControllerFindOne(shopId, {
    query: { retry: false, meta: { skipErrorToast: true } },
  });

  const productsQuery = useProductControllerFindAll(
    { 'filter.shopId': [shopId], page, limit: PAGE_LIMIT },
    {
      query: {
        enabled: Boolean(shopQuery.data?.data.id),
        meta: { skipErrorToast: true },
      },
    },
  );

  const ratingsQuery = useQuery({
    queryKey: ['/api/ratings/shops', shopId],
    queryFn: ({ signal }) => fetchPublicShopRatings(shopId, signal),
    enabled: Boolean(shopQuery.data?.data.id),
    retry: false,
    meta: { skipErrorToast: true },
  });

  const followQueryKey = ['/api/shop-follows/shops', shopId, session?.user.id];
  const followStateQuery = useQuery({
    queryKey: followQueryKey,
    queryFn: ({ signal }) => fetchShopFollowState(shopId, signal),
    enabled: Boolean(isAuthenticated && shopQuery.data?.data.id),
    retry: false,
    meta: { skipErrorToast: true },
  });

  const toggleFollow = useMutation({
    mutationFn: (currentlyFollowing: boolean) =>
      currentlyFollowing ? unfollowShop(shopId) : followShop(shopId),
    onSuccess: (response) => {
      queryClient.setQueryData(followQueryKey, response);
      addToast({
        type: 'success',
        title: response.data.following ? 'Following shop' : 'Unfollowed shop',
        durationMs: 2500,
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Could not update follow status',
        description: getApiErrorMessage(error),
        durationMs: 4000,
      });
    },
    meta: { skipSuccessToast: true, skipErrorToast: true },
  });

  const shop = shopQuery.data?.data;
  const shopLogo = (shop as { logoUrl?: string | null } | undefined)?.logoUrl;
  const products = productsQuery.data?.data.data ?? [];
  const totalItems =
    productsQuery.data?.data.meta.totalItems ?? products.length;
  const totalPages = Math.max(1, productsQuery.data?.data.meta.totalPages ?? 1);
  const ratingSummary = ratingsQuery.data?.data.summary;
  const reviews = ratingsQuery.data?.data.ratings.slice(0, 4) ?? [];
  const isFollowing = Boolean(followStateQuery.data?.data.following);

  const handleFollowClick = () => {
    if (!isAuthenticated) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(`/shops/${shopId}`)}`,
      );
      return;
    }
    toggleFollow.mutate(isFollowing);
  };

  return (
    <div className="bg-rewear-surface text-rewear-text flex min-h-dvh flex-col">
      <MarketplaceHeader
        cartAction={<CartLink />}
        search=""
        onSearch={(value) =>
          router.push(`/products?search=${encodeURIComponent(value)}`)
        }
      />

      <main
        id="main-content"
        className="mx-auto w-full max-w-[1536px] flex-1 space-y-12 px-4 py-8 md:px-12 md:py-12"
      >
        {shopQuery.isPending ? (
          <div className="space-y-6" role="status">
            <div className="bg-rewear-soft h-36 w-full animate-pulse" />
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-rewear-soft aspect-[278/348] w-full animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : shopQuery.isError || !shop ? (
          <div className="mx-auto max-w-xl py-16 text-center">
            <div className="bg-rewear-soft text-rewear-muted mx-auto mb-4 inline-flex size-16 items-center justify-center rounded-full">
              <Store size={28} />
            </div>
            <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
              Shop not found
            </h1>
            <p className="text-rewear-muted mt-2 text-sm">
              This boutique may be closed or the link is no longer valid.
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 inline-flex min-h-11 items-center px-6 text-sm font-semibold"
              >
                Explore catalog
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Editorial Shop Header */}
            <section
              aria-labelledby="shop-name-heading"
              className="border-rewear-border flex flex-col justify-between gap-8 border-b pb-10 md:flex-row md:items-end"
            >
              <div className="flex items-start gap-5">
                <div className="bg-rewear-text text-rewear-accent flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full text-2xl font-semibold">
                  {shopLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={shopLogo}
                      alt={shop.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span>{getShopInitials(shop.name)}</span>
                  )}
                </div>

                <div className="min-w-0 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1
                      id="shop-name-heading"
                      className="text-[32px] leading-[38px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]"
                    >
                      {shop.name}
                    </h1>
                    {shop.status === 'ACTIVE' && <SellerVerifiedBadge />}
                  </div>

                  {shop.description && (
                    <p className="text-rewear-muted max-w-[65ch] text-base leading-6">
                      {shop.description}
                    </p>
                  )}

                  <div className="text-rewear-muted flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <span>
                      <strong className="text-rewear-text font-semibold">
                        {totalItems}
                      </strong>{' '}
                      {totalItems === 1 ? 'listing' : 'listings'}
                    </span>
                    {ratingSummary && ratingSummary.count > 0 ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Star
                          size={14}
                          className="fill-rewear-text text-rewear-text"
                          aria-hidden="true"
                        />
                        <strong className="text-rewear-text font-semibold">
                          {ratingSummary.average?.toFixed(1)}
                        </strong>
                        <span>
                          ({ratingSummary.count}{' '}
                          {ratingSummary.count === 1 ? 'review' : 'reviews'})
                        </span>
                      </span>
                    ) : (
                      <span>New independent shop</span>
                    )}
                    {formatJoinedDate(shop.createdAt) && (
                      <span>Joined {formatJoinedDate(shop.createdAt)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  disabled={toggleFollow.isPending}
                  onClick={handleFollowClick}
                  aria-pressed={isFollowing}
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-2 px-6 text-sm font-semibold transition disabled:opacity-50 ${
                    isFollowing
                      ? 'border-rewear-text bg-rewear-surface text-rewear-text hover:bg-rewear-soft border'
                      : 'bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check size={15} aria-hidden="true" />
                      Following
                    </>
                  ) : (
                    <>
                      <Heart size={15} aria-hidden="true" />
                      Follow shop
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Active Listings Grid */}
            <section
              aria-labelledby="shop-listings-heading"
              className="space-y-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2
                  id="shop-listings-heading"
                  className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]"
                >
                  Available pieces
                </h2>
                <span className="text-rewear-muted font-mono text-xs">
                  {totalItems} {totalItems === 1 ? 'piece' : 'pieces'}
                </span>
              </div>

              {productsQuery.isPending ? (
                <div
                  className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 md:gap-x-6 md:gap-y-8"
                  role="status"
                >
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-rewear-soft aspect-[278/348] w-full animate-pulse"
                    />
                  ))}
                </div>
              ) : productsQuery.isError ? (
                <div
                  role="alert"
                  className="bg-rewear-soft space-y-3 p-8 text-center text-sm"
                >
                  <p className="font-semibold">
                    Could not load this shop&apos;s pieces.
                  </p>
                  <button
                    type="button"
                    onClick={() => void productsQuery.refetch()}
                    className="min-h-11 cursor-pointer font-semibold underline"
                  >
                    Retry
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-rewear-soft space-y-2 p-8 text-center">
                  <p className="text-base font-semibold">
                    No active pieces right now
                  </p>
                  <p className="text-rewear-muted text-sm">
                    Follow this shop to catch new arrivals when they drop.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 md:gap-x-6 md:gap-y-8">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <nav
                      aria-label="Shop listings pagination"
                      className="border-rewear-border flex items-center justify-between border-t pt-6 text-sm font-semibold"
                    >
                      <button
                        type="button"
                        disabled={page <= 1 || productsQuery.isFetching}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="min-h-11 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <span className="text-rewear-muted font-mono text-xs">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={
                          page >= totalPages || productsQuery.isFetching
                        }
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        className="min-h-11 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </nav>
                  )}
                </>
              )}
            </section>

            {/* Buyer Reviews Section (shown when shop has public reviews) */}
            {reviews.length > 0 && (
              <section
                aria-labelledby="shop-reviews-heading"
                className="border-rewear-border space-y-6 border-t pt-10"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2
                    id="shop-reviews-heading"
                    className="text-[24px] leading-[30px] font-semibold tracking-[-0.02em]"
                  >
                    Verified buyer reviews
                  </h2>
                  {ratingSummary && (
                    <span className="text-rewear-muted text-sm">
                      {ratingSummary.average?.toFixed(1)} / 5 from{' '}
                      {ratingSummary.count}{' '}
                      {ratingSummary.count === 1 ? 'review' : 'reviews'}
                    </span>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="border-rewear-border space-y-3 border p-5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold">
                          <Star
                            size={13}
                            className="fill-rewear-text text-rewear-text"
                            aria-hidden="true"
                          />
                          {review.stars}.0
                        </span>
                        <span className="text-rewear-muted text-xs">
                          {review.verifiedTransaction
                            ? 'Verified purchase'
                            : 'Buyer review'}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm leading-6">{review.comment}</p>
                      )}
                      {review.reply && (
                        <div className="bg-rewear-soft space-y-1 p-3 text-xs leading-5">
                          <span className="font-semibold">
                            Reply from {shop.name}
                          </span>
                          <p className="text-rewear-muted">{review.reply}</p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <MarketplaceFooter showOnMobile />
      <MobileNavigation
        cartAction={
          <CartLink className="bg-rewear-soft flex min-h-11 items-center justify-center px-2 text-center" />
        }
      />
    </div>
  );
}
