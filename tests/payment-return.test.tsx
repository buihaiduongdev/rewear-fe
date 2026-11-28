import { PaymentCancelPage } from '@/features/checkout/components/PaymentCancelPage';
import { PaymentResultPage } from '@/features/checkout/components/PaymentResultPage';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const usePaymentFind = vi.hoisted(() => vi.fn());
const reconcileMutate = vi.hoisted(() => vi.fn());
const searchParamsValue = vi.hoisted(() => ({
  current: 'paymentId=pay-1&checkoutId=chk-1',
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(searchParamsValue.current),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    status: 'authenticated',
    data: { user: { id: 'user-1' } },
  }),
}));

vi.mock('@/modules/cart/components/CartLink', () => ({
  CartLink: () => <a href="/cart">Cart</a>,
}));

vi.mock('@/shared/components/marketplace/MarketplaceHeader', () => ({
  MarketplaceHeader: () => <header>Header</header>,
}));

vi.mock('@/shared/components/marketplace/MobileNavigation', () => ({
  MobileNavigation: () => null,
}));

vi.mock('@/shared/api/query-generated/payments/payments', () => ({
  usePaymentControllerFind: usePaymentFind,
  usePaymentControllerReconcile: () => ({
    mutate: reconcileMutate,
    isPending: false,
    isError: false,
  }),
}));

describe('Payment return pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    searchParamsValue.current = 'paymentId=pay-1&checkoutId=chk-1';
  });

  it('renders PAID confirmation and links to /orders', () => {
    usePaymentFind.mockReturnValue({
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
      data: {
        data: {
          id: 'pay-1',
          checkoutId: 'chk-1',
          amount: 1130000,
          state: 'PAID',
          payUrl: null,
          paidAt: '2026-11-26T10:00:00Z',
          refunds: [],
        },
      },
    });

    render(<PaymentResultPage />);
    expect(screen.getByText('Payment confirmed')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View your orders' }),
    ).toHaveAttribute('href', '/orders');
  });

  it('allows manual status reconciliation while payment is PENDING', () => {
    usePaymentFind.mockReturnValue({
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
      data: {
        data: {
          id: 'pay-1',
          checkoutId: 'chk-1',
          amount: 450000,
          state: 'PENDING',
          payUrl: 'https://test-payment.momo.vn/pay/1',
          paidAt: null,
          refunds: [],
        },
      },
    });

    render(<PaymentResultPage />);
    expect(screen.getByText('Confirming your payment')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Check payment status' }),
    );
    expect(reconcileMutate).toHaveBeenCalledWith({ id: 'pay-1' });
  });

  it('explains automatic refund to MoMo/Wallet when hold expires late', () => {
    usePaymentFind.mockReturnValue({
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
      data: {
        data: {
          id: 'pay-1',
          checkoutId: 'chk-1',
          amount: 450000,
          state: 'REFUND_REQUIRED',
          payUrl: null,
          paidAt: null,
          refunds: [{ id: 'ref-1', amount: 450000, state: 'QUEUED' }],
        },
      },
    });

    render(<PaymentResultPage />);
    expect(
      screen.getByText('Late payment refund in progress'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/automatically refunded to your MoMo account/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Refund status: QUEUED/i)).toBeInTheDocument();
  });

  it('renders PaymentCancelPage with Return to checkout and Back to cart links', () => {
    render(<PaymentCancelPage />);
    expect(screen.getByText('Payment cancelled')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Return to checkout' }),
    ).toHaveAttribute('href', '/checkout?id=chk-1');
    expect(screen.getByRole('link', { name: 'Back to cart' })).toHaveAttribute(
      'href',
      '/cart',
    );
  });

  it('renders a single Back to cart action on failed payment without checkoutId', () => {
    searchParamsValue.current = 'paymentId=pay-1&status=CANCELLED';
    usePaymentFind.mockReturnValue({
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
      data: {
        data: {
          id: 'pay-1',
          checkoutId: '',
          amount: 450000,
          state: 'FAILED',
          payUrl: null,
          paidAt: null,
          refunds: [],
        },
      },
    });

    render(<PaymentResultPage />);
    expect(screen.getByText('Payment was not completed')).toBeInTheDocument();
    const cartLinks = screen.getAllByRole('link', { name: 'Back to cart' });
    expect(cartLinks).toHaveLength(1);
    expect(cartLinks[0]).toHaveAttribute('href', '/cart');
  });
});
