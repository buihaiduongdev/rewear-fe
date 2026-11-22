'use client';

import * as React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useShopMemberships } from '@/modules/shop/hooks/use-shop-memberships';
import { useProductControllerFindMine } from '@/shared/api/query-generated/products/products';
import { formatCondition, formatPrice } from '@/shared/utils/product';
import { Store } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { SellerPendingOrders } from './SellerPendingOrders';
import { SellerProductItem, SellerProductsPage } from './SellerProductsPage';
import { SellerNavKey, SellerWorkspaceLayout } from './SellerWorkspaceLayout';

export function SellerDashboardPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get('tab') as SellerNavKey) || 'products';

  const [activeTab, setActiveTab] = React.useState<SellerNavKey>(initialTab);
  const [productsPage, setProductsPage] = React.useState(1);

  const enabled = status === 'authenticated' && !session?.error;

  const memberships = useShopMemberships(enabled, session?.user.id);

  const activeShop = React.useMemo(() => {
    return memberships.data?.data.find(
      (m) => m.memberRole === 'OWNER' && m.status === 'ACTIVE',
    );
  }, [memberships.data?.data]);

  const shopName = activeShop?.shop.name || 'Seller workspace';
  const shopId = activeShop?.shopId || '';

  const shopLogo =
    (activeShop?.shop as { logoUrl?: string | null } | undefined)?.logoUrl ??
    null;

  // Query seller products if shopId is present
  const myProductsQuery = useProductControllerFindMine(
    { page: productsPage, limit: 20, 'filter.shopId': [shopId] },
    {
      query: {
        enabled: Boolean(enabled && shopId),
        queryKey: ['seller-my-products', shopId, productsPage],
      },
    },
  );

  const sellerProducts: SellerProductItem[] = React.useMemo(() => {
    const statuses: Record<string, SellerProductItem['status']> = {
      DRAFT: 'Draft',
      PENDING_REVIEW: 'In review',
      REJECTED: 'Rejected',
      SUSPENDED: 'Suspended',
      ACTIVE: 'Active',
      HELD: 'Held',
      SOLD: 'Sold',
      HIDDEN: 'Hidden',
    };
    return (myProductsQuery.data?.data?.data ?? []).map((product) => ({
      id: product.id,
      title: product.title || 'Untitled listing',
      size: product.size || 'Size unavailable',
      condition: formatCondition(product.condition) || 'Condition unavailable',
      price: formatPrice(product.price),
      status: statuses[product.status],
      isLocked: product.status === 'HELD' || product.status === 'SOLD',
      image: product.coverUrl,
    }));
  }, [myProductsQuery.data?.data]);

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
      onSelectNav={(nav) => setActiveTab(nav)}
      shopName={shopName}
      shopLogo={shopLogo}
    >
      {activeTab === 'products' ? (
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
      ) : activeTab === 'overview' || activeTab === 'orders' ? (
        <div className="space-y-8">
          <section className="border-rewear-border flex flex-wrap items-center justify-between gap-4 border bg-white p-6">
            <div>
              <h2 className="text-2xl font-semibold">
                {activeTab === 'orders' ? 'Orders' : shopName}
              </h2>
              <p className="text-rewear-muted mt-1 text-sm">
                Orders awaiting seller confirmation
              </p>
            </div>
            <Link
              href="/selling/new"
              className="bg-rewear-accent px-4 py-3 text-sm font-semibold"
            >
              Create listing
            </Link>
          </section>
          <SellerPendingOrders key={shopId} shopId={shopId} enabled={enabled} />
        </div>
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
