'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import type { OrderControllerBuyerListStatus } from '@/shared/api/models';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import { formatPrice } from '@/shared/utils/product';

import {
  BUYER_ORDERS_PAGE_SIZE,
  useBuyerOrders,
} from '../hooks/use-buyer-orders';

const statuses: Record<OrderControllerBuyerListStatus, string> = {
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

export function BuyerOrdersPage() {
  const router = useRouter();
  const {
    offset,
    setOffset,
    filter,
    setFilter,
    enabled,
    orders,
    items,
    visible,
  } = useBuyerOrders();

  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh">
      <MarketplaceHeader
        cartAction={<CartLink />}
        search=""
        onSearch={(value) =>
          router.push(`/products?search=${encodeURIComponent(value)}`)
        }
      />
      <main
        id="main-content"
        className="mx-auto min-h-[60vh] max-w-[1280px] px-4 pt-4 pb-12 md:px-12 md:py-12"
      >
        <div className="border-rewear-border flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          <h1 className="text-[28px] font-semibold md:text-[40px]">
            Your orders
          </h1>
          <label className="text-sm font-semibold">
            Status{' '}
            <select
              aria-label="Filter orders by status"
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value as typeof filter);
                setOffset(0);
              }}
              className="bg-rewear-soft ml-2 min-h-11 px-3"
            >
              <option value="all">All orders</option>
              {Object.entries(statuses).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {!enabled || orders.isPending ? (
          <p role="status" className="text-rewear-muted py-10">
            Loading orders…
          </p>
        ) : orders.isError ? (
          <div role="alert" className="space-y-3 py-10">
            <p>Could not load your orders.</p>
            <button
              type="button"
              className="underline"
              onClick={() => void orders.refetch()}
            >
              Retry
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="space-y-4 py-10">
            <p>
              {filter === 'all'
                ? 'You have no orders yet.'
                : 'No orders match this status.'}
            </p>
            {filter === 'all' && (
              <Link href="/products" className="underline">
                Explore products
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-rewear-border divide-y">
            {visible.map((order) => (
              <article key={order.id} className="space-y-4 py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{order.shopName}</p>
                    <p className="text-rewear-muted mt-1 font-mono text-xs break-all">
                      Order {order.id}
                    </p>
                  </div>
                  <span className="bg-rewear-soft px-3 py-2 text-xs font-semibold">
                    {statuses[order.status] ?? order.status}
                  </span>
                </div>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <span>
                        {typeof item.title === 'string' && item.title
                          ? item.title
                          : 'Item'}
                      </span>
                      {typeof item.price === 'number' && (
                        <span>{formatPrice(item.price)}</span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="border-rewear-border flex justify-between border-t pt-3 text-sm">
                  <span>Total</span>
                  <strong>{formatPrice(order.total)}</strong>
                </p>
              </article>
            ))}
          </div>
        )}
        {!orders.isError &&
          (offset > 0 || items.length > BUYER_ORDERS_PAGE_SIZE) && (
            <div className="border-rewear-border flex justify-between border-t py-5 text-sm">
              <button
                type="button"
                disabled={offset === 0 || orders.isFetching}
                onClick={() =>
                  setOffset(Math.max(0, offset - BUYER_ORDERS_PAGE_SIZE))
                }
                className="disabled:opacity-40"
              >
                Previous
              </button>
              <span>Page {offset / BUYER_ORDERS_PAGE_SIZE + 1}</span>
              <button
                type="button"
                disabled={
                  items.length <= BUYER_ORDERS_PAGE_SIZE || orders.isFetching
                }
                onClick={() => setOffset(offset + BUYER_ORDERS_PAGE_SIZE)}
                className="disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
      </main>
      <MobileNavigation
        cartAction={
          <CartLink className="bg-rewear-soft flex min-h-11 items-center justify-center px-2 text-center" />
        }
      />
    </div>
  );
}
