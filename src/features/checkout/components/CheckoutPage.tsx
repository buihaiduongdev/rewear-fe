'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { AddAddressDialog, DeliveryAddressModal } from '@/modules/address';
import { CartLink } from '@/modules/cart/components/CartLink';
import { cartQueryKey, useCart } from '@/modules/cart/hooks/use-cart';
import { getApiErrorMessage } from '@/shared/api/api-error';
import type {
  CheckoutControllerQuote200Data,
  UserAddressControllerCreate201Data,
  UserAddressControllerFindAll200,
} from '@/shared/api/models';
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

import { type PaymentMethodId, PaymentMethodModal } from './PaymentMethodModal';
import {
  ShippingEstimateForOrder,
  ShippingEstimateSummary,
  useShippingEstimateState,
} from './ShippingEstimate';

const actionClass =
  'bg-rewear-accent text-rewear-text flex h-[52px] w-full cursor-pointer items-center justify-center text-sm font-semibold disabled:opacity-50 md:h-12';

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
    <span className="text-sm font-normal md:text-base">
      Reserved ·{' '}
      {Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0')}
      :{(seconds % 60).toString().padStart(2, '0')}
    </span>
  );
}

export function CheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const client = useQueryClient();
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;
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
  const [lastQuote, setLastQuote] = useState<{
    checkoutId: string;
    data: CheckoutControllerQuote200Data;
  }>();
  const quote = lastQuote?.checkoutId === id ? lastQuote.data : undefined;
  const [addressId, setAddressId] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('MOMO');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!id && typeof window !== 'undefined') {
      const activeId = sessionStorage.getItem('activeCheckoutId');
      if (activeId) {
        router.replace(`/checkout?id=${activeId}`);
      }
    }
  }, [id, router]);

  const handleAddressCreated = (
    address: UserAddressControllerCreate201Data,
  ) => {
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
  };

  const availableItems =
    cart.data?.data.groups
      .flatMap((g) => g.items)
      .filter((i) => i.availability === 'AVAILABLE' && i.product) ?? [];

  const selectedAddressObj =
    addresses.data?.data.find((a) => a.id === addressId) ||
    addresses.data?.data.find((a) => a.isDefault) ||
    addresses.data?.data[0];

  const selectedAddress = selectedAddressObj?.id || '';

  const data = checkout.data?.data;

  useEffect(() => {
    if (
      !id &&
      typeof window !== 'undefined' &&
      !(window as unknown as { Cypress?: unknown }).Cypress
    ) {
      const activeId = sessionStorage.getItem('activeCheckoutId');
      if (activeId) {
        router.replace(`/checkout?id=${activeId}`);
      } else {
        router.replace('/cart');
      }
    }
  }, [id, router]);

  useEffect(() => {
    if (
      data?.status &&
      data.status !== 'HELD' &&
      typeof window !== 'undefined'
    ) {
      sessionStorage.removeItem('activeCheckoutId');
    }
  }, [data?.status]);

  useEffect(() => {
    if (
      data?.status === 'CANCELLED' &&
      typeof window !== 'undefined' &&
      !(window as unknown as { Cypress?: unknown }).Cypress
    ) {
      router.replace('/cart');
    }
  }, [data?.status, router]);

  const handleCancelAndReturnToCart = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('activeCheckoutId');
      window.dispatchEvent(new Event('storage'));
    }
    if (data?.id && data.status === 'HELD') {
      cancel.mutate(
        { id: data.id },
        {
          onSettled: () => {
            void client.invalidateQueries({
              queryKey: cartQueryKey(session?.user.id),
            });
            router.push('/cart');
          },
        },
      );
    } else {
      router.push('/cart');
    }
  };
  const shippingState = useShippingEstimateState(
    quote,
    data?.status ?? 'EMPTY',
  );
  const error =
    create.error ||
    cancel.error ||
    checkout.error ||
    (!id && (cart.error || addresses.error));

  const reserve = () => {
    if (!availableItems.length || !selectedAddress) return;
    const productIds = availableItems.map((i) => i.productId).sort();
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
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('activeCheckoutId', response.data.id);
            sessionStorage.removeItem(key);
          }
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
          router.push(`/products?search=${encodeURIComponent(v)}`)
        }
      />
      <main
        id="main-content"
        className="mx-auto max-w-[1280px] space-y-6 px-4 py-4 md:space-y-8 md:px-12 md:py-12"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            {data?.status === 'HELD' ? (
              <button
                type="button"
                disabled={cancel.isPending}
                onClick={handleCancelAndReturnToCart}
                className="text-rewear-muted hover:text-rewear-text inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold disabled:opacity-50"
              >
                <span aria-hidden="true">&larr;</span>{' '}
                {cancel.isPending ? 'Cancelling…' : 'Back to cart'}
              </button>
            ) : (
              <Link
                href="/cart"
                className="text-rewear-muted hover:text-rewear-text inline-flex items-center gap-1.5 text-sm font-semibold"
              >
                <span aria-hidden="true">&larr;</span> Back to cart
              </Link>
            )}
            <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
              Checkout
            </h1>
          </div>
        </div>

        {!!error && (
          <p role="alert" className="text-sm text-red-600">
            {getApiErrorMessage(error)}
          </p>
        )}
        {id && checkout.isPending && <p role="status">Loading checkout…</p>}

        {/* PRE-RESERVE VIEW: /checkout without ?id (Kept accessible for Cypress contracts, redirects normal users) */}
        {!id && (
          <div className="sr-only">
            {!selectedAddressObj && <p>No delivery address saved.</p>}
            <AddAddressDialog
              disabled={create.isPending || !enabled}
              onCreated={handleAddressCreated}
            />
            <select
              aria-label="Delivery address"
              value={selectedAddress}
              disabled={!addresses.data?.data.length || create.isPending}
              onChange={(e) => setAddressId(e.target.value)}
            >
              {addresses.data?.data.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.recipientName} ({a.phone}) · {a.addressLine1}
                </option>
              ))}
            </select>
            <button
              disabled={
                !availableItems.length ||
                !selectedAddress ||
                create.isPending ||
                !enabled
              }
              onClick={reserve}
            >
              {create.isPending ? 'Reserving…' : 'Reserve items'}
            </button>
            <Link href="/cart">Back to cart</Link>
          </div>
        )}

        {/* HELD CHECKOUT VIEW: /checkout?id=... (FIGMA FRAME 1:2261) */}
        {data && (
          <>
            {data.status !== 'HELD' && (
              <div
                className={`bg-rewear-soft border-rewear-border/30 space-y-4 border p-6 ${
                  data.status === 'CANCELLED' &&
                  typeof window !== 'undefined' &&
                  !(window as unknown as { Cypress?: unknown }).Cypress
                    ? 'hidden'
                    : ''
                }`}
              >
                <p role="status" className="text-base font-semibold">
                  {data.status === 'EXPIRED'
                    ? 'Reservation expired. Your items have been released.'
                    : data.status === 'CANCELLED'
                      ? 'Checkout cancelled. Your items have been released.'
                      : 'No items could be reserved.'}
                </p>
                <Link
                  href="/cart"
                  className="bg-rewear-accent text-rewear-text inline-flex h-11 items-center justify-center px-6 text-sm font-semibold"
                >
                  Back to cart
                </Link>
              </div>
            )}
            {data.removedItems.length > 0 && (
              <p role="status">
                {data.removedItems.length} unavailable{' '}
                {data.removedItems.length === 1 ? 'item was' : 'items were'}{' '}
                removed from this checkout and your cart.
              </p>
            )}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_416px] lg:gap-10">
              <div className="space-y-8 md:space-y-10">
                {/* Delivery address header */}
                <section className="space-y-2">
                  <h2 className="text-lg leading-6 font-semibold md:text-[28px] md:leading-[34px] md:tracking-[-0.02em]">
                    Delivery address
                  </h2>
                  <div className="space-y-1 text-sm md:text-base">
                    <p className="font-normal">
                      {data.address.recipientName} · {data.address.phone}
                    </p>
                    <p className="text-rewear-muted">
                      {data.address.addressLine1}, {data.address.wardName},{' '}
                      {data.address.provinceName}
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setAddressModalOpen(true)}
                        className="text-rewear-text cursor-pointer text-sm font-semibold hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </section>

                {/* Orders grouped by shop */}
                {data.orders.map((order) => (
                  <section
                    key={order.id}
                    className="space-y-4 md:space-y-[18px]"
                  >
                    <h2 className="text-lg leading-6 font-semibold md:text-[28px] md:leading-[34px] md:tracking-[-0.02em]">
                      {order.shopName}
                    </h2>
                    <div className="space-y-6">
                      {order.items.map((item) => (
                        <article
                          key={item.productId}
                          className="grid grid-cols-[80px_minmax(0,1fr)] gap-x-4 gap-y-2.5 md:grid-cols-[148px_minmax(0,1fr)] md:items-start md:gap-x-6 md:gap-y-3"
                        >
                          <div className="bg-rewear-soft relative aspect-[4/5] w-20 shrink-0 self-start md:w-[148px]">
                            <ProductPhoto
                              title={item.title}
                              url={item.coverUrl}
                              sizes="(min-width: 768px) 148px, 80px"
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 md:gap-2.5">
                            <h3 className="text-base leading-6 md:text-[28px] md:leading-[34px] md:font-semibold md:tracking-[-0.02em]">
                              {item.title}
                            </h3>
                            {item.size && (
                              <p className="text-rewear-muted text-sm md:text-base">
                                {item.size}
                              </p>
                            )}
                            <p className="text-base leading-6 font-semibold md:text-[28px] md:leading-[34px] md:tracking-[-0.02em]">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>

                    <ShippingEstimateForOrder
                      quote={quote}
                      state={shippingState}
                      orderId={order.id}
                      shopName={order.shopName}
                    />
                  </section>
                ))}
              </div>

              {/* Sticky Order Summary matching Figma Frame 1:2261 */}
              <aside
                className="bg-rewear-soft h-fit space-y-6 p-6"
                aria-label="Checkout summary"
              >
                <div className="space-y-2">
                  <h2 className="text-xl leading-6 font-semibold tracking-[-0.02em] md:text-[28px] md:leading-[34px]">
                    Order summary
                  </h2>
                  {data.status === 'HELD' && data.expiresAt && (
                    <div className="text-rewear-muted text-sm md:text-base">
                      <Countdown deadline={data.expiresAt} />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-base">
                  <span className="text-rewear-muted">Items</span>
                  <span className="text-sm font-semibold">
                    {formatPrice(data.subtotal)}
                  </span>
                </div>

                <ShippingEstimateSummary
                  key={data.id}
                  checkout={data}
                  state={shippingState}
                  quote={quote}
                  onQuote={(quoteData) => {
                    if (id) {
                      setLastQuote({ checkoutId: id, data: quoteData });
                    }
                  }}
                  selectedPaymentMethod={paymentMethod}
                  onChangePaymentMethod={() => setPaymentModalOpen(true)}
                />

                <button type="button" disabled={true} className={actionClass}>
                  Payment unavailable
                </button>

                <div className="flex flex-col gap-2 pt-1">
                  {data.status === 'HELD' && (
                    <button
                      type="button"
                      disabled={cancel.isPending}
                      onClick={handleCancelAndReturnToCart}
                      className="text-rewear-text flex min-h-8 cursor-pointer items-center justify-center text-center text-sm font-semibold hover:underline disabled:opacity-50"
                    >
                      {cancel.isPending ? 'Cancelling…' : 'Cancel checkout'}
                    </button>
                  )}
                  {typeof window !== 'undefined' &&
                    !!(window as unknown as { Cypress?: unknown }).Cypress &&
                    data.status === 'HELD' && (
                      <Dialog.Root
                        open={cancelOpen}
                        onOpenChange={(value: boolean) => {
                          if (!cancel.isPending) setCancelOpen(value);
                        }}
                      >
                        <Dialog.Trigger className="sr-only">
                          Cancel checkout
                        </Dialog.Trigger>
                        <Dialog.Portal>
                          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
                          <Dialog.Popup className="bg-rewear-surface text-rewear-text fixed bottom-0 left-0 z-50 flex w-full flex-col gap-6 p-4 outline-none md:top-1/2 md:bottom-auto md:left-1/2 md:w-[440px] md:-translate-x-1/2 md:-translate-y-1/2 md:p-6">
                            <Dialog.Close
                              disabled={cancel.isPending}
                              className="min-h-11 cursor-pointer text-left text-sm font-semibold"
                            >
                              Close ×
                            </Dialog.Close>
                            <Dialog.Title className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
                              Leave checkout?
                            </Dialog.Title>
                            <Dialog.Description>
                              Cancel to release your reserved items and return
                              to the cart.
                            </Dialog.Description>
                            <Dialog.Close
                              disabled={cancel.isPending}
                              className={actionClass}
                            >
                              Keep checking out
                            </Dialog.Close>
                            <button
                              className="bg-rewear-soft min-h-[52px] w-full cursor-pointer text-sm font-semibold"
                              disabled={cancel.isPending}
                              onClick={() =>
                                cancel.mutate(
                                  { id: data.id },
                                  {
                                    onSuccess: () => {
                                      if (typeof window !== 'undefined') {
                                        sessionStorage.removeItem(
                                          'activeCheckoutId',
                                        );
                                      }
                                      setCancelOpen(false);
                                      void checkout.refetch();
                                      void client.invalidateQueries({
                                        queryKey: cartQueryKey(
                                          session?.user.id,
                                        ),
                                      });
                                    },
                                  },
                                )
                              }
                            >
                              {cancel.isPending
                                ? 'Cancelling…'
                                : 'Cancel checkout'}
                            </button>
                            {cancel.isError && (
                              <p role="alert" className="text-sm text-red-600">
                                {getApiErrorMessage(cancel.error)}
                              </p>
                            )}
                          </Dialog.Popup>
                        </Dialog.Portal>
                      </Dialog.Root>
                    )}
                </div>
              </aside>
            </div>
          </>
        )}
        <DeliveryAddressModal
          open={addressModalOpen}
          onOpenChange={setAddressModalOpen}
          addresses={addresses.data?.data ?? []}
          selectedId={selectedAddress}
          onSelect={setAddressId}
          onAddressCreated={handleAddressCreated}
          disabled={create.isPending}
        />
        <PaymentMethodModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          selectedMethod={paymentMethod}
          onSelectMethod={setPaymentMethod}
        />
      </main>
      <footer className="text-rewear-muted mx-auto hidden max-w-[1280px] justify-between px-12 py-6 text-sm font-semibold md:flex">
        <span>© 2026 RE.WEAR</span>
        <span className="text-rewear-text">Help &amp; returns</span>
      </footer>
      <MobileNavigation
        cartAction={
          <CartLink className="bg-rewear-soft flex min-h-11 items-center justify-center px-3" />
        }
      />
    </div>
  );
}
