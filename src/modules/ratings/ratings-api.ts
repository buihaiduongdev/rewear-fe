import { axiosClient } from '@/shared/api/axios-client';

type Envelope<T> = { data: T };

export type PublicShopRating = {
  id: string;
  shopId: string;
  stars: number;
  comment: string | null;
  mediaIds: string[];
  reply: string | null;
  revision: number;
  updatedAt: string;
  mode: 'EVIDENCE' | 'SIMULATION';
  verifiedTransaction: boolean;
};

export type PrivateShopRating = PublicShopRating & {
  orderId: string;
  replyRevision: number;
  commentHidden: boolean;
  mediaHidden: boolean;
  replyHidden: boolean;
  invalidated: boolean;
  createdAt: string;
};

export type ShopRatingPage = {
  summary: {
    mode: 'EVIDENCE' | 'SIMULATION';
    count: number;
    average: number | null;
    distribution: Record<string, number>;
    verifiedBuyerCount: number;
  };
  ratings: PublicShopRating[];
};

export const ratingsApi = {
  getShopRatings: (shopId: string, offset = 0) =>
    axiosClient.get<never, Envelope<ShopRatingPage>>(
      `/ratings/shops/${shopId}`,
      { params: { mode: 'EVIDENCE', offset } },
    ),
  getMyRatings: (offset = 0) =>
    axiosClient.get<never, Envelope<PrivateShopRating[]>>('/ratings/mine', {
      params: { offset },
    }),
  upsertRating: (input: {
    orderId: string;
    stars: number;
    comment?: string | null;
  }) =>
    axiosClient.post<never, Envelope<PrivateShopRating>>('/ratings', {
      orderId: input.orderId,
      stars: input.stars,
      comment: input.comment?.trim() ? input.comment.trim() : null,
      mediaIds: [],
    }),
};
