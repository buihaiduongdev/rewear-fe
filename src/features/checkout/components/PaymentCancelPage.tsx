'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import {
  PolicyModals,
  type PolicyModalType,
} from '@/shared/components/marketplace/PolicyModals';
import { formatPrice } from '@/shared/utils/product';

import { readLastPaymentSession } from '../api/checkout-payment.api';

export function PaymentCancelPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [policyModal, setPolicyModal] = useState<PolicyModalType>(null);

  const stored = useMemo(() => readLastPaymentSession(), []);
  const checkoutId = params.get('checkoutId') || stored?.checkoutId || '';
  const paymentId = params.get('paymentId') || stored?.paymentId || '';

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
            Payment cancelled
          </h1>

          <section className="border-rewear-border bg-rewear-soft space-y-6 border p-6 md:p-8">
            <p className="text-rewear-text text-base leading-6">
              No payment was completed. If your 10-minute reservation is still
              active, you can return to checkout and choose another payment
              method.
            </p>

            {stored?.amount ? (
              <div className="border-rewear-border flex items-baseline justify-between border-y py-4">
                <span className="text-rewear-muted text-sm font-semibold">
                  Order total
                </span>
                <span className="font-mono text-xl font-semibold tabular-nums">
                  {formatPrice(stored.amount)}
                </span>
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              {checkoutId ? (
                <Link
                  href={`/checkout?id=${encodeURIComponent(checkoutId)}`}
                  className="bg-rewear-accent text-rewear-text flex h-12 w-full items-center justify-center text-sm font-semibold"
                >
                  Return to checkout
                </Link>
              ) : (
                <Link
                  href="/cart"
                  className="bg-rewear-accent text-rewear-text flex h-12 w-full items-center justify-center text-sm font-semibold"
                >
                  Back to cart
                </Link>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-sm">
                <Link
                  href="/cart"
                  className="text-rewear-text inline-flex min-h-11 items-center font-semibold hover:underline"
                >
                  Back to cart
                </Link>
                {paymentId && (
                  <Link
                    href={`/payment-result?paymentId=${encodeURIComponent(paymentId)}`}
                    className="text-rewear-muted hover:text-rewear-text inline-flex min-h-11 items-center font-semibold hover:underline"
                  >
                    Payment still uncertain? Check status
                  </Link>
                )}
              </div>
            </div>
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
