'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { getApiErrorMessage } from '@/shared/api/api-error';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { formatCondition, formatPrice } from '@/shared/utils/product';

import { useCart, useRemoveCartItem } from '../hooks/use-cart';
import { CartLink } from './CartLink';

const availabilityLabels = {
  HELD: 'Temporarily reserved',
  SOLD: 'Sold',
  OWN_PRODUCT: 'Your item',
  UNAVAILABLE: 'No longer available',
};

export function CartPage() {
  const router = useRouter();
  const cart = useCart();
  const remove = useRemoveCartItem();
  const data = cart.data?.data;

  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh">
      <MarketplaceHeader
        cartAction={<CartLink active />}
        search=""
        onSearch={(value) =>
          router.push(`/?search=${encodeURIComponent(value)}#new-arrivals`)
        }
      />
      <main
        id="main-content"
        className="mx-auto min-h-[60vh] max-w-[1280px] px-4 pt-4 pb-4 md:px-12 md:py-12"
      >
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
          Your cart
        </h1>
        {cart.isPending && (
          <p role="status" className="mt-8">
            Loading your cart…
          </p>
        )}
        {cart.isError && (
          <div role="alert" className="mt-8 space-y-3">
            <p>{getApiErrorMessage(cart.error)}</p>
            <button
              type="button"
              className="underline"
              onClick={() => void cart.refetch()}
            >
              Try again
            </button>
          </div>
        )}
        {data && data.summary.itemCount === 0 && (
          <div className="bg-rewear-soft mt-8 p-8">
            <p>Your cart is empty.</p>
            <Link
              href="/"
              className="mt-4 inline-block font-semibold underline underline-offset-4"
            >
              Explore pieces
            </Link>
          </div>
        )}
        {data && data.summary.itemCount > 0 && (
          <div className="mt-6 grid gap-6 md:mt-8 md:gap-10 lg:grid-cols-[minmax(0,1fr)_416px]">
            <div className="space-y-6 md:space-y-8">
              {data.groups.map((group, index) => (
                <section
                  key={group.source?.id ?? `unavailable-${index}`}
                  className="bg-rewear-soft space-y-4 p-4 md:space-y-[18px] md:bg-transparent md:p-0"
                >
                  <h2 className="text-sm leading-5 font-semibold md:text-[28px] md:leading-[34px] md:tracking-[-0.02em]">
                    {group.source?.name ?? 'Unavailable items'}
                  </h2>
                  {group.items.map((item) => (
                    <article
                      key={item.productId}
                      className="flex gap-4 md:flex-wrap md:items-center md:gap-x-6 md:gap-y-1"
                    >
                      <div className="bg-rewear-soft relative aspect-[4/5] w-20 shrink-0 self-start md:w-[148px]">
                        <ProductPhoto
                          url={item.product?.coverUrl ?? null}
                          title={item.product?.title ?? null}
                          sizes="(min-width: 768px) 148px, 80px"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-2.5">
                        <h3 className="text-base leading-6 md:text-[28px] md:leading-[34px] md:font-semibold md:tracking-[-0.02em]">
                          {item.product?.title ?? 'Unavailable item'}
                        </h3>
                        {item.product && (
                          <p className="text-rewear-muted text-sm font-semibold md:text-base md:font-normal">
                            {[
                              item.product.size,
                              item.product.color,
                              formatCondition(item.product.condition),
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        )}
                        {item.product && (
                          <p className="text-base leading-6 md:text-[28px] md:leading-[34px] md:font-semibold md:tracking-[-0.02em]">
                            {formatPrice(item.product.price)}
                          </p>
                        )}
                        {item.availability !== 'AVAILABLE' && (
                          <p className="text-sm" role="status">
                            {availabilityLabels[item.availability]}
                          </p>
                        )}
                        <button
                          type="button"
                          disabled={remove.isPending}
                          onClick={() =>
                            remove.mutate({ productId: item.productId })
                          }
                          className="min-h-11 cursor-pointer text-sm font-semibold disabled:opacity-50 md:hidden"
                        >
                          {remove.isPending &&
                          remove.variables?.productId === item.productId
                            ? 'Removing…'
                            : 'Remove'}
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={remove.isPending}
                        onClick={() =>
                          remove.mutate({ productId: item.productId })
                        }
                        className="hidden min-h-11 w-full cursor-pointer items-center text-left text-sm font-semibold disabled:opacity-50 md:flex"
                      >
                        {remove.isPending &&
                        remove.variables?.productId === item.productId
                          ? 'Removing…'
                          : 'Remove'}
                      </button>
                    </article>
                  ))}
                </section>
              ))}
              {remove.isError && (
                <p role="alert">{getApiErrorMessage(remove.error)}</p>
              )}
            </div>
            <aside
              className="md:bg-rewear-soft flex h-fit flex-col gap-6 md:p-6"
              aria-label="Cart summary"
            >
              <h2 className="hidden text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:block">
                Summary
              </h2>
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-4">
                <span className="md:text-rewear-muted text-base leading-6">
                  Subtotal · {data.summary.availableItemCount}{' '}
                  {data.summary.availableItemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-[40px] leading-[46px] font-semibold tracking-[-0.02em] md:text-[28px] md:leading-[34px]">
                  {formatPrice(data.summary.totalPrice)}
                </span>
              </div>
              <p className="md:text-rewear-muted text-base leading-6">
                Shipping calculated at checkout.
              </p>
              <button
                type="button"
                disabled
                className="bg-rewear-accent text-rewear-text h-[52px] w-full text-sm opacity-60 md:h-12"
              >
                Checkout coming soon
              </button>
              <Link
                href="/"
                className="flex min-h-11 items-center justify-center text-sm font-semibold"
              >
                Keep browsing
              </Link>
            </aside>
          </div>
        )}
      </main>
      <footer className="text-rewear-muted mx-auto hidden max-w-[1280px] justify-between px-12 py-6 text-sm font-semibold md:flex">
        <span>© 2026 RE.WEAR</span>
        <span className="text-rewear-text">Help &amp; returns</span>
      </footer>
      <MobileNavigation
        active="cart"
        cartAction={
          <CartLink
            active
            className="bg-rewear-soft flex min-h-11 items-center justify-center px-3"
          />
        }
      />
    </div>
  );
}
