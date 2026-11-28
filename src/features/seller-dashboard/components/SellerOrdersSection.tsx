'use client';

import { Fragment, useState } from 'react';

import type { OrderControllerShopList200DataItem } from '@/shared/api/models';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { formatPrice } from '@/shared/utils/product';

import {
  SELLER_ORDERS_PAGE_SIZE,
  useSellerOrders,
} from '../hooks/use-seller-orders';
import {
  formatDeadlineCountdown,
  formatVietnamDateTime,
  getEscrowSummary,
  getOrderDisplayCode,
  getSellerOrderStatusClass,
  getSellerOrderStatusLabel,
  hasPendingCodCancelRequest,
  SELLER_ORDER_FILTER_TABS,
  type SellerOrderFilter,
} from '../utils/seller-order-display';
import { SellerOrderRowDetail } from './SellerOrderRowDetail';

type CodCancelDialogState = {
  orderId: string;
  orderCode: string;
  approve: boolean;
} | null;

export function SellerOrdersSection({
  shopId,
  enabled,
  initialFilter = 'all',
}: {
  shopId: string;
  enabled: boolean;
  initialFilter?: SellerOrderFilter;
}) {
  const {
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
  } = useSellerOrders(shopId, enabled, initialFilter);

  const [rejectTarget, setRejectTarget] =
    useState<OrderControllerShopList200DataItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [codCancelDialog, setCodCancelDialog] =
    useState<CodCancelDialogState>(null);
  const [codReason, setCodReason] = useState('');
  const [codEvidence, setCodEvidence] = useState('');

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget || !rejectReason.trim()) return;
    const ok = await rejectOrder(rejectTarget.id, rejectReason);
    if (ok) {
      setRejectTarget(null);
      setRejectReason('');
    }
  };

  const handleConfirmCodCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codCancelDialog || !codReason.trim() || !codEvidence.trim()) return;
    const ok = await respondCodCancel(
      codCancelDialog.orderId,
      codCancelDialog.approve,
      codReason,
      codEvidence,
    );
    if (ok) {
      setCodCancelDialog(null);
      setCodReason('');
      setCodEvidence('');
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] sm:text-[36px] sm:leading-[42px]">
          Orders
        </h1>
        <p className="text-rewear-muted text-sm">
          Confirm pending orders within 24 hours, book GHN shipments, print A5
          shipping labels, and monitor 72-hour escrow settlement.
        </p>
      </div>

      {/* Status Filter Tabs (Figma 53:1226) */}
      <div
        role="tablist"
        aria-label="Filter orders by status"
        className="border-rewear-border flex flex-wrap gap-2 border-b pb-3"
      >
        {SELLER_ORDER_FILTER_TABS.map((tab) => {
          const active = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleFilterChange(tab.key)}
              className={`min-h-11 cursor-pointer px-4 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-rewear-text text-rewear-surface'
                  : 'bg-rewear-soft text-rewear-text hover:bg-rewear-border/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Field (Figma 71:420) */}
      <div className="max-w-[560px]">
        <label htmlFor="seller-order-search" className="sr-only">
          Search orders
        </label>
        <input
          id="seller-order-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order code, item or recipient"
          className="border-rewear-border bg-rewear-surface text-rewear-text placeholder:text-rewear-muted h-11 w-full border px-4 text-sm outline-none focus:border-[#1A1C1D]"
        />
      </div>

      {notice && (
        <p
          role="status"
          className="border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          {notice}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="border border-[#BA1A1A]/30 bg-red-50 px-4 py-3 text-sm text-[#BA1A1A]"
        >
          {error}
        </p>
      )}

      {/* Orders Table */}
      <div className="border-rewear-border overflow-hidden border bg-white">
        {!enabled || !shopId || ordersQuery.isPending ? (
          <p className="text-rewear-muted p-6 text-sm" role="status">
            Loading orders…
          </p>
        ) : ordersQuery.isError ? (
          <div className="p-6 text-sm" role="alert">
            <p>Could not load orders.</p>
            <button
              type="button"
              onClick={() => void ordersQuery.refetch()}
              className="mt-2 cursor-pointer font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="text-rewear-muted p-6 text-sm">
            No orders match this view.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-rewear-border bg-rewear-soft/70 text-rewear-muted border-b uppercase">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5">Total</th>
                  <th className="px-4 py-3.5">Deadline / Escrow</th>
                  <th className="px-4 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-rewear-border divide-y">
                {items.map((order) => {
                  const displayCode = getOrderDisplayCode(order);
                  const isExpanded = expandedId === order.id;
                  const isBusy = busyId === order.id;
                  const confirmCountdown =
                    order.status === 'pending'
                      ? formatDeadlineCountdown(order.sellerConfirmBy, nowMs)
                      : null;
                  const escrow = getEscrowSummary(order, nowMs);
                  const codCancelPending = hasPendingCodCancelRequest(order);

                  return (
                    <Fragment key={order.id}>
                      <tr className="hover:bg-rewear-soft/30">
                        <td className="px-5 py-4 align-top">
                          <div className="space-y-1">
                            <p className="font-mono text-xs font-semibold">
                              {displayCode}
                            </p>
                            <p className="text-rewear-muted">
                              {order.items.length}{' '}
                              {order.items.length === 1 ? 'item' : 'items'}
                            </p>
                            {codCancelPending && (
                              <span className="inline-block border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-900">
                                COD cancel requested
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-block border px-2 py-0.5 text-[11px] font-semibold ${getSellerOrderStatusClass(order.status)}`}
                          >
                            {getSellerOrderStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top font-mono font-semibold">
                          {order.paymentMethod}
                        </td>
                        <td className="px-4 py-4 align-top font-mono font-semibold tabular-nums">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-4 py-4 align-top">
                          {order.status === 'pending' && confirmCountdown ? (
                            <div className="space-y-0.5">
                              <p
                                className={`font-mono font-semibold ${
                                  confirmCountdown.overdue
                                    ? 'text-[#BA1A1A]'
                                    : 'text-rewear-text'
                                }`}
                              >
                                {confirmCountdown.text}
                              </p>
                              <time
                                dateTime={order.sellerConfirmBy}
                                className="text-rewear-muted block text-[11px]"
                              >
                                {formatVietnamDateTime(order.sellerConfirmBy)}
                              </time>
                            </div>
                          ) : escrow ? (
                            <span className="font-mono font-semibold">
                              {escrow.badge}
                            </span>
                          ) : order.handoverBy &&
                            order.status === 'preparing' ? (
                            <div className="space-y-0.5">
                              <p className="font-mono font-semibold">
                                Handover due
                              </p>
                              <time
                                dateTime={order.handoverBy}
                                className="text-rewear-muted block text-[11px]"
                              >
                                {formatVietnamDateTime(order.handoverBy)}
                              </time>
                            </div>
                          ) : (
                            <span className="text-rewear-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap items-center gap-2">
                            {order.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  disabled={Boolean(busyId)}
                                  onClick={() => void acceptOrder(order.id)}
                                  className="bg-rewear-accent text-rewear-text min-h-9 cursor-pointer px-3 font-semibold disabled:opacity-50"
                                >
                                  {isBusy ? 'Saving…' : 'Accept'}
                                </button>
                                <button
                                  type="button"
                                  disabled={Boolean(busyId)}
                                  onClick={() => {
                                    setRejectTarget(order);
                                    setRejectReason('');
                                  }}
                                  className="border-rewear-border bg-rewear-surface text-rewear-text min-h-9 cursor-pointer border px-3 font-semibold disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {order.status === 'preparing' && (
                              <button
                                type="button"
                                disabled={Boolean(busyId)}
                                onClick={() => void createShipment(order.id)}
                                className="bg-rewear-accent text-rewear-text min-h-9 cursor-pointer px-3 font-semibold disabled:opacity-50"
                              >
                                {isBusy ? 'Booking…' : 'Book GHN'}
                              </button>
                            )}

                            {(order.status === 'preparing' ||
                              order.status === 'shipping') && (
                              <button
                                type="button"
                                disabled={Boolean(busyId)}
                                onClick={() =>
                                  void printShippingLabel(order.id)
                                }
                                className="border-rewear-border bg-rewear-surface text-rewear-text min-h-9 cursor-pointer border px-3 font-semibold disabled:opacity-50"
                              >
                                Print A5 label
                              </button>
                            )}

                            {codCancelPending && (
                              <button
                                type="button"
                                disabled={Boolean(busyId)}
                                onClick={() => {
                                  setCodCancelDialog({
                                    orderId: order.id,
                                    orderCode: displayCode,
                                    approve: true,
                                  });
                                  setCodReason('');
                                  setCodEvidence('');
                                }}
                                className="border border-amber-400 bg-amber-50 px-3 py-2 font-semibold text-amber-950"
                              >
                                Review cancel
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(isExpanded ? '' : order.id)
                              }
                              aria-expanded={isExpanded}
                              className="text-rewear-text min-h-9 cursor-pointer px-2 font-semibold underline"
                            >
                              {isExpanded ? 'Hide' : 'Details'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="p-0">
                            <SellerOrderRowDetail
                              shopId={shopId}
                              order={order}
                              nowMs={nowMs}
                              busy={isBusy}
                              labelUrl={labelLinks[order.id]}
                              onCreateShipment={() =>
                                void createShipment(order.id)
                              }
                              onPrintLabel={() =>
                                void printShippingLabel(order.id)
                              }
                              onOpenCodCancelModal={(approve) => {
                                setCodCancelDialog({
                                  orderId: order.id,
                                  orderCode: displayCode,
                                  approve,
                                });
                                setCodReason('');
                                setCodEvidence('');
                              }}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {(offset > 0 || items.length === SELLER_ORDERS_PAGE_SIZE) &&
          !ordersQuery.isError && (
            <div className="border-rewear-border flex items-center justify-between border-t px-5 py-4 text-sm">
              <button
                type="button"
                disabled={offset === 0 || ordersQuery.isFetching}
                onClick={() =>
                  setOffset((val) => Math.max(0, val - SELLER_ORDERS_PAGE_SIZE))
                }
                className="min-h-11 cursor-pointer font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-mono text-xs">
                Page {offset / SELLER_ORDERS_PAGE_SIZE + 1}
              </span>
              <button
                type="button"
                disabled={
                  items.length < SELLER_ORDERS_PAGE_SIZE ||
                  ordersQuery.isFetching
                }
                onClick={() =>
                  setOffset((val) => val + SELLER_ORDERS_PAGE_SIZE)
                }
                className="min-h-11 cursor-pointer font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
      </div>

      {/* Reject Order Modal (Figma 48:1644) */}
      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open && !busyId) {
            setRejectTarget(null);
            setRejectReason('');
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="border-rewear-border bg-rewear-surface max-w-[520px] space-y-6 rounded-none border p-8"
        >
          <button
            type="button"
            disabled={Boolean(busyId)}
            onClick={() => setRejectTarget(null)}
            className="text-rewear-muted hover:text-rewear-text min-h-11 cursor-pointer text-left text-sm font-semibold"
          >
            Close ×
          </button>
          <DialogHeader className="gap-1">
            <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
              Reject this order?
            </DialogTitle>
            <DialogDescription className="text-rewear-muted text-sm">
              Only this seller&apos;s order is cancelled and refunded to the
              buyer.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmReject} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="seller-reject-reason"
                className="block text-sm font-semibold"
              >
                Rejection reason
              </label>
              <textarea
                id="seller-reject-reason"
                required
                maxLength={1000}
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Item is no longer available or has an undisclosed defect"
                className="border-rewear-border bg-rewear-surface w-full border p-3 text-sm outline-none focus:border-[#1A1C1D]"
              />
            </div>
            <button
              type="submit"
              disabled={Boolean(busyId) || !rejectReason.trim()}
              className="border-rewear-text bg-rewear-text text-rewear-surface flex h-12 w-full cursor-pointer items-center justify-center border text-sm font-semibold disabled:opacity-50"
            >
              {busyId ? 'Rejecting…' : 'Confirm rejection'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Buyer COD Cancellation Response Modal */}
      <Dialog
        open={Boolean(codCancelDialog)}
        onOpenChange={(open) => {
          if (!open && !busyId) {
            setCodCancelDialog(null);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="border-rewear-border bg-rewear-surface max-w-[520px] space-y-5 rounded-none border p-8"
        >
          <button
            type="button"
            disabled={Boolean(busyId)}
            onClick={() => setCodCancelDialog(null)}
            className="text-rewear-muted hover:text-rewear-text min-h-11 cursor-pointer text-left text-sm font-semibold"
          >
            Close ×
          </button>
          <DialogHeader className="gap-1">
            <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
              {codCancelDialog?.approve
                ? 'Approve COD cancellation?'
                : 'Reject COD cancellation?'}
            </DialogTitle>
            <DialogDescription className="text-rewear-muted text-sm">
              Order {codCancelDialog?.orderCode}. Choose whether to approve or
              reject the buyer&apos;s request.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setCodCancelDialog((prev) =>
                  prev ? { ...prev, approve: true } : prev,
                )
              }
              className={`min-h-11 cursor-pointer border text-sm font-semibold ${
                codCancelDialog?.approve
                  ? 'border-rewear-text bg-rewear-text text-rewear-surface'
                  : 'border-rewear-border bg-rewear-soft text-rewear-text'
              }`}
            >
              Approve cancel
            </button>
            <button
              type="button"
              onClick={() =>
                setCodCancelDialog((prev) =>
                  prev ? { ...prev, approve: false } : prev,
                )
              }
              className={`min-h-11 cursor-pointer border text-sm font-semibold ${
                codCancelDialog && !codCancelDialog.approve
                  ? 'border-rewear-text bg-rewear-text text-rewear-surface'
                  : 'border-rewear-border bg-rewear-soft text-rewear-text'
              }`}
            >
              Reject cancel
            </button>
          </div>

          <form onSubmit={handleConfirmCodCancel} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="cod-cancel-reason"
                className="block text-sm font-semibold"
              >
                Reason
              </label>
              <input
                id="cod-cancel-reason"
                required
                maxLength={1000}
                value={codReason}
                onChange={(e) => setCodReason(e.target.value)}
                placeholder={
                  codCancelDialog?.approve
                    ? 'Parcel has not been handed over yet'
                    : 'Parcel already handed over to GHN carrier'
                }
                className="border-rewear-border bg-rewear-surface h-11 w-full border px-3 text-sm outline-none focus:border-[#1A1C1D]"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="cod-cancel-evidence"
                className="block text-sm font-semibold"
              >
                Handover note / evidence
              </label>
              <textarea
                id="cod-cancel-evidence"
                required
                maxLength={2000}
                rows={3}
                value={codEvidence}
                onChange={(e) => setCodEvidence(e.target.value)}
                placeholder="Provide handover receipt reference or cancellation note"
                className="border-rewear-border bg-rewear-surface w-full border p-3 text-sm outline-none focus:border-[#1A1C1D]"
              />
            </div>
            <button
              type="submit"
              disabled={
                Boolean(busyId) || !codReason.trim() || !codEvidence.trim()
              }
              className="bg-rewear-accent text-rewear-text flex h-12 w-full cursor-pointer items-center justify-center text-sm font-semibold disabled:opacity-50"
            >
              {busyId
                ? 'Submitting…'
                : codCancelDialog?.approve
                  ? 'Confirm approval'
                  : 'Confirm rejection'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
