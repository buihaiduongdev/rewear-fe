'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { usePaymentSession } from '@/modules/payment/hooks/use-payment-session';
import {
  getPaymentPresentation,
  isPendingPayment,
  type PaymentReturnMode,
} from '@/modules/payment/payment-state';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { formatPrice } from '@/shared/utils/product';

export function PaymentResultPage({ mode }: { mode: PaymentReturnMode }) {
  const router = useRouter();
  const flow = usePaymentSession();
  const data = flow.payment.data?.data;
  const presentation = data
    ? getPaymentPresentation(data.state, mode)
    : {
        title: 'Confirming your payment',
        description: 'We are checking the latest payment status.',
      };
  const pending = data && isPendingPayment(data.state);
  const primary =
    'bg-rewear-accent text-rewear-text flex min-h-12 w-full cursor-pointer items-center justify-center px-5 text-sm font-semibold disabled:opacity-50';
  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh">
      <MarketplaceHeader
        cartAction={<CartLink />}
        search=""
        onSearch={(value) =>
          router.push(`/products?search=${encodeURIComponent(value)}`)
        }
      />
      <main
        id="main-content"
        className="mx-auto flex max-w-[1280px] flex-col items-center gap-8 px-4 py-12 md:px-12 md:py-24"
      >
        <h1 className="text-center text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
          {!flow.authLoading && flow.enabled && !flow.context
            ? 'Find your payment'
            : presentation.title}
        </h1>
        <section
          aria-label="Payment confirmation"
          className="bg-rewear-soft flex w-full max-w-[600px] flex-col gap-5 p-6"
        >
          {flow.authLoading ? (
            <p role="status">Checking your session…</p>
          ) : !flow.enabled ? (
            <>
              <p>Sign in to check your payment securely.</p>
              <Link
                className={primary}
                href={`/login?callbackUrl=${encodeURIComponent(mode === 'cancel' ? '/payment-cancel' : '/payment-result')}`}
              >
                Sign in
              </Link>
            </>
          ) : !flow.context ? (
            <>
              <p>
                We could not find a payment in this browser session. Open your
                orders to check any completed purchases.
              </p>
              <p className="text-rewear-muted text-sm">
                Returning from PayOS is not proof of payment. If you were
                charged, check your orders before paying again.
              </p>
              <Link className={primary} href="/orders">
                View my orders
              </Link>
              <Link className="text-sm font-semibold underline" href="/cart">
                Back to cart
              </Link>
            </>
          ) : (
            <>
              {flow.payment.isPending && (
                <p role="status">Loading payment status…</p>
              )}
              {flow.payment.isError && (
                <p role="alert" className="text-sm text-red-600">
                  We could not check the payment. Do not pay again until its
                  status is confirmed. Try checking again.
                </p>
              )}
              {data && (
                <>
                  <p role="status">{presentation.description}</p>
                  <div className="space-y-1">
                    <p className="text-rewear-muted text-base">Amount</p>
                    <p className="text-[32px] leading-10 font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
                      {formatPrice(data.amount)}
                    </p>
                  </div>
                </>
              )}
              {flow.error && (
                <p role="alert" className="text-sm text-red-600">
                  {flow.error}
                </p>
              )}
              {pending && (
                <p className="text-rewear-muted text-base">
                  Please wait before paying again. You can leave this page and
                  check your orders later.
                </p>
              )}
              {(pending || flow.payment.isError) && (
                <button
                  className={primary}
                  type="button"
                  disabled={flow.checking}
                  onClick={flow.checkStatus}
                >
                  {flow.checking ? 'Checking…' : 'Check payment status'}
                </button>
              )}
              {data?.state === 'PAID' && (
                <Link className={primary} href="/orders">
                  View my orders
                </Link>
              )}
              {data?.state === 'FAILED' && (
                <Link
                  className={primary}
                  href={`/checkout?id=${encodeURIComponent(data.checkoutId)}`}
                >
                  Return to checkout
                </Link>
              )}
              {data && (
                <details className="space-y-2 text-sm">
                  <summary className="min-h-8 cursor-pointer font-semibold">
                    Payment details
                  </summary>
                  <dl className="text-rewear-muted space-y-2 break-all">
                    <div>
                      <dt>Payment reference</dt>
                      <dd>{data.id}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{data.state}</dd>
                    </div>
                    {data.paidAt && (
                      <div>
                        <dt>Payment recorded</dt>
                        <dd>{new Date(data.paidAt).toLocaleString()}</dd>
                      </div>
                    )}
                    {data.refunds.map((refund) => (
                      <div key={refund.id}>
                        <dt>Refund</dt>
                        <dd>
                          {formatPrice(refund.amount)} · {refund.state}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </details>
              )}
              {data?.state !== 'PAID' && (
                <Link
                  className="text-sm font-semibold underline"
                  href="/orders"
                >
                  View my orders
                </Link>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
