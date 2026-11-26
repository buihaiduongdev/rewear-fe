import * as React from 'react';

import { AdminWorkspaceLayout } from '@/features/admin/AdminWorkspaceLayout';
import { AdminDisputesPage } from '@/features/admin/disputes/AdminDisputesPage';
import { AdminCodSettingsPage } from '@/features/admin/settings/AdminCodSettingsPage';
import { AdminUsersShopsPage } from '@/features/admin/users/AdminUsersShopsPage';
import { BuyerDisputePanel } from '@/features/orders/components/BuyerDisputePanel';
import { SellerReturnsSection } from '@/features/seller-dashboard/components/SellerReturnsSection';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
  getDisputeByOrder: vi.fn(),
  getShopDisputes: vi.fn(),
  getAdminDisputes: vi.fn(),
  getAdminDisputeDetail: vi.fn(),
  replyToDisputeIssue: vi.fn(),
  submitDisputeAppeal: vi.fn(),
  decideDisputeIssue: vi.fn(),
  handoverReturn: vi.fn(),
  confirmReturnReceipt: vi.fn(),
  listAdminApplications: vi.fn(),
  getAdminApplicationDetail: vi.fn(),
  decideAdminApplication: vi.fn(),
  useUserFindAll: vi.fn(),
  useUserUpdate: vi.fn(),
  useShopFindAll: vi.fn(),
  useCodList: vi.fn(),
  useCodDetail: vi.fn(),
  useCodRefresh: vi.fn(),
  useCodCollect: vi.fn(),
  useCodRemit: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: mocks.useSession,
  signOut: mocks.signOut,
}));

vi.mock('@/modules/disputes/api', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/modules/disputes/api')>();
  return {
    ...actual,
    getDisputeByOrder: mocks.getDisputeByOrder,
    getShopDisputes: mocks.getShopDisputes,
    getAdminDisputes: mocks.getAdminDisputes,
    getAdminDisputeDetail: mocks.getAdminDisputeDetail,
    replyToDisputeIssue: mocks.replyToDisputeIssue,
    submitDisputeAppeal: mocks.submitDisputeAppeal,
    decideDisputeIssue: mocks.decideDisputeIssue,
    handoverReturn: mocks.handoverReturn,
    confirmReturnReceipt: mocks.confirmReturnReceipt,
  };
});

vi.mock('@/modules/kyc/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/modules/kyc/api')>();
  return {
    ...actual,
    listAdminApplications: mocks.listAdminApplications,
    getAdminApplicationDetail: mocks.getAdminApplicationDetail,
    decideAdminApplication: mocks.decideAdminApplication,
  };
});

vi.mock('@/shared/api/query-generated/users/users', () => ({
  useUserControllerFindAll: mocks.useUserFindAll,
  useUserControllerUpdate: mocks.useUserUpdate,
}));

vi.mock('@/shared/api/query-generated/shops/shops', () => ({
  useShopControllerFindAll: mocks.useShopFindAll,
}));

vi.mock(
  '@/shared/api/query-generated/cod-reconciliation/cod-reconciliation',
  () => ({
    useCodReconciliationControllerList: mocks.useCodList,
    useCodReconciliationControllerDetail: mocks.useCodDetail,
    useCodReconciliationControllerRefresh: mocks.useCodRefresh,
    useCodReconciliationControllerCollect: mocks.useCodCollect,
    useCodReconciliationControllerRemit: mocks.useCodRemit,
  }),
);

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

const futureIso = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

