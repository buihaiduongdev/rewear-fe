import { AdminCategoriesPage } from '@/features/admin/components/AdminCategoriesPage';
import { AdminProductModerationPage } from '@/features/admin/components/AdminProductModerationPage';
import { AdminWorkspaceLayout } from '@/features/admin/components/AdminWorkspaceLayout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: {
    data: {
      user: {
        id: 'admin-1',
        fullName: 'Admin User',
        email: 'admin@rewear.vn',
        role: 'ADMIN',
      },
    } as Record<string, unknown> | null,
    status: 'authenticated' as 'authenticated' | 'unauthenticated' | 'loading',
  },
  queueSpy: vi.fn(),
  moderateMutateAsync: vi.fn(),
  suspendMutateAsync: vi.fn(),
  createCategoryMutateAsync: vi.fn(),
  updateCategoryMutateAsync: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/products',
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mocks.session,
}));

const pendingListing = {
  id: 'prod-1',
  categoryId: 'cat-1',
  shopId: 'shop-1',
  title: 'Vintage Wool Blazer',
  description: 'Structured vintage blazer in very good condition.',
  condition: 'EXCELLENT' as const,
  size: 'M',
  color: 'Navy',
  brand: 'Lemaire',
  price: 650000,
  measurements: { chest: 54, length: 72 },
  shippingPackage: null,
  repairs: 'None',
  defects: [{ description: 'Minor loose thread on cuff', mediaIds: ['m-1'] }],
  coverUrl: 'https://example.com/blazer.jpg',
  mediaCount: 4,
  status: 'PENDING_REVIEW' as const,
  publishedAt: null,
  heldUntil: null,
  soldAt: null,
  createdAt: '2026-11-20T10:00:00Z',
  updatedAt: '2026-11-20T10:00:00Z',
  category: { id: 'cat-1', name: 'Outerwear', slug: 'outerwear' },
  shop: {
    id: 'shop-1',
    name: 'Hanoi Archive',
    logoUrl: null,
    identitySalesPaused: false,
  },
};

vi.mock('@/shared/api/query-generated/products/products', () => ({
  getProductControllerReviewQueueQueryKey: () => ['/api/products/admin'],
  useProductControllerReviewQueue: (params: unknown) => {
    mocks.queueSpy(params);
    return {
      data: {
        data: {
          data: [pendingListing],
          meta: {
            totalItems: 1,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: 10,
          },
        },
      },
      isPending: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    };
  },
  useProductControllerReviewDetail: () => ({
    data: { data: pendingListing },
    isPending: false,
    isError: false,
  }),
  useProductControllerModerationForAdmin: () => ({
    data: {
      data: {
        productId: 'prod-1',
        status: 'PENDING',
        version: 3,
        reason: null,
      },
    },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useProductControllerModerate: () => ({
    mutateAsync: mocks.moderateMutateAsync,
    isPending: false,
  }),
  useProductControllerSuspend: () => ({
    mutateAsync: mocks.suspendMutateAsync,
    isPending: false,
  }),
}));

vi.mock('@/shared/api/query-generated/product-media/product-media', () => ({
  useMediaControllerFindAll: () => ({
    data: undefined,
    isPending: false,
    isError: false,
  }),
}));

const sampleCategories = [
  {
    id: 'cat-1',
    name: 'Outerwear',
    slug: 'outerwear',
    isActive: true,
    requiredMeasurements: ['chest', 'length'] as const,
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Trousers',
    slug: 'trousers',
    isActive: false,
    requiredMeasurements: ['waist', 'inseam'] as const,
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  },
];

vi.mock('@/shared/api/query-generated/categories/categories', () => ({
  getCategoryControllerFindAllQueryKey: () => ['/api/categories'],
  useCategoryControllerFindAll: () => ({
    data: { data: sampleCategories },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCategoryControllerCreate: () => ({
    mutateAsync: mocks.createCategoryMutateAsync,
    isPending: false,
  }),
  useCategoryControllerUpdate: () => ({
    mutateAsync: mocks.updateCategoryMutateAsync,
    isPending: false,
  }),
}));

function renderWithQuery(node: React.ReactNode) {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {node}
    </QueryClientProvider>,
  );
}

describe('AdminWorkspaceLayout role guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.status = 'authenticated';
    mocks.session.data = {
      user: {
        id: 'admin-1',
        fullName: 'Admin User',
        email: 'admin@rewear.vn',
        role: 'ADMIN',
      },
    };
  });

  it('blocks non-admin users with an access notice', () => {
    mocks.session.data = {
      user: {
        id: 'buyer-1',
        fullName: 'Regular Buyer',
        role: 'USER',
      },
    };

    render(
      <AdminWorkspaceLayout activeNav="products">
        <div>Secret panel</div>
      </AdminWorkspaceLayout>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Admin access required',
    );
    expect(screen.queryByText('Secret panel')).not.toBeInTheDocument();
  });

  it('renders admin sidebar links for ADMIN role', () => {
    render(
      <AdminWorkspaceLayout activeNav="products">
        <div>Moderation content</div>
      </AdminWorkspaceLayout>,
    );

    expect(screen.getByText('Moderation content')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Product moderation' }),
    ).toHaveAttribute('href', '/admin/products');
    expect(screen.getByRole('link', { name: 'Categories' })).toHaveAttribute(
      'href',
      '/admin/categories',
    );
    expect(
      screen.getByRole('link', { name: /View marketplace/i }),
    ).toHaveAttribute('href', '/');
  });
});

