'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  usePaymentControllerFind,
  usePaymentControllerReconcile,
} from '@/shared/api/query-generated/payments/payments';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import {
  PolicyModals,
  type PolicyModalType,
} from '@/shared/components/marketplace/PolicyModals';
import { formatPrice } from '@/shared/utils/product';
import { useSession } from 'next-auth/react';

import {
  clearLastPaymentSession,
  type PaymentAttemptView,
  readLastPaymentSession,
} from '../api/checkout-payment.api';

const PENDING_STATES = new Set(['CREATING', 'PENDING', 'UNKNOWN']);

export function PaymentResultPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [policyModal, setPolicyModal] = useState<PolicyModalType>(null);

  const stored = useMemo(() => readLastPaymentSession(), []);
  const paymentId =
    params.get('paymentId') || params.get('id') || stored?.paymentId || '';
  const checkoutId = params.get('checkoutId') || stored?.checkoutId || '';
  const resultCode = params.get('resultCode');
  const queryStatus = params.get('status')?.toUpperCase() || '';
  const queryCancelled = params.get('cancel') === 'true';

  const isAuthenticated = sessionStatus === 'authenticated' && !session?.error;

  const paymentQuery = usePaymentControllerFind(paymentId, {
    query: {
      enabled: isAuthenticated && Boolean(paymentId),
      retry: false,
      refetchInterval: (query) => {
        const state = query.state.data?.data?.state;
        return !state || PENDING_STATES.has(state) ? 3000 : false;
      },
    },
  });

  const reconcile = usePaymentControllerReconcile({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onSuccess: () => {
        void paymentQuery.refetch();
      },
    },
  });

  const payment = paymentQuery.data?.data as PaymentAttemptView | undefined;
  const effectiveCheckoutId = payment?.checkoutId || checkoutId;
  const amount = payment?.amount ?? stored?.amount ?? null;
  const state = payment?.state;

  // Clear local checkout & payment session once settled or refunded
  useEffect(() => {
    if (
      state === 'PAID' ||
      state === 'REFUND_REQUIRED' ||
      state === 'REFUNDED'
    ) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('activeCheckoutId');
      }
      clearLastPaymentSession();
    }
  }, [state]);

  const isPaid = state === 'PAID';
  const isRefundFlow =
    state === 'REFUND_REQUIRED' ||
    state === 'REFUNDED' ||
    Boolean(payment?.refunds?.length);
  const isFailed =
    state === 'FAILED' ||
    (!state &&
      (queryCancelled ||
        queryStatus === 'CANCELLED' ||
        queryStatus === 'EXPIRED' ||
        (resultCode !== null && resultCode !== '0')));
  const isPending = !isPaid && !isRefundFlow && !isFailed && Boolean(paymentId);

  const handleCheckStatus = () => {
    if (!paymentId) return;
    reconcile.mutate({ id: paymentId });
  };

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
        className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center px-4 py-12 md:px-12 md:py-20"
      >
        <div className="w-full max-w-[600px] space-y-6">
          <h1 className="text-center text-[32px] leading-[38px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
            {isPaid
              ? 'Payment confirmed'
              : isRefundFlow
                ? 'Late payment refund in progress'
                : isFailed
                  ? 'Payment was not completed'
                  : 'Confirming your payment'}
          </h1>

          <section className="border-rewear-border bg-rewear-soft space-y-6 border p-6 md:p-8">
            {amount !== null && (
              <div className="flex items-baseline justify-between gap-4 border-b border-[#E2E2E4] pb-4">
                <span className="text-rewear-muted text-sm font-semibold">
                  Amount
                </span>
                <span className="font-mono text-[28px] leading-[34px] font-semibold tracking-[-0.02em] tabular-nums">
                  {formatPrice(amount)}
                </span>
              </div>
            )}

            {paymentId && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-rewear-muted">Payment reference</span>
                <span className="font-mono text-xs font-semibold">
                  {paymentId.slice(0, 8).toUpperCase()}
                </span>
              </div>
            )}

            {sessionStatus === 'unauthenticated' && (
              <div className="space-y-4">
                <p className="text-rewear-muted text-sm leading-6">
                  Sign in to verify your payment status and view your orders.
                </p>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(`/payment-result${paymentId ? `?paymentId=${paymentId}` : ''}`)}`}
                  className="bg-rewear-accent text-rewear-text flex h-12 w-full items-center justify-center text-sm font-semibold"
                >
                  Sign in to check payment
                </Link>
              </div>
            )}

            {sessionStatus !== 'unauthenticated' && !paymentId && (
              <div className="space-y-4">
                <p className="text-rewear-muted text-sm leading-6">
                  We couldn&apos;t find a payment reference in this link. Check
                  your orders page to see if your payment was recorded.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/orders"
                    className="bg-rewear-accent text-rewear-text flex h-12 flex-1 items-center justify-center text-sm font-semibold"
                  >
                    Go to orders
                  </Link>
                  <Link
                    href="/cart"
                    className="border-rewear-border bg-rewear-surface text-rewear-text flex h-12 flex-1 items-center justify-center border text-sm font-semibold"
                  >
                    Back to cart
                  </Link>
                </div>
              </div>
            )}

            {isAuthenticated && isPaid && (
              <div className="space-y-5">
                <p className="text-rewear-text text-base leading-6">
                  Your payment is verified and your order has been sent to the
                  seller for confirmation.
                </p>
                <p className="text-rewear-muted text-sm leading-5">
                  Sellers confirm within 24 hours. Your funds remain protected
                  in escrow until 72 hours after delivery.
                </p>
                <Link
                  href="/orders"
                  className="bg-rewear-accent text-rewear-text flex h-12 w-full items-center justify-center text-sm font-semibold"
                >
                  View your orders
                </Link>
              </div>
            )}

            {isAuthenticated && isPending && (
              <div className="space-y-5">
                <p
                  role="status"
                  className="text-rewear-text text-base leading-6"
                >
                  Please wait before paying again. We are confirming your
                  payment with the provider before your 10-minute reservation
                  expires.
                </p>
                <button
                  type="button"
                  disabled={reconcile.isPending || paymentQuery.isFetching}
                  onClick={handleCheckStatus}
                  className="bg-rewear-accent text-rewear-text flex h-12 w-full cursor-pointer items-center justify-center text-sm font-semibold disabled:opacity-50"
                >
                  {reconcile.isPending
                    ? 'Checking payment status…'
                    : 'Check payment status'}
                </button>
                <div className="flex items-center justify-between pt-1 text-sm">
                  <Link
                    href="/orders"
                    className="text-rewear-text font-semibold hover:underline"
                  >
                    View orders
                  </Link>
                  {effectiveCheckoutId && (
                    <Link
                      href={`/checkout?id=${encodeURIComponent(effectiveCheckoutId)}`}
                      className="text-rewear-muted hover:text-rewear-text font-semibold hover:underline"
                    >
                      Return to checkout
                    </Link>
                  )}
                </div>
              </div>
            )}

            {isAuthenticated && isRefundFlow && (
              <div className="space-y-5">
                <p
                  role="status"
                  className="text-rewear-text text-base leading-6"
                >
                  Your 10-minute checkout hold expired before payment completed,
                  so your items were released.
                </p>
                <div className="border-rewear-border bg-rewear-surface space-y-2 border p-4 text-sm">
                  <p className="font-semibold">Automatic refund initiated</p>
                  <p className="text-rewear-muted leading-5">
                    Any captured amount is automatically refunded to your MoMo
                    account or credited to your RE.WEAR Refund Wallet.
                  </p>
                  {payment?.refunds?.[0] && (
                    <p className="font-mono text-xs font-semibold">
                      Refund status: {payment.refunds[0].state} ·{' '}
                      {formatPrice(payment.refunds[0].amount)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/cart"
                    className="bg-rewear-accent text-rewear-text flex h-12 flex-1 items-center justify-center text-sm font-semibold"
                  >
                    Back to cart
                  </Link>
                  <Link
                    href="/orders"
                    className="border-rewear-border bg-rewear-surface text-rewear-text flex h-12 flex-1 items-center justify-center border text-sm font-semibold"
                  >
                    View orders
                  </Link>
                </div>
              </div>
            )}

            {isAuthenticated && isFailed && (
              <div className="space-y-5">
                <p className="text-rewear-text text-base leading-6">
                  No payment was completed. Check your payment method and try
                  again while your reservation is still active.
                </p>
                <div className="flex flex-col gap-3">
                  {effectiveCheckoutId ? (
                    <>
                      <Link
                        href={`/checkout?id=${encodeURIComponent(effectiveCheckoutId)}`}
                        className="bg-rewear-accent text-rewear-text flex h-12 w-full items-center justify-center text-sm font-semibold"
                      >
                        Return to checkout
                      </Link>
                      <Link
                        href="/cart"
                        className="text-rewear-muted hover:text-rewear-text flex min-h-11 items-center justify-center text-sm font-semibold hover:underline"
                      >
                        Back to cart
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/cart"
                      className="bg-rewear-accent text-rewear-text flex h-12 w-full items-center justify-center text-sm font-semibold"
                    >
                      Back to cart
                    </Link>
                  )}
                </div>
              </div>
            )}

            {(paymentQuery.isError || reconcile.isError) && (
              <p role="alert" className="text-xs text-[#BA1A1A]">
                {getApiErrorMessage(reconcile.error || paymentQuery.error)}
              </p>
            )}
          </section>
        </div>
      </main>

      <footer className="border-rewear-border text-rewear-muted mx-auto hidden w-full max-w-[1280px] items-center justify-between border-t px-12 py-6 text-sm font-semibold md:flex">
        <span>© 2026 RE.WEAR</span>
        <button
          type="button"
          onClick={() => setPolicyModal('help')}
          className="text-rewear-text cursor-pointer hover:underline"
        >
          Help &amp; returns
        </button>
      </footer>
      <PolicyModals
        openType={policyModal}
        onClose={() => setPolicyModal(null)}
      />
      <MobileNavigation
        cartAction={
          <CartLink className="bg-rewear-soft flex min-h-11 items-center justify-center px-3" />
        }
      />
    </div>
  );
}
