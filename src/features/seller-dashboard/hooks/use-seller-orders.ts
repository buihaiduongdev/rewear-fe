'use client';

import { useEffect, useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  orderControllerAccept,
  orderControllerReject,
  useOrderControllerShopList,
} from '@/shared/api/query-generated/orders/orders';
import {
  getShipmentControllerShopViewQueryKey,
  shipmentControllerCreate,
  shipmentControllerLabel,
  shipmentControllerRespond,
} from '@/shared/api/query-generated/shipments/shipments';
import { useQueryClient } from '@tanstack/react-query';

import type { SellerOrderFilter } from '../utils/seller-order-display';

export const SELLER_ORDERS_PAGE_SIZE = 20;

export function useSellerOrders(
  shopId: string,
  enabled: boolean,
  initialFilter: SellerOrderFilter = 'all',
) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] =
    useState<SellerOrderFilter>(initialFilter);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [expandedId, setExpandedId] = useState<string>('');
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [labelLinks, setLabelLinks] = useState<Record<string, string>>({});
  const [nowMs, setNowMs] = useState(() => Date.now());

  // Tick every 30s so 24h confirm-by and 72h escrow countdowns stay live
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const ordersQuery = useOrderControllerShopList(
    shopId,
    {
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      limit: SELLER_ORDERS_PAGE_SIZE,
      offset,
    },
    { query: { enabled: enabled && Boolean(shopId) } },
  );

  const rawItems = ordersQuery.data?.data ?? [];
  const normalizedSearch = search.trim().toLowerCase();
  const items = normalizedSearch
    ? rawItems.filter((order) => {
        const code = (order as { orderCode?: string }).orderCode ?? '';
        const recipient =
          typeof order.address?.recipientName === 'string'
            ? order.address.recipientName
            : '';
        const itemTitles = order.items
          .map((item) => (typeof item.title === 'string' ? item.title : ''))
          .join(' ');
        return (
          order.id.toLowerCase().includes(normalizedSearch) ||
          code.toLowerCase().includes(normalizedSearch) ||
          recipient.toLowerCase().includes(normalizedSearch) ||
          itemTitles.toLowerCase().includes(normalizedSearch)
        );
      })
    : rawItems;

  const handleFilterChange = (next: SellerOrderFilter) => {
    setStatusFilter(next);
    setOffset(0);
    setError('');
    setNotice('');
  };

  async function acceptOrder(orderId: string) {
    setBusyId(orderId);
    setError('');
    setNotice('');
    try {
      await orderControllerAccept(shopId, orderId, {});
      setNotice('Order confirmed. You can now book a GHN shipment.');
      await ordersQuery.refetch();
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setBusyId('');
    }
  }

  async function rejectOrder(orderId: string, reason: string) {
    setBusyId(orderId);
    setError('');
    setNotice('');
    try {
      await orderControllerReject(shopId, orderId, { reason: reason.trim() });
      setNotice('Order rejected and buyer refund initiated.');
      await ordersQuery.refetch();
      return true;
    } catch (cause) {
      setError(getApiErrorMessage(cause));
      return false;
    } finally {
      setBusyId('');
    }
  }

  async function respondCodCancel(
    orderId: string,
    approve: boolean,
    reason: string,
    evidence: string,
  ) {
    setBusyId(orderId);
    setError('');
    setNotice('');
    try {
      await shipmentControllerRespond(shopId, orderId, {
        approve,
        reason: reason.trim(),
        evidence: evidence.trim(),
      });
      setNotice(
        approve
          ? 'Buyer COD cancellation request approved.'
          : 'Buyer COD cancellation request rejected.',
      );
      await ordersQuery.refetch();
      return true;
    } catch (cause) {
      setError(getApiErrorMessage(cause));
      return false;
    } finally {
      setBusyId('');
    }
  }

  async function createShipment(orderId: string) {
    setBusyId(orderId);
    setError('');
    setNotice('');
    try {
      const response = await shipmentControllerCreate(shopId, orderId, {});
      setExpandedId(orderId);
      setNotice(
        response.data.orderCode
          ? `GHN shipment booked (${response.data.orderCode}).`
          : 'GHN shipment booking submitted.',
      );
      await queryClient.invalidateQueries({
        queryKey: getShipmentControllerShopViewQueryKey(shopId, orderId),
      });
      await ordersQuery.refetch();
      return true;
    } catch (cause) {
      setError(getApiErrorMessage(cause));
      return false;
    } finally {
      setBusyId('');
    }
  }

  async function printShippingLabel(orderId: string) {
    setBusyId(orderId);
    setError('');
    setNotice('');
    try {
      const response = await shipmentControllerLabel(shopId, orderId, {});
      const url = response.data.url;
      setLabelLinks((prev) => ({ ...prev, [orderId]: url }));
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      setNotice('GHN A5 shipping label opened in a new tab.');
      return url;
    } catch (cause) {
      setError(getApiErrorMessage(cause));
      return null;
    } finally {
      setBusyId('');
    }
  }

  return {
    statusFilter,
    handleFilterChange,
    search,
    setSearch,
    offset,
    setOffset,
    expandedId,
    setExpandedId,
    busyId,
    error,
    notice,
    labelLinks,
    nowMs,
    ordersQuery,
    items,
    acceptOrder,
    rejectOrder,
    respondCodCancel,
    createShipment,
    printShippingLabel,
  };
}
