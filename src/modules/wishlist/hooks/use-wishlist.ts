'use client';

import {
  getWishlistControllerFindMineQueryKey,
  useWishlistControllerAdd,
  useWishlistControllerFindMine,
  useWishlistControllerRemove,
} from '@/shared/api/query-generated/wishlist/wishlist';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const wishlistQueryKey = (userId?: string) => [
  ...getWishlistControllerFindMineQueryKey(),
  userId ?? 'guest',
];

export function useWishlist() {
  const { data: session, status } = useSession();
  return useWishlistControllerFindMine({
    query: {
      queryKey: wishlistQueryKey(session?.user?.id),
      enabled: status === 'authenticated' && !session?.error,
      staleTime: 0,
      refetchOnWindowFocus: true,
      meta: { skipErrorToast: true },
    },
  });
}

export function useAddToWishlist() {
  const { data: session } = useSession();
  const client = useQueryClient();
  const queryKey = wishlistQueryKey(session?.user?.id);

  return useWishlistControllerAdd({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onMutate: () => client.cancelQueries({ queryKey }),
      onSuccess: (response) => client.setQueryData(queryKey, response),
      onSettled: () => client.invalidateQueries({ queryKey }),
    },
  });
}

export function useRemoveFromWishlist() {
  const { data: session } = useSession();
  const client = useQueryClient();
  const queryKey = wishlistQueryKey(session?.user?.id);

  return useWishlistControllerRemove({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onMutate: () => client.cancelQueries({ queryKey }),
      onSuccess: (response) => client.setQueryData(queryKey, response),
      onSettled: () => client.invalidateQueries({ queryKey }),
    },
  });
}
