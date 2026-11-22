'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useShopControllerFindMine } from '@/shared/api/query-generated/shops/shops';
import { SellerWorkspaceLayout } from '@/features/seller-dashboard/components/SellerWorkspaceLayout';
import { SellerListingEditorPage } from '@/features/seller-dashboard/components/SellerListingEditorPage';

function getShopLogo(shopId: string): string | null {
  if (typeof window === 'undefined' || !shopId) return null;
  try {
    return localStorage.getItem(`rewear_shop_logo_${shopId}`);
  } catch {
    return null;
  }
}

function subscribeToStorage(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export default function NewListingPage() {
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;

  const memberships = useShopControllerFindMine({
    query: {
      enabled,
      queryKey: ['pickup-shop-memberships', session?.user.id],
    },
  });

  const activeShop = React.useMemo(() => {
    return memberships.data?.data.find(
      (m) => m.memberRole === 'OWNER' && m.status === 'ACTIVE',
    );
  }, [memberships.data?.data]);

  const shopName = activeShop?.shop.name || 'Hanoi Archive';
  const shopId = activeShop?.shopId || '';

  const shopLogo = React.useSyncExternalStore(
    subscribeToStorage,
    () => getShopLogo(shopId),
    () => null,
  );

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
        <SellerListingEditorPage />
      </React.Suspense>
    </SellerWorkspaceLayout>
  );
}
