'use client';

import { useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  orderControllerAccept,
  orderControllerReject,
  useOrderControllerShopList,
} from '@/shared/api/query-generated/orders/orders';
import { formatPrice } from '@/shared/utils/product';

const PAGE_SIZE = 20;

export function SellerPendingOrders({
  shopId,
  enabled,
}: {
  shopId: string;
  enabled: boolean;
}) {
  const [offset, setOffset] = useState(0);
  const [busyId, setBusyId] = useState('');
  const [rejectId, setRejectId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const orders = useOrderControllerShopList(
    shopId,
    { status: 'pending', limit: PAGE_SIZE, offset },
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

  return (
    <section className="border-rewear-border overflow-hidden border bg-white shadow-xs">
      <div className="border-rewear-border border-b p-5">
        <h3 className="text-lg font-semibold">Orders awaiting confirmation</h3>
        <p className="text-rewear-muted mt-1 text-xs">
          Orders awaiting your confirmation, newest first.
        </p>
      </div>
      {error && (
        <p role="alert" className="p-5 text-sm text-red-700">
          {error}
        </p>
      )}
      {!enabled || !shopId || orders.isPending ? (
        <p className="text-rewear-muted p-5 text-sm">Loading orders…</p>
      ) : orders.isError ? (
        <div className="p-5 text-sm" role="alert">
          <p>Could not load orders.</p>
          <button
            type="button"
            onClick={() => void orders.refetch()}
            className="mt-2 font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="text-rewear-muted p-5 text-sm">
          No orders awaiting confirmation.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-rewear-border bg-rewear-soft/60 text-rewear-muted border-b uppercase">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Confirm by</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-rewear-border divide-y">
              {items.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-4 font-mono">{order.id}</td>
                  <td className="px-4 py-4">
                    {order.items.length}{' '}
                    {order.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="px-4 py-4">{formatPrice(order.total)}</td>
                  <td className="px-4 py-4">
                    <time dateTime={order.sellerConfirmBy}>
                      {new Intl.DateTimeFormat('en-GB', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        timeZone: 'Asia/Ho_Chi_Minh',
                      }).format(new Date(order.sellerConfirmBy))}{' '}
                      ICT
                    </time>
                  </td>
                  <td className="px-4 py-4">
                    {rejectId === order.id ? (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          if (reason.trim()) void respond(order.id, 'reject');
                        }}
                        className="space-y-2"
                      >
                        <label className="block">
                          Reason
                          <input
                            aria-label="Rejection reason"
                            value={reason}
                            maxLength={1000}
                            required
                            onChange={(event) => setReason(event.target.value)}
                            className="block border p-1"
                          />
                        </label>
                        <button type="submit" disabled={!!busyId}>
                          Confirm rejection
                        </button>{' '}
                        <button
                          type="button"
                          disabled={!!busyId}
                          onClick={() => {
                            setRejectId('');
                            setReason('');
                          }}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          disabled={!!busyId}
                          onClick={() => void respond(order.id, 'accept')}
                          className="underline"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={!!busyId}
                          onClick={() => setRejectId(order.id)}
                          className="underline"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(offset > 0 || items.length === PAGE_SIZE) && !orders.isError && (
        <div className="border-rewear-border flex justify-between border-t p-5 text-sm">
          <button
            type="button"
            disabled={offset === 0 || orders.isFetching}
            onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))}
            className="disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {offset / PAGE_SIZE + 1}</span>
          <button
            type="button"
            disabled={items.length < PAGE_SIZE || orders.isFetching}
            onClick={() => setOffset((value) => value + PAGE_SIZE)}
            className="disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
