import { axiosClient } from '@/shared/api/axios-client';

type Envelope<T> = { data: T };

export type ShopFollowState = {
  shopId: string;
  following: boolean;
  followedAt: string | null;
};

export const shopFollowApi = {
  getState: (shopId: string) =>
    axiosClient.get<never, Envelope<ShopFollowState>>(
      `/shop-follows/shops/${shopId}`,
    ),
  follow: (shopId: string) =>
    axiosClient.put<never, Envelope<ShopFollowState>>(
      `/shop-follows/shops/${shopId}`,
      {},
    ),
  unfollow: (shopId: string) =>
    axiosClient.delete<never, Envelope<ShopFollowState>>(
      `/shop-follows/shops/${shopId}`,
    ),
};
