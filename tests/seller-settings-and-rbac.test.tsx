import { SellerSettingsSection } from '@/features/seller-dashboard/components/SellerSettingsSection';
import { validateBankAccountFields } from '@/modules/shop/api/shop-bank-accounts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const updateShopMutateAsync = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: {} }),
);
const inviteMutateAsync = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: {} }),
);
const assignRoleMutateAsync = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: {} }),
);
const createRoleMutateAsync = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: {} }),
);
const fetchPayouts = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    statusCode: 200,
    message: 'OK',
    data: {
      accounts: [
        {
          id: 'bank-1',
          shopId: 'shop-1',
          bankCode: 'VCB',
          accountNumber: '0123456789',
          accountName: 'NGUYEN MINH ANH',
          confirmedBy: 'user-1',
          confirmedAt: '2026-01-01T00:00:00.000Z',
          isDefault: true,
          deletedAt: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      payouts: [],
    },
  }),
);

vi.mock('@/modules/shop/api/shop-bank-accounts', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('@/modules/shop/api/shop-bank-accounts')
    >();
  return {
    ...actual,
    fetchShopPayoutOverview: fetchPayouts,
  };
});

vi.mock('@/shared/api/query-generated/shops/shops', () => ({
  getShopControllerFindOneQueryKey: (id: string) => [`/api/shops/${id}`],
  getShopControllerFindMembersQueryKey: (id: string) => [
    `/api/shops/${id}/members`,
  ],
  getShopControllerListQueryKey: (id: string) => [
    `/api/shops/${id}/invitations`,
  ],
  useShopControllerUpdate: () => ({
    isPending: false,
    error: null,
    mutateAsync: updateShopMutateAsync,
  }),
  useShopControllerFindMembers: () => ({
    isPending: false,
    isError: false,
    data: {
      data: [
        {
          id: 'mem-owner',
          shopId: 'shop-1',
          userId: 'user-1',
          memberRole: 'OWNER',
          roles: [],
          joinedAt: '2026-01-01T00:00:00.000Z',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          user: {
            id: 'user-1',
            fullName: 'Nguyen Minh Anh',
            email: 'owner@hanoi.vn',
          },
        },
        {
          id: 'mem-staff',
          shopId: 'shop-1',
          userId: 'user-2',
          memberRole: 'STAFF',
          roles: [{ id: 'role-1', name: 'Catalog manager' }],
          joinedAt: '2026-02-01T00:00:00.000Z',
          createdAt: '2026-02-01T00:00:00.000Z',
          updatedAt: '2026-02-01T00:00:00.000Z',
          user: {
            id: 'user-2',
            fullName: 'Le Hoang Yen',
            email: 'yen@hanoi.vn',
          },
        },
      ],
    },
    refetch: vi.fn(),
  }),
  useShopControllerList: () => ({
    isPending: false,
    isError: false,
    data: { data: [] },
  }),
  useShopControllerInvite: () => ({
    isPending: false,
    error: null,
    reset: vi.fn(),
    mutateAsync: inviteMutateAsync,
  }),
  useShopControllerRevoke: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useShopControllerRemoveMember: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

vi.mock('@/shared/api/query-generated/shop-roles/shop-roles', () => ({
  getShopRoleControllerListQueryKey: (id: string) => [`/api/shops/${id}/roles`],
  useShopRoleControllerList: () => ({
    isPending: false,
    isError: false,
    data: {
      data: [
        {
          id: 'role-1',
          shopId: 'shop-1',
          name: 'Catalog manager',
          isDefault: false,
          permissions: ['product.view', 'product.create'],
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    },
  }),
  useShopRoleControllerPermissions: () => ({
    isPending: false,
    data: { data: ['product.view', 'product.create', 'order.view'] },
  }),
  useShopRoleControllerCreate: () => ({
    isPending: false,
    error: null,
    reset: vi.fn(),
    mutateAsync: createRoleMutateAsync,
  }),
  useShopRoleControllerUpdate: () => ({
    isPending: false,
    error: null,
    reset: vi.fn(),
    mutateAsync: vi.fn(),
  }),
  useShopRoleControllerAssign: () => ({
    isPending: false,
    error: null,
    reset: vi.fn(),
    mutateAsync: assignRoleMutateAsync,
  }),
}));

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe('SellerSettingsSection & bank account validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates bank account fields cleanly against BE rules', () => {
    expect(
      validateBankAccountFields({
        bankCode: 'vcb',
        accountNumber: '0123456789',
        accountName: 'NGUYEN MINH ANH',
        ownerConfirmed: true,
      }),
    ).toEqual({});

    const invalid = validateBankAccountFields({
      bankCode: '!',
      accountNumber: '12',
      accountName: 'A',
      ownerConfirmed: false,
    });
    expect(invalid.bankCode).toBeTruthy();
    expect(invalid.accountNumber).toBeTruthy();
    expect(invalid.accountName).toBeTruthy();
    expect(invalid.ownerConfirmed).toBeTruthy();
  });

  it('renders shop profile, logistics links, bank account, and team RBAC controls', async () => {
    renderWithQuery(
      <SellerSettingsSection
        shopId="shop-1"
        initialName="Hanoi Archive"
        initialDescription="Curated menswear"
        initialStatus="ACTIVE"
        isOwner={true}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Shop settings' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Manage pickup address/i }),
    ).toHaveAttribute('href', '/selling/pickup?shopId=shop-1');
    expect(
      screen.getByRole('link', { name: /Manage packaging presets/i }),
    ).toHaveAttribute('href', '/selling/packages');
    expect(
      screen.getByRole('link', { name: /View storefront/i }),
    ).toHaveAttribute('href', '/shops/shop-1');

    // Payout bank account loads
    expect(await screen.findByText('0123456789')).toBeInTheDocument();

    // Team members & RBAC roles render
    expect(screen.getByText('Le Hoang Yen')).toBeInTheDocument();
    expect(screen.getAllByText('Catalog manager').length).toBeGreaterThan(0);

    // Save shop profile
    fireEvent.change(screen.getByLabelText('Shop name'), {
      target: { value: 'Hanoi Archive Studio' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save shop profile' }));
    await waitFor(() => {
      expect(updateShopMutateAsync).toHaveBeenCalledWith({
        shopId: 'shop-1',
        data: {
          name: 'Hanoi Archive Studio',
          description: 'Curated menswear',
          status: 'ACTIVE',
        },
      });
    });

    // Open invite member modal and invite staff
    fireEvent.click(screen.getByRole('button', { name: /Invite member/i }));
    fireEvent.change(screen.getByLabelText('Member email'), {
      target: { value: 'newstaff@hanoi.vn' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send invitation' }));
    await waitFor(() => {
      expect(inviteMutateAsync).toHaveBeenCalledWith({
        shopId: 'shop-1',
        data: { email: 'newstaff@hanoi.vn', roleIds: ['role-1'] },
      });
    });
  });
});
