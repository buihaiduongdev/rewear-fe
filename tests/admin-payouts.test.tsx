import { AdminPayoutsPage } from '@/features/admin-payouts/components/AdminPayoutsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, useSessionMock } = vi.hoisted(() => ({
  api: {
    adminListPayouts: vi.fn(),
    adminStartPayout: vi.fn(),
    adminRejectPayout: vi.fn(),
    adminFailPayout: vi.fn(),
    adminCreateReceiptUploadTicket: vi.fn(),
    adminGetPayoutReceipt: vi.fn(),
    adminSucceedPayout: vi.fn(),
  },
  useSessionMock: vi.fn(),
}));

vi.mock('@/modules/shop-finance/shop-finance-api', () => ({
  shopFinanceApi: api,
}));
vi.mock('next-auth/react', () => ({
  useSession: useSessionMock,
}));

const processingPayout = {
  id: 'payout-proc-1',
  shopId: 'shop-11111111',
  ownerId: 'owner-1',
  requestId: 'WD-0261',
  mode: 'EVIDENCE' as const,
  status: 'PROCESSING' as const,
  amount: 500000,
  bankAccountId: 'bank-1',
  recipientSnapshot: {
    bankCode: 'VCB',
    accountNumber: '0011004892',
    accountName: 'NGUYEN LINH',
  },
  createdAt: '2026-11-25T08:00:00.000Z',
  updatedAt: '2026-11-25T08:30:00.000Z',
  dueAt: null,
  processedAt: '2026-11-25T08:30:00.000Z',
  completedAt: null,
  bankReference: null,
  bankTransferredAt: null,
  reason: null,
  transferEvidence: null,
  transferEvidenceMediaId: null,
  transferEvidenceUrl: null,
};

const succeededPayout = {
  ...processingPayout,
  id: 'payout-done-2',
  requestId: 'WD-0260',
  status: 'SUCCEEDED' as const,
  bankReference: 'FT261125999',
  transferEvidenceMediaId: 'media-receipt-1',
  transferEvidenceUrl: 'https://storage.example.com/receipt-initial.png',
};

function renderAdminPayouts() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminPayoutsPage />
    </QueryClientProvider>,
  );
}

describe('AdminPayoutsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionMock.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'admin-1', fullName: 'Admin User', role: 'ADMIN' } },
    });
    api.adminListPayouts.mockResolvedValue({
      data: { payouts: [processingPayout, succeededPayout] },
    });
    api.adminCreateReceiptUploadTicket.mockResolvedValue({
      data: {
        id: 'media-unc-123',
        uploadUrl: 'https://storage.example.com/upload-unc',
        method: 'PUT',
        headers: { 'x-amz-acl': 'private' },
      },
    });
    api.adminSucceedPayout.mockResolvedValue({
      data: { ...processingPayout, status: 'SUCCEEDED' },
    });
    api.adminGetPayoutReceipt.mockResolvedValue({
      data: {
        mediaId: 'media-receipt-1',
        url: 'https://storage.example.com/receipt-signed.png',
        expiresAt: '2026-11-26T12:00:00.000Z',
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200 }),
    );
  });

  it('blocks non-admin users cleanly', () => {
    useSessionMock.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'buyer-1', fullName: 'Buyer', role: 'USER' } },
    });
    renderAdminPayouts();
    expect(screen.getByText('Admin access required')).toBeInTheDocument();
  });

  it('uploads UNC receipt image and confirms completed transfer with transferEvidenceMediaId', async () => {
    renderAdminPayouts();

    expect(await screen.findByText('WD-0261')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Record completed transfer' }),
    );

    const refInput = await screen.findByLabelText(
      /Bank reference \/ transaction code/i,
    );
    fireEvent.change(refInput, { target: { value: 'FT261126000888' } });

    const fileInput = screen.getByLabelText(/Upload UNC bank receipt image/i);
    const file = new File(['receipt-bytes'], 'unc-receipt.png', {
      type: 'image/png',
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm transfer' }));

    await waitFor(() =>
      expect(api.adminCreateReceiptUploadTicket).toHaveBeenCalledWith({
        mimeType: 'image/png',
        sizeBytes: file.size,
      }),
    );

    await waitFor(() =>
      expect(api.adminSucceedPayout).toHaveBeenCalledWith(
        'payout-proc-1',
        expect.objectContaining({
          bankCode: 'VCB',
          accountNumber: '0011004892',
          accountName: 'NGUYEN LINH',
          amount: 500000,
          bankReference: 'FT261126000888',
          transferEvidenceMediaId: 'media-unc-123',
        }),
      ),
    );
  });

  it('previews an uploaded UNC receipt for a completed payout', async () => {
    renderAdminPayouts();

    const viewBtn = await screen.findByRole('button', {
      name: 'View UNC receipt',
    });
    fireEvent.click(viewBtn);

    await waitFor(() =>
      expect(api.adminGetPayoutReceipt).toHaveBeenCalledWith('payout-done-2'),
    );
    const img = await screen.findByAltText(/UNC bank receipt for WD-0260/i);
    expect(img).toHaveAttribute(
      'src',
      'https://storage.example.com/receipt-signed.png',
    );
  });
});
