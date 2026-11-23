import Link from 'next/link';

import type { OrderControllerBuyerList200DataItem } from '@/shared/api/models';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { formatPrice } from '@/shared/utils/product';

import {
  getItemCondition,
  getItemText,
  ORDER_STATUS_LABELS,
} from '../utils/order-display';

export function BuyerOrderCard({
  order,
}: {
  order: OrderControllerBuyerList200DataItem;
}) {
  const item = order.items[0];
  const title = item ? getItemText(item, 'title') : undefined;
  const image = item ? getItemText(item, 'coverUrl') : undefined;
  const size = item ? getItemText(item, 'size') : undefined;
  const condition = item ? getItemCondition(item) : undefined;
  const price = item && typeof item.price === 'number' ? item.price : undefined;
  return (
    <article className="border-rewear-border space-y-5 rounded-lg border p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">{order.shopName}</p>
        <span className="text-sm">
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>
      {item && (
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="bg-rewear-soft relative h-[120px] w-24 shrink-0 overflow-hidden">
            <ProductPhoto
              url={image ?? null}
              title={title ?? 'Order item'}
              sizes="96px"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{title ?? 'Item'}</h2>
            {(size || condition) && (
              <p className="text-rewear-muted text-sm">
                {[size ? `Size ${size}` : null, condition]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
            {price !== undefined && (
              <p className="font-semibold">{formatPrice(price)}</p>
            )}
            {order.items.length > 1 && (
              <p className="text-rewear-muted text-sm">
                + {order.items.length - 1} other{' '}
                {order.items.length === 2 ? 'item' : 'items'}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <span className="text-rewear-muted break-all">
          Order {order.orderCode}
        </span>
        <span>
          Total · <strong>{formatPrice(order.total)}</strong>
        </span>
        <Link
          href={`/orders/${encodeURIComponent(order.id)}`}
          className="font-semibold underline-offset-4 hover:underline"
        >
          View order →
        </Link>
      </div>
    </article>
  );
}
