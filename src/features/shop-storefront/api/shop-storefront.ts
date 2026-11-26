import { orvalRequest } from '@/shared/api/orval-request';

export type PublicShopRatingItem = {
  id: string;
  shopId: string;
  stars: number;
  comment: string | null;
  reply: string | null;
  updatedAt: string;
  verifiedTransaction: boolean;
};

export type PublicShopRatingSummary = {
  mode: string;
  count: number;
  average: number | null;
  distribution: Record<string, number>;
  verifiedBuyerCount: number;
};

export type PublicShopRatingsResponse = {
  statusCode: number;
  message: string;
  data: {
    summary: PublicShopRatingSummary;
    ratings: PublicShopRatingItem[];
  };
};

export type ShopFollowState = {
  shopId: string;
  following: boolean;
  followedAt: string | null;
};

export type ShopFollowStateResponse = {
  statusCode: number;
  message: string;
  data: ShopFollowState;
};

export function fetchPublicShopRatings(shopId: string, signal?: AbortSignal) {
  return orvalRequest<PublicShopRatingsResponse>({
    url: `/api/ratings/shops/${shopId}`,
    method: 'GET',
    params: { mode: 'EVIDENCE', offset: 0 },
    signal,
  });
}

export function fetchShopFollowState(shopId: string, signal?: AbortSignal) {
  return orvalRequest<ShopFollowStateResponse>({
    url: `/api/shop-follows/shops/${shopId}`,
    method: 'GET',
    signal,
  });
}

export function followShop(shopId: string) {
  return orvalRequest<ShopFollowStateResponse>({
    url: `/api/shop-follows/shops/${shopId}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data: {},
  });
}

export function unfollowShop(shopId: string) {
  return orvalRequest<ShopFollowStateResponse>({
    url: `/api/shop-follows/shops/${shopId}`,
    method: 'DELETE',
  });
}
