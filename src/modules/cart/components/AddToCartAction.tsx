'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { getApiErrorMessage } from '@/shared/api/api-error';
import { Button } from '@/shared/components/ui/button';
import { TOAST_DURATION_MS } from '@/shared/constants/toast';
import { useToastStore } from '@/shared/stores/toast.store';
import { useSession } from 'next-auth/react';

import { useAddCartItem, useCart } from '../hooks/use-cart';

type CartProduct = {
  id: string;
  title: string | null;
  size: string | null;
};
const primaryClass =
  'h-[52px] w-full rounded-none border-0 bg-rewear-accent px-5 text-sm font-normal text-rewear-text shadow-none hover:bg-rewear-accent/90';

export function AddToCartAction({
  product,
  primary = false,
  onAdded,
}: {
  product: CartProduct;
  primary?: boolean;
  onAdded?: () => void;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const params = useSearchParams();
  const cart = useCart();
  const add = useAddCartItem();
  const className = primary
    ? primaryClass
    : 'bg-rewear-soft text-rewear-text h-11 w-full rounded-none border-0 text-sm shadow-none hover:bg-rewear-border';
  const alreadySaved = cart.data?.data.groups.some((group) =>
    group.items.some((item) => item.productId === product.id),
  );

  if (status === 'loading')
    return (
      <Button className={className} disabled>
        Loading…
      </Button>
    );
  if (status !== 'authenticated' || session?.error) {
    const callbackUrl = `${pathname}${params.size ? `?${params}` : ''}`;
    return (
      <Button
        className={className}
        render={
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          />
        }
        nativeButton={false}
      >
        Sign in to add
      </Button>
    );
  }
  if (alreadySaved)
    return (
      <Button
        className={className}
        render={<Link href="/cart" />}
        nativeButton={false}
      >
        View cart
      </Button>
    );

  return (
    <>
      <Button
        className={className}
        loading={add.isPending}
        disabled={add.isPending}
        onClick={() =>
          add.mutate(
            { productId: product.id, data: {} },
            {
              onSuccess: () => {
                onAdded?.();
                useToastStore.getState().addToast({
                  type: 'success',
                  title: 'Added to cart',
                  description: [product.title, product.size]
                    .filter(Boolean)
                    .join(' · '),
                  durationMs: TOAST_DURATION_MS.DEFAULT,
                  href: '/cart',
                  actionLabel: 'View cart',
                });
              },
            },
          )
        }
      >
        Add to cart
      </Button>
      {add.isError && (
        <p role="alert" className="text-sm leading-5">
          {getApiErrorMessage(add.error)}
        </p>
      )}
    </>
  );
}
