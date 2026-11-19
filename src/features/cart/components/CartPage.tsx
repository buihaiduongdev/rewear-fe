'use client';

import { useState, useSyncExternalStore } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';

import { DeliveryAddressModal } from '@/modules/address';
import { CartLink } from '@/modules/cart/components/CartLink';
import {
  cartQueryKey,
  useCart,
  useRemoveCartItem,
} from '@/modules/cart/hooks/use-cart';
import { CartSkeleton } from '@/modules/cart/skeletons/CartSkeleton';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { useCheckoutControllerCreate } from '@/shared/api/query-generated/checkout/checkout';
import { useUserAddressControllerFindAll } from '@/shared/api/query-generated/user-addresses/user-addresses';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { formatCondition, formatPrice } from '@/shared/utils/product';

const availabilityLabels: Record<string, string> = {
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
  const activeCheckoutId = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('storage', onStoreChange);
      return () => window.removeEventListener('storage', onStoreChange);
    },
    () => sessionStorage.getItem('activeCheckoutId'),
    () => null,
  );

  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;
  const client = useQueryClient();
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const addresses = useUserAddressControllerFindAll({
    query: {
      enabled: enabled,
      queryKey: ['/api/user-addresses', session?.user.id],
    },
  });

  const create = useCheckoutControllerCreate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const allCartItems = data?.groups.flatMap((g) => g.items) ?? [];
  const displayCount =
    (data?.summary.availableItemCount ?? 0) > 0
      ? data!.summary.availableItemCount
      : allCartItems.length;

  const displayTotal =
    (data?.summary.totalPrice ?? 0) > 0
      ? data!.summary.totalPrice
      : allCartItems.reduce(
          (sum, item) => sum + (item.product?.price ?? 0),
          0,
        );

  const handleContinueToCheckout = (customAddressId?: string) => {
    setCreateError(null);
    if (!enabled) {
      router.push('/login?callbackUrl=/cart');
      return;
    }

    const available = allCartItems.filter(
      (i) => i.availability === 'AVAILABLE' && i.product,
    );
    if (!available.length) return;

    const chosenAddressId =
      customAddressId ||
      addresses.data?.data.find((a) => a.isDefault)?.id ||
      addresses.data?.data[0]?.id;

    if (!chosenAddressId) {
      setAddressModalOpen(true);
      return;
    }

    const productIds = available.map((i) => i.productId).sort();
    const key = `rewear.checkout.request:${session?.user.id}:${chosenAddressId}:${productIds.join(',')}`;
    let requestId =
      typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
    if (!requestId) {
      requestId = crypto.randomUUID();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, requestId);
      }
    }

    create.mutate(
      { data: { requestId, addressId: chosenAddressId, productIds } },
      {
        onSuccess: (response: { data: { id: string } }) => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('activeCheckoutId', response.data.id);
            sessionStorage.removeItem(key);
            window.dispatchEvent(new Event('storage'));
          }
          void client.invalidateQueries({
            queryKey: cartQueryKey(session?.user.id),
          });
          router.push(`/checkout?id=${response.data.id}`);
        },
        onError: (err: unknown) => {
          setCreateError(getApiErrorMessage(err));
        },
      },
    );
  };

  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh">
      <MarketplaceHeader
        cartAction={<CartLink active />}
        search=""
        onSearch={(value) =>
          router.push(`/products?search=${encodeURIComponent(value)}`)
        }
      />
      <main
        id="main-content"
        className="mx-auto min-h-[60vh] max-w-[1280px] px-4 pt-4 pb-4 md:px-12 md:py-12"
      >
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
          Your cart
        </h1>
        {cart.isPending && <CartSkeleton />}
        {cart.isError && (
          <div role="alert" className="mt-8 space-y-3">
            <p>{getApiErrorMessage(cart.error)}</p>
            <button
              type="button"
              className="underline cursor-pointer"
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
          <>
            {activeCheckoutId && (
              <div className="bg-rewear-soft border-rewear-border/30 mt-6 flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold">
                  You have items reserved in an ongoing checkout.
                </p>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/checkout?id=${activeCheckoutId}`}
                    className="bg-rewear-accent text-rewear-text flex h-9 items-center justify-center px-4 text-xs font-semibold"
                  >
                    Resume checkout
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        sessionStorage.removeItem('activeCheckoutId');
                        window.dispatchEvent(new Event('storage'));
                      }
                      void cart.refetch();
                    }}
                    className="text-rewear-muted hover:text-rewear-text cursor-pointer text-xs font-semibold underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
            <div className="mt-6 grid gap-6 md:mt-8 md:gap-10 lg:grid-cols-[minmax(0,1fr)_416px]">
              <div className="space-y-8 md:space-y-10">
                {data.groups.map((group, groupIndex) => (
                  <section
                    key={group.shop?.id ?? `unavailable-${groupIndex}`}
                    className="space-y-4 md:space-y-[18px]"
                  >
                    <h2 className="text-lg leading-6 font-semibold md:text-[28px] md:leading-[34px] md:tracking-[-0.02em]">
                      {group.shop?.name ?? 'Unavailable items'}
                    </h2>

                    <div className="space-y-6">
                      {group.items.map((item) => (
                        <article
                          key={item.productId}
                          className="grid grid-cols-[80px_minmax(0,1fr)] gap-x-4 gap-y-2.5 md:grid-cols-[148px_minmax(0,1fr)] md:items-start md:gap-x-6 md:gap-y-3"
                        >
                          <div className="bg-rewear-soft relative aspect-[4/5] w-20 shrink-0 self-start md:w-[148px]">
                            <ProductPhoto
                              url={item.product?.coverUrl ?? null}
                              title={item.product?.title ?? null}
                              sizes="(min-width: 768px) 148px, 80px"
                            />
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 md:gap-2.5">
                            <h3 className="text-base leading-6 md:text-[28px] md:leading-[34px] md:font-semibold md:tracking-[-0.02em]">
                              {item.product?.title ?? 'Unavailable item'}
                            </h3>
                            {item.product && (
                              <p className="text-rewear-muted text-sm font-normal md:text-base">
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
                              <p className="text-base leading-6 font-semibold md:text-[28px] md:leading-[34px] md:tracking-[-0.02em]">
                                {formatPrice(item.product.price)}
                              </p>
                            )}
                            {item.availability !== 'AVAILABLE' && (
                              <p className="text-sm font-medium" role="status">
                                {availabilityLabels[item.availability]}
                              </p>
                            )}
                          </div>

                          <div className="col-span-2 flex items-center gap-6 pt-1 md:col-span-2 md:col-start-1">
                            <button
                              type="button"
                              className="text-rewear-muted hover:text-rewear-text cursor-pointer text-sm font-semibold transition-colors hover:underline"
                              onClick={() => {}}
                            >
                              Save for later
                            </button>
                            <button
                              type="button"
                              disabled={remove.isPending}
                              onClick={() =>
                                remove.mutate({ productId: item.productId })
                              }
                              className="hover:text-rewear-text text-rewear-muted cursor-pointer text-sm font-semibold transition-colors hover:underline disabled:opacity-50"
                            >
                              {remove.isPending &&
                              remove.variables?.productId === item.productId
                                ? 'Removing…'
                                : 'Remove'}
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
                {remove.isError && (
                  <p role="alert" className="text-xs text-red-600">
                    {getApiErrorMessage(remove.error)}
                  </p>
                )}
              </div>

              <aside
                className="bg-rewear-soft flex h-fit flex-col gap-6 p-6"
                aria-label="Cart summary"
              >
                <h2 className="text-xl leading-6 font-semibold tracking-[-0.02em] md:text-[28px] md:leading-[34px]">
                  Summary
                </h2>
                <div className="flex items-center justify-between">
                  <span className="text-rewear-muted text-sm md:text-base">
                    Items · {displayCount}
                  </span>
                  <span className="text-xl leading-6 font-semibold tracking-[-0.02em] md:text-[28px] md:leading-[34px]">
                    {formatPrice(displayTotal)}
                  </span>
                </div>
                <p className="text-rewear-muted text-sm md:text-base">
                  Shipping calculated at checkout.
                </p>
                {createError && (
                  <p role="alert" className="text-xs text-red-600">
                    {createError}
                  </p>
                )}
                {activeCheckoutId ? (
                  <Link
                    href={`/checkout?id=${activeCheckoutId}`}
                    className="bg-rewear-accent text-rewear-text flex h-[52px] w-full items-center justify-center text-sm font-semibold md:h-12"
                  >
                    Resume checkout
                  </Link>
                ) : (
                  <Link
                    href="/checkout"
                    onClick={(e) => {
                      e.preventDefault();
                      handleContinueToCheckout();
                    }}
                    className={`bg-rewear-accent text-rewear-text flex h-[52px] w-full items-center justify-center text-sm font-semibold md:h-12 ${create.isPending || displayCount === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                  >
                    {create.isPending
                      ? 'Reserving items…'
                      : 'Continue to checkout'}
                  </Link>
                )}
                <Link
                  href="/"
                  className="flex min-h-11 items-center justify-center text-center text-sm font-semibold hover:underline"
                >
                  Keep browsing
                </Link>
              </aside>
            </div>
          </>
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
      <DeliveryAddressModal
        open={addressModalOpen}
        onOpenChange={setAddressModalOpen}
        addresses={addresses.data?.data ?? []}
        selectedId={
          addresses.data?.data.find((a) => a.isDefault)?.id ||
          addresses.data?.data[0]?.id ||
          ''
        }
        onSelect={(id) => {
          setAddressModalOpen(false);
          handleContinueToCheckout(id);
        }}
      />
    </div>
  );
}
