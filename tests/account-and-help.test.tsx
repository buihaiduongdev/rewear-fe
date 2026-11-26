import { AccountPage } from '@/features/account/components/AccountPage';
import { HelpPage } from '@/features/help/components/HelpPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const push = vi.hoisted(() => vi.fn());
const updateSession = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const updateMeMutateAsync = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: { fullName: 'Tran Minh Anh' } }),
);
const updateAddressMutateAsync = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: {} }),
);
const removeAddressMutateAsync = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined),
);
const acceptInvitationMutateAsync = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: {} }),
);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    status: 'authenticated',
    data: {
      user: { id: 'user-1', fullName: 'Nguyen Minh Anh', email: 'anh@test.vn' },
    },
    update: updateSession,
  }),
  signOut: vi.fn(),
}));

vi.mock('@/modules/cart/components/CartLink', () => ({
  CartLink: () => <a href="/cart">Cart</a>,
}));

vi.mock('@/shared/api/query-generated/users/users', () => ({
  getUserControllerGetMeQueryKey: () => ['/api/users/me'],
  useUserControllerGetMe: () => ({
    isPending: false,
    isError: false,
    data: {
      data: {
        id: 'user-1',
        fullName: 'Nguyen Minh Anh',
        email: 'anh@test.vn',
        provider: 'credentials',
        role: 'USER',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        shop: null,
      },
    },
    refetch: vi.fn(),
  }),
  useUserControllerUpdateMe: () => ({
    isPending: false,
    error: null,
    reset: vi.fn(),
    mutateAsync: updateMeMutateAsync,
  }),
}));

vi.mock('@/shared/api/query-generated/user-addresses/user-addresses', () => ({
  getUserAddressControllerFindAllQueryKey: () => ['/api/user-addresses'],
  useUserAddressControllerFindAll: () => ({
    isPending: false,
    isError: false,
    data: {
      data: [
        {
          id: 'addr-1',
          recipientName: 'Nguyen Minh Anh',
          phone: '0912345678',
          addressLine1: '12 Hang Bac',
          wardCode: '00001',
          wardName: 'Hang Bac',
          districtId: 1482,
          districtName: 'Hoan Kiem',
          provinceId: 201,
          provinceName: 'Ha Noi',
          countryCode: 'VN',
          provinceCode: '01',
          label: null,
          addressLine2: null,
          postalCode: null,
          deliveryInstructions: null,
          isDefault: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'addr-2',
          recipientName: 'Le Van Binh',
          phone: '0987654321',
          addressLine1: '88 Nguyen Hue',
          wardCode: '00002',
          wardName: 'Ben Nghe',
          districtId: 1442,
          districtName: 'Quan 1',
          provinceId: 202,
          provinceName: 'Ho Chi Minh',
          countryCode: 'VN',
          provinceCode: '79',
          label: null,
          addressLine2: null,
          postalCode: null,
          deliveryInstructions: null,
          isDefault: false,
          createdAt: '2026-01-02T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
    },
    refetch: vi.fn(),
  }),
  useUserAddressControllerCreate: () => ({
    isPending: false,
    error: null,
    mutate: vi.fn(),
  }),
  useUserAddressControllerUpdate: () => ({
    isPending: false,
    error: null,
    mutate: vi.fn(),
    mutateAsync: updateAddressMutateAsync,
  }),
  useUserAddressControllerRemove: () => ({
    isPending: false,
    error: null,
    mutateAsync: removeAddressMutateAsync,
  }),
}));

vi.mock('@/shared/api/query-generated/orders/orders', () => ({
  useOrderControllerBuyerList: () => ({
    isPending: false,
    isError: false,
    data: {
      data: [
        {
          id: 'ord-1',
          orderCode: 'RW-2026-0001',
          status: 'delivered',
          shopName: 'Hanoi Archive',
          items: [{ title: 'Lemaire wool coat', price: 580000 }],
          total: 580000,
          createdAt: '2026-05-01T00:00:00.000Z',
        },
      ],
    },
  }),
}));

vi.mock('@/shared/api/query-generated/shops/shops', () => ({
  getShopControllerFindMyInvitationsQueryKey: () => [
    '/api/shop-invitations/me',
  ],
  useShopControllerFindMyInvitations: () => ({
    isPending: false,
    isError: false,
    data: {
      data: [
        {
          id: 'inv-1',
          shopId: 'shop-1',
          userId: 'user-1',
          status: 'PENDING',
          expiresAt: '2026-12-01T00:00:00.000Z',
          createdAt: '2026-11-01T00:00:00.000Z',
          updatedAt: '2026-11-01T00:00:00.000Z',
          roleIds: [],
          shop: { id: 'shop-1', name: 'Saigon Vintage' },
        },
      ],
    },
  }),
  useShopControllerAccept: () => ({
    isPending: false,
    mutateAsync: acceptInvitationMutateAsync,
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

describe('AccountPage & HelpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile, saved addresses, pending invitation, and recent orders on /account', async () => {
    renderWithQuery(<AccountPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Your account' }),
    ).toBeInTheDocument();
    expect(screen.getByText('anh@test.vn')).toBeInTheDocument();
    expect(
      screen.getByText('12 Hang Bac, Hang Bac, Hoan Kiem, Ha Noi'),
    ).toBeInTheDocument();
    expect(screen.getByText('Saigon Vintage')).toBeInTheDocument();
    expect(screen.getByText('RW-2026-0001')).toBeInTheDocument();

    // Set non-default address as default
    fireEvent.click(screen.getByRole('button', { name: 'Set as default' }));
    await waitFor(() => {
      expect(updateAddressMutateAsync).toHaveBeenCalledWith({
        id: 'addr-2',
        data: { isDefault: true },
      });
    });

    // Open Edit profile dialog and save display name
    fireEvent.click(screen.getByRole('button', { name: /Edit profile/i }));
    const nameInput = screen.getByLabelText('Display name');
    fireEvent.change(nameInput, { target: { value: 'Tran Minh Anh' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(updateMeMutateAsync).toHaveBeenCalledWith({
        data: { fullName: 'Tran Minh Anh' },
      });
    });
  });

  it('renders /help page with 72-hour delivery issue window and returns policy', () => {
    renderWithQuery(<HelpPage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Buying secondhand & returns/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Within 72h of delivery')).toBeInTheDocument();
    expect(
      screen.getByText(/Confirming receipt does not shorten this window/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'View your orders' }),
    ).toHaveAttribute('href', '/orders');
  });
});
