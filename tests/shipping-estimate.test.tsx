import { useShippingEstimateState } from '@/features/checkout/components/ShippingEstimate';
import type { CheckoutControllerFind200 } from '@/shared/api/models';
import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

type Quote = CheckoutControllerFind200['data']['shippingQuote'];
afterEach(() => vi.useRealTimers());
it('starts the quote clock when a delayed quote arrives and hides expired totals', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-31T09:00:00Z'));
  const { result, rerender } = renderHook(
    ({ quote }: { quote: Quote | undefined }) =>
      useShippingEstimateState(quote, 'HELD'),
    { initialProps: { quote: undefined as Quote | undefined } },
  );
  act(() => vi.advanceTimersByTime(30000));
  const quotedAt = new Date().toISOString();
  rerender({
    quote: {
      id: 'quote-id',
      status: 'READY',
      environment: 'SANDBOX',
      carrier: 'GHN',
      parcelMethod: 'BOUNDING_STACK_V1',
      quotedAt,
      expiresAt: new Date(Date.now() + 120000).toISOString(),
      orders: [],
      totalShippingFee: 20900,
      grandTotal: 120900,
      currency: 'VND',
      paymentReady: false,
    },
  });
  expect(result.current.seconds).toBe(120);
  act(() => vi.advanceTimersByTime(0));
  expect(result.current.seconds).toBe(120);
  expect(result.current.complete).toBe(true);
  act(() => vi.advanceTimersByTime(121000));
  expect(result.current.expired).toBe(true);
  expect(result.current.complete).toBe(false);
});
