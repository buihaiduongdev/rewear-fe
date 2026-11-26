'use client';

import Link from 'next/link';

import type { OrderControllerBuyerListStatus } from '@/shared/api/models';
import { useOrderControllerBuyerList } from '@/shared/api/query-generated/orders/orders';
import { formatPrice } from '@/shared/utils/product';
import { Package } from 'lucide-react';

const ORDER_STATUS_LABELS: Record<OrderControllerBuyerListStatus, string> = {
  waiting: 'Awaiting payment',
  pending: 'Awaiting seller confirmation',
  preparing: 'Preparing',
  shipping: 'Shipping',
  delivered: 'Delivered',
  completed: 'Completed',
  dispute: 'In dispute',
  returns: 'Return in progress',
  cancelled: 'Cancelled',
};

export function AccountRecentOrdersCard({
  enabled,
  userId,
}: {
  enabled: boolean;
  userId?: string;
}) {
  const recentOrdersQuery = useOrderControllerBuyerList(
    { limit: 3, offset: 0 },
    {
      query: {
        enabled,
        queryKey: ['account-recent-orders', userId],
      },
    },
  );

  const recentOrders = recentOrdersQuery.data?.data ?? [];

  return (
    <aside
      aria-labelledby="recent-orders-heading"
      className="space-y-5 lg:col-span-4"
    >
      <div className="border-rewear-border space-y-5 border p-6">
        <div className="flex items-center justify-between gap-2">
          <h2
            id="recent-orders-heading"
            className="text-[22px] leading-7 font-semibold tracking-[-0.02em]"
          >
            Recent orders
          </h2>
          <Link
            href="/orders"
            className="text-sm font-semibold underline underline-offset-4"
          >
            View all →
          </Link>
        </div>

        {recentOrdersQuery.isPending ? (
          <p role="status" className="text-rewear-muted text-sm">
            Loading recent orders…
          </p>
        ) : recentOrdersQuery.isError ? (
          <p role="alert" className="text-rewear-muted text-sm">
            Could not load recent orders right now.
          </p>
        ) : recentOrders.length === 0 ? (
          <div className="bg-rewear-soft space-y-3 p-5 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <Package size={16} aria-hidden="true" />
              <span>No orders yet</span>
            </div>
            <p className="text-rewear-muted">
              Pieces you purchase will appear here with tracking and 72-hour
              delivery protection.
            </p>
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
            >
              Explore clothing →
            </Link>
          </div>
        ) : (
          <div className="divide-rewear-border divide-y">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="hover:bg-rewear-soft/50 block space-y-1.5 py-4 transition first:pt-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold">
                    {order.orderCode}
                  </span>
                  <span className="bg-rewear-soft px-2 py-0.5 text-xs font-semibold">
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <p className="truncate text-sm font-medium">
                  {order.shopName} · {order.items.length}{' '}
                  {order.items.length === 1 ? 'item' : 'items'}
                </p>
                <div className="text-rewear-muted flex items-center justify-between text-xs">
                  <span className="underline underline-offset-4">
                    View order →
                  </span>
                  <span className="text-rewear-text font-mono font-semibold">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
