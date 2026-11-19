'use client';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type {
  CheckoutControllerFind200,
  CheckoutControllerQuote200Data,
} from '@/shared/api/models';
import { useCheckoutControllerQuote } from '@/shared/api/query-generated/checkout/checkout';
import { Button } from '@/shared/components/ui/button';
import { formatPrice } from '@/shared/utils/product';

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
export function ShippingEstimateForOrder({
  quote,
  state,
  orderId,
}: {
  quote: CheckoutControllerQuote200Data | undefined;
  state: State;
  orderId: string;
}) {
  const order = quote?.orders.find((row) => row.orderId === orderId);
  const quoted =
    state.fresh && order?.status === 'QUOTED' && order.fee !== null;
  return (
    <div className="space-y-2">
      {order?.parcel && (
        <p className="text-rewear-muted text-sm">
          1 parcel · {order.itemCount}{' '}
          {order.itemCount === 1 ? 'item' : 'items'} ·{' '}
          {order.parcel.weightGrams} g · {order.parcel.lengthCm} ×{' '}
          {order.parcel.widthCm} × {order.parcel.heightCm} cm
        </p>
      )}
      <div className="flex justify-between gap-3">
        <span className="text-rewear-muted">Shipping estimate</span>
        <span className="shrink-0 text-sm font-semibold">
          {quoted ? formatPrice(order.fee) : 'Not available'}
        </span>
      </div>
      {!state.invalid && order?.reason && (
        <p className="text-rewear-muted text-sm">
          {reasons[order.reason] ?? 'Shipping estimate is unavailable.'}
        </p>
      )}
    </div>
  );
}
export function ShippingEstimateSummary({
  checkout,
  quote,
  state,
  onQuote,
}: {
  checkout: Checkout;
  state: State;
  quote: CheckoutControllerQuote200Data | undefined;
  onQuote: (quote: CheckoutControllerQuote200Data) => void;
}) {
  const refresh = useCheckoutControllerQuote({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onSuccess: (response) => onQuote(response.data),
    },
  });
  return (
    <>
      <div className="flex justify-between gap-3">
        <span className="text-rewear-muted">Shipping</span>
        <span className="shrink-0 text-sm font-semibold">
          {state.complete && quote?.totalShippingFee !== null
            ? formatPrice(quote!.totalShippingFee)
            : 'Not available'}
        </span>
      </div>
      {state.complete && quote?.grandTotal !== null ? (
        <>
          <p
            aria-label="Estimated checkout total"
            className="text-[40px] leading-[46px] font-semibold tracking-[-0.02em]"
          >
            {formatPrice(quote!.grandTotal)}
          </p>
          <p className="text-sm">
            GHN sandbox estimate. This is not a payable total.
          </p>
        </>
      ) : (
        <>
          <p className="text-[40px] leading-[46px] font-semibold tracking-[-0.02em]">
            {formatPrice(checkout.subtotal)}
          </p>
          <p className="text-sm">
            Item subtotal. A complete shipping estimate is required for a
            combined total.
          </p>
        </>
      )}
      <p className="text-rewear-muted text-sm">
        One parcel per seller or shop. Parcel dimensions are a conservative
        estimate from the declared item boxes; actual packing may differ.
      </p>
      {state.invalid && (
        <p role="status">
          Shipping details changed or this reservation is no longer active.
          Refresh before using an estimate.
        </p>
      )}
      {quote?.status === 'PARTIAL' && state.fresh && (
        <p role="status">
          Some sellers could not be quoted. A complete total is unavailable.
        </p>
      )}
      {checkout.status === 'HELD' && (
        <Button
          type="button"
          variant="ghost"
          loading={refresh.isPending}
          disabled={state.pending}
          className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent h-[52px] w-full rounded-none px-5 text-sm font-normal"
          onClick={() => refresh.mutate({ id: checkout.id, data: {} })}
        >
          {state.pending
            ? 'Getting shipping estimate…'
            : quote
              ? 'Refresh shipping estimate'
              : 'Get shipping estimate'}
        </Button>
      )}
      {refresh.isError && !state.complete && (
        <p role="alert">{getApiErrorMessage(refresh.error)}</p>
      )}
      <p className="text-sm">
        Sandbox only. Shipping registration and payment are not enabled.
      </p>
    </>
  );
}
