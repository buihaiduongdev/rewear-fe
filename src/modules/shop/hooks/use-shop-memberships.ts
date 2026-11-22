import { useShopControllerFindMine } from '@/shared/api/query-generated/shops/shops';

export const shopMembershipsQueryKey = ['pickup-shop-memberships'] as const;

export function useShopMemberships(
  enabled: boolean,
  userId: string | undefined,
) {
  return useShopControllerFindMine({
    query: {
      enabled,
      queryKey: [...shopMembershipsQueryKey, userId],
    },
  });
}
