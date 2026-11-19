'use client';

import { useEffect, useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type {
  CheckoutControllerFind200,
  CheckoutControllerQuote200Data,
} from '@/shared/api/models';
import { useCheckoutControllerQuote } from '@/shared/api/query-generated/checkout/checkout';
import { formatPrice } from '@/shared/utils/product';

import { DeliveryMethodModal } from './DeliveryMethodModal';
import type { PaymentMethodId } from './PaymentMethodModal';

type Checkout = CheckoutControllerFind200['data'];

export function useShippingEstimateState(
  quote: CheckoutControllerQuote200Data | undefined,
  status: Checkout['status'],
) {
  const invalid = !!quote && status !== 'HELD';
  const fresh =
    !!quote && !invalid && ['READY', 'PARTIAL'].includes(quote.status);
  return {
    fresh,
    complete: fresh && quote?.status === 'READY',
    pending: false,
    invalid,
  };
}

type State = ReturnType<typeof useShippingEstimateState>;

const reasons: Record<string, string> = {
  PACKAGE_REQUIRED: 'Seller needs to declare packaging for every item.',
  PARCEL_LIMIT_EXCEEDED:
    'The combined parcel exceeds the supported size or weight.',
  PICKUP_REQUIRED: 'Seller needs to add a pickup address.',
  DECLARED_VALUE_LIMIT:
    'The parcel value exceeds this shipping service’s supported limit.',
  ADDRESS_MAPPING_UNAVAILABLE:
    'This address could not be matched to the carrier directory.',
  CARRIER_NOT_CONFIGURED: 'Shipping estimates are not configured yet.',
  CARRIER_REJECTED: 'The carrier could not quote this route or parcel.',
  CARRIER_UNAVAILABLE: 'The carrier is temporarily unavailable. Try again.',
};

export function formatEstimatedDelivery(estimatedDeliveryAt?: string | null) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  if (estimatedDeliveryAt) {
    const target = new Date(estimatedDeliveryAt);
    if (!isNaN(target.getTime())) {
      const start = new Date(target.getTime() - 2 * 24 * 60 * 60 * 1000);
      return `${start.getDate()}–${target.getDate()} ${months[target.getMonth()]}`;
    }
  }
  const now = new Date();
  const d1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const d2 = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  return `${d1.getDate()}–${d2.getDate()} ${months[d2.getMonth()]}`;
}

export function getEstimatedDeliveryText(estimatedDeliveryAt?: string | null) {
  return `GHN Standard · Estimated ${formatEstimatedDelivery(estimatedDeliveryAt)}`;
}

export function ShippingEstimateForOrder({
  quote,
  state,
  orderId,
  shopName,
}: {
  quote: CheckoutControllerQuote200Data | undefined;
  state: State;
  orderId: string;
  shopName?: string;
}) {
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const order = quote?.orders.find((row) => row.orderId === orderId);
  const quoted =
    state.fresh && order?.status === 'QUOTED' && order.fee !== null;

  return (
    <div className="bg-rewear-soft/40 border-rewear-text/70 mt-3 space-y-1.5 border p-4 transition-colors">
      <div className="flex items-center justify-between text-base">
        <span className="font-semibold">Delivery method</span>
        <span className="text-sm font-semibold">
          {quoted ? (
            formatPrice(order.fee)
          ) : order?.status === 'UNAVAILABLE' ? (
            <span className="text-amber-600 text-xs">Unavailable</span>
          ) : (
            <span className="text-rewear-muted animate-pulse text-xs">
              Calculating…
            </span>
          )}
        </span>
      </div>
      <p className="text-rewear-muted text-sm">
        {getEstimatedDeliveryText(order?.estimatedDeliveryAt)}
      </p>
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setDeliveryModalOpen(true)}
          className="text-sm font-semibold hover:underline cursor-pointer"
        >
          Change &rarr;
        </button>
      </div>
      {!state.invalid && order?.reason && (
        <p className="text-xs text-amber-600 pt-1">
          {reasons[order.reason] ?? 'Shipping estimate is unavailable.'}
        </p>
      )}

      <DeliveryMethodModal
        open={deliveryModalOpen}
        onOpenChange={setDeliveryModalOpen}
        shopName={shopName ?? 'Order'}
        fee={order?.fee ?? null}
        estimatedDateText={formatEstimatedDelivery(order?.estimatedDeliveryAt)}
      />
    </div>
  );
}

export function ShippingEstimateSummary({
  checkout,
  quote,
  state,
  onQuote,
  selectedPaymentMethod = 'MOMO',
  onChangePaymentMethod,
}: {
  checkout: Checkout;
  state: State;
  quote: CheckoutControllerQuote200Data | undefined;
  onQuote: (quote: CheckoutControllerQuote200Data) => void;
  selectedPaymentMethod?: PaymentMethodId;
  onChangePaymentMethod?: () => void;
}) {
  const refresh = useCheckoutControllerQuote({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onSuccess: (response) => onQuote(response.data),
    },
  });

  // Tự động tính phí vận chuyển GHN ngay khi vào trang checkout
  useEffect(() => {
    if (
      checkout.status === 'HELD' &&
      !quote &&
      !refresh.isPending &&
      !refresh.isSuccess &&
      !refresh.isError
    ) {
      refresh.mutate({ id: checkout.id, data: {} });
    }
  }, [checkout.id, checkout.status, quote, refresh]);

  const sellerCount = checkout.orders.length;
  const hasQuotedFee = state.complete && quote?.totalShippingFee !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-base">
        <span className="text-rewear-muted">
          Shipping · {sellerCount} {sellerCount === 1 ? 'seller' : 'sellers'}
        </span>
        <span className="text-sm font-semibold">
          {refresh.isPending ? (
            <span className="text-rewear-muted animate-pulse">
              Calculating…
            </span>
          ) : hasQuotedFee ? (
            formatPrice(quote!.totalShippingFee)
          ) : quote?.status === 'UNAVAILABLE' ? (
            <span className="text-amber-600 text-xs">Unavailable</span>
          ) : (
            <span className="text-rewear-muted animate-pulse">
              Calculating…
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-rewear-border/20 pt-4">
        <span className="text-base font-normal">Total</span>
        <span
          aria-label="Estimated checkout total"
          className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]"
        >
          {hasQuotedFee && quote?.grandTotal !== null
            ? formatPrice(quote!.grandTotal)
            : formatPrice(checkout.subtotal)}
        </span>
      </div>

      <div className="space-y-1 pt-2">
        <p className="text-sm font-semibold">Payment method &rsaquo;</p>
        <p className="text-rewear-muted text-base">
          {selectedPaymentMethod === 'CARD'
            ? 'Bank card'
            : selectedPaymentMethod === 'VNPAY'
              ? 'VNPAY'
              : selectedPaymentMethod === 'ZALOPAY'
                ? 'ZaloPay'
                : 'MoMo'}
          {' · '}
          <button
            type="button"
            onClick={onChangePaymentMethod}
            className="text-rewear-text font-semibold hover:underline cursor-pointer"
          >
            Change
          </button>
        </p>
      </div>

      {state.invalid && (
        <p role="status" className="text-xs text-amber-600">
          Shipping details changed or this reservation is no longer active.
        </p>
      )}

      {refresh.isError && (
        <div className="flex items-center justify-between text-xs text-red-600">
          <span>{getApiErrorMessage(refresh.error)}</span>
          <button
            type="button"
            className="cursor-pointer font-semibold underline"
            onClick={() => refresh.mutate({ id: checkout.id, data: {} })}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
