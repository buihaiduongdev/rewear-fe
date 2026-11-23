import { SellerPendingOrders } from '@/features/seller-dashboard/components/SellerPendingOrders';
import {
  orderControllerAccept,
  orderControllerReject,
} from '@/shared/api/query-generated/orders/orders';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const useOrders = vi.hoisted(() => vi.fn());
vi.mock('@/shared/api/query-generated/orders/orders', () => ({
  useOrderControllerShopList: useOrders,
  orderControllerAccept: vi.fn(),
  orderControllerReject: vi.fn(),
}));

describe('SellerPendingOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOrders.mockReset();
  });

  it('requests pending orders for the shop and displays returned values', () => {
    useOrders.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        data: [
          {
            id: 'order-123',
            total: 125000,
            sellerConfirmBy: '2026-11-22T12:00:00Z',
            items: [{}, {}],
          },
        ],
      },
    });
    render(<SellerPendingOrders shopId="shop-123" enabled />);
    expect(useOrders).toHaveBeenCalledWith(
      'shop-123',
      { status: 'pending', limit: 20, offset: 0 },
      { query: { enabled: true } },
    );
    expect(screen.getByText('order-123')).toBeInTheDocument();
    expect(screen.getByText(/125\.000/)).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();
  });

  it('shows loading, empty and retryable error states', () => {
    const retry = vi.fn();
    useOrders.mockReturnValue({ isPending: true, isError: false });
    const { rerender } = render(
      <SellerPendingOrders shopId="shop-123" enabled />,
    );
    expect(screen.getByText('Loading orders…')).toBeInTheDocument();
    useOrders.mockReturnValue({
      isPending: false,
      isError: false,
      data: { data: [] },
    });
    rerender(<SellerPendingOrders shopId="shop-123" enabled />);
    expect(
      screen.getByText('No orders awaiting confirmation.'),
    ).toBeInTheDocument();
    useOrders.mockReturnValue({
      isPending: false,
      isError: true,
      refetch: retry,
    });
    rerender(<SellerPendingOrders shopId="shop-123" enabled />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
  });
  it('accepts and rejects orders through the API and refreshes the list', async () => {
    const refetch = vi.fn().mockResolvedValue({});
    useOrders.mockReturnValue({
      isPending: false,
      isError: false,
      refetch,
      data: {
        data: [
          {
            id: 'order-123',
            total: 125000,
            sellerConfirmBy: '2026-11-22T12:00:00Z',
            items: [{}],
          },
        ],
      },
    });
    vi.mocked(orderControllerAccept).mockResolvedValue({} as never);
    vi.mocked(orderControllerReject).mockResolvedValue({} as never);
    render(<SellerPendingOrders shopId="shop-123" enabled />);
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
    await waitFor(() =>
      expect(orderControllerAccept).toHaveBeenCalledWith(
        'shop-123',
        'order-123',
        {},
      ),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    fireEvent.change(screen.getByLabelText('Rejection reason'), {
      target: { value: 'Unavailable' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm rejection' }));
    await waitFor(() =>
      expect(orderControllerReject).toHaveBeenCalledWith(
        'shop-123',
        'order-123',
        { reason: 'Unavailable' },
      ),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(2));
  });
});
