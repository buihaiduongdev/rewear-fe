'use client';

import { useEffect, useRef, useState } from 'react';

import { CartLink } from '@/modules/cart/components/CartLink';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
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

export function ProductsPage() {
  const {
    search,
    categoryId,
    shopId,
    size,
    condition,
    maxPrice,
    sortBy,
    page,
    categories,
    shops,
    products,
    updateFilters,
  } = useHomeCatalog(true);

  const [previewHandle] = useState(() => Dialog.createHandle<Product>());
  const [prevSearch, setPrevSearch] = useState(search);
  const [localSearch, setLocalSearch] = useState(search);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  if (prevSearch !== search) {
    setPrevSearch(search);
    setLocalSearch(search);
  }

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
    search || categoryId || shopId || size || condition || maxPrice || sortBy,
  );

  const activeFilterCount =
    (categoryId ? 1 : 0) +
    (size ? 1 : 0) +
    (condition ? 1 : 0) +
    (maxPrice ? 1 : 0);

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
              className="bg-rewear-card flex h-20 w-full shrink-0 flex-col justify-between p-3 px-4 md:w-[440px]"
            >
              <label
                htmlFor="catalog-search"
                className="text-rewear-text text-sm leading-5 font-semibold"
              >
                Search
              </label>
              <div className="flex items-center justify-between gap-2">
                <input
                  id="catalog-search"
                  type="text"
                  placeholder="Clothing, brand or seller"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="text-rewear-text placeholder:text-rewear-muted w-full bg-transparent text-base leading-6 outline-none"
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
              </div>
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
                        className={`w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors hover:bg-rewear-card ${
                          (sortBy || '') === opt.value
                            ? 'bg-rewear-card text-rewear-text font-semibold'
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
                <span className="bg-rewear-card text-rewear-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
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
                <span className="bg-rewear-card text-rewear-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
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
                <span className="bg-rewear-card text-rewear-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
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
                <span className="bg-rewear-card text-rewear-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
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
              {maxPrice && (
                <span className="bg-rewear-card text-rewear-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
                  Price: Up to {Number(maxPrice).toLocaleString('vi-VN')}₫
                  <button
                    type="button"
                    onClick={() => updateFilters({ maxPrice: undefined })}
                    className="text-rewear-muted hover:text-rewear-text ml-0.5 cursor-pointer"
                    aria-label="Remove price filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {activeShop && (
                <span className="bg-rewear-card text-rewear-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
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

          {/* Pagination */}
          {meta && (meta.totalPages ?? 1) > 1 && (
            <nav
              aria-label="Product pages"
              className="flex items-center justify-center gap-6 text-sm font-semibold"
            >
              <button
                type="button"
                disabled={page <= 1 || products.isFetching}
                onClick={() => updateFilters({ page: String(page - 1) })}
                className="min-h-11 cursor-pointer disabled:cursor-default disabled:opacity-40"
              >
                ← Previous
              </button>
              <p aria-live="polite">
                Page {page} of {meta.totalPages}
              </p>
              <button
                type="button"
                disabled={page >= (meta.totalPages ?? 1) || products.isFetching}
                onClick={() => updateFilters({ page: String(page + 1) })}
                className="min-h-11 cursor-pointer disabled:cursor-default disabled:opacity-40"
              >
                Next →
              </button>
            </nav>
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
          maxPrice: maxPrice || undefined,
        }}
        onApply={(filters) => updateFilters(filters)}
        onReset={() =>
          updateFilters({
            categoryId: undefined,
            size: undefined,
            condition: undefined,
            maxPrice: undefined,
          })
        }
      />
    </>
  );
}
