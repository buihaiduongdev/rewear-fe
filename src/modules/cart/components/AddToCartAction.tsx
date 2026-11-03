'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { getApiErrorMessage } from '@/shared/api/api-error';
import { Button } from '@/shared/components/ui/button';
import { formatPrice } from '@/shared/utils/product';
import { Dialog } from '@base-ui/react/dialog';
import { useSession } from 'next-auth/react';

import { useAddCartItem, useCart } from '../hooks/use-cart';

type CartProduct = {
  id: string;
  title: string | null;
  size: string | null;
  price: number | null;
  sellerUserId: string | null;
};
const primaryClass =
  'h-[52px] w-full rounded-none border-0 bg-rewear-accent px-5 text-sm font-normal text-rewear-text shadow-none hover:bg-rewear-accent/90';

export function AddToCartAction({
  product,
  primary = false,
}: {
  product: CartProduct;
  primary?: boolean;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const params = useSearchParams();
  const cart = useCart();
  const add = useAddCartItem();
  const [open, setOpen] = useState(false);
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
  if (product.sellerUserId === session.user.id)
    return (
      <Button disabled className={className}>
        Your item
      </Button>
    );
  // Keep the confirmation mounted after the response also updates the shared cart cache.
  if (alreadySaved && !open)
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
      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) setOpen(false);
        }}
      >
        <Dialog.Trigger
          render={
            <Button
              className={className}
              loading={add.isPending}
              disabled={add.isPending}
            />
          }
          onClick={() =>
            add.mutate(
              { productId: product.id, data: {} },
              { onSuccess: () => setOpen(true) },
            )
          }
        >
          Add to cart
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Popup className="bg-rewear-surface text-rewear-text fixed bottom-0 left-0 z-50 flex max-h-[90dvh] w-full flex-col gap-6 overflow-y-auto p-4 outline-none md:top-1/2 md:bottom-auto md:left-1/2 md:w-[440px] md:-translate-x-1/2 md:-translate-y-1/2 md:p-6">
            <Dialog.Close className="min-h-11 w-full cursor-pointer text-left text-sm font-semibold">
              Close ×
            </Dialog.Close>
            <Dialog.Title className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
              Added to cart
            </Dialog.Title>
            <Dialog.Description className="text-base leading-6">
              {[product.title, product.size].filter(Boolean).join(' · ')}
              <span className="block md:hidden">
                {formatPrice(product.price)}
              </span>
            </Dialog.Description>
            <Button
              className={primaryClass}
              render={<Link href="/cart" />}
              nativeButton={false}
            >
              View cart
            </Button>
            <Dialog.Close className="min-h-11 w-full cursor-pointer text-left text-sm font-semibold">
              Keep browsing
            </Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      {add.isError && (
        <p role="alert" className="text-sm leading-5">
          {getApiErrorMessage(add.error)}
        </p>
      )}
    </>
  );
}
