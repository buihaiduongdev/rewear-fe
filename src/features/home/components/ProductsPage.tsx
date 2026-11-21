'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

import { useDebounce } from '@/shared/hooks';

import { CartLink } from '@/modules/cart/components/CartLink';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPageSize,
  PaginationPrevious,
} from '@/shared/components/ui/pagination';
import { PRODUCT_CONDITION_LABELS } from '@/shared/utils/product';
import type { Product } from '@/shared/utils/product';
import { Dialog } from '@base-ui/react/dialog';

import { useHomeCatalog } from '../hooks/use-home-catalog';
import { ProductCard } from './ProductCard';
import { ProductFilterModal } from './ProductFilterModal';
import { ProductPreview } from './ProductPreview';
import { SectionState } from './SectionState';

const SORT_OPTIONS = [
  { label: 'Newest', value: '' },
  { label: 'Price: Low to high', value: 'price:ASC' },
  { label: 'Price: High to low', value: 'price:DESC' },
];

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | 'ellipsis')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [
      1,
      'ellipsis',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ];
}

export function ProductsPage() {
  const {
    search,
    categoryId,
    shopId,
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

  const [previewHandle] = useState(() => Dialog.createHandle<Product>());
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

  const hasFilters = Boolean(
    search ||
      categoryId ||
      shopId ||
      size ||
      condition ||
      minPrice ||
      maxPrice ||
      sortBy,
  );

  const activeFilterCount =
    (categoryId ? 1 : 0) +
    (size ? 1 : 0) +
    (condition ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0);

  const sortLabel =
    SORT_OPTIONS.find((opt) => opt.value === (sortBy || ''))?.label ?? 'Newest';

  return (
    <>
      <MarketplaceHeader
        cartAction={<CartLink />}
        search={search}
        onSearch={(value) => {
          setLocalSearch(value);
          updateFilters({ search: value || undefined });
        }}
      />
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1536px] px-4 py-8 md:px-12 md:py-12"
      >
        <section
          id="catalog-section"
          aria-labelledby="catalog-title"
          className="flex scroll-mt-6 flex-col gap-6 md:gap-8"
        >
          {/* Title - Figma 53:1053 */}
          <div className="flex items-center justify-between gap-6">
            <h1
              id="catalog-title"
              className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]"
            >
              All clothing
            </h1>
          </div>

          {/* Categories bar - Figma 53:1054 */}
          <div
            className="flex min-h-11 flex-wrap items-center gap-x-8 gap-y-2 text-sm leading-5 font-semibold"
            aria-label="Filter by category"
          >
            <button
              type="button"
              aria-pressed={!categoryId}
              onClick={() => updateFilters({ categoryId: undefined })}
              className="min-h-11 cursor-pointer underline-offset-4 aria-pressed:underline"
            >
              All clothing
            </button>
            {categories.data?.data.map((category) => (
              <button
                type="button"
                key={category.id}
                aria-pressed={categoryId === category.id}
                onClick={() => updateFilters({ categoryId: category.id })}
                className="min-h-11 cursor-pointer underline-offset-4 aria-pressed:underline"
              >
                {category.name}
              </button>
            ))}
            {categories.isError && (
              <button
                type="button"
                onClick={() => void categories.refetch()}
                className="text-rewear-muted min-h-11 cursor-pointer underline underline-offset-4"
              >
                Retry categories
              </button>
            )}
          </div>

          {/* Search and filters bar - Figma 53:1061 */}
          <div className="flex flex-col items-stretch justify-between gap-6 py-2 md:flex-row md:items-center">
            {/* Search Field - Figma 53:1062 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateFilters({ search: localSearch.trim() || undefined });
              }}
              className="bg-rewear-soft border-rewear-border focus-within:border-rewear-text flex h-12 w-full shrink-0 items-center gap-3 border px-4 transition-colors md:w-[420px]"
            >
              <label htmlFor="catalog-search" className="sr-only">
                Search clothing, brand or seller
              </label>
              <Search
                aria-hidden="true"
                className="text-rewear-muted size-4 shrink-0"
              />
              <input
                id="catalog-search"
                type="text"
                placeholder="Clothing, brand or seller"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="text-rewear-text placeholder:text-rewear-muted w-full bg-transparent text-sm leading-5 outline-none"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    updateFilters({ search: undefined });
                  }}
                  className="text-rewear-muted hover:text-rewear-text cursor-pointer text-xs"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </form>

            {/* Filter controls - Figma 53:1065 */}
            <div className="flex items-center gap-8 text-sm leading-5 font-semibold">
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className="text-rewear-text hover:opacity-70 cursor-pointer transition-opacity"
              >
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}{' '}
                ↓
              </button>

              <div className="relative" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => setIsSortOpen((prev) => !prev)}
                  className="text-rewear-text hover:opacity-70 cursor-pointer transition-opacity"
                >
                  Sort: {sortLabel} ↓
                </button>
                {isSortOpen && (
                  <div className="border-rewear-border bg-rewear-surface absolute right-0 top-full z-20 mt-2 min-w-[200px] border p-2 shadow-lg">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          updateFilters({ sortBy: opt.value || undefined });
                          setIsSortOpen(false);
                        }}
                        className={`w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors hover:bg-rewear-soft ${
                          (sortBy || '') === opt.value
                            ? 'bg-rewear-soft text-rewear-text font-semibold'
                            : 'text-rewear-muted'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active filter tags ribbon - Figma 1:2773 */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-rewear-muted mr-1 text-[11px] font-semibold tracking-wider uppercase">
                Filtered by:
              </span>
              {search && (
                <span className="bg-rewear-soft text-rewear-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
                  Search: “{search}”
                  <button
                    type="button"
                    onClick={() => {
                      setLocalSearch('');
                      updateFilters({ search: undefined });
                    }}
                    className="text-rewear-muted hover:text-rewear-text ml-0.5 cursor-pointer"
                    aria-label="Remove search filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {activeCategory && (
                <span className="bg-rewear-soft text-rewear-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
                  Category: {activeCategory.name}
                  <button
                    type="button"
                    onClick={() => updateFilters({ categoryId: undefined })}
                    className="text-rewear-muted hover:text-rewear-text ml-0.5 cursor-pointer"
                    aria-label="Remove category filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {size && (
                <span className="bg-rewear-soft text-rewear-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
                  Size: {size}
                  <button
                    type="button"
                    onClick={() => updateFilters({ size: undefined })}
                    className="text-rewear-muted hover:text-rewear-text ml-0.5 cursor-pointer"
                    aria-label="Remove size filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {condition && (
                <span className="bg-rewear-soft text-rewear-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
                  Condition:{' '}
                  {PRODUCT_CONDITION_LABELS[
                    condition as keyof typeof PRODUCT_CONDITION_LABELS
                  ] ?? condition}
                  <button
                    type="button"
                    onClick={() => updateFilters({ condition: undefined })}
                    className="text-rewear-muted hover:text-rewear-text ml-0.5 cursor-pointer"
                    aria-label="Remove condition filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="bg-rewear-soft text-rewear-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
                  Price:{' '}
                  {minPrice && maxPrice
                    ? `${Number(minPrice).toLocaleString('vi-VN')}₫ – ${Number(maxPrice).toLocaleString('vi-VN')}₫`
                    : minPrice
                      ? `From ${Number(minPrice).toLocaleString('vi-VN')}₫`
                      : `Up to ${Number(maxPrice).toLocaleString('vi-VN')}₫`}
                  <button
                    type="button"
                    onClick={() =>
                      updateFilters({ minPrice: undefined, maxPrice: undefined })
                    }
                    className="text-rewear-muted hover:text-rewear-text ml-0.5 cursor-pointer"
                    aria-label="Remove price filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {activeShop && (
                <span className="bg-rewear-soft text-rewear-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
                  Shop: {activeShop.name}
                  <button
                    type="button"
                    onClick={() => updateFilters({ shopId: undefined })}
                    className="text-rewear-muted hover:text-rewear-text ml-0.5 cursor-pointer"
                    aria-label="Remove shop filter"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                type="button"
                className="text-rewear-muted hover:text-rewear-text ml-2 cursor-pointer font-semibold underline underline-offset-4"
                onClick={() => {
                  setLocalSearch('');
                  updateFilters({
                    search: undefined,
                    categoryId: undefined,
                    shopId: undefined,
                    size: undefined,
                    condition: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                    sortBy: undefined,
                  });
                }}
              >
                Clear all
              </button>
              {meta && (
                <span className="text-rewear-muted ml-auto font-normal">
                  {meta.totalItems} {meta.totalItems === 1 ? 'piece' : 'pieces'}
                </span>
              )}
            </div>
          )}

          {/* Product grid / Empty / Error state */}
          <div aria-busy={products.isFetching}>
            {products.isError || products.isPending || items.length === 0 ? (
              <SectionState
                isPending={products.isPending}
                isError={products.isError}
                onRetry={() => void products.refetch()}
                emptyTitle={
                  hasFilters
                    ? 'No pieces found'
                    : 'Good pieces are on their way'
                }
                emptyDescription={
                  hasFilters
                    ? 'Try another search or clear your filters.'
                    : 'Check back soon for clothing from independent sellers.'
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 md:gap-x-6 md:gap-y-8">
                {items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    handle={previewHandle}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination - Figma 86:1606 */}
          {meta && (meta.totalItems ?? 0) > 0 && (
            <Pagination className="pt-6">
              <PaginationPageSize
                value={limit}
                options={[12, 24, 48]}
                onChange={(val) =>
                  updateFilters({ limit: String(val), page: '1' })
                }
              />

              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    disabled={page <= 1 || products.isFetching}
                    onClick={() => updateFilters({ page: String(page - 1) })}
                  />
                </PaginationItem>

                {getPageNumbers(page, meta.totalPages ?? 1).map((item, idx) => (
                  <PaginationItem key={idx}>
                    {item === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={page === item}
                        onClick={() => updateFilters({ page: String(item) })}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    disabled={
                      page >= (meta.totalPages ?? 1) || products.isFetching
                    }
                    onClick={() => updateFilters({ page: String(page + 1) })}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </section>
      </main>

      <MarketplaceFooter />
      <MobileNavigation cartAction={<CartLink />} />
      <ProductPreview handle={previewHandle} />

      {/* Filter Modal - Figma 48:143 / 48:2559 */}
      <ProductFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        categories={categories.data?.data ?? []}
        currentFilters={{
          categoryId: categoryId || undefined,
          size: size || undefined,
          condition: condition || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        }}
        onApply={(filters) => updateFilters(filters)}
      />
    </>
  );
}
