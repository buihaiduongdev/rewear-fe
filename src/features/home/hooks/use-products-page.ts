'use client';

import { useEffect, useRef, useState } from 'react';

import { useProvinces } from '@/modules/address/hooks/use-administrative-divisions';
import { useDebounce } from '@/shared/hooks';

import { useHomeCatalog } from './use-home-catalog';

export const SORT_OPTIONS = [
  { label: 'Newest', value: '' },
  { label: 'Price: Low to high', value: 'price:ASC' },
  { label: 'Price: High to low', value: 'price:DESC' },
];

export function useProductsPage() {
  const {
    search,
    categoryId,
    shopId,
    provinceId,
    size,
    condition,
    minPrice,
    maxPrice,
    sortBy,
    page,
    limit,
    categories,
    shops,
    products,
    updateFilters,
  } = useHomeCatalog(true);

  const provinces = useProvinces({ skipErrorToast: true });

  const [prevSearch, setPrevSearch] = useState(search);
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch.trim(), 350);
  const isInitialMount = useRef(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  if (prevSearch !== search) {
    setPrevSearch(search);
    setLocalSearch(search);
  }

  // Auto-update filter when user pauses typing
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const current = (search ?? '').trim();
    if (debouncedSearch !== current) {
      updateFilters({ search: debouncedSearch || undefined });
    }
  }, [debouncedSearch, search, updateFilters]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const items = products.data?.data.data ?? [];
  const meta = products.data?.data.meta;
  const activeShop = shops.data?.data.find(({ id }) => id === shopId);
  const activeCategory = categories.data?.data.find(
    ({ id }) => id === categoryId,
  );
  const activeProvince = provinces.data?.data.find(
    ({ id }) => String(id) === provinceId,
  );

  const hasFilters = Boolean(
    search ||
    categoryId ||
    shopId ||
    provinceId ||
    size ||
    condition ||
    minPrice ||
    maxPrice ||
    sortBy,
  );

  const activeFilterCount =
    (categoryId ? 1 : 0) +
    (shopId ? 1 : 0) +
    (provinceId ? 1 : 0) +
    (size ? 1 : 0) +
    (condition ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0);

  const sortLabel =
    SORT_OPTIONS.find((opt) => opt.value === (sortBy || ''))?.label ?? 'Newest';

  return {
    search,
    categoryId,
    shopId,
    provinceId,
    size,
    condition,
    minPrice,
    maxPrice,
    sortBy,
    page,
    limit,
    categories,
    shops,
    provinces,
    products,
    updateFilters,
    localSearch,
    setLocalSearch,
    isFilterModalOpen,
    setIsFilterModalOpen,
    isSortOpen,
    setIsSortOpen,
    sortRef,
    items,
    meta,
    activeShop,
    activeCategory,
    activeProvince,
    hasFilters,
    activeFilterCount,
    sortLabel,
  };
}
