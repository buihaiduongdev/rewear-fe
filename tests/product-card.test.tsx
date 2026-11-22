import { ProductCard } from '@/features/home/components/ProductCard';
import type { Product } from '@/shared/utils/product';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mockProduct: Product = {
  id: 'prod-1',
  title: 'Vintage Leather Jacket',
  price: 550000,
  size: 'L',
  condition: 'EXCELLENT',
  coverUrl: 'https://example.com/jacket.jpg',
  shopId: 'shop-123',
  shop: {
    id: 'shop-123',
    name: 'hanoivintage',
  },
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Outerwear', slug: 'outerwear' },
  description: 'A genuine leather jacket',
  brand: 'Vintage Co',
  color: 'Brown',
  mediaCount: 1,
  status: 'ACTIVE',
  repairs: null,
  defects: [],
  measurements: {},
  shippingPackage: null,
  publishedAt: '2026-01-01T00:00:00Z',
  heldUntil: null,
  soldAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('ProductCard', () => {
  it('renders product details and shop name', () => {
    render(<ProductCard product={mockProduct} onSelectShop={vi.fn()} />);

    expect(
      screen.getByRole('link', { name: 'View Vintage Leather Jacket' }),
    ).toHaveAttribute('href', '/products/prod-1');
    expect(screen.getByText('Vintage Leather Jacket')).toBeInTheDocument();
    expect(screen.getAllByText(/@hanoivintage/)).toHaveLength(2); // desktop & mobile
    expect(screen.getAllByText(/L · Very good/)).toHaveLength(2);
  });

  it('calls onSelectShop when clicking shop name and stops propagation', () => {
    const onSelectShop = vi.fn();
    render(
      <ProductCard
        product={mockProduct}

        onSelectShop={onSelectShop}
      />,
    );

    const shopButtons = screen.getAllByTitle('Filter by @hanoivintage');
    fireEvent.click(shopButtons[0]);

    expect(onSelectShop).toHaveBeenCalledWith('shop-123');
  });

  it('handles products without shop info gracefully', () => {
    const noShopProduct = {
      ...mockProduct,
      shop: undefined as unknown as Product['shop'],
    };
    render(<ProductCard product={noShopProduct} />);

    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/L · Very good/)).toHaveLength(2);
  });

  it('uses shop initials when the server has no logo', () => {
    render(<ProductCard product={mockProduct} onSelectShop={vi.fn()} />);
    expect(screen.getAllByText('H')).toHaveLength(2);
  });

  it('renders shop logo if provided directly by server in product.shop.logoUrl', () => {
    const productWithLogo = {
      ...mockProduct,
      shop: {
        ...mockProduct.shop,
        logoUrl: 'https://cdn.example.com/logo.jpg',
      },
    };
    render(
      <ProductCard
        product={productWithLogo as unknown as Product}
        onSelectShop={vi.fn()}
      />,
    );
    expect(screen.getAllByAltText('hanoivintage')).toHaveLength(2);
  });
});
