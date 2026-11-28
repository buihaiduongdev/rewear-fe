'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Store } from 'lucide-react';

import { useSellerDashboard } from '../hooks/use-seller-dashboard';
import type { SellerOrderFilter } from '../utils/seller-order-display';
import { SellerOrdersSection } from './SellerOrdersSection';
import { SellerOverviewSection } from './SellerOverviewSection';
import { SellerProductsPage } from './SellerProductsPage';
import { SellerReturnsSection } from './SellerReturnsSection';
import { SellerSettingsSection } from './SellerSettingsSection';
import { SellerWorkspaceLayout } from './SellerWorkspaceLayout';

export function SellerDashboardPage() {
  const [orderFilter, setOrderFilter] = useState<SellerOrderFilter>('all');

  const {
    enabled,
    memberships,
    activeShop,
    isOwner,
    shopName,
    shopDescription,
    shopStatus,
    shopId,
    shopLogo,
    myProductsQuery,
    sellerProducts,
    activeTab,
    setActiveTab,
    productsPage,
    setProductsPage,
  } = useSellerDashboard();

  if (enabled && memberships.isPending) {
    return (
      <p className="text-rewear-muted p-8" role="status">
        Loading shop…
      </p>
    );
  }
  if (enabled && memberships.isError) {
    return (
      <div className="p-8" role="alert">
        <p>Could not load your shop.</p>
        <button
          type="button"
          className="mt-2 underline"
          onClick={() => void memberships.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Zero State: User is authenticated but has no owned shop yet
  if (enabled && !memberships.isPending && !activeShop) {
    return (
      <div className="bg-rewear-surface text-rewear-text min-h-dvh">
        <header className="mx-auto flex min-h-20 w-full max-w-[1280px] items-center justify-between gap-6 px-4 text-sm leading-5 font-semibold md:px-8">
          <Link
            href="/"
            aria-label="RE.WEAR home"
            className="flex min-h-11 items-center"
          >
            <Image
              src="/brands/rewear-wordmark.svg"
              alt="RE.WEAR"
              width={91}
              height={16}
              className="h-auto w-[60px]"
              unoptimized
            />
          </Link>
          <span className="text-rewear-muted hidden sm:block">
            Seller workspace
          </span>
          <Link href="/" className="inline-flex min-h-11 items-center">
            Back to marketplace
          </Link>
        </header>

        <main
          id="main-content"
          className="mx-auto flex w-full max-w-[640px] flex-col items-center justify-center px-4 py-20 text-center"
        >
          <div className="border-rewear-border w-full space-y-6 border p-8 md:p-12">
            <div className="bg-rewear-soft text-rewear-text mx-auto flex size-16 items-center justify-center rounded-full">
              <Store size={28} />
            </div>

            <div className="space-y-2">
              <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
                Start selling on RE.WEAR
              </h1>
              <p className="text-rewear-muted text-sm leading-6">
                You haven&apos;t set up a shop yet. Create your boutique to
                unlock listing management, real-time inventory tracking, and
                seller payouts.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/selling/open"
                className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex min-h-12 w-full items-center justify-center text-sm font-semibold transition"
              >
                Open your shop
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <SellerWorkspaceLayout
      activeNav={activeTab}
      onSelectNav={(nav) => {
        if (nav === 'orders') setOrderFilter('all');
        setActiveTab(nav);
      }}
      shopName={shopName}
      shopLogo={shopLogo}
    >
      {activeTab === 'overview' ? (
        <>
          <Link
            href="/selling/kyc"
            className="mb-4 inline-flex min-h-11 items-center underline"
          >
            Identity verification (KYC)
          </Link>
          <SellerOverviewSection
            shopId={shopId}
            shopName={shopName}
            enabled={enabled}
            products={sellerProducts}
            totalListings={myProductsQuery.data?.data.meta.totalItems}
            onNavigate={(tab, nextFilter) => {
              if (nextFilter) setOrderFilter(nextFilter);
              setActiveTab(tab);
            }}
          />
        </>
      ) : activeTab === 'products' ? (
        myProductsQuery.isPending ? (
          <p className="text-rewear-muted" role="status">
            Loading products…
          </p>
        ) : myProductsQuery.isError ? (
          <div role="alert">
            <p>Could not load products.</p>
            <button
              type="button"
              className="mt-2 underline"
              onClick={() => void myProductsQuery.refetch()}
            >
              Retry
            </button>
          </div>
        ) : (
          <SellerProductsPage
            products={sellerProducts}
            totalItems={myProductsQuery.data?.data.meta.totalItems}
            page={productsPage}
            hasNext={!!myProductsQuery.data?.data.links.next}
            onPageChange={setProductsPage}
          />
        )
      ) : activeTab === 'orders' ? (
        <SellerOrdersSection
          key={`${shopId}-${orderFilter}`}
          shopId={shopId}
          enabled={enabled}
          initialFilter={orderFilter}
        />
      ) : activeTab === 'returns' ? (
        <SellerReturnsSection shopId={shopId} enabled={enabled} />
      ) : activeTab === 'settings' ? (
        <SellerSettingsSection
          key={shopId}
          shopId={shopId}
          initialName={shopName}
          initialDescription={shopDescription}
          initialStatus={shopStatus}
          shopLogo={shopLogo}
          isOwner={isOwner}
        />
      ) : (
        <section>
          <h2 className="text-2xl font-semibold capitalize">{activeTab}</h2>
          <p className="text-rewear-muted mt-3">
            This section is not available yet.
          </p>
        </section>
      )}
    </SellerWorkspaceLayout>
  );
}
