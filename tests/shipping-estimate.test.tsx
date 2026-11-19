import { useShippingEstimateState } from '@/features/checkout/components/ShippingEstimate';
import type { CheckoutControllerQuote200Data } from '@/shared/api/models';
import { renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';

type Quote = CheckoutControllerQuote200Data;
it('shows a ready quote returned by the checkout API', () => {
  const { result, rerender } = renderHook(
    ({ quote }: { quote: Quote | undefined }) =>
      useShippingEstimateState(quote, 'HELD'),
    { initialProps: { quote: undefined as Quote | undefined } },
  );
  const quotedAt = new Date().toISOString();
  rerender({
    quote: {
      status: 'READY',
      environment: 'SANDBOX',
      carrier: 'GHN',
      parcelMethod: 'BOUNDING_STACK_V1',
      quotedAt,
      orders: [],
      totalShippingFee: 20900,
      grandTotal: 120900,
      currency: 'VND',
      paymentReady: false,
    },
  });
  expect(result.current.complete).toBe(true);
});
