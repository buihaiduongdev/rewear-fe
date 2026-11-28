import { SellerOrdersSection } from '@/features/seller-dashboard/components/SellerOrdersSection';
import { SellerOverviewSection } from '@/features/seller-dashboard/components/SellerOverviewSection';
import {
  orderControllerAccept,
  orderControllerReject,
} from '@/shared/api/query-generated/orders/orders';
import {
  shipmentControllerCreate,
  shipmentControllerLabel,
  shipmentControllerRespond,
} from '@/shared/api/query-generated/shipments/shipments';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const useShopOrders = vi.hoisted(() => vi.fn());
const useShipmentView = vi.hoisted(() => vi.fn());

vi.mock('@/shared/api/query-generated/orders/orders', () => ({
  useOrderControllerShopList: useShopOrders,
  orderControllerAccept: vi.fn(),
  orderControllerReject: vi.fn(),
}));

vi.mock('@/shared/api/query-generated/shipments/shipments', () => ({
  useShipmentControllerShopView: useShipmentView,
  getShipmentControllerShopViewQueryKey: (shopId: string, id: string) => [
    `/api/shops/${shopId}/orders/${id}/shipment`,
  ],
  shipmentControllerCreate: vi.fn(),
  shipmentControllerLabel: vi.fn(),
  shipmentControllerRespond: vi.fn(),
}));

function wrap(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

const sampleOrders = [
  {
    id: 'ord-pending-1',
    orderCode: 'RW-AAA1111111',
    status: 'pending',
    paymentMethod: 'MOMO',
    total: 350000,
    subtotal: 320000,
    shippingFee: 30000,
    sellerConfirmBy: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    handoverBy: null,
    disputeDeadlineAt: null,
    receiptConfirmedAt: null,
    cancelRequestedAt: null,
    cancelState: null,
    cancellationNote: null,
    address: { recipientName: 'Nguyen Thuy Linh', phone: '0903112233' },
    items: [{ title: 'Lemaire coat', size: 'M', price: 320000 }],
  },
  {
    id: 'ord-prep-2',
    orderCode: 'RW-BBB2222222',
    status: 'preparing',
    paymentMethod: 'COD',
    total: 240000,
    subtotal: 210000,
    shippingFee: 30000,
    sellerConfirmBy: new Date().toISOString(),
    handoverBy: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
    disputeDeadlineAt: null,
    receiptConfirmedAt: null,
    cancelRequestedAt: '2026-11-26T09:00:00Z',
    cancelState: null,
    cancellationNote: null,
    address: { recipientName: 'Tran Minh', phone: '0911222333' },
    items: [{ title: 'Wool trousers', size: 'L', price: 210000 }],
  },
  {
    id: 'ord-deliv-3',
    orderCode: 'RW-CCC3333333',
    status: 'delivered',
    paymentMethod: 'PAYOS',
    total: 520000,
    subtotal: 490000,
    shippingFee: 30000,
    sellerConfirmBy: new Date().toISOString(),
    handoverBy: null,
    disputeDeadlineAt: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
    receiptConfirmedAt: null,
    cancelRequestedAt: null,
    cancelState: null,
    cancellationNote: null,
    address: { recipientName: 'Le Ha', phone: '0988777666' },
    items: [{ title: 'Cashmere knit', size: 'S', price: 490000 }],
  },
];

describe('SellerOverviewSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useShopOrders.mockReturnValue({
      isPending: false,
      isError: false,
      data: { data: sampleOrders },
    });
  });

  it('displays shop activity KPIs, recent orders, and New listing CTA', () => {
    const onNavigate = vi.fn();
    wrap(
      <SellerOverviewSection
        shopId="shop-1"
        shopName="Hanoi Archive"
        enabled
        products={[
          {
            id: 'p1',
            title: 'Coat',
            size: 'M',
            condition: 'Good',
            price: '320.000₫',
            status: 'Active',
            image: null,
          },
        ]}
        totalListings={3}
        onNavigate={onNavigate}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Overview' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'New listing' })).toHaveAttribute(
      'href',
      '/selling/new',
    );
    expect(screen.getByText('RW-AAA1111111')).toBeInTheDocument();
    expect(
      screen.getByText(/Buyer COD cancel requests \(1\)/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Pending orders/i }));
    expect(onNavigate).toHaveBeenCalledWith('orders', 'pending');
  });
});

