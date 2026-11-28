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
      {enabled && memberships.isPending ? (
        <div
          role="status"
          className="border-rewear-border bg-rewear-soft/40 flex h-64 items-center justify-center rounded-[8px] border"
        >
          <span className="text-rewear-muted text-sm">Loading shop…</span>
        </div>
      ) : enabled && memberships.isError ? (
        <div
          role="alert"
          className="border-rewear-border bg-rewear-surface flex flex-col items-start gap-3 rounded-[8px] border p-6"
        >
          <p className="text-rewear-text text-sm font-semibold">
            Could not load your shop.
          </p>
          <button
            type="button"
            onClick={() => void memberships.refetch()}
            className="border-rewear-border text-rewear-text hover:bg-rewear-soft min-h-11 rounded-[8px] border px-4 text-sm font-semibold transition"
          >
            Retry
          </button>
        </div>
      ) : (
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
      )}
    </SellerWorkspaceLayout>
  );
}