const sampleDisputeDetail = {
  id: '11111111-1111-4111-8111-111111111111',
  orderId: '22222222-2222-4222-8222-222222222222',
  buyerId: '33333333-3333-4333-8333-333333333333',
  shopId: '44444444-4444-4444-8444-444444444444',
  state: 'OPEN' as const,
  createdAt: '2026-11-25T10:00:00.000Z',
  issues: [
    {
      id: '55555555-5555-4555-8555-555555555555',
      caseId: '11111111-1111-4111-8111-111111111111',
      productId: '66666666-6666-4666-8666-666666666666',
      kind: 'NOT_AS_DESCRIBED' as const,
      description: 'Undisclosed tear on sleeve cuff.',
      evidenceIds: [],
      status: 'AWAITING_APPEAL' as const,
      sellerRespondBy: '2026-11-26T10:00:00.000Z',
      reviewDueAt: '2026-11-28T10:00:00.000Z',
      maxReviewDueAt: '2026-11-30T10:00:00.000Z',
      extendedAt: null,
      extensionReason: null,
      reviewOverdue: true,
      createdAt: '2026-11-25T10:00:00.000Z',
    },
  ],
  messages: [],
  evidence: [],
  decisions: [
    {
      id: '77777777-7777-4777-8777-777777777777',
      issueId: '55555555-5555-4555-8555-555555555555',
      actorId: '88888888-8888-4888-8888-888888888888',
      outcome: 'REQUIRE_RETURN' as const,
      responsibility: 'SELLER' as const,
      reason: 'Tear was not disclosed in photos; return required for refund.',
      itemPrice: 880000,
      refundAmount: 880000,
      decidedAt: '2026-11-26T08:00:00.000Z',
      appealUntil: futureIso,
      finalizedAt: null,
      finalOutcome: null,
      finalRefundAmount: null,
      finalReason: null,
      finalActorId: null,
    },
  ],
  appeals: [],
  returns: [
    {
      id: '99999999-9999-4999-8999-999999999999',
      decisionId: '77777777-7777-4777-8777-777777777777',
      orderId: '22222222-2222-4222-8222-222222222222',
      productId: '66666666-6666-4666-8666-666666666666',
      state: 'AWAITING_HANDOVER' as const,
      mode: 'SIMULATION' as const,
      labelCode: 'RETURN-4091',
      instructions: 'Drop off at nearest GHN station within 5 days.',
      handoverBy: futureIso,
      handoverAt: null,
      deliveredAt: null,
      readyAt: null,
    },
  ],
};

