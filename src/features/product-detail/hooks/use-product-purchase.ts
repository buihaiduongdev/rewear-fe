'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAddCartItem, useCart } from '@/modules/cart/hooks/use-cart';
import { getApiErrorMessage } from '@/shared/api/api-error';
import type { ProductControllerFindOne200Data } from '@/shared/api/models';
import { TOAST_DURATION_MS } from '@/shared/constants/toast';
import { useToastStore } from '@/shared/stores/toast.store';
import { useSession } from 'next-auth/react';

export function useProductPurchase(
  product: ProductControllerFindOne200Data | undefined,
) {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const addToast = useToastStore((s) => s.addToast);
  const cart = useCart();
  const addCartItem = useAddCartItem();
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const alreadyInCart = cart.data?.data.groups.some((group) =>
    group.items.some((item) => item.productId === product?.id),
  );
  const handleAddToCart = () => {
    if (!product) return;
    if (authStatus !== 'authenticated' || session?.error) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(`/products/${product.id}`)}`,
      );
      return;
    }

    addCartItem.mutate(
      { productId: product.id, data: {} },
      {
        onSuccess: () => {
          addToast({
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
        onError: (err) => {
          addToast({
            type: 'error',
            title: 'Could not add to cart',
            description: getApiErrorMessage(err),
            durationMs: TOAST_DURATION_MS.DEFAULT,
          });
        },
      },
    );
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (authStatus !== 'authenticated' || session?.error) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/checkout`)}`);
      return;
    }

    if (alreadyInCart) {
      router.push('/checkout');
      return;
    }

    try {
      setIsBuyingNow(true);
      await addCartItem.mutateAsync({ productId: product.id, data: {} });
      router.push('/checkout');
    } catch (err) {
      setIsBuyingNow(false);
      addToast({
        type: 'error',
        title: 'Could not process purchase',
        description: getApiErrorMessage(err),
        durationMs: TOAST_DURATION_MS.DEFAULT,
      });
    }
  };

  return {
    alreadyInCart,
    isBuyingNow,
    isPending: addCartItem.isPending,
    handleAddToCart,
    handleBuyNow,
  };
}
