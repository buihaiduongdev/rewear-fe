'use client';

import { useMediaControllerFindAll } from '@/shared/api/query-generated/product-media/product-media';
import {
  useProductControllerFindAll,
  useProductControllerFindOne,
} from '@/shared/api/query-generated/products/products';

export function useProductDetail(id: string) {
  // 1. Fetch main product data
  const {
    data: productResponse,
    isLoading,
    isError,
  } = useProductControllerFindOne(id);
  const product = productResponse?.data;

  // 2. Fetch full seller photography
  const { data: mediaResponse } = useMediaControllerFindAll(id, {
    query: { enabled: !!product?.id },
  });
  const mediaList = mediaResponse?.data ?? [];

  // 3. Fetch "More from this seller"
  const shopId = product?.shopId;
  const { data: shopProductsResponse } = useProductControllerFindAll(
    shopId ? { 'filter.shopId': [`$eq:${shopId}`], limit: 5 } : undefined,
    {
      query: { enabled: !!shopId },
    },
  );

  // 4. Fetch fallback category products if seller has only 1 item
  const categoryId = product?.categoryId;
  const { data: categoryProductsResponse } = useProductControllerFindAll(
    categoryId
      ? { 'filter.categoryId': [`$eq:${categoryId}`], limit: 5 }
      : undefined,
    {
      query: { enabled: !!categoryId },
    },
  );

  // Prepare photos gallery
  const displayPhotos =
    mediaList.length > 0
      ? mediaList
      : product?.coverUrl
        ? [{ id: 'cover', url: product.coverUrl, position: 0 }]
        : [];

  // Related products (filter out current product)
  const sellerProducts = (shopProductsResponse?.data?.data || [])
    .filter((item) => item.id !== product?.id)
    .slice(0, 4);

  const relatedProducts =
    sellerProducts.length >= 2
      ? sellerProducts
      : (categoryProductsResponse?.data?.data || [])
          .filter((item) => item.id !== product?.id)
          .slice(0, 4);

  return {
    product,
    isLoading,
    isError,
    mediaList,
    displayPhotos,
    relatedProducts,
  };
}
