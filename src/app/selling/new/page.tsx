'use client';

import * as React from 'react';

import { SellerListingEditorPage } from '@/features/seller-dashboard/components/SellerListingEditorPage';
import { SellerWorkspaceLayout } from '@/features/seller-dashboard/components/SellerWorkspaceLayout';
import { useShopMemberships } from '@/modules/shop/hooks/use-shop-memberships';
import { useSession } from 'next-auth/react';

export default function NewListingPage() {
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;

  const memberships = useShopMemberships(enabled, session?.user.id);

  const activeShop = React.useMemo(() => {
    return memberships.data?.data.find(
      (m) => m.memberRole === 'OWNER' && m.status === 'ACTIVE',
    );
  }, [memberships.data?.data]);

  if (enabled && memberships.isPending)
    return <p role="status">Loading shop…</p>;
  if (enabled && memberships.isError)
    return (
      <div role="alert">
        Could not load your shop.{' '}
        <button onClick={() => void memberships.refetch()}>Retry</button>
      </div>
    );

  const shopName = activeShop?.shop.name || 'Seller workspace';
  const shopId = activeShop?.shopId || '';

  const shopLogo =
    (activeShop?.shop as { logoUrl?: string | null } | undefined)?.logoUrl ??
    null;

  return (
    <SellerWorkspaceLayout
      activeNav="products"
      shopName={shopName}
      shopLogo={shopLogo}
    >
      <React.Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <span className="text-rewear-muted text-sm">
              Loading listing editor...
            </span>
          </div>
        }
      >
        <SellerListingEditorPage shopId={shopId} />
      </React.Suspense>
    </SellerWorkspaceLayout>
  );
}
