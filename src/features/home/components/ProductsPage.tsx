'use client';

import { useState } from 'react';

import { CartLink } from '@/modules/cart/components/CartLink';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import { Dialog } from '@base-ui/react/dialog';

import type { Product } from '@/shared/utils/product';
import { useHomeCatalog } from '../hooks/use-home-catalog';
import { ProductCard } from './ProductCard';
import { ProductPreview } from './ProductPreview';
import { SectionState } from './SectionState';

export function ProductsPage() {
  const {
    search,
    categoryId,
    shopId,
    page,
    categories,
    shops,
    products,
    updateFilters,
  } = useHomeCatalog(true);
  const [previewHandle] = useState(() => Dialog.createHandle<Product>());
  const items = products.data?.data.data ?? [];
  const meta = products.data?.data.meta;
  const activeShop = shops.data?.data.find(({ id }) => id === shopId);
  const hasFilters = Boolean(search || categoryId || shopId);
  return (
    <>
      <MarketplaceHeader
        cartAction={<CartLink />}
        search={search}
        onSearch={(value) => updateFilters({ search: value })}
      />
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1536px] px-4 py-8 md:px-12 md:py-12"
      >
        <section
          id="new-arrivals"
          aria-labelledby="arrivals-title"
          className="flex scroll-mt-6 flex-col gap-6 md:gap-8"
        >
          <div className="flex items-center justify-between gap-6">
            <h2
              id="arrivals-title"
              className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]"
            >
              Find your next piece.
            </h2>
          </div>
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
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <p role="status">
                {search && <>Search: “{search}” </>}
                {activeShop && <>Shop: {activeShop.name} </>}
                {meta && (
                  <>
                    · {meta.totalItems}{' '}
                    {meta.totalItems === 1 ? 'piece' : 'pieces'}
                  </>
                )}
              </p>
              <button
                type="button"
                className="min-h-11 cursor-pointer font-semibold underline underline-offset-4"
                onClick={() =>
                  updateFilters({
                    search: undefined,
                    categoryId: undefined,
                    shopId: undefined,
                  })
                }
              >
                Clear filters
              </button>
            </div>
          )}
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
    </>
  );
}