describe('SellerOrdersSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useShipmentView.mockReturnValue({
      isPending: false,
      data: {
        data: {
          id: 'ship-1',
          orderId: 'ord-prep-2',
          state: 'READY',
          orderCode: 'GHN-998877',
          codAmount: 240000,
          carrierFee: 30000,
        },
      },
    });
  });

  it('filters by status tab, accepts/rejects pending orders, and shows 72h escrow countdown', async () => {
    const refetch = vi.fn().mockResolvedValue({});
    useShopOrders.mockReturnValue({
      isPending: false,
      isError: false,
      isFetching: false,
      refetch,
      data: { data: sampleOrders },
    });
    vi.mocked(orderControllerAccept).mockResolvedValue({} as never);
    vi.mocked(orderControllerReject).mockResolvedValue({} as never);

    wrap(<SellerOrdersSection shopId="shop-1" enabled />);

    expect(screen.getByText('RW-AAA1111111')).toBeInTheDocument();
    expect(screen.getByText(/Escrow · \d+h/i)).toBeInTheDocument();

    // Accept pending order
    fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
    await waitFor(() =>
      expect(orderControllerAccept).toHaveBeenCalledWith(
        'shop-1',
        'ord-pending-1',
        {},
      ),
    );

    // Reject pending order via modal
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    fireEvent.change(screen.getByLabelText('Rejection reason'), {
      target: { value: 'Out of stock' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm rejection' }));
    await waitFor(() =>
      expect(orderControllerReject).toHaveBeenCalledWith(
        'shop-1',
        'ord-pending-1',
        { reason: 'Out of stock' },
      ),
    );

    // Switch status filter tab to Preparing
    fireEvent.click(screen.getByRole('tab', { name: 'Preparing' }));
    expect(useShopOrders).toHaveBeenLastCalledWith(
      'shop-1',
      { status: 'preparing', limit: 20, offset: 0 },
      { query: { enabled: true } },
    );
  });

  it('books GHN shipment, prints A5 label, and responds to buyer COD cancel request', async () => {
    const refetch = vi.fn().mockResolvedValue({});
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    useShopOrders.mockReturnValue({
      isPending: false,
      isError: false,
      isFetching: false,
      refetch,
      data: { data: [sampleOrders[1]] },
    });
    vi.mocked(shipmentControllerCreate).mockResolvedValue({
      statusCode: 200,
      message: 'ok',
      data: { id: 'ship-1', orderCode: 'GHN-998877' },
    } as never);
    vi.mocked(shipmentControllerLabel).mockResolvedValue({
      statusCode: 200,
      message: 'ok',
      data: { url: 'https://dev-online-gateway.ghn.vn/a5/label-1.pdf' },
    } as never);
    vi.mocked(shipmentControllerRespond).mockResolvedValue({} as never);

    wrap(<SellerOrdersSection shopId="shop-1" enabled />);

    // Book GHN shipment
    fireEvent.click(screen.getByRole('button', { name: 'Book GHN' }));
    await waitFor(() =>
      expect(shipmentControllerCreate).toHaveBeenCalledWith(
        'shop-1',
        'ord-prep-2',
        {},
      ),
    );

    // Print GHN A5 shipping label
    fireEvent.click(screen.getByRole('button', { name: 'Print A5 label' }));
    await waitFor(() =>
      expect(shipmentControllerLabel).toHaveBeenCalledWith(
        'shop-1',
        'ord-prep-2',
        {},
      ),
    );
    expect(openSpy).toHaveBeenCalledWith(
      'https://dev-online-gateway.ghn.vn/a5/label-1.pdf',
      '_blank',
      'noopener,noreferrer',
    );

    // Respond to buyer COD cancellation request
    fireEvent.click(screen.getByRole('button', { name: 'Review cancel' }));
    fireEvent.change(screen.getByLabelText('Reason'), {
      target: { value: 'Not yet handed over' },
    });
    fireEvent.change(screen.getByLabelText('Handover note / evidence'), {
      target: { value: 'Parcel still at shop' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm approval' }));

    await waitFor(() =>
      expect(shipmentControllerRespond).toHaveBeenCalledWith(
        'shop-1',
        'ord-prep-2',
        {
          approve: true,
          reason: 'Not yet handed over',
          evidence: 'Parcel still at shop',
        },
      ),
    );

    openSpy.mockRestore();
  });
});
