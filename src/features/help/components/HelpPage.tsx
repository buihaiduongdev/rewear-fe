'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';

export function HelpPage() {
  const router = useRouter();

  return (
    <div className="bg-rewear-surface text-rewear-text flex min-h-dvh flex-col">
      <MarketplaceHeader
        cartAction={<CartLink />}
        search=""
        onSearch={(value) =>
          router.push(`/products?search=${encodeURIComponent(value)}`)
        }
      />

      <main
        id="main-content"
        className="mx-auto w-full max-w-[960px] flex-1 space-y-12 px-4 py-8 md:px-12 md:py-12"
      >
        <header className="border-rewear-border space-y-4 border-b pb-8">
          <h1 className="text-[32px] leading-[38px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
            Buying secondhand &amp; returns
          </h1>
          <p className="text-rewear-muted max-w-[65ch] text-base leading-6">
            Check the photos, measurements, and disclosed flaws before buying.
            Every order on RE.WEAR is protected by a 72-hour delivery issue
            window.
          </p>
        </header>

        <section
          aria-labelledby="delivery-window-heading"
          className="bg-rewear-soft space-y-4 p-6 md:p-8"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="delivery-window-heading"
              className="text-[22px] leading-7 font-semibold tracking-[-0.02em]"
            >
              Report an issue
            </h2>
            <span className="font-mono text-xs font-semibold">
              Within 72h of delivery
            </span>
          </div>
          <p className="max-w-[65ch] text-base leading-6">
            Confirming receipt does not shorten this window. If an item arrives
            damaged, missing, or materially different from its listing photos
            and disclosed flaws, open a return request from your order page
            within 72 hours of delivery.
          </p>
        </section>

        <section
          aria-labelledby="returns-refunds-heading"
          className="grid gap-8 md:grid-cols-2"
        >
          <div className="border-rewear-border space-y-4 border p-6">
            <h2
              id="returns-refunds-heading"
              className="text-lg leading-6 font-semibold"
            >
              Returns &amp; refunds
            </h2>
            <div className="text-rewear-muted space-y-3 text-sm leading-6">
              <p>
                Approved returns are refunded after the returned parcel is
                received and verified.
              </p>
              <p>
                Partial returns cover approved items only. Shipping refunds
                require review. Buyer-caused damage and flaws already disclosed
                in the listing are not seller-fault refunds.
              </p>
            </div>
          </div>

          <div className="border-rewear-border space-y-4 border p-6">
            <h2 className="text-lg leading-6 font-semibold">
              Escrow &amp; buyer protection
            </h2>
            <div className="text-rewear-muted space-y-3 text-sm leading-6">
              <p>
                Payments stay protected in escrow until 72 hours after delivery
                with no open dispute.
              </p>
              <p>
                Your delivery address and contact phone are shared with
                logistics partners strictly to fulfill your shipment and are
                never sold to third parties.
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="before-buying-heading"
          className="border-rewear-border space-y-4 border-t pt-8"
        >
          <h2
            id="before-buying-heading"
            className="text-[22px] leading-7 font-semibold tracking-[-0.02em]"
          >
            Quick links
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/orders"
              className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 inline-flex min-h-11 items-center px-5 text-sm font-semibold transition"
            >
              View your orders
            </Link>
            <Link
              href="/account"
              className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 items-center border px-5 text-sm font-semibold transition"
            >
              Manage profile &amp; addresses
            </Link>
            <Link
              href="/products"
              className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 items-center border px-5 text-sm font-semibold transition"
            >
              Explore catalog
            </Link>
          </div>
        </section>
      </main>

      <MarketplaceFooter showOnMobile />
      <MobileNavigation
        cartAction={
          <CartLink className="bg-rewear-soft flex min-h-11 items-center justify-center px-2 text-center" />
        }
      />
    </div>
  );
}
