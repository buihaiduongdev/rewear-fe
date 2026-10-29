'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { cartQueryKey, useCart } from '@/modules/cart/hooks/use-cart';
import { getApiErrorMessage } from '@/shared/api/api-error';
import type { UserAddressControllerFindAll200 } from '@/shared/api/models';
import {
  useCheckoutControllerCancel,
  useCheckoutControllerCreate,
  useCheckoutControllerFind,
} from '@/shared/api/query-generated/checkout/checkout';
import { useUserAddressControllerFindAll } from '@/shared/api/query-generated/user-addresses/user-addresses';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { formatPrice } from '@/shared/utils/product';
import { Dialog } from '@base-ui/react/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { AddDeliveryAddress } from './AddDeliveryAddress';

const actionClass =
  'bg-rewear-accent text-rewear-text flex min-h-[52px] w-full items-center justify-center px-5 text-sm disabled:opacity-50';

function Countdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const seconds = Math.max(
    0,
    Math.ceil((new Date(deadline).getTime() - now) / 1000),
  );
  return (
    <p className="text-sm font-semibold">
      Reserved ·{' '}
      {Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0')}
      :{(seconds % 60).toString().padStart(2, '0')}
    </p>
  );
}

export function CheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;
  const client = useQueryClient();
  const cart = useCart();
  const addresses = useUserAddressControllerFindAll({
    query: {
      enabled: enabled && !id,
      queryKey: ['/api/user-addresses', session?.user.id],
    },
  });
  const checkout = useCheckoutControllerFind(id, {
    query: {
      enabled: enabled && !!id,
      queryKey: ['/api/checkouts', id, session?.user.id],
      refetchInterval: 5000,
      retry: false,
    },
  });
  const create = useCheckoutControllerCreate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const cancel = useCheckoutControllerCancel({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const [addressId, setAddressId] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [excluded, setExcluded] = useState<string[]>([]);
  const available =
    cart.data?.data.groups
      .flatMap((g) => g.items)
      .filter((i) => i.availability === 'AVAILABLE' && i.product) ?? [];
  const selected = available.filter((i) => !excluded.includes(i.productId));
  const selectedAddress =
    addressId ||
    addresses.data?.data.find((a) => a.isDefault)?.id ||
    addresses.data?.data[0]?.id ||
    '';
  const data = checkout.data?.data;
  const error =
    create.error ||
    cancel.error ||
    checkout.error ||
    (!id && (cart.error || addresses.error));
  const reserve = () => {
    const productIds = selected.map((i) => i.productId).sort();
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
          router.replace(`/checkout?id=${response.data.id}`);
        },
      },
    );
  };
  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh">
      <MarketplaceHeader
        cartAction={<CartLink />}
        search=""
        onSearch={(v) =>
          router.push(`/?search=${encodeURIComponent(v)}#new-arrivals`)
        }
      />
      <main
        id="main-content"
        className="mx-auto max-w-[1280px] space-y-6 px-4 py-4 md:space-y-8 md:px-12 md:py-12"
      >
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
          Checkout
        </h1>
        {!!error && <p role="alert">{getApiErrorMessage(error)}</p>}
        {id && checkout.isPending && <p role="status">Loading checkout…</p>}
        {!id && (
          <>
            <p>
              Choose your items and delivery address. Items are reserved for 10
              minutes after you continue.
            </p>
            {(cart.isPending || addresses.isPending) && (
              <p role="status">Loading items and addresses…</p>
            )}
            {available.map((item) => (
              <label
                key={item.productId}
                className="bg-rewear-soft flex min-h-11 items-center gap-4 p-4"
              >
                <input
                  type="checkbox"
                  disabled={create.isPending}
                  checked={!excluded.includes(item.productId)}
                  onChange={(e) =>
                    setExcluded(
                      e.target.checked
                        ? excluded.filter((id) => id !== item.productId)
                        : [...excluded, item.productId],
                    )
                  }
                />
                {item.product?.title} · {formatPrice(item.product!.price)}
              </label>
            ))}
            {!cart.isPending && available.length === 0 && (
              <p>No available items in your cart.</p>
            )}
            <label className="block space-y-2">
              <span className="block font-semibold">Delivery address</span>
              <select
                aria-label="Delivery address"
                className="bg-rewear-soft min-h-11 w-full p-3"
                value={selectedAddress}
                onChange={(e) => setAddressId(e.target.value)}
                disabled={!addresses.data?.data.length || create.isPending}
              >
                <option value="" disabled>
                  Select an address
                </option>
                {addresses.data?.data.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.recipientName} · {a.addressLine1}, {a.wardName},{' '}
                    {a.provinceName}
                  </option>
                ))}
              </select>
            </label>
            <AddDeliveryAddress
              disabled={create.isPending || !enabled}
              onCreated={(address) => {
                client.setQueryData<UserAddressControllerFindAll200>(
                  ['/api/user-addresses', session?.user.id],
                  (previous) => ({
                    statusCode: 200,
                    message: previous?.message ?? 'Addresses loaded',
                    data: [
                      ...(previous?.data ?? []).map((a) =>
                        address.isDefault ? { ...a, isDefault: false } : a,
                      ),
                      address,
                    ],
                  }),
                );
                setAddressId(address.id);
                void client.invalidateQueries({
                  queryKey: ['/api/user-addresses', session?.user.id],
                });
              }}
            />
            {addresses.data?.data.length === 0 && (
              <p>No delivery address saved. Add one to reserve your items.</p>
            )}
            <p className="text-[28px] font-semibold">
              {formatPrice(
                selected.reduce((sum, i) => sum + i.product!.price, 0),
              )}
            </p>
            <button
              className={actionClass}
              disabled={
                !selected.length ||
                !selectedAddress ||
                create.isPending ||
                !enabled
              }
              onClick={reserve}
            >
              {create.isPending ? 'Reserving…' : 'Reserve items'}
            </button>
          </>
        )}
        {data && (
          <>
            {data.status === 'HELD' && data.expiresAt && (
              <Countdown deadline={data.expiresAt} />
            )}
            {data.status !== 'HELD' && (
              <p role="status">
                {data.status === 'EXPIRED'
                  ? 'Reservation expired. Your items have been released.'
                  : data.status === 'CANCELLED'
                    ? 'Checkout cancelled. Your items have been released.'
                    : 'No items could be reserved.'}
              </p>
            )}
            {data.removedItems.length > 0 && (
              <p role="status">
                {data.removedItems.length} unavailable{' '}
                {data.removedItems.length === 1 ? 'item was' : 'items were'}{' '}
                removed from this checkout and your cart.
              </p>
            )}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_416px] lg:gap-10">
              <div className="space-y-6">
                <section className="bg-rewear-soft space-y-4 p-4">
                  <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
                    Deliver to {data.address.recipientName}
                  </h2>
                  <p>
                    {data.address.addressLine1}, {data.address.wardName},{' '}
                    {data.address.provinceName}
                  </p>
                  <p>{data.address.phone}</p>
                </section>
                {data.orders.map((order) => (
                  <section key={order.id} className="space-y-4">
                    <h2 className="text-sm font-semibold">
                      {order.sourceName}
                    </h2>
                    {order.items.map((item) => (
                      <article key={item.productId} className="flex gap-4">
                        <div className="bg-rewear-soft relative h-20 w-16 shrink-0">
                          <ProductPhoto
                            title={item.title}
                            url={item.coverUrl}
                            sizes="64px"
                          />
                        </div>
                        <div className="min-w-0 space-y-2">
                          <h3>{item.title}</h3>
                          <p className="text-rewear-muted text-sm">
                            {item.size}
                          </p>
                          <p>{formatPrice(item.price)}</p>
                        </div>
                      </article>
                    ))}
                    <p className="text-rewear-muted">Shipping quote pending</p>
                  </section>
                ))}
              </div>
              <aside
                className="bg-rewear-soft h-fit space-y-6 p-4 md:p-6"
                aria-label="Checkout summary"
              >
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>{formatPrice(data.subtotal)}</span>
                </div>
                <p>Shipping quote pending</p>
                <p className="text-[40px] leading-[46px] font-semibold tracking-[-0.02em]">
                  {formatPrice(data.subtotal)}
                </p>
                <p className="text-sm">
                  Item subtotal. Shipping and payment are not available yet.
                </p>
                <button disabled className={actionClass}>
                  Payment unavailable
                </button>
              </aside>
            </div>
            {data.status === 'HELD' && (
              <Dialog.Root
                open={cancelOpen}
                onOpenChange={(value) => {
                  if (!cancel.isPending) setCancelOpen(value);
                }}
              >
                <Dialog.Trigger className="min-h-11 w-full text-center text-sm font-semibold">
                  Cancel checkout
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
                  <Dialog.Popup className="bg-rewear-surface text-rewear-text fixed bottom-0 left-0 z-50 flex w-full flex-col gap-6 p-4 outline-none md:top-1/2 md:bottom-auto md:left-1/2 md:w-[440px] md:-translate-x-1/2 md:-translate-y-1/2 md:p-6">
                    <Dialog.Close
                      disabled={cancel.isPending}
                      className="min-h-11 text-left text-sm font-semibold"
                    >
                      Close ×
                    </Dialog.Close>
                    <Dialog.Title className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
                      Leave checkout?
                    </Dialog.Title>
                    <Dialog.Description>
                      Cancel to release your reserved items and return to the
                      cart.
                    </Dialog.Description>
                    <Dialog.Close
                      disabled={cancel.isPending}
                      className={actionClass}
                    >
                      Keep checking out
                    </Dialog.Close>
                    <button
                      className="bg-rewear-soft min-h-[52px] w-full text-sm"
                      disabled={cancel.isPending}
                      onClick={() =>
                        cancel.mutate(
                          { id: data.id },
                          {
                            onSuccess: () => {
                              setCancelOpen(false);
                              void checkout.refetch();
                              void client.invalidateQueries({
                                queryKey: cartQueryKey(session?.user.id),
                              });
                            },
                          },
                        )
                      }
                    >
                      {cancel.isPending ? 'Cancelling…' : 'Cancel checkout'}
                    </button>
                    {cancel.isError && (
                      <p role="alert">{getApiErrorMessage(cancel.error)}</p>
                    )}
                  </Dialog.Popup>
                </Dialog.Portal>
              </Dialog.Root>
            )}
          </>
        )}
        <Link
          href="/cart"
          className="flex min-h-11 items-center justify-center text-sm font-semibold"
        >
          Back to cart
        </Link>
      </main>
      <MobileNavigation
        cartAction={
          <CartLink className="bg-rewear-soft flex min-h-11 items-center justify-center px-3" />
        }
      />
    </div>
  );
}
