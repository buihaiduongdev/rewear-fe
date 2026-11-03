import type { ReactNode } from 'react';

import Link from 'next/link';

export function MobileNavigation({
  active = 'home',
  cartAction,
}: {
  active?: 'home' | 'cart';
  cartAction: ReactNode;
}) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="grid grid-cols-3 gap-3.5 px-4 py-4 text-sm leading-5 font-semibold md:hidden"
    >
      <Link
        href="/"
        aria-current={active === 'home' ? 'page' : undefined}
        className="bg-rewear-soft flex min-h-11 items-center justify-center px-3"
      >
        Home
      </Link>
      <Link
        href="/?view=all#new-arrivals"
        className="bg-rewear-soft flex min-h-11 items-center justify-center px-3"
      >
        Shop
      </Link>
      {cartAction}
    </nav>
  );
}
