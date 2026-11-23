'use client';

import { useState } from 'react';

import type { OrderControllerBuyerListStatus } from '@/shared/api/models';
import { useOrderControllerBuyerList } from '@/shared/api/query-generated/orders/orders';
import { useSession } from 'next-auth/react';

export const BUYER_ORDERS_PAGE_SIZE = 20;

export function useBuyerOrders() {
  const { data: session, status } = useSession();
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState<OrderControllerBuyerListStatus | 'all'>(
    'all',
  );
  const enabled = status === 'authenticated' && !session?.error;
  const params = {
    limit: BUYER_ORDERS_PAGE_SIZE + 1,
    offset,
    ...(filter === 'all' ? {} : { status: filter }),
  };
  const orders = useOrderControllerBuyerList(params, {
    query: { enabled, queryKey: ['buyer-orders', session?.user.id, params] },
  });
  const items = orders.data?.data ?? [];
  const visible = items.slice(0, BUYER_ORDERS_PAGE_SIZE);

  return {
    offset,
    setOffset,
    filter,
    setFilter,
    enabled,
    orders,
    items,
    visible,
  };
}
