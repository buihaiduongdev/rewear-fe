import { CheckoutPage } from '@/features/checkout/components/CheckoutPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const routerPush = vi.hoisted(() => vi.fn());
const routerReplace = vi.hoisted(() => vi.fn());
const codMutateAsync = vi.hoisted(() => vi.fn());
const checkoutRefetch = vi.hoisted(() => vi.fn());
const mockApi = vi.hoisted(() => ({
  createMomoPayment: vi.fn(),
  createPayosPayment: vi.fn(),
  fetchCoinBalance: vi.fn(),
  selectCheckoutCoins: vi.fn(),
  reserveWalletCheckout: vi.fn(),
  confirmWalletCheckout: vi.fn(),
  saveLastPaymentSession: vi.fn(),
  redirectToExternalUrl: vi.fn(),
}));

const mockWalletData = vi.hoisted(() => ({
  current: { data: { balance: 250000, currency: 'VND', credits: [] } },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, replace: routerReplace }),
  useSearchParams: () => new URLSearchParams('id=chk-1'),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    status: 'authenticated',
    data: { user: { id: 'user-1', name: 'Linh' } },
  }),
}));

vi.mock('@/modules/cart/hooks/use-cart', () => ({
  cartQueryKey: () => ['cart'],
  useCart: () => ({ data: { data: { groups: [] } } }),
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

vi.mock('@/shared/components/marketplace/ProductPhoto', () => ({
  ProductPhoto: ({ title }: { title: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={title} src="/test.jpg" />
  ),
}));

vi.mock('@/modules/address', () => ({
  AddAddressDialog: () => null,
  DeliveryAddressModal: () => null,
}));

vi.mock('@/shared/api/query-generated/user-addresses/user-addresses', () => ({
  useUserAddressControllerFindAll: () => ({ data: { data: [] } }),
}));

vi.mock('@/shared/api/query-generated/wallet/wallet', () => ({
  useWalletControllerMine: () => ({ data: mockWalletData.current }),
}));

vi.mock('@/shared/api/query-generated/cod/cod', () => ({
  useCodControllerPlace: () => ({
    mutateAsync: codMutateAsync,
    isPending: false,
  }),
}));

vi.mock('@/shared/api/query-generated/checkout/checkout', () => ({
  useCheckoutControllerFind: () => ({
    isPending: false,
    refetch: checkoutRefetch,
    data: {
      data: {
        id: 'chk-1',
        status: 'HELD',
        expiresAt: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
        holdSeconds: 600,
        removedItems: [],
        subtotal: 200000,
        coinDiscount: 0,
        currency: 'VND',
        paymentReady: false,
        address: {
          recipientName: 'Nguyen Thuy Linh',
          phone: '0903112233',
          addressLine1: '72 Le Thanh Ton',
          wardName: 'Ben Nghe',
          provinceName: 'Ho Chi Minh City',
        },
        orders: [
          {
            id: 'co-1',
            shopId: 'shop-1',
            shopName: 'Hanoi Archive',
            subtotal: 200000,
            shippingFee: 25000,
            items: [
              {
                productId: 'prod-1',
                title: 'Lemaire wool coat',
                price: 200000,
                size: 'M',
                condition: 'GOOD',
                coverUrl: null,
              },
            ],
          },
        ],
      },
    },
  }),
  useCheckoutControllerCreate: () => ({ mutate: vi.fn(), isPending: false }),
  useCheckoutControllerCancel: () => ({ mutate: vi.fn(), isPending: false }),
  useCheckoutControllerQuote: (options?: {
    mutation?: { onSuccess?: (res: unknown) => void };
  }) => ({
    isPending: false,
    isSuccess: false,
    isError: false,
    mutate: () => {
      options?.mutation?.onSuccess?.({
        data: {
          status: 'READY',
          environment: 'SANDBOX',
          carrier: 'GHN',
          parcelMethod: 'BOUNDING_STACK_V1',
          quotedAt: new Date().toISOString(),
          orders: [
            {
              orderId: 'co-1',
              status: 'QUOTED',
              fee: 25000,
              estimatedDeliveryAt: null,
              reason: null,
            },
          ],
          totalShippingFee: 25000,
          grandTotal: 225000,
          currency: 'VND',
          paymentReady: false,
        },
      });
    },
  }),
}));

vi.mock('@/features/checkout/api/checkout-payment.api', () => mockApi);

function renderCheckout() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CheckoutPage />
    </QueryClientProvider>,
  );
}

describe('CheckoutPage payments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockWalletData.current = {
      data: { balance: 250000, currency: 'VND', credits: [] },
    };
    mockApi.fetchCoinBalance.mockResolvedValue({
      statusCode: 200,
      message: 'ok',
      data: {
        balance: 50000,
        heldBalance: 0,
        simulationBalance: 50000,
        simulationHeldBalance: 0,
      },
    });
    mockApi.selectCheckoutCoins.mockResolvedValue({
      statusCode: 200,
      message: 'ok',
      data: { coinDiscount: 20000 },
    });
    mockApi.createMomoPayment.mockResolvedValue({
      statusCode: 200,
      message: 'ok',
      data: {
        id: 'pay-momo-1',
        checkoutId: 'chk-1',
        amount: 225000,
        state: 'PENDING',
        payUrl: 'https://test-payment.momo.vn/pay/123',
        paidAt: null,
        refunds: [],
      },
    });
    mockApi.createPayosPayment.mockResolvedValue({
      statusCode: 200,
      message: 'ok',
      data: {
        id: 'pay-payos-1',
        checkoutId: 'chk-1',
        amount: 225000,
        state: 'PENDING',
        payUrl: 'https://pay.payos.vn/web/123',
        paidAt: null,
        refunds: [],
      },
    });
    mockApi.reserveWalletCheckout.mockResolvedValue({
      statusCode: 200,
      message: 'ok',
      data: { id: 'hold-1', amount: 225000, state: 'HELD' },
    });
    mockApi.confirmWalletCheckout.mockResolvedValue({
      statusCode: 200,
      message: 'ok',
      data: { id: 'hold-1', amount: 225000, state: 'CAPTURED' },
    });
    codMutateAsync.mockResolvedValue({ data: [{ id: 'ord-1' }] });
  });

  it('places a MoMo Sandbox payment and redirects to payUrl', async () => {
    renderCheckout();

    const payButton = await screen.findByRole('button', {
      name: /Pay now via MoMo/i,
    });
    expect(payButton).toBeEnabled();
    fireEvent.click(payButton);

    await waitFor(() =>
      expect(mockApi.createMomoPayment).toHaveBeenCalledWith(
        'chk-1',
        expect.any(String),
      ),
    );
    expect(mockApi.saveLastPaymentSession).toHaveBeenCalledWith({
      paymentId: 'pay-momo-1',
      checkoutId: 'chk-1',
      provider: 'MOMO',
      amount: 225000,
    });
    expect(mockApi.redirectToExternalUrl).toHaveBeenCalledWith(
      'https://test-payment.momo.vn/pay/123',
    );
  });

  it('switches to PayOS VietQR via PaymentMethodModal and redirects to PayOS', async () => {
    renderCheckout();

    const changeButtons = await screen.findAllByRole('button', {
      name: 'Change',
    });
    fireEvent.click(changeButtons[changeButtons.length - 1]);

    fireEvent.click(screen.getByRole('radio', { name: /PayOS VietQR/i }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Use selected method' }),
    );

    const payosButton = screen.getByRole('button', {
      name: /Pay now via PayOS/i,
    });
    fireEvent.click(payosButton);

    await waitFor(() =>
      expect(mockApi.createPayosPayment).toHaveBeenCalledWith(
        'chk-1',
        expect.any(String),
      ),
    );
    expect(mockApi.redirectToExternalUrl).toHaveBeenCalledWith(
      'https://pay.payos.vn/web/123',
    );
  });

  it('switches to COD and places a COD order redirecting to /orders', async () => {
    renderCheckout();

    const changeButtons = await screen.findAllByRole('button', {
      name: 'Change',
    });
    fireEvent.click(changeButtons[changeButtons.length - 1]);

    fireEvent.click(screen.getByRole('radio', { name: /Cash on Delivery/i }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Use selected method' }),
    );

    fireEvent.click(screen.getByRole('button', { name: /Place COD order/i }));

    await waitFor(() =>
      expect(codMutateAsync).toHaveBeenCalledWith({
        id: 'chk-1',
        data: { expectedTotal: 225000 },
      }),
    );
    expect(routerPush).toHaveBeenCalledWith('/orders');
  });

  it('applies Reward Coins (10% cap) and pays 100% from Refund Wallet', async () => {
    renderCheckout();

    const coinsCheckbox = await screen.findByLabelText('Use Reward Coins');
    await waitFor(() => expect(coinsCheckbox).toBeEnabled());
    fireEvent.click(coinsCheckbox);

    await waitFor(() =>
      expect(mockApi.selectCheckoutCoins).toHaveBeenCalledWith('chk-1', {
        requestId: expect.any(String),
        amount: 20000,
        mode: 'SIMULATION',
      }),
    );

    const walletCheckbox = screen.getByLabelText('Pay with Refund Wallet');
    expect(walletCheckbox).toBeEnabled();
    fireEvent.click(walletCheckbox);

    const walletPayBtn = screen.getByRole('button', {
      name: /Pay 205\.000.*with Wallet/i,
    });
    fireEvent.click(walletPayBtn);

    await waitFor(() =>
      expect(mockApi.reserveWalletCheckout).toHaveBeenCalledWith('chk-1', {
        expectedTotal: 205000,
        mode: 'EVIDENCE',
      }),
    );
    expect(mockApi.confirmWalletCheckout).toHaveBeenCalledWith('hold-1');
    expect(routerPush).toHaveBeenCalledWith('/orders');
  });

  it('opens the shared Help & returns policy modal from checkout footer', async () => {
    renderCheckout();

    const helpBtn = await screen.findByRole('button', {
      name: 'Help & returns',
    });
    fireEvent.click(helpBtn);

    expect(await screen.findByText('Buying secondhand')).toBeInTheDocument();
  });
});
