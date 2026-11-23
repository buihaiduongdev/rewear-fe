import { BuyerOrdersPage } from '@/features/orders/components/BuyerOrdersPage';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useOrders: vi.fn(),
  useSession: vi.fn(),
  replace: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.replace }),
}));
vi.mock('next-auth/react', () => ({ useSession: mocks.useSession }));
vi.mock('@/shared/api/query-generated/orders/orders', () => ({
  useOrderControllerBuyerList: mocks.useOrders,
}));
vi.mock('@/shared/components/marketplace/MarketplaceHeader', () => ({
  MarketplaceHeader: () => null,
}));
vi.mock('@/shared/components/marketplace/MobileNavigation', () => ({
  MobileNavigation: () => null,
}));
vi.mock('@/modules/cart/components/CartLink', () => ({ CartLink: () => null }));

const order = {
  id: 'order-123',
  orderCode: 'RW-0123456789',
  shopName: 'Second Story',
  status: 'pending',
  total: 230000,
  items: [{ title: 'Coat', price: 200000 }],
};
describe('buyer orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'buyer-1' } },
    });
  });
  it('requests the authenticated buyer orders and displays API data', () => {
    mocks.useOrders.mockReturnValue({
      isPending: false,
      isError: false,
      data: { data: [order] },
    });
    render(<BuyerOrdersPage />);
    expect(mocks.useOrders).toHaveBeenCalledWith(
      { limit: 21, offset: 0 },
      {
        query: {
          enabled: true,
          queryKey: ['buyer-orders', 'buyer-1', { limit: 21, offset: 0 }],
        },
      },
    );
    expect(screen.getByText('Second Story')).toBeInTheDocument();
    expect(
      screen.getByText('Awaiting seller confirmation', { selector: 'span' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/230\.000/)).toBeInTheDocument();
  });
  it('shows loading, empty, and retryable error states', () => {
    mocks.useOrders.mockReturnValue({ isPending: true, isError: false });
    const { rerender } = render(<BuyerOrdersPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading orders');
    mocks.useOrders.mockReturnValue({
      isPending: false,
      isError: false,
      data: { data: [] },
    });
    rerender(<BuyerOrdersPage />);
    expect(screen.getByText('You have no orders yet.')).toBeInTheDocument();
    const retry = vi.fn();
    mocks.useOrders.mockReturnValue({
      isPending: false,
      isError: true,
      refetch: retry,
    });
    rerender(<BuyerOrdersPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
  });
  it('paginates and resets the offset when filtering by status', () => {
    mocks.useOrders.mockReturnValue({
      isPending: false,
      isFetching: false,
      isError: false,
      data: {
        data: Array.from({ length: 21 }, (_, i) => ({
          ...order,
          id: `order-${i}`,
        })),
      },
    });
    render(<BuyerOrdersPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(mocks.useOrders).toHaveBeenLastCalledWith(
      expect.objectContaining({ offset: 20 }),
      expect.anything(),
    );
    fireEvent.change(screen.getByLabelText('Filter orders by status'), {
      target: { value: 'cancelled' },
    });
    expect(mocks.useOrders).toHaveBeenLastCalledWith(
      expect.objectContaining({ offset: 0, status: 'cancelled' }),
      expect.anything(),
    );
  });
  it('does not query before authentication', () => {
    mocks.useSession.mockReturnValue({ status: 'loading', data: null });
    mocks.useOrders.mockReturnValue({ isPending: true, isError: false });
    render(<BuyerOrdersPage />);
    expect(mocks.useOrders).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        query: expect.objectContaining({ enabled: false }),
      }),
    );
  });
});
