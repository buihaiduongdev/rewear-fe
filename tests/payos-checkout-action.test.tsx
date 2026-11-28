import { PayosCheckoutAction } from '@/features/checkout/components/PayosCheckoutAction';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ flow: vi.fn(), pay: vi.fn() }));
vi.mock('@/modules/payment/hooks/use-payment-session', () => ({
  usePaymentSession: mocks.flow,
}));
const base = {
  checkoutId: 'checkout',
  status: 'HELD',
  expiresAt: new Date(Date.now() + 600000).toISOString(),
  quoteReady: true,
  quoteTotal: 230000,
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.flow.mockReturnValue({
    enabled: true,
    payment: { isFetching: false, isError: false },
    context: null,
    pay: mocks.pay,
    creating: false,
  });
});
it('does not start a new payment before shipping is completely quoted or after expiry', () => {
  const { rerender } = render(
    <PayosCheckoutAction {...base} quoteReady={false} />,
  );
  expect(screen.getByRole('button', { name: 'Pay with PayOS' })).toBeDisabled();
  rerender(<PayosCheckoutAction {...base} expiresAt="2020-01-01T00:00:00Z" />);
  expect(screen.getByRole('button', { name: 'Pay with PayOS' })).toBeDisabled();
});
it('asks to continue for the authoritative new amount and can resume without another shipping quote', () => {
  mocks.flow.mockReturnValue({
    enabled: true,
    payment: {
      data: { data: { state: 'PENDING', amount: 250000 } },
      isFetching: false,
      isError: false,
    },
    context: { paymentId: 'payment' },
    pay: mocks.pay,
  });
  render(<PayosCheckoutAction {...base} quoteReady={false} />);
  const button = screen.getByRole('button', { name: /Continue for/ });
  expect(button).toBeEnabled();
  fireEvent.click(button);
  expect(mocks.pay).toHaveBeenCalledWith(250000);
});
it('blocks new attempts while an existing payment is unknown', () => {
  mocks.flow.mockReturnValue({
    enabled: true,
    payment: { data: { data: { state: 'UNKNOWN', amount: 230000 } } },
    context: { paymentId: 'payment' },
    pay: mocks.pay,
  });
  render(<PayosCheckoutAction {...base} />);
  expect(screen.getByRole('button', { name: 'Pay with PayOS' })).toBeDisabled();
  expect(
    screen.getByRole('link', { name: 'View payment status' }),
  ).toBeInTheDocument();
});
