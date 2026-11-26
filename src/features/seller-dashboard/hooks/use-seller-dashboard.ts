'use client';

import { useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { useShopMemberships } from '@/modules/shop/hooks/use-shop-memberships';
import { useProductControllerFindMine } from '@/shared/api/query-generated/products/products';
import { formatCondition, formatPrice } from '@/shared/utils/product';
import { useSession } from 'next-auth/react';

import type { SellerNavKey, SellerProductItem } from '../types';

const VALID_SELLER_TABS: readonly SellerNavKey[] = [
  'overview',
  'products',
  'orders',
  'returns',
  'funds',
  'settings',
  'messages',
];

function resolveSellerTab(rawTab: string | null | undefined): SellerNavKey {
  if (rawTab && VALID_SELLER_TABS.includes(rawTab as SellerNavKey)) {
    return rawTab as SellerNavKey;
  }
  return 'overview';
}

export function useSellerDashboard() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const initialTab = resolveSellerTab(searchParams?.get('tab'));

  const [activeTab, setActiveTab] = useState<SellerNavKey>(initialTab);
  const [productsPage, setProductsPage] = useState(1);

  const enabled = status === 'authenticated' && !session?.error;

  const memberships = useShopMemberships(enabled, session?.user.id);

  const activeShop = useMemo(() => {
    const list = memberships.data?.data ?? [];
    return (
      list.find((m) => m.memberRole === 'OWNER' && m.status === 'ACTIVE') ??
      list.find((m) => m.status === 'ACTIVE')
    );
  }, [memberships.data?.data]);

  const isOwner = activeShop?.memberRole === 'OWNER';
  const shopName = activeShop?.shop.name || 'Seller workspace';
  const shopDescription = activeShop?.shop.description ?? '';
  const shopStatus = activeShop?.shop.status ?? 'ACTIVE';
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

  const sellerProducts: SellerProductItem[] = useMemo(() => {
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

  return {
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
  };
}
