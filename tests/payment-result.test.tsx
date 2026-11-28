import { PaymentResultPage } from '@/features/payment/components/PaymentResultPage';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ payment: vi.fn(), check: vi.fn() }));
vi.mock('@/modules/payment/hooks/use-payment-session', () => ({
  usePaymentSession: mocks.payment,
}));
vi.mock('@/shared/components/marketplace/MarketplaceHeader', () => ({
  MarketplaceHeader: () => null,
}));
vi.mock('@/modules/cart/components/CartLink', () => ({ CartLink: () => null }));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.payment.mockReturnValue({
    authLoading: false,
    enabled: true,
    context: { paymentId: 'payment', checkoutId: 'checkout' },
    payment: {
      data: {
        data: {
          id: 'payment',
          amount: 230000,
          state: 'PENDING',
          refunds: [],
          paidAt: null,
        },
      },
      isPending: false,
      isError: false,
    },
    checkStatus: mocks.check,
    checking: false,
  });
});
it('does not accept success query parameters as payment proof', () => {
  window.history.replaceState({}, '', '/payment-result?status=PAID&code=00');
  render(<PaymentResultPage mode="result" />);
  expect(
    screen.getByRole('heading', { name: 'Confirming your payment' }),
  ).toBeInTheDocument();
  expect(screen.queryByText('Payment confirmed')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Check payment status' }));
  expect(mocks.check).toHaveBeenCalled();
});
it('shows server PAID even on cancellation return without cancelling the checkout', () => {
  const state = mocks.payment();
  state.payment.data.data.state = 'PAID';
  mocks.payment.mockReturnValue(state);
  render(<PaymentResultPage mode="cancel" />);
  expect(
    screen.getByRole('heading', { name: 'Payment confirmed' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View my orders' })).toHaveAttribute(
    'href',
    '/orders',
  );
});
it('offers recovery instead of guessing when browser context is missing', () => {
  mocks.payment.mockReturnValue({
    authLoading: false,
    enabled: true,
    context: null,
    payment: {},
    checking: false,
  });
  render(<PaymentResultPage mode="result" />);
  expect(
    screen.getByRole('heading', { name: 'Find your payment' }),
  ).toBeInTheDocument();
  expect(screen.queryByText('Payment confirmed')).not.toBeInTheDocument();
});
it('preserves an uncertain state after a network error', () => {
  const state = mocks.payment();
  state.payment = {
    isError: true,
    error: new Error('Network unavailable'),
    isPending: false,
  };
  mocks.payment.mockReturnValue(state);
  render(<PaymentResultPage mode="result" />);
  expect(screen.getByRole('alert')).toHaveTextContent(/could not check/i);
  expect(screen.queryByText('Payment confirmed')).not.toBeInTheDocument();
});
