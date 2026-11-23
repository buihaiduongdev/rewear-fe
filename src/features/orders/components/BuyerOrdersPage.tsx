'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';

import {
  BUYER_ORDERS_PAGE_SIZE,
  useBuyerOrders,
} from '../hooks/use-buyer-orders';
import { ORDER_STATUS_LABELS } from '../utils/order-display';
import { BuyerOrderCard } from './BuyerOrderCard';

export function BuyerOrdersPage() {
  const router = useRouter();
  const {
    offset,
    setOffset,
    filter,
    setFilter,
    enabled,
    authLoading,
    orders,
    items,
    visible,
  } = useBuyerOrders();

  return (
    <div className="bg-rewear-surface text-rewear-text flex min-h-dvh flex-col">
      <MarketplaceHeader
        cartAction={<CartLink />}
        search=""
        onSearch={(value) =>
          router.push(`/products?search=${encodeURIComponent(value)}`)
        }
      />
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1280px] flex-1 px-4 pt-4 pb-12 md:px-12 md:py-12"
      >
        <div className="border-rewear-border flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          <h1 className="text-[28px] font-semibold md:text-[40px]">
            Your orders
          </h1>
          <label className="text-sm font-semibold md:hidden">
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
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <nav
          aria-label="Order status"
          className="mt-6 hidden gap-2 overflow-x-auto pb-1 md:flex"
        >
          {(
            [
              ['all', 'All'],
              ['waiting', 'Awaiting payment'],
              ['pending', 'Awaiting confirmation'],
              ['preparing', 'Preparing'],
              ['shipping', 'Shipping'],
              ['delivered', 'Delivered'],
              ['completed', 'Completed'],
              ['dispute', 'In dispute'],
              ['returns', 'Returns'],
              ['cancelled', 'Cancelled'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => {
                setFilter(value);
                setOffset(0);
              }}
              className={`min-h-11 shrink-0 px-5 text-sm font-semibold ${filter === value ? 'bg-rewear-text text-white' : 'bg-rewear-soft text-rewear-text hover:opacity-80'}`}
            >
              {label}
            </button>
          ))}
        </nav>
        {authLoading ? (
          <p role="status" className="text-rewear-muted py-10">
            Loading orders…
          </p>
        ) : !enabled ? (
          <p role="alert" className="py-10">
            Your session has expired.{' '}
            <Link href="/login" className="underline">
              Sign in again
            </Link>{' '}
            to view your orders.
          </p>
        ) : orders.isPending ? (
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
          <div className="space-y-6 pt-6">
            {visible.map((order) => (
              <BuyerOrderCard key={order.id} order={order} />
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
      <MarketplaceFooter />
      <MobileNavigation
        cartAction={
          <CartLink className="bg-rewear-soft flex min-h-11 items-center justify-center px-2 text-center" />
        }
      />
    </div>
  );
}
