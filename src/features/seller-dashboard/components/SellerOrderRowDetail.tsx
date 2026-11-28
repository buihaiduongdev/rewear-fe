'use client';

import type { OrderControllerShopList200DataItem } from '@/shared/api/models';
import { useShipmentControllerShopView } from '@/shared/api/query-generated/shipments/shipments';
import { formatPrice } from '@/shared/utils/product';

import {
  getEscrowSummary,
  getSellerAddressLines,
  getSellerItemText,
  hasPendingCodCancelRequest,
} from '../utils/seller-order-display';

const SHIPMENT_RELEVANT_STATUSES = new Set([
  'preparing',
  'shipping',
  'delivered',
  'completed',
  'dispute',
  'returns',
]);

export function SellerOrderRowDetail({
  shopId,
  order,
  nowMs,
  busy,
  labelUrl,
  onCreateShipment,
  onPrintLabel,
  onOpenCodCancelModal,
}: {
  shopId: string;
  order: OrderControllerShopList200DataItem;
  nowMs: number;
  busy: boolean;
  labelUrl?: string;
  onCreateShipment: () => void;
  onPrintLabel: () => void;
  onOpenCodCancelModal: (approve: boolean) => void;
}) {
  const canQueryShipment = SHIPMENT_RELEVANT_STATUSES.has(order.status);
  const shipmentQuery = useShipmentControllerShopView(shopId, order.id, {
    query: {
      enabled: Boolean(shopId && canQueryShipment),
      retry: false,
    },
  });

  const shipment = shipmentQuery.data?.data;
  const addressLines = getSellerAddressLines(order.address);
  const escrow = getEscrowSummary(order, nowMs);
  const hasCodCancelRequest = hasPendingCodCancelRequest(order);

  return (
    <div className="bg-rewear-soft/60 border-rewear-border space-y-5 border-t px-5 py-5 text-sm">
      {hasCodCancelRequest && (
        <div className="flex flex-wrap items-center justify-between gap-4 border border-amber-300 bg-amber-50 p-4">
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-950">
              Buyer requested COD cancellation
            </p>
            <p className="text-xs text-amber-900">
              Approve to cancel before dispatch, or reject with handover
              evidence.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onOpenCodCancelModal(true)}
              className="bg-rewear-text text-rewear-surface min-h-10 cursor-pointer px-4 text-xs font-semibold disabled:opacity-50"
            >
              Approve cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onOpenCodCancelModal(false)}
              className="border-rewear-border bg-rewear-surface text-rewear-text min-h-10 cursor-pointer border px-4 text-xs font-semibold disabled:opacity-50"
            >
              Reject cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Items & Delivery Address */}
        <div className="space-y-4">
          <div>
            <p className="text-rewear-muted text-xs font-semibold uppercase">
              Items ({order.items.length})
            </p>
            <ul className="mt-2 space-y-2">
              {order.items.map((item, idx) => {
                const title =
                  getSellerItemText(item, 'title') ?? `Item #${idx + 1}`;
                const size = getSellerItemText(item, 'size');
                const price =
                  typeof item.price === 'number' ? item.price : null;
                return (
                  <li
                    key={`${order.id}-item-${idx}`}
                    className="border-rewear-border bg-rewear-surface flex items-center justify-between gap-3 border px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{title}</p>
                      {size && <p className="text-rewear-muted">Size {size}</p>}
                    </div>
                    {price !== null && (
                      <span className="shrink-0 font-mono font-semibold">
                        {formatPrice(price)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {addressLines.length > 0 && (
            <div>
              <p className="text-rewear-muted text-xs font-semibold uppercase">
                Deliver to
              </p>
              <div className="mt-1 space-y-0.5 text-xs">
                {addressLines.map((line, index) => (
                  <p
                    key={index}
                    className={
                      index === 0 ? 'font-semibold' : 'text-rewear-muted'
                    }
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GHN Shipment & 72h Escrow Info */}
        <div className="space-y-4">
          {canQueryShipment && (
            <div className="border-rewear-border bg-rewear-surface space-y-3 border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase">GHN Shipment</p>
                {shipment?.state && (
                  <span className="border-rewear-border bg-rewear-soft px-2 py-0.5 font-mono text-[11px] font-semibold">
                    {shipment.state}
                  </span>
                )}
              </div>

              {shipmentQuery.isPending ? (
                <p className="text-rewear-muted text-xs">
                  Checking shipment status…
                </p>
              ) : shipment ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-rewear-muted">GHN tracking code</span>
                    <span className="font-mono font-semibold">
                      {shipment.orderCode ?? 'Pending carrier code'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-rewear-muted">Amount to collect</span>
                    <span className="font-mono font-semibold">
                      {formatPrice(shipment.codAmount)}
                    </span>
                  </div>
                  {shipment.carrierFee !== null && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-rewear-muted">Carrier fee</span>
                      <span className="font-mono font-semibold">
                        {formatPrice(shipment.carrierFee)}
                      </span>
                    </div>
                  )}

                  {shipment.orderCode && (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={onPrintLabel}
                        className="bg-rewear-accent text-rewear-text min-h-10 cursor-pointer px-4 text-xs font-semibold disabled:opacity-50"
                      >
                        {busy ? 'Loading label…' : 'Print GHN A5 label'}
                      </button>
                      {labelUrl && (
                        <a
                          href={labelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rewear-text text-xs font-semibold underline"
                        >
                          Open A5 label PDF ↗
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ) : order.status === 'preparing' ? (
                <div className="space-y-3 text-xs">
                  <p className="text-rewear-muted leading-5">
                    No GHN shipment booked yet. Create a shipment using the
                    order&apos;s quoted parcel dimensions to generate a tracking
                    code and A5 shipping label.
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={onCreateShipment}
                    className="bg-rewear-accent text-rewear-text min-h-10 cursor-pointer px-4 text-xs font-semibold disabled:opacity-50"
                  >
                    {busy ? 'Creating shipment…' : 'Book GHN shipment'}
                  </button>
                </div>
              ) : (
                <p className="text-rewear-muted text-xs">
                  Shipment details unavailable.
                </p>
              )}
            </div>
          )}

          {escrow && (
            <div className="border-rewear-border bg-rewear-surface space-y-1.5 border p-4 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold uppercase">
                  Escrow &amp; settlement
                </span>
                <span className="font-mono text-[11px] font-semibold">
                  {escrow.badge}
                </span>
              </div>
              <p className="text-rewear-muted leading-5">{escrow.detail}</p>
            </div>
          )}

          {order.cancellationNote && (
            <div className="border-rewear-border bg-rewear-surface space-y-1 border p-4 text-xs">
              <p className="font-semibold">Cancellation note</p>
              <p className="text-rewear-muted">{order.cancellationNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
