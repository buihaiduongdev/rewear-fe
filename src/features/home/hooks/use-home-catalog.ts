'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { ProductControllerFindAllSortByItem } from '@/shared/api/models';
import { useCategoryControllerFindAll } from '@/shared/api/query-generated/categories/categories';
import { useProductControllerFindAll } from '@/shared/api/query-generated/products/products';
import { useShopControllerFindAll } from '@/shared/api/query-generated/shops/shops';
import { keepPreviousData } from '@tanstack/react-query';

export function useHomeCatalog(catalog = false) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const shopId = searchParams.get('shopId') ?? '';
  const size = searchParams.get('size') ?? '';
  const condition = searchParams.get('condition') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const sortBy = searchParams.get('sortBy') ?? '';
  const pageValue = Number(searchParams.get('page') ?? 1);
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const categories = useCategoryControllerFindAll({
    query: { meta: { skipErrorToast: true } },
  });
  const shops = useShopControllerFindAll({
    query: { meta: { skipErrorToast: true } },
  });
  const validSortBy =
    sortBy && sortBy in ProductControllerFindAllSortByItem
      ? [sortBy as ProductControllerFindAllSortByItem]
      : undefined;

  const priceFilters: string[] = [];
  if (minPrice) priceFilters.push(`$gte:${minPrice}`);
  if (maxPrice) priceFilters.push(`$lte:${maxPrice}`);

  const products = useProductControllerFindAll(
    {
      page,
      limit: catalog ? 12 : 4,
      ...(search ? { search } : {}),
      ...(categoryId ? { 'filter.categoryId': [categoryId] } : {}),
      ...(shopId ? { 'filter.shopId': [shopId] } : {}),
      ...(size ? { 'filter.size': [`$ilike:${size}`] } : {}),
      ...(condition ? { 'filter.condition': [condition] } : {}),
      ...(priceFilters.length > 0 ? { 'filter.price': priceFilters } : {}),
      ...(validSortBy ? { sortBy: validSortBy } : {}),
    },
    {
      query: {
        placeholderData: keepPreviousData,
        meta: { skipErrorToast: true },
      },
    },
  );

  function updateFilters(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    if (!('page' in updates)) next.delete('page');
    next.delete('view');
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    const url = query ? `/products?${query}` : '/products';
    if (catalog) router.replace(url, { scroll: false });
    else router.push(url);
  }

  return {
    search,
    categoryId,
    shopId,
    size,
    condition,
    minPrice,
    maxPrice,
    sortBy,
    page,
    categories,
    shops,
    products,
    updateFilters,
  };
}
