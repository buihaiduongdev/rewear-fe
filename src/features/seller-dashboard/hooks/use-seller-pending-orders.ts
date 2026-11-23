'use client';

import { useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  orderControllerAccept,
  orderControllerReject,
  useOrderControllerShopList,
} from '@/shared/api/query-generated/orders/orders';

export const SELLER_ORDERS_PAGE_SIZE = 20;

export function useSellerPendingOrders(shopId: string, enabled: boolean) {
  const [offset, setOffset] = useState(0);
  const [busyId, setBusyId] = useState('');
  const [rejectId, setRejectId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const orders = useOrderControllerShopList(
    shopId,
    { status: 'pending', limit: SELLER_ORDERS_PAGE_SIZE, offset },
    { query: { enabled: enabled && Boolean(shopId) } },
  );
  const items = orders.data?.data ?? [];

  async function respond(id: string, action: 'accept' | 'reject') {
    setBusyId(id);
    setError('');
    try {
      if (action === 'accept') await orderControllerAccept(shopId, id, {});
      else await orderControllerReject(shopId, id, { reason: reason.trim() });
      setRejectId('');
      setReason('');
      await orders.refetch();
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setBusyId('');
    }
  }

  return {
    offset,
    setOffset,
    busyId,
    rejectId,
    setRejectId,
    reason,
    setReason,
    error,
    orders,
    items,
    respond,
  };
}
