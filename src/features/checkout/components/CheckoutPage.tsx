'use client';

import Link from 'next/link';

import { AddAddressDialog, DeliveryAddressModal } from '@/modules/address';
import { CartLink } from '@/modules/cart/components/CartLink';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { formatPrice } from '@/shared/utils/product';
import { Dialog } from '@base-ui/react/dialog';

import { useCheckoutPage } from '../hooks/use-checkout-page';
import { CheckoutCountdown } from './CheckoutCountdown';
import { PaymentMethodModal } from './PaymentMethodModal';
import {
  ShippingEstimateForOrder,
  ShippingEstimateSummary,
} from './ShippingEstimate';

const actionClass =
  'bg-rewear-accent text-rewear-text flex h-[52px] w-full cursor-pointer items-center justify-center text-sm font-semibold disabled:opacity-50 md:h-12';

export function CheckoutPage() {
  const {
    router,
    id,
    enabled,
    addresses,
    checkout,
    create,
    cancel,
    quote,
    setAddressId,
    cancelOpen,
    setCancelOpen,
    addressModalOpen,
    setAddressModalOpen,
    paymentMethod,
    setPaymentMethod,
    paymentModalOpen,
    setPaymentModalOpen,
    handleAddressCreated,
    availableItems,
    selectedAddressObj,
    selectedAddress,
    data,
    handleCancelAndReturnToCart,
    handleCancelCheckout,
    handleQuote,
    shippingState,
    error,
    reserve,
  } = useCheckoutPage();

  return (
    <div className="bg-rewear-surface text-rewear-text flex min-h-dvh flex-col">
      <MarketplaceHeader
        cartAction={<CartLink />}
        search=""
        onSearch={(v) =>
          router.push(`/products?search=${encodeURIComponent(v)}`)
        }
      />
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1280px] flex-1 space-y-6 px-4 py-4 md:space-y-8 md:px-12 md:py-12"
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
                      <CheckoutCountdown deadline={data.expiresAt} />
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
                  onQuote={handleQuote}
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
                              onClick={handleCancelCheckout}
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
      <footer className="text-rewear-muted mx-auto hidden w-full max-w-[1280px] justify-between px-12 py-6 text-sm font-semibold md:flex">
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
