import { ProductDetailsSection } from '@/features/product-detail/components/ProductDetailsSection';
import { ShopStorefrontPage } from '@/features/shop-storefront/components/ShopStorefrontPage';
import type { ProductControllerFindOne200Data } from '@/shared/api/models';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const push = vi.hoisted(() => vi.fn());
const followShopMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    statusCode: 200,
    message: 'OK',
    data: {
      shopId: 'shop-1',
      following: true,
      followedAt: '2026-06-01T00:00:00.000Z',
    },
  }),
);
const sessionState = vi.hoisted(() => ({
  status: 'authenticated' as 'authenticated' | 'unauthenticated',
  data: { user: { id: 'user-1', fullName: 'Buyer One' } } as {
    user: { id: string; fullName: string };
  } | null,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => sessionState,
  signOut: vi.fn(),
}));

vi.mock('@/modules/cart/components/CartLink', () => ({
  CartLink: () => <a href="/cart">Cart</a>,
}));

vi.mock('@/shared/api/query-generated/shops/shops', () => ({
  useShopControllerFindOne: () => ({
    isPending: false,
    isError: false,
    data: {
      data: {
        id: 'shop-1',
        name: 'Hanoi Archive',
        description: 'Curated Japanese and European secondhand menswear.',
        status: 'ACTIVE',
        createdAt: '2026-01-15T00:00:00.000Z',
        updatedAt: '2026-01-15T00:00:00.000Z',
      },
    },
  }),
}));

vi.mock('@/shared/api/query-generated/products/products', () => ({
  useProductControllerFindAll: () => ({
    isPending: false,
    isFetching: false,
    isError: false,
    data: {
      data: {
        data: [
          {
            id: 'prod-1',
            shopId: 'shop-1',
            title: 'Lemaire wool overcoat',
            price: 1200000,
            size: 'M',
            condition: 'EXCELLENT',
            coverUrl: null,
            shop: { id: 'shop-1', name: 'Hanoi Archive' },
          },
        ],
        meta: { totalItems: 1, totalPages: 1 },
      },
    },
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/shop-storefront/api/shop-storefront', () => ({
  fetchPublicShopRatings: vi.fn().mockResolvedValue({
    statusCode: 200,
    message: 'OK',
    data: {
      summary: {
        mode: 'EVIDENCE',
        count: 2,
        average: 4.8,
        distribution: { '5': 2 },
        verifiedBuyerCount: 2,
      },
      ratings: [
        {
          id: 'rev-1',
          shopId: 'shop-1',
          stars: 5,
          comment: 'Exact measurements and fast shipping.',
          reply: null,
          updatedAt: '2026-05-10T00:00:00.000Z',
          verifiedTransaction: true,
        },
      ],
    },
  }),
  fetchShopFollowState: vi.fn().mockResolvedValue({
    statusCode: 200,
    message: 'OK',
    data: { shopId: 'shop-1', following: false, followedAt: null },
  }),
  followShop: followShopMock,
  unfollowShop: vi.fn(),
}));

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe('ShopStorefrontPage & ProductDetailsSection shop link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionState.status = 'authenticated';
    sessionState.data = { user: { id: 'user-1', fullName: 'Buyer One' } };
  });

  it('renders public shop header, rating summary, product grid, and follow action', async () => {
    renderWithQuery(<ShopStorefrontPage shopId="shop-1" />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Hanoi Archive' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Lemaire wool overcoat')).toBeInTheDocument();
    expect(
      await screen.findByText('Exact measurements and fast shipping.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Follow shop/i }));
    await waitFor(() => {
      expect(followShopMock).toHaveBeenCalledWith('shop-1');
    });
  });

  it('links shop name on ProductDetailsSection to /shops/[shopId]', () => {
    const product = {
      id: 'prod-1',
      shopId: 'shop-1',
      title: 'Wool coat',
      description: 'Clean wool coat',
      measurements: {},
      defects: [],
      repairs: null,
      shop: { id: 'shop-1', name: 'Hanoi Archive' },
    } as unknown as ProductControllerFindOne200Data;

    renderWithQuery(
      <ProductDetailsSection
        product={product}
        media={[]}
        onHowToMeasure={vi.fn()}
      />,
    );

    const shopLink = screen.getByRole('link', { name: /Hanoi Archive/i });
    expect(shopLink).toHaveAttribute('href', '/shops/shop-1');
  });
});
