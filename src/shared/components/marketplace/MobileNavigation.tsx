import type { ReactNode } from 'react';
import Link from 'next/link';

export function MobileNavigation({
  active = 'home',
  cartAction,
}: {
  active?: 'home' | 'cart' | 'wishlist';
  cartAction?: ReactNode;
}) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="grid grid-cols-4 gap-2 px-4 py-4 text-xs leading-4 font-semibold md:hidden"
    >
      <Link
        href="/"
        aria-current={active === 'home' ? 'page' : undefined}
        className={`flex min-h-11 items-center justify-center px-2 text-center transition-colors ${
          active === 'home'
            ? 'bg-rewear-text text-white'
            : 'bg-rewear-soft text-rewear-text'
        }`}
      >
        Home
      </Link>
      <Link
        href="/products"
        className="bg-rewear-soft flex min-h-11 items-center justify-center px-2 text-center"
      >
        Shop
      </Link>
      <Link
        href="/wishlist"
        aria-current={active === 'wishlist' ? 'page' : undefined}
        className={`flex min-h-11 items-center justify-center px-2 text-center transition-colors ${
          active === 'wishlist'
            ? 'bg-rewear-text text-white'
            : 'bg-rewear-soft text-rewear-text'
        }`}
      >
        Wishlist
      </Link>
      {cartAction ?? (
        <Link
          href="/cart"
          aria-current={active === 'cart' ? 'page' : undefined}
          className={`flex min-h-11 items-center justify-center px-2 text-center transition-colors ${
            active === 'cart'
              ? 'bg-rewear-text text-white'
              : 'bg-rewear-soft text-rewear-text'
          }`}
        >
          Cart
        </Link>
      )}
    </nav>
  );
}