describe('AdminProductModerationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.moderateMutateAsync.mockResolvedValue({ data: pendingListing });
  });

  it('filters by status tab, reviews a pending listing, and approves with version', async () => {
    renderWithQuery(<AdminProductModerationPage />);

    expect(screen.getByText('Vintage Wool Blazer')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(await screen.findByText('Review listing')).toBeInTheDocument();
    expect(screen.getByText('Minor loose thread on cuff')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Approve listing' }));

    await waitFor(() =>
      expect(mocks.moderateMutateAsync).toHaveBeenCalledWith({
        productId: 'prod-1',
        data: { version: 3, decision: 'APPROVE' },
      }),
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Active' }));
    expect(mocks.queueSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ 'filter.status': ['ACTIVE'] }),
    );
  });

  it('requires a rejection reason before calling reject moderation endpoint', async () => {
    renderWithQuery(<AdminProductModerationPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    await screen.findByText('Review listing');

    fireEvent.click(screen.getByRole('button', { name: 'Reject listing' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please enter a rejection reason before rejecting.',
    );
    expect(mocks.moderateMutateAsync).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Rejection reason'), {
      target: { value: 'Label photo is missing' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reject listing' }));

    await waitFor(() =>
      expect(mocks.moderateMutateAsync).toHaveBeenCalledWith({
        productId: 'prod-1',
        data: {
          version: 3,
          decision: 'REJECT',
          reason: 'Label photo is missing',
        },
      }),
    );
  });
});

describe('AdminCategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createCategoryMutateAsync.mockResolvedValue({ data: {} });
    mocks.updateCategoryMutateAsync.mockResolvedValue({ data: {} });
  });

  it('lists categories, creates a new category with slug preview, and toggles active state', async () => {
    renderWithQuery(<AdminCategoriesPage />);

    expect(screen.getByText('Outerwear')).toBeInTheDocument();
    expect(screen.getByText('Trousers')).toBeInTheDocument();

    // Open Add category modal
    fireEvent.click(screen.getByRole('button', { name: /Add category/i }));
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Áo Khoác Da' },
    });
    expect(screen.getByLabelText('Slug (auto-generated)')).toHaveValue(
      'ao-khoac-da',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Create category' }));

    await waitFor(() =>
      expect(mocks.createCategoryMutateAsync).toHaveBeenCalledWith({
        data: {
          name: 'Áo Khoác Da',
          isActive: true,
          requiredMeasurements: [],
        },
      }),
    );

    // Toggle active status on first category
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }));
    await waitFor(() =>
      expect(mocks.updateCategoryMutateAsync).toHaveBeenCalledWith({
        id: 'cat-1',
        data: { isActive: false },
      }),
    );
  });
});
