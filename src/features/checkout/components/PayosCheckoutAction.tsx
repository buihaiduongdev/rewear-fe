'use client';
import { useEffect, useState } from 'react';

import Link from 'next/link';

import { usePaymentSession } from '@/modules/payment/hooks/use-payment-session';
import { isPendingPayment } from '@/modules/payment/payment-state';
import { formatPrice } from '@/shared/utils/product';

export function PayosCheckoutAction({
  checkoutId,
  status,
  expiresAt,
  quoteReady,
  quoteTotal,
}: {
  checkoutId: string;
  status: string;
  expiresAt: string | null;
  quoteReady: boolean;
  quoteTotal: number | null | undefined;
}) {
  const flow = usePaymentSession(checkoutId);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const active =
    status === 'HELD' && !!expiresAt && Date.parse(expiresAt) > now;
  const state = flow.payment.data?.data.state;
  const paymentAmount = flow.payment.data?.data.amount;
  const changedTotal =
    state === 'PENDING' &&
    paymentAmount !== undefined &&
    paymentAmount !== quoteTotal;
  const resumingPayment = state === 'PENDING' && paymentAmount !== undefined;
  const payableAmount = resumingPayment ? paymentAmount : quoteTotal;
  const needsReview =
    !!flow.context &&
    (!state ||
      state === 'UNKNOWN' ||
      state === 'CREATING' ||
      state === 'REFUND_REQUIRED' ||
      state === 'REFUNDED');
  const canPay =
    flow.enabled &&
    active &&
    (resumingPayment || quoteReady) &&
    Number.isSafeInteger(payableAmount) &&
    payableAmount! >= 2000 &&
    payableAmount! <= 500000000 &&
    !flow.creating &&
    !flow.payment.isFetching &&
    !flow.payment.isError &&
    !needsReview;
  const actionClass =
    'bg-rewear-accent text-rewear-text flex min-h-[52px] w-full cursor-pointer items-center justify-center px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 md:min-h-12';
  if (state === 'PAID')
    return (
      <Link className={actionClass} href="/payment-result">
        View payment result
      </Link>
    );
  return (
    <div className="space-y-3">
      <button
        type="button"
        className={actionClass}
        disabled={!canPay}
        onClick={() =>
          void flow.pay(state === 'PENDING' ? paymentAmount : quoteTotal)
        }
      >
        {flow.creating
          ? 'Opening PayOS…'
          : flow.context && state === 'PENDING'
            ? changedTotal
              ? `Continue for ${formatPrice(paymentAmount)}`
              : 'Continue to PayOS'
            : 'Pay with PayOS'}
      </button>
      {changedTotal && (
        <p role="status" className="text-rewear-muted text-sm">
          The confirmed payment total is {formatPrice(paymentAmount)}. Review
          this amount before continuing.
        </p>
      )}
      {!active && (
        <p className="text-rewear-muted text-sm" role="status">
          This reservation is no longer active.
        </p>
      )}
      {active && !quoteReady && !resumingPayment && (
        <p className="text-rewear-muted text-sm">
          A complete shipping quote is required before payment.
        </p>
      )}
      {flow.error && (
        <p role="alert" className="text-sm text-red-600">
          {flow.error}
        </p>
      )}
      {flow.context && (
        <>
          <Link
            className="text-sm font-semibold underline"
            href="/payment-result"
          >
            View payment status
          </Link>
          {(needsReview ||
            isPendingPayment(state ?? 'UNKNOWN') ||
            flow.payment.isError) && (
            <button
              type="button"
              disabled={flow.checking}
              onClick={flow.checkStatus}
              className="text-rewear-text min-h-11 w-full cursor-pointer text-sm font-semibold underline disabled:opacity-50"
            >
              {flow.checking ? 'Checking…' : 'Check payment status'}
            </button>
          )}
          <p className="text-rewear-muted text-xs">
            If you have already paid, wait for confirmation before paying again.
          </p>
        </>
      )}
    </div>
  );
}