describe('Admin workspace, disputes, KYC & COD reconciliation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'admin-1', fullName: 'Admin Tam', role: 'ADMIN' } },
    });
    mocks.useUserUpdate.mockReturnValue({ mutate: vi.fn(), isPending: false });
    mocks.useCodRefresh.mockReturnValue({ mutate: vi.fn(), isPending: false });
    mocks.useCodCollect.mockReturnValue({ mutate: vi.fn(), isPending: false });
    mocks.useCodRemit.mockReturnValue({ mutate: vi.fn(), isPending: false });
    mocks.useCodDetail.mockReturnValue({ isPending: false, isError: false });
  });

  it('guards AdminWorkspaceLayout for non-admin accounts and renders navigation for ADMIN', () => {
    mocks.useSession.mockReturnValueOnce({
      status: 'authenticated',
      data: { user: { id: 'user-1', fullName: 'Buyer', role: 'USER' } },
    });
    const { rerender } = render(
      <AdminWorkspaceLayout activeNav="disputes" title="Disputes">
        <div>Secret console</div>
      </AdminWorkspaceLayout>,
    );
    expect(screen.getByText('Access denied')).toBeInTheDocument();
    expect(screen.queryByText('Secret console')).not.toBeInTheDocument();

    rerender(
      <AdminWorkspaceLayout activeNav="disputes" title="Disputes">
        <div>Secret console</div>
      </AdminWorkspaceLayout>,
    );
    expect(screen.getByText('Secret console')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Disputes' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Users & Shops' })).toHaveAttribute(
      'href',
      '/admin/users',
    );
    expect(
      screen.getByRole('link', { name: 'COD & Settings' }),
    ).toHaveAttribute('href', '/admin/settings');
  });

  it('renders BuyerDisputePanel ruling, submits 2-day appeal, and confirms return handover', async () => {
    mocks.getDisputeByOrder.mockResolvedValue({ data: sampleDisputeDetail });
    mocks.submitDisputeAppeal.mockResolvedValue({ data: {} });
    mocks.handoverReturn.mockResolvedValue({ data: {} });

    renderWithQuery(
      <BuyerDisputePanel
        orderId={sampleDisputeDetail.orderId}
        shopName="Saigon Thrift Studio"
        enabled={true}
      />,
    );

    expect(
      await screen.findByText('Undisclosed tear on sleeve cuff.'),
    ).toBeInTheDocument();
    expect(screen.getByText('RETURN-4091')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm parcel handed over' }),
    );
    await waitFor(() =>
      expect(mocks.handoverReturn).toHaveBeenCalledWith(
        '99999999-9999-4999-8999-999999999999',
      ),
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Request reconsideration/i }),
    );
    fireEvent.change(screen.getByPlaceholderText(/reconsidered/i), {
      target: { value: 'Shipping fee should also be refunded.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit appeal' }));

    await waitFor(() =>
      expect(mocks.submitDisputeAppeal).toHaveBeenCalledWith(
        '77777777-7777-4777-8777-777777777777',
        {
          reason: 'Shipping fee should also be refunded.',
          evidenceIds: [],
        },
      ),
    );
  });

  it('allows seller to view shop returns, send reply, and confirm returned item receipt', async () => {
    const activeDetail = {
      ...sampleDisputeDetail,
      issues: [{ ...sampleDisputeDetail.issues[0], status: 'ACTIVE' as const }],
    };
    mocks.getShopDisputes.mockResolvedValue({ data: [activeDetail] });
    mocks.getDisputeByOrder.mockResolvedValue({ data: activeDetail });
    mocks.replyToDisputeIssue.mockResolvedValue({ data: {} });
    mocks.confirmReturnReceipt.mockResolvedValue({ data: {} });

    renderWithQuery(
      <SellerReturnsSection
        shopId={sampleDisputeDetail.shopId}
        enabled={true}
      />,
    );

    const caseBtn = await screen.findByRole('button', { name: /CASE #1111/i });
    fireEvent.click(caseBtn);

    const replyBox = await screen.findByPlaceholderText(
      /Explain your packing record/i,
    );
    fireEvent.change(replyBox, {
      target: { value: 'Flaw was disclosed in listing photo 3.' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Send seller response' }),
    );

    await waitFor(() =>
      expect(mocks.replyToDisputeIssue).toHaveBeenCalledWith(
        '55555555-5555-4555-8555-555555555555',
        {
          text: 'Flaw was disclosed in listing photo 3.',
          evidenceIds: [],
        },
      ),
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm returned item received' }),
    );
    await waitFor(() =>
      expect(mocks.confirmReturnReceipt).toHaveBeenCalledWith(
        '99999999-9999-4999-8999-999999999999',
      ),
    );
  });

  it('lets admin adjudicate an overdue dispute in AdminDisputesPage', async () => {
    const activeDetail = {
      ...sampleDisputeDetail,
      issues: [{ ...sampleDisputeDetail.issues[0], status: 'ACTIVE' as const }],
      decisions: [],
      returns: [],
    };
    mocks.getAdminDisputes.mockResolvedValue({ data: [activeDetail] });
    mocks.getAdminDisputeDetail.mockResolvedValue({ data: activeDetail });
    mocks.decideDisputeIssue.mockResolvedValue({ data: {} });

    renderWithQuery(<AdminDisputesPage />);

    expect(await screen.findByText('Overdue SLA')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /CASE #1111/i }));

    const ruleBtn = await screen.findByRole('button', {
      name: 'Record ruling',
    });
    fireEvent.click(ruleBtn);

    fireEvent.change(
      screen.getByPlaceholderText(/Document evidence findings/i),
      {
        target: { value: 'Confirmed undisclosed cuff tear from buyer photos.' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Confirm ruling' }));

    await waitFor(() =>
      expect(mocks.decideDisputeIssue).toHaveBeenCalledWith(
        '55555555-5555-4555-8555-555555555555',
        {
          outcome: 'UPHOLD_CLAIM',
          responsibility: 'SELLER',
          reason: 'Confirmed undisclosed cuff tear from buyer photos.',
          refundAmount: null,
        },
      ),
    );
  });

  it('switches Users / Shops / Owner KYC tabs and submits a KYC approval decision', async () => {
    mocks.useUserFindAll.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        data: {
          data: [
            {
              id: 'u-1',
              email: 'linh@rewear.vn',
              fullName: 'Nguyen Thuy Linh',
              role: 'USER',
              status: 'ACTIVE',
              createdAt: '2026-11-20T08:00:00.000Z',
            },
          ],
          meta: { totalItems: 1 },
          links: { next: null },
        },
      },
    });
    mocks.useShopFindAll.mockReturnValue({
      isPending: false,
      isError: false,
      data: { data: [] },
    });
    mocks.listAdminApplications.mockResolvedValue({
      data: {
        items: [
          {
            id: 'aaaa1111-1111-4111-8111-111111111111',
            shopId: 'bbbb1111-1111-4111-8111-111111111111',
            kind: 'INITIAL',
            state: 'SUBMITTED',
            submittedAt: '2026-11-25T10:00:00.000Z',
            reviewedAt: null,
            reason: null,
            createdAt: '2026-11-25T09:00:00.000Z',
            updatedAt: '2026-11-25T10:00:00.000Z',
          },
        ],
        totalCount: 1,
        limit: 50,
        offset: 0,
      },
    });
    mocks.getAdminApplicationDetail.mockResolvedValue({
      data: {
        id: 'aaaa1111-1111-4111-8111-111111111111',
        shopId: 'bbbb1111-1111-4111-8111-111111111111',
        kind: 'INITIAL',
        state: 'SUBMITTED',
        submittedAt: '2026-11-25T10:00:00.000Z',
        reviewedAt: null,
        reason: null,
        createdAt: '2026-11-25T09:00:00.000Z',
        updatedAt: '2026-11-25T10:00:00.000Z',
        applicantId: 'u-1',
        reviewedById: null,
        adminNote: null,
        shop: {
          id: 'bbbb1111-1111-4111-8111-111111111111',
          name: 'Hanoi Archive',
          description: null,
          logoUrl: null,
        },
        identity: {
          documentType: 'NATIONAL_ID',
          documentNumber: '079199001234',
          issuingCountry: 'VN',
          fullName: 'NGUYEN THUY LINH',
          birthDate: '1999-05-12',
          expiresOn: '2035-05-12',
        },
        pickup: null,
        bank: null,
        documents: [],
      },
    });
    mocks.decideAdminApplication.mockResolvedValue({ data: {} });

    renderWithQuery(<AdminUsersShopsPage />);

    expect(screen.getByText('Nguyen Thuy Linh')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Owner KYC' }));

    const reviewBtn = await screen.findByRole('button', {
      name: 'Review KYC',
    });
    fireEvent.click(reviewBtn);

    expect(await screen.findByText('Hanoi Archive')).toBeInTheDocument();
    fireEvent.change(
      screen.getByPlaceholderText(/Identity document and payout bank account/i),
      { target: { value: 'CCCD verified cleanly.' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Submit decision' }));

    await waitFor(() =>
      expect(mocks.decideAdminApplication).toHaveBeenCalledWith(
        'aaaa1111-1111-4111-8111-111111111111',
        {
          outcome: 'APPROVED',
          reason: 'CCCD verified cleanly.',
          adminNote: '',
        },
      ),
    );
  });

  it('renders COD reconciliations and platform policy parameters in AdminCodSettingsPage', () => {
    mocks.useCodList.mockReturnValue({
      isPending: false,
      isError: false,
      refetch: vi.fn(),
      data: {
        data: [
          {
            id: 'cod-1',
            orderId: '22222222-2222-4222-8222-222222222222',
            shopId: '44444444-4444-4444-8444-444444444444',
            shipmentId: 'ship-1',
            mode: 'EVIDENCE',
            status: 'AWAITING',
            expectedAmount: 530000,
            collectedAmount: 530000,
            approvedCarrierFee: 30000,
            gross: 500000,
            commission: 25000,
            sellerNet: 475000,
            cashReceived: 0,
            feeDeducted: 0,
            collectedAt: '2026-11-25T12:00:00.000Z',
            reviewReason: null,
            fundedAt: null,
            createdAt: '2026-11-25T12:00:00.000Z',
            requestId: 'req-1',
            waybillCode: 'GHN-COD-9901',
            actorId: 'admin-1',
            reason: 'Collected on delivery',
            evidence: 'GHN statement',
          },
        ],
      },
    });

    renderWithQuery(<AdminCodSettingsPage />);

    expect(screen.getByText(/GHN-COD-9901/)).toBeInTheDocument();
    expect(screen.getByText('72 hours after delivery')).toBeInTheDocument();
    expect(screen.getByText('3–5 business days')).toBeInTheDocument();
    expect(screen.getByText('2 business days')).toBeInTheDocument();
  });
});
