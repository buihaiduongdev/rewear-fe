import { SellerFundsSection } from '@/features/seller-dashboard/components/SellerFundsSection';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, useFinance } = vi.hoisted(() => ({
  api: {
    getOwnerPayouts: vi.fn(),
    requestPayout: vi.fn(),
    cancelPayout: vi.fn(),
    addBankAccount: vi.fn(),
    deleteBankAccount: vi.fn(),
  },
  useFinance: vi.fn(),
}));

vi.mock('@/modules/shop-finance/shop-finance-api', () => ({
  shopFinanceApi: api,
}));
vi.mock('@/shared/api/query-generated/shop-finance/shop-finance', () => ({
  useShopFinanceControllerView: useFinance,
}));

function renderFunds() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SellerFundsSection shopId="shop-1" enabled={true} />
    </QueryClientProvider>,
  );
}

describe('SellerFundsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFinance.mockReturnValue({
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      data: {
        data: {
          available: 2400000,
          held: 1800000,
          payoutLocked: 500000,
          paidOut: 1200000,
        },
      },
    });
    api.getOwnerPayouts.mockResolvedValue({
      data: {
        accounts: [
          {
            id: 'bank-1',
            shopId: 'shop-1',
            bankCode: 'VCB',
            accountNumber: '0011004892',
            accountName: 'NGUYEN LINH',
            isDefault: true,
            confirmedBy: 'owner-1',
            confirmedAt: '2026-11-20T00:00:00.000Z',
            deletedAt: null,
            createdAt: '2026-11-20T00:00:00.000Z',
            updatedAt: '2026-11-20T00:00:00.000Z',
          },
        ],
        payouts: [
          {
            id: 'payout-1',
            shopId: 'shop-1',
            ownerId: 'owner-1',
            requestId: 'WD-0261',
            mode: 'EVIDENCE',
            status: 'PENDING',
            amount: 500000,
            bankAccountId: 'bank-1',
            recipientSnapshot: {
              bankCode: 'VCB',
              accountNumber: '0011004892',
              accountName: 'NGUYEN LINH',
            },
            createdAt: '2026-11-25T08:00:00.000Z',
            updatedAt: '2026-11-25T08:00:00.000Z',
            dueAt: null,
            processedAt: null,
            completedAt: null,
            bankReference: null,
            bankTransferredAt: null,
            reason: null,
          },
        ],
      },
    });
    api.requestPayout.mockResolvedValue({ data: { id: 'payout-2' } });
    api.cancelPayout.mockResolvedValue({ data: { id: 'payout-1' } });
  });

  it('shows balances, bank summary, payout history, and submits a withdrawal request', async () => {
    renderFunds();

    expect(
      await screen.findByRole('heading', { name: 'Funds' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/2\.400\.000/)).toBeInTheDocument();
    expect(screen.getByText(/1\.800\.000/)).toBeInTheDocument();
    expect(screen.getByText('WD-0261')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Request withdrawal' }));
    const amountInput = await screen.findByLabelText(/Amount \(VND\)/i);
    fireEvent.change(amountInput, { target: { value: '600000' } });

    const submitButtons = screen.getAllByRole('button', {
      name: 'Request withdrawal',
    });
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() =>
      expect(api.requestPayout).toHaveBeenCalledWith(
        'shop-1',
        expect.objectContaining({
          amount: 600000,
          bankAccountId: 'bank-1',
          requestId: expect.any(String),
        }),
      ),
    );
  });

  it('allows cancelling a pending withdrawal', async () => {
    renderFunds();

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    await waitFor(() =>
      expect(api.cancelPayout).toHaveBeenCalledWith('shop-1', 'payout-1'),
    );
  });
});
