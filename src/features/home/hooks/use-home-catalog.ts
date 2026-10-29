'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useCategoryControllerFindAll } from '@/shared/api/query-generated/categories/categories';
import { useProductControllerFindAll } from '@/shared/api/query-generated/products/products';
import { useShopControllerFindAll } from '@/shared/api/query-generated/shops/shops';
import { keepPreviousData } from '@tanstack/react-query';

export function useHomeCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const shopId = searchParams.get('shopId') ?? '';
  const pageValue = Number(searchParams.get('page') ?? 1);
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const expanded = searchParams.get('view') === 'all';
  const categories = useCategoryControllerFindAll({
    query: { meta: { skipErrorToast: true } },
  });
  const shops = useShopControllerFindAll({
    query: { meta: { skipErrorToast: true } },
  });
  const products = useProductControllerFindAll(
    {
      page,
      pageSize: expanded ? 12 : 4,
      sortBy: 'publishedAt',
      order: 'DESC',
      ...(search ? { search } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(shopId ? { shopId } : {}),
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
    next.delete('page');
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const query = next.toString();
    router.replace(`${query ? `/?${query}` : '/'}#new-arrivals`, {
      scroll: false,
    });
    document
      .getElementById('new-arrivals')
      ?.scrollIntoView({ behavior: 'instant' });
  }

  return {
    search,
    categoryId,
    shopId,
    page,
    expanded,
    categories,
    shops,
    products,
    updateFilters,
  };
}
