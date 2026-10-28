'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@base-ui/react/dialog';
import { useSession } from 'next-auth/react';

import { useHomeCatalog } from '../hooks/use-home-catalog';
import type { HomeProduct } from '../lib/product';
import { MarketplaceFooter } from './MarketplaceFooter';
import { MarketplaceHeader } from './MarketplaceHeader';
import { ProductCard } from './ProductCard';
import { ProductPreview } from './ProductPreview';
import { SectionState } from './SectionState';
import { ShopCard } from './ShopCard';

const primaryButtonClass =
  'h-[52px] w-full rounded-none border-0 bg-rewear-accent px-5 py-3 text-sm leading-5 font-normal text-rewear-text shadow-none hover:bg-rewear-accent/90 md:w-52';

function SellAction() {
  const { status } = useSession();
  return status === 'authenticated' ? (
    <Button
      disabled
      className={primaryButtonClass}
      title="Listing tools are coming soon"
    >
      Start selling
    </Button>
  ) : (
    <Button
      render={<Link href="/register" />}
      nativeButton={false}
      className={primaryButtonClass}
    >
      Start selling
    </Button>
  );
}

export function HomePage() {
  const {
    search,
    categoryId,
    shopId,
    page,
    expanded,
    categories,
    shops,
    products,
    updateFilters,
  } = useHomeCatalog();
  const { status: sessionStatus } = useSession();
  const [previewHandle] = useState(() => Dialog.createHandle<HomeProduct>());
  const items = products.data?.data.items ?? [];
  const meta = products.data?.data.meta;
  const shopItems = shops.data?.data.slice(0, 2) ?? [];
  const activeShop = shops.data?.data.find(({ id }) => id === shopId);
  const hasFilters = Boolean(search || categoryId || shopId);
  const browseAll = () =>
    updateFilters({
      view: 'all',
      search: undefined,
      categoryId: undefined,
      shopId: undefined,
    });

  return (
    <>
      <MarketplaceHeader
        search={search}
        onSearch={(value) =>
          updateFilters({ search: value, shopId: undefined, view: 'all' })
        }
      />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-[1536px] flex-col gap-6 px-4 py-4 md:gap-[88px] md:px-12 md:py-12"
      >
        <section
          aria-labelledby="home-title"
          className="flex flex-col gap-6 md:flex-row md:gap-16"
        >
          <div className="flex flex-col items-start gap-6 md:min-h-[660px] md:min-w-0 md:flex-[592] md:justify-center md:gap-7">
            <h1
              id="home-title"
              className="text-[40px] leading-[46px] font-semibold tracking-[-0.02em] lg:text-[64px] lg:leading-[68px]"
            >
              Good pieces.
              <br />
              Next chapter.
            </h1>
            <p className="hidden text-base leading-6 md:block">
              Discover pre-owned clothing from
              <br />
              independent sellers across Vietnam.
            </p>
            <p className="text-base leading-6 md:hidden">
              Pre-owned clothing. Ready to wear.
            </p>
            <div className="flex w-full items-center gap-7">
              <Button
                render={<a href="#new-arrivals" />}
                nativeButton={false}
                className={primaryButtonClass}
              >
                Explore clothing
              </Button>
              {sessionStatus !== 'authenticated' && (
                <Link
                  href="/register"
                  className="hidden shrink-0 text-sm leading-5 font-semibold hover:underline md:block"
                >
                  Start selling <span aria-hidden="true">↗</span>
                </Link>
              )}
            </div>
          </div>
          <div className="relative aspect-[358/448] w-full md:aspect-[528/660] md:min-w-0 md:flex-[528]">
            <Image
              src="/images/home/editorial.png"
              alt="Pre-owned wool outerwear, styled for its next chapter"
              fill
              preload
              sizes="(min-width: 1536px) 656px, (min-width: 768px) 44vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>

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
              {hasFilters ? 'Find your next piece.' : 'Just landed.'}
            </h2>
            <button
              type="button"
              onClick={browseAll}
              className="hidden min-h-11 shrink-0 cursor-pointer text-sm leading-5 font-semibold hover:underline md:block"
            >
              Browse all clothing <span aria-hidden="true">→</span>
            </button>
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
                    · {meta.total} {meta.total === 1 ? 'piece' : 'pieces'}
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
          {expanded && meta && meta.totalPage > 1 && (
            <nav
              aria-label="Product pages"
              className="flex items-center justify-center gap-6 text-sm font-semibold"
            >
              <button
                type="button"
                disabled={!meta.hasPreviousPage || products.isFetching}
                onClick={() => updateFilters({ page: String(page - 1) })}
                className="min-h-11 cursor-pointer disabled:cursor-default disabled:opacity-40"
              >
                ← Previous
              </button>
              <p aria-live="polite">
                Page {page} of {meta.totalPage}
              </p>
              <button
                type="button"
                disabled={!meta.hasNextPage || products.isFetching}
                onClick={() => updateFilters({ page: String(page + 1) })}
                className="min-h-11 cursor-pointer disabled:cursor-default disabled:opacity-40"
              >
                Next →
              </button>
            </nav>
          )}
          <button
            type="button"
            onClick={browseAll}
            className="min-h-11 w-fit cursor-pointer text-sm font-semibold hover:underline md:hidden"
          >
            Browse all clothing <span aria-hidden="true">→</span>
          </button>
        </section>

        <section
          aria-labelledby="shops-title"
          className="flex flex-col gap-6 md:gap-8"
        >
          <h2
            id="shops-title"
            className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]"
          >
            <span className="md:hidden">Independent shops</span>
            <span className="hidden md:inline">Find your kind of shop.</span>
          </h2>
          <div>
            {shops.isError || shops.isPending || shopItems.length === 0 ? (
              <SectionState
                isPending={shops.isPending}
                isError={shops.isError}
                onRetry={() => void shops.refetch()}
                emptyTitle="Meet your next favourite shop, soon"
                emptyDescription="Independent shops will appear here when they open."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                {shopItems.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    onExplore={(id) =>
                      updateFilters({
                        shopId: id,
                        categoryId: undefined,
                        search: undefined,
                        view: 'all',
                      })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section
          aria-label="Start selling"
          className="bg-rewear-text md:text-rewear-text flex flex-col gap-6 p-6 text-white md:relative md:min-h-[400px] md:flex-row md:gap-0 md:bg-transparent md:p-0"
        >
          <h2 className="order-first text-[40px] leading-[46px] font-semibold tracking-[-0.02em] md:hidden">
            Make room.
            <br />
            Pass it on.
          </h2>
          <div className="relative h-[180px] w-full md:aspect-[592/400] md:h-auto md:w-1/2">
            <Image
              src="/images/home/selling.png"
              alt="Clothing rails inside an independent secondhand shop"
              fill
              sizes="(min-width: 1536px) 720px, (min-width: 768px) 50vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="md:bg-rewear-soft flex flex-col items-start gap-6 md:w-1/2 md:justify-center md:p-12">
            <h2 className="hidden text-[40px] leading-[46px] font-semibold tracking-[-0.02em] md:block">
              Make room.
              <br />
              Pass it on.
            </h2>
            <p className="text-base leading-6">
              Give the pieces you no longer wear
              <br className="hidden lg:block" /> a place in someone else’s
              wardrobe.
            </p>
            <SellAction />
          </div>
        </section>
      </main>
      <MarketplaceFooter />
      <nav
        aria-label="Mobile navigation"
        className="grid grid-cols-3 gap-3.5 px-4 py-4 text-sm leading-5 font-semibold md:hidden"
      >
        <Link
          href="/"
          aria-current="page"
          className="bg-rewear-soft flex min-h-11 items-center px-3"
        >
          Home
        </Link>
        <a
          href="#new-arrivals"
          className="bg-rewear-soft flex min-h-11 items-center px-3"
        >
          Shop
        </a>
        <button
          type="button"
          disabled
          title="Your cart is coming soon"
          className="bg-rewear-soft min-h-11 px-3 text-left"
        >
          Cart
        </button>
      </nav>
      <ProductPreview handle={previewHandle} />
    </>
  );
}
