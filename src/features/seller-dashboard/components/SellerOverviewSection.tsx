'use client';

import Link from 'next/link';

import { useOrderControllerShopList } from '@/shared/api/query-generated/orders/orders';
import { formatPrice } from '@/shared/utils/product';

import type { SellerNavKey, SellerProductItem } from '../types';
import {
  getOrderDisplayCode,
  getSellerOrderStatusClass,
  getSellerOrderStatusLabel,
  hasPendingCodCancelRequest,
  type SellerOrderFilter,
} from '../utils/seller-order-display';

export function SellerOverviewSection({
  shopId,
  shopName,
  enabled,
  products,
  totalListings,
  onNavigate,
}: {
  shopId: string;
  shopName: string;
  enabled: boolean;
  products: SellerProductItem[];
  totalListings?: number;
  onNavigate: (tab: SellerNavKey, orderFilter?: SellerOrderFilter) => void;
}) {
  const ordersQuery = useOrderControllerShopList(
    shopId,
    { limit: 50, offset: 0 },
    { query: { enabled: enabled && Boolean(shopId) } },
  );

  const orders = ordersQuery.data?.data ?? [];
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const inFulfillmentCount = orders.filter(
    (o) => o.status === 'preparing' || o.status === 'shipping',
  ).length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const deliveredOrDoneCount = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'completed',
  ).length;
  const codCancelCount = orders.filter(hasPendingCodCancelRequest).length;
  const activeListingsCount = products.filter(
    (p) => p.status === 'Active',
  ).length;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header + Primary CTA (Figma 28:5) */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] sm:text-[36px] sm:leading-[42px]">
            Overview
          </h1>
          <p className="text-rewear-muted text-sm">
            {shopName} · Shop activity
          </p>
        </div>
        <Link
          href="/selling/new"
          className="bg-rewear-accent text-rewear-text inline-flex min-h-12 items-center justify-center px-6 text-sm font-semibold transition-opacity hover:opacity-90"
        >
          New listing
        </Link>
      </div>

      {/* Shop Activity KPI Strip */}
      <section aria-label="Shop activity">
        <div className="border-rewear-border grid grid-cols-2 border bg-white md:grid-cols-4 md:divide-x">
          <button
            type="button"
            onClick={() => onNavigate('orders', 'pending')}
            className="border-rewear-border hover:bg-rewear-soft/50 flex cursor-pointer flex-col gap-1 border-b p-5 text-left transition-colors md:border-b-0"
          >
            <span className="text-rewear-muted text-xs font-semibold">
              Pending orders
            </span>
            <span className="font-mono text-[28px] leading-[34px] font-semibold tabular-nums">
              {ordersQuery.isPending ? '—' : pendingCount}
            </span>
            <span className="text-rewear-muted text-xs">
              Confirm within 24h
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('orders', 'preparing')}
            className="border-rewear-border hover:bg-rewear-soft/50 flex cursor-pointer flex-col gap-1 border-b border-l p-5 text-left transition-colors md:border-b-0 md:border-l-0"
          >
            <span className="text-rewear-muted text-xs font-semibold">
              Preparing &amp; shipping
            </span>
            <span className="font-mono text-[28px] leading-[34px] font-semibold tabular-nums">
              {ordersQuery.isPending ? '—' : inFulfillmentCount}
            </span>
            <span className="text-rewear-muted text-xs">
              {preparingCount} ready for GHN
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="border-rewear-border hover:bg-rewear-soft/50 flex cursor-pointer flex-col gap-1 p-5 text-left transition-colors"
          >
            <span className="text-rewear-muted text-xs font-semibold">
              Active listings
            </span>
            <span className="font-mono text-[28px] leading-[34px] font-semibold tabular-nums">
              {activeListingsCount}
            </span>
            <span className="text-rewear-muted text-xs">
              {totalListings ?? products.length} total listings
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('orders', 'delivered')}
            className="border-rewear-border hover:bg-rewear-soft/50 flex cursor-pointer flex-col gap-1 border-l p-5 text-left transition-colors md:border-l-0"
          >
            <span className="text-rewear-muted text-xs font-semibold">
              Delivered &amp; completed
            </span>
            <span className="font-mono text-[28px] leading-[34px] font-semibold tabular-nums">
              {ordersQuery.isPending ? '—' : deliveredOrDoneCount}
            </span>
            <span className="text-rewear-muted text-xs">
              72h escrow settlement
            </span>
          </button>
        </div>
      </section>

      {/* Tasks & Shop Action Queue */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tasks &amp; shop</h2>
        <div className="border-rewear-border divide-rewear-border divide-y border bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-semibold">
                Confirm pending orders ({pendingCount})
              </p>
              <p className="text-rewear-muted text-xs">
                Unconfirmed orders expire automatically after 24 hours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('orders', 'pending')}
              className="text-rewear-text min-h-10 cursor-pointer text-sm font-semibold underline"
            >
              Review pending →
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-semibold">
                Book GHN shipments &amp; print A5 labels ({preparingCount})
              </p>
              <p className="text-rewear-muted text-xs">
                Generate tracking codes and hand over parcels within 48 hours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('orders', 'preparing')}
              className="text-rewear-text min-h-10 cursor-pointer text-sm font-semibold underline"
            >
              Manage fulfillment →
            </button>
          </div>

          {codCancelCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 bg-amber-50/60 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-amber-950">
                  Buyer COD cancel requests ({codCancelCount})
                </p>
                <p className="text-xs text-amber-900">
                  Approve or reject pending buyer cancellation requests.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('orders', 'all')}
                className="min-h-10 cursor-pointer text-sm font-semibold text-amber-950 underline"
              >
                Respond now →
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-semibold">
                Pickup address &amp; GHN connection
              </p>
              <p className="text-rewear-muted text-xs">
                Keep your shop dispatch address up to date for accurate shipping
                quotes.
              </p>
            </div>
            <Link
              href={`/selling/pickup?shopId=${encodeURIComponent(shopId)}`}
              className="text-rewear-text inline-flex min-h-10 items-center text-sm font-semibold underline"
            >
              Manage pickup →
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <button
            type="button"
            onClick={() => onNavigate('orders', 'all')}
            className="text-rewear-text cursor-pointer text-sm font-semibold underline"
          >
            View all orders
          </button>
        </div>

        <div className="border-rewear-border border bg-white">
          {ordersQuery.isPending ? (
            <p className="text-rewear-muted p-5 text-sm" role="status">
              Loading recent orders…
            </p>
          ) : ordersQuery.isError ? (
            <div className="p-5 text-sm" role="alert">
              <p>Could not load recent orders.</p>
              <button
                type="button"
                onClick={() => void ordersQuery.refetch()}
                className="mt-2 cursor-pointer font-semibold underline"
              >
                Retry
              </button>
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-rewear-muted p-5 text-sm">
              No orders yet. Publish listings to start receiving buyer orders.
            </p>
          ) : (
            <div className="divide-rewear-border divide-y">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold">
                        {getOrderDisplayCode(order)}
                      </span>
                      <span
                        className={`border px-2 py-0.5 text-[11px] font-semibold ${getSellerOrderStatusClass(order.status)}`}
                      >
                        {getSellerOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-rewear-muted text-xs">
                      {order.items.length}{' '}
                      {order.items.length === 1 ? 'item' : 'items'} ·{' '}
                      {order.paymentMethod}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {formatPrice(order.total)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('orders', order.status)}
                      className="text-rewear-text cursor-pointer text-xs font-semibold underline"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
