'use client';

import { useState, useSyncExternalStore } from 'react';

import { useRouter } from 'next/navigation';

import {
  cartQueryKey,
  useCart,
  useRemoveCartItem,
} from '@/modules/cart/hooks/use-cart';
import { useAddToWishlist } from '@/modules/wishlist/hooks/use-wishlist';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { useCheckoutControllerCreate } from '@/shared/api/query-generated/checkout/checkout';
import { useUserAddressControllerFindAll } from '@/shared/api/query-generated/user-addresses/user-addresses';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export function useCartPage() {
  const router = useRouter();
  const cart = useCart();
  const remove = useRemoveCartItem();
  const addToWishlist = useAddToWishlist();
  const data = cart.data?.data;
  const activeCheckoutId = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('storage', onStoreChange);
      return () => window.removeEventListener('storage', onStoreChange);
    },
    () => sessionStorage.getItem('activeCheckoutId'),
    () => null,
  );

  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;
  const client = useQueryClient();
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const addresses = useUserAddressControllerFindAll({
    query: {
      enabled: enabled,
      queryKey: ['/api/user-addresses', session?.user.id],
    },
  });

  const create = useCheckoutControllerCreate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const allCartItems = data?.groups.flatMap((g) => g.items) ?? [];
  const displayCount = data?.summary.availableItemCount ?? 0;
  const displayTotal = data?.summary.totalPrice ?? 0;

  const handleContinueToCheckout = (customAddressId?: string) => {
    setCreateError(null);
    if (!enabled) {
      router.push('/login?callbackUrl=/cart');
      return;
    }

    const available = allCartItems.filter(
      (i) => i.availability === 'AVAILABLE' && i.product,
    );
    if (!available.length) return;

    const chosenAddressId =
      customAddressId ||
      addresses.data?.data.find((a) => a.isDefault)?.id ||
      addresses.data?.data[0]?.id;

    if (!chosenAddressId) {
      setAddressModalOpen(true);
      return;
    }

    const productIds = available.map((i) => i.productId).sort();
    const key = `rewear.checkout.request:${session?.user.id}:${chosenAddressId}:${productIds.join(',')}`;
    let requestId =
      typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
    if (!requestId) {
      requestId = crypto.randomUUID();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, requestId);
      }
    }

    create.mutate(
      { data: { requestId, addressId: chosenAddressId, productIds } },
      {
        onSuccess: (response: { data: { id: string } }) => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('activeCheckoutId', response.data.id);
            sessionStorage.removeItem(key);
            window.dispatchEvent(new Event('storage'));
          }
          void client.invalidateQueries({
            queryKey: cartQueryKey(session?.user.id),
          });
          router.push(`/checkout?id=${response.data.id}`);
        },
        onError: (err: unknown) => {
          setCreateError(getApiErrorMessage(err));
        },
      },
    );
  };

  const handleSaveForLater = (productId: string) => {
    if (!enabled) {
      router.push('/login?callbackUrl=/cart');
      return;
    }
    addToWishlist.mutate(
      { productId, data: {} },
      { onSuccess: () => remove.mutate({ productId }) },
    );
  };

  return {
    cart,
    remove,
    addToWishlist,
    data,
    activeCheckoutId,
    addressModalOpen,
    setAddressModalOpen,
    createError,
    addresses,
    create,
    displayCount,
    displayTotal,
    handleContinueToCheckout,
    handleSaveForLater,
  };
}
