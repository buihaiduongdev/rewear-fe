'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { getApiErrorMessage } from '@/shared/api/api-error';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
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
        className="mx-auto min-h-[60vh] max-w-[1440px] px-4 py-10 md:px-12 md:py-16"
      >
        <Link
          href="/"
          className="text-sm font-semibold underline underline-offset-4"
        >
          Continue browsing
        </Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight md:text-5xl">
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
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              {data.groups.map((group, index) => (
                <section key={group.source?.id ?? `unavailable-${index}`}>
                  <h2 className="border-rewear-border border-b pb-4 text-lg font-semibold">
                    {group.source?.name ?? 'Unavailable items'}
                  </h2>
                  {group.items.map((item) => (
                    <article
                      key={item.productId}
                      className="border-rewear-border flex gap-4 border-b py-5 md:gap-6"
                    >
                      <div className="bg-rewear-soft relative aspect-[4/5] w-24 shrink-0 md:w-32">
                        <ProductPhoto
                          url={item.product?.coverUrl ?? null}
                          title={item.product?.title ?? null}
                          sizes="128px"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
                        <h3 className="text-base font-semibold">
                          {item.product?.title ?? 'Unavailable item'}
                        </h3>
                        {item.product && (
                          <p className="text-rewear-muted text-sm">
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
                          <p className="font-semibold">
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
                          className="mt-auto min-h-11 cursor-pointer text-sm underline underline-offset-4 disabled:opacity-50"
                        >
                          {remove.isPending &&
                          remove.variables?.productId === item.productId
                            ? 'Removing…'
                            : 'Remove'}
                        </button>
                      </div>
                    </article>
                  ))}
                </section>
              ))}
              {remove.isError && (
                <p role="alert">{getApiErrorMessage(remove.error)}</p>
              )}
            </div>
            <aside
              className="bg-rewear-soft h-fit space-y-4 p-6"
              aria-label="Cart summary"
            >
              <h2 className="text-xl font-semibold">Summary</h2>
              <div className="flex justify-between gap-4">
                <span>Available items ({data.summary.availableItemCount})</span>
                <span>{formatPrice(data.summary.totalPrice)}</span>
              </div>
              <p className="text-rewear-muted text-sm">
                Subtotal excludes shipping. Availability and prices may change.
              </p>
              <button
                type="button"
                disabled
                className="bg-rewear-text w-full p-4 text-white opacity-50"
              >
                Checkout coming soon
              </button>
            </aside>
          </div>
        )}
      </main>
      <MarketplaceFooter />
      <MobileNavigation
        active="cart"
        cartAction={
          <CartLink
            active
            className="bg-rewear-soft flex min-h-11 items-center px-3"
          />
        }
      />
    </div>
  );
}
