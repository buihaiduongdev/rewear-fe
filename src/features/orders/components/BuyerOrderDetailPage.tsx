'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { formatPrice } from '@/shared/utils/product';

import { useBuyerOrderDetail } from '../hooks/use-buyer-order-detail';
import { useDisputeWindow } from '../hooks/use-dispute-window';
import { useOrderActions } from '../hooks/use-order-actions';
import {
  getAddressLines,
  getItemCondition,
  getItemText,
  ORDER_STATUS_LABELS,
} from '../utils/order-display';
import { ConfirmReceiptDialog } from './ConfirmReceiptDialog';
import {
  CancelOrderDialog,
  ReportIssueDialog,
  SupplementEvidenceDialog,
} from './OrderActionDialogs';
import { OrderTimeline } from './OrderTimeline';
import { OrderDetailSkeleton } from '../skeletons/OrderDetailSkeleton';

export function BuyerOrderDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const {
    enabled,
    authLoading,
    order: query,
    receipt,
    confirmReceipt,
  } = useBuyerOrderDetail(id);
  const order = query.data?.data;
  const address = order ? getAddressLines(order.address) : [];
  const disputeOpen = useDisputeWindow(order?.disputeDeadlineAt);
  const actions = useOrderActions(
    id,
    enabled &&
      !!order &&
      ['shipping', 'delivered', 'completed', 'dispute', 'returns'].includes(
        order.status,
      ),
    enabled && order?.status === 'dispute',
    async () => {
      await query.refetch();
    },
  );
  const reportItems = (order?.items ?? []).flatMap((item) => {
    const productId = getItemText(item, 'productId');
    return productId
      ? [{ id: productId, title: getItemText(item, 'title') ?? 'Item' }]
      : [];
  });

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
        className="mx-auto w-full max-w-[1280px] flex-1 space-y-6 px-4 py-8 md:px-12 md:py-12"
      >
        <Link
          href="/orders"
          className="inline-block text-sm font-semibold hover:underline"
        >
          ← Back to orders
        </Link>
        {authLoading ? (
          <OrderDetailSkeleton />
        ) : !enabled ? (
          <p role="alert">
            Your session has expired.{' '}
            <Link href="/login" className="underline">
              Sign in again
            </Link>{' '}
            to view your order.
          </p>
        ) : query.isPending ? (
          <OrderDetailSkeleton />
        ) : query.isError || !order ? (
          <div role="alert" className="space-y-3">
            <p>Could not load this order.</p>
            <button
              type="button"
              className="underline"
              onClick={() => void query.refetch()}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h1 className="text-[28px] leading-tight font-semibold md:text-[40px]">
                Order details
              </h1>
              <p className="text-rewear-muted text-sm">
                Order {order.orderCode}
              </p>
            </div>
            <div className="space-y-2 md:hidden">
              <h2 className="text-[32px] leading-tight font-semibold">
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </h2>
              {order.deliveryObservedAt && (
                <p className="text-rewear-muted text-sm">
                  Delivered{' '}
                  {new Intl.DateTimeFormat('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Ho_Chi_Minh',
                  }).format(new Date(order.deliveryObservedAt))}{' '}
                  ICT
                </p>
              )}
            </div>
            <OrderTimeline order={order} />
            {address.length > 0 && (
              <section className="bg-rewear-soft space-y-2 px-5 py-4">
                <h2 className="font-semibold">Delivery address</h2>
                {address.map((line) => (
                  <p key={line} className="text-sm sm:text-base">
                    {line}
                  </p>
                ))}
              </section>
            )}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,416px)]">
              <section className="space-y-7" aria-label="Items">
                {order.items.map((item, index) => {
                  const title = getItemText(item, 'title') ?? 'Item';
                  const productId = getItemText(item, 'productId');
                  const size = getItemText(item, 'size');
                  const condition = getItemCondition(item);
                  const image = getItemText(item, 'coverUrl');
                  return (
                    <article
                      key={`${productId ?? title}-${index}`}
                      className="flex gap-4 sm:gap-6"
                    >
                      <div className="bg-rewear-soft relative h-[150px] w-[120px] shrink-0 overflow-hidden sm:h-[185px] sm:w-[148px]">
                        <ProductPhoto
                          url={image ?? null}
                          title={title}
                          sizes="148px"
                        />
                      </div>
                      <div className="min-w-0 space-y-4">
                        <h2 className="text-xl font-semibold sm:text-[28px] sm:leading-[34px]">
                          {title}
                        </h2>
                        <p className="text-rewear-muted text-sm">
                          {[
                            order.shopName,
                            size ? `Size ${size}` : null,
                            condition,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        {typeof item.price === 'number' && (
                          <p className="text-xl font-semibold sm:text-[28px] sm:leading-[34px]">
                            {formatPrice(item.price)}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </section>
              <aside className="bg-rewear-soft h-fit space-y-6 p-6">
                <h2 className="text-2xl font-semibold">
                  {ORDER_STATUS_LABELS[order.status] ?? order.status}
                </h2>
                <dl className="space-y-6 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt>Items · {order.items.length}</dt>
                    <dd>{formatPrice(order.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Shipping</dt>
                    <dd>{formatPrice(order.shippingFee)}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-4 text-xl font-semibold sm:text-[28px]">
                    <dt>Total</dt>
                    <dd>{formatPrice(order.total)}</dd>
                  </div>
                </dl>
                {order.paymentMethod === 'COD' &&
                  order.status === 'preparing' &&
                  !order.cancelRequestedAt && (
                    <CancelOrderDialog
                      request
                      cancel={actions.requestCancellation}
                      pending={actions.cancellationRequest.isPending}
                      error={actions.cancellationRequest.error}
                    />
                  )}
                {order.cancelState === 'PENDING' && (
                  <p className="text-sm">
                    Cancellation requested; awaiting the seller’s response.
                  </p>
                )}
                {order.disputeDeadlineAt && (
                  <p className="text-sm">
                    Report an issue by{' '}
                    {new Intl.DateTimeFormat('en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'Asia/Ho_Chi_Minh',
                    }).format(new Date(order.disputeDeadlineAt))}{' '}
                    ICT
                  </p>
                )}
                {order.status === 'pending' &&
                  order.paymentMethod === 'COD' && (
                    <CancelOrderDialog
                      cancel={actions.cancelOrder}
                      pending={actions.cancel.isPending}
                      error={actions.cancel.error}
                    />
                  )}
                {order.status === 'delivered' && !order.receiptConfirmedAt && (
                  <ConfirmReceiptDialog
                    confirmReceipt={confirmReceipt}
                    pending={receipt.isPending}
                    error={receipt.error}
                  />
                )}
                {disputeOpen &&
                  ['delivered', 'completed', 'dispute'].includes(
                    order.status,
                  ) &&
                  reportItems.length > 0 && (
                    <ReportIssueDialog
                      items={reportItems}
                      report={actions.reportIssue}
                      pending={actions.issuePending}
                      error={actions.issueError}
                    />
                  )}
              </aside>
            </div>
            {[
              'shipping',
              'delivered',
              'completed',
              'dispute',
              'returns',
            ].includes(order.status) && (
              <section className="bg-rewear-soft space-y-3 p-5">
                <h2 className="text-xl font-semibold">Delivery</h2>
                {actions.shipment.isPending ? (
                  <p role="status">Loading delivery information…</p>
                ) : actions.shipment.isError ? (
                  <p>
                    Delivery information is unavailable.{' '}
                    <button
                      type="button"
                      className="underline"
                      onClick={() => void actions.shipment.refetch()}
                    >
                      Retry
                    </button>
                  </p>
                ) : (
                  <>
                    <p>{ORDER_STATUS_LABELS[order.status]}</p>
                    {actions.shipment.data?.data.orderCode && (
                      <p>
                        Tracking number: {actions.shipment.data.data.orderCode}
                      </p>
                    )}
                    {actions.shipment.data?.data.providerStatus && (
                      <p className="text-rewear-muted text-sm">
                        Carrier status:{' '}
                        {actions.shipment.data.data.providerStatus.replaceAll(
                          '_',
                          ' ',
                        )}
                      </p>
                    )}
                  </>
                )}
              </section>
            )}
            {order.status === 'dispute' && (
              <section className="bg-rewear-soft space-y-3 p-5">
                <h2 className="text-xl font-semibold">Reported issues</h2>
                {actions.dispute.isPending ? (
                  <p>Loading report…</p>
                ) : actions.dispute.isError ? (
                  <p>
                    Could not load the report.{' '}
                    <button
                      className="underline"
                      type="button"
                      onClick={() => void actions.dispute.refetch()}
                    >
                      Retry
                    </button>
                  </p>
                ) : (
                  actions.dispute.data?.data.issues.map((issue) => (
                    <article
                      className="border-rewear-border space-y-1 border-t pt-3"
                      key={issue.id}
                    >
                      <p className="font-semibold">
                        {issue.kind.replaceAll('_', ' ').toLowerCase()}
                      </p>
                      <p>{issue.description}</p>
                      <p className="text-rewear-muted text-sm">
                        Status:{' '}
                        {issue.status.replaceAll('_', ' ').toLowerCase()}
                      </p>
                      {issue.status === 'NEEDS_EVIDENCE' && (
                        <>
                          <p className="text-sm">
                            Add the required evidence before{' '}
                            {new Intl.DateTimeFormat('en-GB', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                              timeZone: 'Asia/Ho_Chi_Minh',
                            }).format(new Date(issue.supplementBy))}{' '}
                            ICT.
                          </p>
                          <SupplementEvidenceDialog
                            submitEvidence={(files, tags) =>
                              actions.supplementIssue(issue.id, files, tags)
                            }
                            pending={actions.issuePending}
                            error={actions.issueError}
                          />
                        </>
                      )}
                    </article>
                  ))
                )}
              </section>
            )}
          </>
        )}
      </main>
      <MarketplaceFooter />
      <MobileNavigation cartAction={<CartLink />} />
    </div>
  );
}
