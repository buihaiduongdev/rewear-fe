import { ProductFilterModal } from '@/features/home/components/ProductFilterModal';
import { ProductsPage } from '@/features/home/components/ProductsPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const navMock = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  search: '',
  findAllSpy: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navMock.replace, push: navMock.push }),
  useSearchParams: () => new URLSearchParams(navMock.search),
  usePathname: () => '/products',
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signOut: vi.fn(),
}));

vi.mock('@/modules/cart/components/CartLink', () => ({
  CartLink: () => <span>Cart</span>,
}));

vi.mock('@/shared/api/query-generated/categories/categories', () => ({
  useCategoryControllerFindAll: () => ({
    data: { data: [{ id: 'cat-1', name: 'Coats' }] },
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/shared/api/query-generated/shops/shops', () => ({
  useShopControllerFindAll: () => ({
    data: { data: [] },
    isError: false,
  }),
}));

vi.mock('@/modules/address/hooks/use-administrative-divisions', () => ({
  useProvinces: () => ({
    data: {
      data: [
        { id: 201, name: 'Hà Nội' },
        { id: 202, name: 'Hồ Chí Minh' },
      ],
    },
    isPending: false,
    isError: false,
  }),
}));

vi.mock('@/shared/api/query-generated/products/products', () => ({
  useProductControllerFindAll: (params: unknown) => {
    navMock.findAllSpy(params);
    return {
      data: {
        data: {
          data: [],
          meta: {
            totalItems: 0,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 12,
          },
        },
      },
      isPending: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    };
  },
}));

describe('Shop region (provinceId) filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navMock.search = '';
  });

  it('selects a shop region in ProductFilterModal and applies provinceId', () => {
    const onApply = vi.fn();
    const onClose = vi.fn();

    render(
      <ProductFilterModal
        isOpen={true}
        onClose={onClose}
        categories={[{ id: 'cat-1', name: 'Coats' }]}
        provinces={[
          { id: 201, name: 'Hà Nội' },
          { id: 202, name: 'Hồ Chí Minh' },
        ]}
        currentFilters={{}}
        onApply={onApply}
      />,
    );

    const regionSelect = screen.getByLabelText('Shop region');
    fireEvent.change(regionSelect, { target: { value: '202' } });
    fireEvent.click(screen.getByRole('button', { name: 'Show items' }));

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ provinceId: '202' }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('passes numeric provinceId to catalog query, shows active region chip, and clears it', () => {
    navMock.search = 'provinceId=202';

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ProductsPage />
      </QueryClientProvider>,
    );

    expect(navMock.findAllSpy).toHaveBeenCalledWith(
      expect.objectContaining({ provinceId: 202 }),
    );
    expect(screen.getByText(/Region: Hồ Chí Minh/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Remove region filter'));
    expect(navMock.replace).toHaveBeenCalledWith('/products', {
      scroll: false,
    });
  });
});
