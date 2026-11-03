'use client';

import {
  getCartControllerFindMineQueryKey,
  useCartControllerAdd,
  useCartControllerFindMine,
  useCartControllerRemove,
} from '@/shared/api/query-generated/cart/cart';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const cartQueryKey = (userId?: string) => [
  ...getCartControllerFindMineQueryKey(),
  userId ?? 'guest',
];

export function useCart() {
  const { data: session, status } = useSession();
  return useCartControllerFindMine({
    query: {
      queryKey: cartQueryKey(session?.user.id),
      enabled: status === 'authenticated' && !session?.error,
      staleTime: 0,
      refetchOnWindowFocus: true,
      meta: { skipErrorToast: true },
    },
  });
}

export function useAddCartItem() {
  const { data: session } = useSession();
  const client = useQueryClient();
  const queryKey = cartQueryKey(session?.user.id);
  return useCartControllerAdd({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onMutate: () => client.cancelQueries({ queryKey }),
      onSuccess: (response) => client.setQueryData(queryKey, response),
      onSettled: () => client.invalidateQueries({ queryKey }),
    },
  });
}

export function useRemoveCartItem() {
  const { data: session } = useSession();
  const client = useQueryClient();
  const queryKey = cartQueryKey(session?.user.id);
  return useCartControllerRemove({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onMutate: () => client.cancelQueries({ queryKey }),
      onSuccess: (_, { productId }) => {
        client.setQueryData<
          import('@/shared/api/models').CartControllerFindMine200
        >(queryKey, (previous) => {
          if (!previous) return previous;
          const groups = previous.data.groups
            .map((group) => ({
              ...group,
              items: group.items.filter((item) => item.productId !== productId),
            }))
            .filter((group) => group.items.length > 0);
          const items = groups.flatMap((group) => group.items);
          const available = items.filter(
            (item) => item.availability === 'AVAILABLE' && item.product,
          );
          return {
            ...previous,
            data: {
              groups,
              summary: {
                itemCount: items.length,
                availableItemCount: available.length,
                totalPrice: available.reduce(
                  (total, item) => total + item.product!.price,
                  0,
                ),
                currency: 'VND',
              },
            },
          };
        });
      },
      onSettled: () => client.invalidateQueries({ queryKey }),
    },
  });
}
