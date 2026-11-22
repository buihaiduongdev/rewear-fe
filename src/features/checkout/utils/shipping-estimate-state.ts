import type {
  CheckoutControllerFind200,
  CheckoutControllerQuote200Data,
} from '@/shared/api/models';

type Checkout = CheckoutControllerFind200['data'];

export function getShippingEstimateState(
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
