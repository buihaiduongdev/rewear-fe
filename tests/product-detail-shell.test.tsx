import { ProductDetailShell } from '@/features/product-detail/components/ProductDetailShell';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null }),
  signOut: vi.fn(),
}));
vi.mock('@/modules/cart/components/CartLink', () => ({
  CartLink: () => <a href="/cart">Cart</a>,
}));

describe('ProductDetailShell', () => {
  it('keeps navigation and footer visible when content is loading or unavailable', () => {
    const { rerender } = render(
      <ProductDetailShell>
        <p>Loading product details</p>
      </ProductDetailShell>,
    );
    expect(
      screen.getByRole('link', { name: 'RE.WEAR home' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Loading product details')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveClass('flex');
    rerender(
      <ProductDetailShell>
        <p>Product not found</p>
      </ProductDetailShell>,
    );
    expect(screen.getByText('Product not found')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
  it('navigates to the catalog with the search term', () => {
    render(
      <ProductDetailShell>
        <p>Product</p>
      </ProductDetailShell>,
    );
    const input = screen.getAllByLabelText('Search clothing and brands')[0];
    fireEvent.change(input, { target: { value: 'linen coat' } });
    fireEvent.submit(input.closest('form')!);
    expect(push).toHaveBeenCalledWith('/products?search=linen%20coat');
  });
});
