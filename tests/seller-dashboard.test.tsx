import { useSellerDashboard } from '@/features/seller-dashboard/hooks/use-seller-dashboard';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useSearchParamsMock, useSessionMock } = vi.hoisted(() => ({
  useSearchParamsMock: vi.fn(),
  useSessionMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: useSearchParamsMock,
}));

vi.mock('next-auth/react', () => ({
  useSession: useSessionMock,
}));

vi.mock('@/modules/shop/hooks/use-shop-memberships', () => ({
  useShopMemberships: () => ({
    isPending: false,
    isError: false,
    data: {
      data: [
        {
          shopId: 'shop-1',
          memberRole: 'OWNER',
          status: 'ACTIVE',
          shop: { name: 'Hanoi Archive', logoUrl: null },
        },
      ],
    },
  }),
}));

vi.mock('@/shared/api/query-generated/products/products', () => ({
  useProductControllerFindMine: () => ({
    isPending: false,
    isError: false,
    data: { data: { data: [], meta: { totalItems: 0 }, links: {} } },
  }),
}));

describe('useSellerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionMock.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'seller-1', role: 'USER' } },
    });
  });

  it('defaults to the overview tab when no ?tab= query parameter is present', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    const { result } = renderHook(() => useSellerDashboard());
    expect(result.current.activeTab).toBe('overview');
  });

  it('respects explicit ?tab= query parameters such as products and orders', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('tab=products'));
    const productsHook = renderHook(() => useSellerDashboard());
    expect(productsHook.result.current.activeTab).toBe('products');

    useSearchParamsMock.mockReturnValue(new URLSearchParams('tab=orders'));
    const ordersHook = renderHook(() => useSellerDashboard());
    expect(ordersHook.result.current.activeTab).toBe('orders');
  });

  it('falls back to overview when ?tab= is unrecognized', () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('tab=unknown'));
    const { result } = renderHook(() => useSellerDashboard());
    expect(result.current.activeTab).toBe('overview');
  });
});
