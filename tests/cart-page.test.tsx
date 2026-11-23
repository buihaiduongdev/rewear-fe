import { CartPage } from '@/features/cart/components/CartPage';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cart: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    status: 'authenticated',
    data: { user: { id: 'buyer' } },
  }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock('@/modules/cart/hooks/use-cart', () => ({
  useCart: mocks.cart,
  useRemoveCartItem: () => ({ mutate: mocks.remove }),
  cartQueryKey: () => [],
}));
vi.mock('@/modules/wishlist/hooks/use-wishlist', () => ({
  useAddToWishlist: () => ({ mutate: mocks.save }),
}));
vi.mock('@/shared/api/query-generated/checkout/checkout', () => ({
  useCheckoutControllerCreate: () => ({ mutate: vi.fn() }),
}));
vi.mock('@/shared/api/query-generated/user-addresses/user-addresses', () => ({
  useUserAddressControllerFindAll: () => ({ data: { data: [] } }),
}));
vi.mock('@/modules/address', () => ({ DeliveryAddressModal: () => null }));
vi.mock('@/modules/cart/components/CartLink', () => ({ CartLink: () => null }));
vi.mock('@/shared/components/marketplace/MarketplaceHeader', () => ({
  MarketplaceHeader: () => null,
}));
vi.mock('@/shared/components/marketplace/MobileNavigation', () => ({
  MobileNavigation: () => null,
}));
vi.mock('@/shared/components/marketplace/ProductPhoto', () => ({
  ProductPhoto: () => null,
}));

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mocks.cart.mockReturnValue({
      data: {
        data: {
          summary: {
            itemCount: 1,
            availableItemCount: 0,
            totalPrice: 0,
            currency: 'VND',
          },
          groups: [
            {
              shop: { id: 'shop-1', name: 'Shop' },
              items: [
                {
                  productId: 'product-1',
                  availability: 'SOLD',
                  product: {
                    title: 'Coat',
                    price: 100000,
                    size: 'M',
                    color: 'Black',
                    condition: 'GOOD',
                  },
                },
              ],
            },
          ],
        },
      },
    });
  });
  it('excludes unavailable products from the total and disables checkout', () => {
    render(<CartPage />);
    const summary = screen.getByRole('complementary', { name: 'Cart summary' });
    expect(within(summary).getByText('Items · 0')).toBeInTheDocument();
    expect(within(summary).getByText(/0\s*₫/)).toBeInTheDocument();
    expect(
      within(summary).getByRole('button', { name: 'Continue to checkout' }),
    ).toBeDisabled();
  });
  it('removes an item only after saving it to the wishlist succeeds', () => {
    render(<CartPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    expect(mocks.save).toHaveBeenCalledOnce();
    expect(mocks.remove).not.toHaveBeenCalled();
    mocks.save.mock.calls[0][1].onSuccess();
    expect(mocks.remove).toHaveBeenCalledWith({ productId: 'product-1' });
  });
});
