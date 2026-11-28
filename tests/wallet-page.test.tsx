import { WalletPage } from '@/features/wallet/components/WalletPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({
  api: {
    getWallet: vi.fn(),
    getCoinBalance: vi.fn(),
    getCoinHistory: vi.fn(),
  },
}));

vi.mock('@/modules/wallet/wallet-api', () => ({ walletApi: api }));
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    status: 'authenticated',
    data: { user: { id: 'buyer-1', fullName: 'Minh Buyer', role: 'USER' } },
  }),
  signOut: vi.fn(),
}));
vi.mock('@/shared/components/marketplace/MarketplaceHeader', () => ({
  MarketplaceHeader: () => null,
}));
vi.mock('@/shared/components/marketplace/MobileNavigation', () => ({
  MobileNavigation: () => null,
}));
vi.mock('@/shared/components/marketplace/MarketplaceFooter', () => ({
  MarketplaceFooter: () => null,
}));
vi.mock('@/modules/cart/components/CartLink', () => ({
  CartLink: () => null,
}));

function renderWallet() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <WalletPage />
    </QueryClientProvider>,
  );
}

describe('WalletPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getWallet.mockResolvedValue({
      data: {
        balance: 350000,
        simulationBalance: 0,
        heldBalance: 50000,
        simulationHeldBalance: 0,
        currency: 'VND',
        credits: [
          {
            id: 'cred-1',
            orderId: '11111111-1111-1111-1111-111111111111',
            amount: 350000,
            reason: 'ORDER_CANCELLED',
            mode: 'EVIDENCE',
            createdAt: '2026-11-25T10:00:00.000Z',
          },
        ],
        disputeRefunds: [],
      },
    });
    api.getCoinBalance.mockResolvedValue({
      data: {
        balance: 2500,
        heldBalance: 0,
        simulationBalance: 0,
        simulationHeldBalance: 0,
      },
    });
    api.getCoinHistory.mockResolvedValue({
      data: {
        rewards: [
          {
            id: 'rew-1',
            orderId: '22222222-2222-2222-2222-222222222222',
            mode: 'EVIDENCE',
            grantedAmount: 3000,
            entitlement: 2500,
            recoveredAmount: 500,
            evaluatedAt: '2026-11-25T12:00:00.000Z',
            createdAt: '2026-11-25T12:00:00.000Z',
          },
        ],
        debits: [
          {
            id: 'deb-1',
            orderId: '33333333-3333-3333-3333-333333333333',
            mode: 'EVIDENCE',
            amount: 1000,
            createdAt: '2026-11-25T13:00:00.000Z',
          },
        ],
      },
    });
  });

  it('displays refund-only wallet balance, reward coins balance, policy rules, and both ledgers', async () => {
    renderWallet();

    expect(
      await screen.findByRole('heading', { name: 'Wallet & Coins' }),
    ).toBeInTheDocument();
    expect((await screen.findAllByText(/350\.000/)).length).toBeGreaterThan(0);
    expect(screen.getByText(/2\.500 coins/)).toBeInTheDocument();
    expect(
      screen.getByText(/Covers up to 100% of checkout total/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Apply up to 10% of item subtotal at checkout/i),
    ).toBeInTheDocument();

    // Wallet ledger is active by default
    expect(screen.getByText('Cancelled order refund')).toBeInTheDocument();

    // Switch to Coins history tab
    fireEvent.click(screen.getByRole('tab', { name: /Coins history/i }));
    expect(
      await screen.findByText('0.5% completed order reward'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Reward clawback after order refund'),
    ).toBeInTheDocument();
    expect(screen.getByText('Applied at checkout')).toBeInTheDocument();
  });

  it('renders a LATE_PAYMENT_REFUND credit with null orderId without crashing', async () => {
    api.getWallet.mockResolvedValueOnce({
      data: {
        balance: 200000,
        simulationBalance: 0,
        heldBalance: 0,
        simulationHeldBalance: 0,
        currency: 'VND',
        credits: [
          {
            id: 'cred-late-1',
            orderId: null,
            paymentRefundId: '44444444-4444-4444-4444-444444444444',
            amount: 200000,
            reason: 'LATE_PAYMENT_REFUND',
            mode: 'EVIDENCE',
            createdAt: '2026-11-26T10:00:00.000Z',
          },
        ],
        disputeRefunds: [],
      },
    });

    renderWallet();

    expect(
      await screen.findByText('Late payment refund credit'),
    ).toBeInTheDocument();
    expect(screen.getByText('Late payment refund')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /null/i })).toBeNull();
  });
});
