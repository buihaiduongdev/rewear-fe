'use client';

import Link from 'next/link';

import { useCart } from '../hooks/use-cart';

export function CartLink({
  className = 'inline-flex min-h-11 items-center hover:underline',
  active = false,
}: {
  className?: string;
  active?: boolean;
}) {
  const cart = useCart();
  const count = cart.data?.data.summary.itemCount;
  return (
    <Link
      href="/cart"
      className={className}
      aria-current={active ? 'page' : undefined}
      aria-label={
        count === undefined
          ? 'Cart'
          : `Cart, ${count} ${count === 1 ? 'item' : 'items'}`
      }
    >
      Cart{count === undefined ? '' : ` (${count})`}
    </Link>
  );
}
