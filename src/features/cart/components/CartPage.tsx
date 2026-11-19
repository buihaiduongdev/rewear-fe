'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AddAddressDialog } from '@/modules/address';
import { CartLink } from '@/modules/cart/components/CartLink';
import {
  cartQueryKey,
  useCart,
  useRemoveCartItem,
} from '@/modules/cart/hooks/use-cart';
import { CartSkeleton } from '@/modules/cart/skeletons/CartSkeleton';
import { getApiErrorMessage } from '@/shared/api/api-error';
import type { UserAddressControllerFindAll200 } from '@/shared/api/models';
import { useCheckoutControllerCreate } from '@/shared/api/query-generated/checkout/checkout';
import { useUserAddressControllerFindAll } from '@/shared/api/query-generated/user-addresses/user-addresses';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { formatCondition, formatPrice } from '@/shared/utils/product';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

const availabilityLabels: Record<string, string> = {
  HELD: 'Temporarily reserved',
  SOLD: 'Sold',
  OWN_PRODUCT: 'Your item',
  UNAVAILABLE: 'No longer available',
};

export function CartPage() {
  const router = useRouter();
  const client = useQueryClient();
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;
  const cart = useCart();
  const remove = useRemoveCartItem();
  const [addressId, setAddressId] = useState('');
  const [excluded, setExcluded] = useState<string[]>([]);

  const addresses = useUserAddressControllerFindAll({
    query: {
      enabled,
      queryKey: ['/api/user-addresses', session?.user.id],
    },
  });

  const create = useCheckoutControllerCreate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const data = cart.data?.data;

  const availableItems = useMemo(() => {
    return (
      data?.groups
        .flatMap((g) => g.items)
        .filter((i) => i.availability === 'AVAILABLE' && i.product) ?? []
    );
  }, [data]);

  const selectedItems = useMemo(() => {
    return availableItems.filter((i) => !excluded.includes(i.productId));
  }, [availableItems, excluded]);

  const selectedTotal = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + (item.product?.price ?? 0),
      0,
    );
  }, [selectedItems]);

  const selectedAddress =
    addressId ||
    addresses.data?.data.find((a) => a.isDefault)?.id ||
    addresses.data?.data[0]?.id ||
    '';

  const isAllSelected =
    availableItems.length > 0 && selectedItems.length === availableItems.length;

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setExcluded([]);
    } else {
      setExcluded(availableItems.map((i) => i.productId));
    }
  };

  const toggleItem = (productId: string, checked: boolean) => {
    setExcluded((prev) =>
      checked ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  const toggleShop = (shopItemIds: string[], checked: boolean) => {
    setExcluded((prev) => {
      if (checked) {
        return prev.filter((id) => !shopItemIds.includes(id));
      }
      return Array.from(new Set([...prev, ...shopItemIds]));
    });
  };

  const handleCheckout = () => {
    if (!selectedItems.length || !selectedAddress) return;
    const productIds = selectedItems.map((i) => i.productId).sort();
    const key = `rewear.checkout.request:${session?.user.id}:${selectedAddress}:${productIds.join(',')}`;
    let requestId = sessionStorage.getItem(key);
    if (!requestId) {
      requestId = crypto.randomUUID();
      sessionStorage.setItem(key, requestId);
    }
    create.mutate(
      { data: { requestId, addressId: selectedAddress, productIds } },
      {
        onSuccess: (response) => {
          sessionStorage.removeItem(key);
          void client.invalidateQueries({
            queryKey: cartQueryKey(session?.user.id),
          });
          router.push(`/checkout?id=${response.data.id}`);
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
              {availableItems.length > 0 && (
                <div className="bg-rewear-soft flex items-center justify-between p-4">
                  <label className="flex cursor-pointer select-none items-center gap-3 text-sm font-semibold">
                    <input
                      type="checkbox"
                      className="accent-rewear-accent size-5 shrink-0"
                      checked={isAllSelected}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                    Select all ({availableItems.length}{' '}
                    {availableItems.length === 1 ? 'item' : 'items'})
                  </label>
                  {selectedItems.length > 0 &&
                    selectedItems.length < availableItems.length && (
                      <span className="text-rewear-muted text-xs">
                        {selectedItems.length} selected
                      </span>
                    )}
                </div>
              )}

              {data.groups.map((group, groupIndex) => {
                const shopAvailableItems = group.items.filter(
                  (i) => i.availability === 'AVAILABLE' && i.product,
                );
                const shopSelectedCount = shopAvailableItems.filter(
                  (i) => !excluded.includes(i.productId),
                ).length;
                const isShopAllSelected =
                  shopAvailableItems.length > 0 &&
                  shopSelectedCount === shopAvailableItems.length;

                return (
                  <section
                    key={group.shop?.id ?? `unavailable-${groupIndex}`}
                    className="bg-rewear-soft space-y-4 p-4 md:space-y-[18px] md:bg-transparent md:p-0"
                  >
                    <div className="flex items-center gap-3">
                      {shopAvailableItems.length > 0 && (
                        <input
                          type="checkbox"
                          aria-label={`Select all from ${group.shop?.name ?? 'shop'}`}
                          className="accent-rewear-accent size-4 shrink-0"
                          checked={isShopAllSelected}
                          onChange={(e) =>
                            toggleShop(
                              shopAvailableItems.map((i) => i.productId),
                              e.target.checked,
                            )
                          }
                        />
                      )}
                      <h2 className="text-sm leading-5 font-semibold md:text-[24px] md:leading-[30px] md:tracking-[-0.02em]">
                        {group.shop?.name ?? 'Unavailable items'}
                      </h2>
                    </div>

                    {group.items.map((item) => {
                      const isAvailable =
                        item.availability === 'AVAILABLE' && !!item.product;
                      const isChecked =
                        isAvailable && !excluded.includes(item.productId);

                      return (
                        <article
                          key={item.productId}
                          className="grid grid-cols-[auto_80px_minmax(0,1fr)] items-center gap-x-4 gap-y-2.5 md:grid-cols-[auto_148px_minmax(0,1fr)] md:gap-x-6 md:gap-y-1"
                        >
                          <div className="row-span-2 flex items-center justify-center md:row-span-1">
                            {isAvailable ? (
                              <input
                                type="checkbox"
                                aria-label={`Select ${item.product?.title}`}
                                className="accent-rewear-accent size-5 shrink-0 cursor-pointer"
                                checked={isChecked}
                                disabled={create.isPending}
                                onChange={(e) =>
                                  toggleItem(item.productId, e.target.checked)
                                }
                              />
                            ) : (
                              <div className="size-5" />
                            )}
                          </div>

                          <div className="bg-rewear-soft relative row-span-2 aspect-[4/5] w-20 shrink-0 self-start md:row-span-1 md:w-[148px]">
                            <ProductPhoto
                              url={item.product?.coverUrl ?? null}
                              title={item.product?.title ?? null}
                              sizes="(min-width: 768px) 148px, 80px"
                            />
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col items-start gap-2.5">
                            <h3 className="text-base leading-6 md:text-[24px] md:leading-[30px] md:font-semibold md:tracking-[-0.02em]">
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
                              <p className="text-base leading-6 font-semibold md:text-[24px] md:leading-[30px] md:tracking-[-0.02em]">
                                {formatPrice(item.product.price)}
                              </p>
                            )}
                            {item.availability !== 'AVAILABLE' && (
                              <p className="text-sm" role="status">
                                {availabilityLabels[item.availability]}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={remove.isPending}
                            onClick={() =>
                              remove.mutate({ productId: item.productId })
                            }
                            className="col-start-3 flex min-h-11 w-full cursor-pointer items-center text-left text-sm font-semibold disabled:opacity-50 md:col-span-3 md:col-start-2"
                          >
                            {remove.isPending &&
                            remove.variables?.productId === item.productId
                              ? 'Removing…'
                              : 'Remove'}
                          </button>
                        </article>
                      );
                    })}
                  </section>
                );
              })}
              {remove.isError && (
                <p role="alert">{getApiErrorMessage(remove.error)}</p>
              )}
            </div>

            <aside
              className="bg-rewear-soft flex h-fit flex-col gap-6 p-4 md:p-6"
              aria-label="Cart summary"
            >
              <h2 className="text-lg font-semibold md:text-[24px] md:leading-[30px] md:tracking-[-0.02em]">
                Order summary
              </h2>

              <div className="space-y-3 border-b border-rewear-border/20 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    Delivery address
                  </span>
                  {session?.user.id && (
                    <AddAddressDialog
                      disabled={create.isPending}
                      onCreated={(address) => {
                        client.setQueryData<UserAddressControllerFindAll200>(
                          ['/api/user-addresses', session.user.id],
                          (previous) => ({
                            statusCode: 200,
                            message: previous?.message ?? 'Addresses loaded',
                            data: [
                              ...(previous?.data ?? []).map((a) =>
                                address.isDefault
                                  ? { ...a, isDefault: false }
                                  : a,
                              ),
                              address,
                            ],
                          }),
                        );
                        setAddressId(address.id);
                        void client.invalidateQueries({
                          queryKey: ['/api/user-addresses', session.user.id],
                        });
                      }}
                    />
                  )}
                </div>

                {!session?.user.id ? (
                  <p className="text-rewear-muted text-xs">
                    Sign in to choose a delivery address.
                  </p>
                ) : addresses.isPending ? (
                  <p className="text-rewear-muted text-xs" role="status">
                    Loading addresses…
                  </p>
                ) : addresses.data?.data.length ? (
                  <select
                    aria-label="Delivery address"
                    className="bg-rewear-surface text-xs md:text-sm min-h-11 w-full rounded border border-rewear-border/30 p-2.5"
                    value={selectedAddress}
                    onChange={(e) => setAddressId(e.target.value)}
                    disabled={create.isPending}
                  >
                    {addresses.data.data.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.recipientName} ({a.phone}) · {a.addressLine1},{' '}
                        {a.wardName}, {a.provinceName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-rewear-muted text-xs">
                    No delivery address saved. Please add one above.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-rewear-muted text-sm md:text-base">
                    Selected items ({selectedItems.length})
                  </span>
                  <span className="text-xl font-semibold tracking-[-0.01em] md:text-2xl">
                    {formatPrice(selectedTotal)}
                  </span>
                </div>
                <p className="text-rewear-muted text-xs">
                  Shipping calculated at checkout.
                </p>
              </div>

              {create.isError && (
                <p role="alert" className="text-xs text-red-600">
                  {getApiErrorMessage(create.error)}
                </p>
              )}

              {!session?.user.id ? (
                <Link
                  href="/login?redirect=/cart"
                  className="bg-rewear-accent text-rewear-text flex h-[52px] w-full items-center justify-center text-sm font-semibold md:h-12"
                >
                  Sign in to checkout
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={
                    !selectedItems.length ||
                    !selectedAddress ||
                    create.isPending
                  }
                  onClick={handleCheckout}
                  className="bg-rewear-accent text-rewear-text flex h-[52px] w-full cursor-pointer items-center justify-center text-sm font-semibold disabled:opacity-50 md:h-12"
                >
                  {create.isPending
                    ? 'Reserving items…'
                    : 'Continue to checkout'}
                </button>
              )}

              <Link
                href="/"
                className="flex min-h-11 items-center justify-center text-center text-sm font-semibold"
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
