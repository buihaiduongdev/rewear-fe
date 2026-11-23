'use client';

import { useState } from 'react';

import Link from 'next/link';

import { SaveToWishlistButton } from '@/modules/wishlist/components/SaveToWishlistButton';
import { Button } from '@/shared/components/ui/button';
import { formatCondition, formatPrice } from '@/shared/utils/product';
import { AlertTriangle } from 'lucide-react';

import { useProductDetail } from '../hooks/use-product-detail';
import { useProductPurchase } from '../hooks/use-product-purchase';
import { ProductDetailSkeleton } from '../skeletons/ProductDetailSkeleton';
import { ProductDetailsSection } from './ProductDetailsSection';
import { ProductGallery } from './ProductGallery';
import { ProductHowToMeasureModal } from './ProductModals';
import { RelatedProducts } from './RelatedProducts';

export function ProductDetailPage({ id }: { id: string }) {
  const [howToMeasureOpen, setHowToMeasureOpen] = useState(false);
  const {
    product,
    isLoading,
    isError,
    mediaList,
    displayPhotos,
    relatedProducts,
  } = useProductDetail(id);
  const {
    alreadyInCart,
    isBuyingNow,
    isPending,
    handleAddToCart,
    handleBuyNow,
  } = useProductPurchase(product);
  const isSoldOut = product?.status && product.status !== 'ACTIVE';

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <div className="bg-rewear-soft text-rewear-muted mb-4 inline-flex size-16 items-center justify-center rounded-full">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-rewear-text text-2xl font-bold tracking-tight">
          Product not found
        </h1>
        <p className="text-rewear-muted mt-2 text-sm">
          This piece may have been removed or the link is incorrect.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90"
            render={<Link href="/products" />}
            nativeButton={false}
          >
            Back to catalog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-10 pb-8 font-sans sm:px-6 lg:px-8 lg:pb-16">
      {/* 1. Breadcrumbs (Figma 53:755) */}
      <nav className="flex items-center gap-4 text-sm font-semibold">
        <Link
          href="/products"
          className="text-rewear-text transition-colors hover:underline"
        >
          Shop
        </Link>
        <span className="text-rewear-muted">/</span>
        {product.category ? (
          <>
            <Link
              href={`/products?categoryId=${encodeURIComponent(product.category.id)}`}
              className="text-rewear-text transition-colors hover:underline"
            >
              {product.category.name}
            </Link>
            <span className="text-rewear-muted">/</span>
          </>
        ) : null}
        <span className="text-rewear-muted">
          {product.brand ? product.brand : (product.title ?? 'Piece details')}
        </span>
      </nav>

      {/* 2. Main Editorial Stage: Two-Column Canvas (Figma 53:760 / 1:3581) */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8 lg:gap-14">
        <ProductGallery
          product={product}
          photos={displayPhotos}
          isSoldOut={isSoldOut}
        />

        {/* Right Column: Complete Purchase Information */}
        <div
          className={`flex flex-col gap-6 md:col-span-6 ${displayPhotos.length > 1 ? 'md:pb-[136px]' : ''}`}
        >
          {/* Brand, Title & Price (Figma 53:771) */}
          <div className="space-y-4">
            <h1 className="text-rewear-text text-3xl leading-tight font-semibold tracking-[-0.02em] sm:text-4xl">
              {product.title ?? 'Untitled piece'}
            </h1>
            <div>
              <span className="text-rewear-text text-3xl leading-tight font-semibold tracking-[-0.02em] sm:text-4xl">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* Size & Condition Side-by-side (Figma 53:775) */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <span className="text-rewear-muted block text-sm font-semibold">
                Size
              </span>
              <p className="text-rewear-text text-base font-medium">
                {product.size || 'One size'}
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-rewear-muted block text-sm font-semibold">
                Condition
              </span>
              <p className="text-rewear-text text-base font-medium">
                {formatCondition(product.condition)}
              </p>
            </div>
            {product.category?.name && (
              <div className="space-y-1.5">
                <span className="text-rewear-muted block text-sm font-semibold">
                  Category
                </span>
                <p className="text-rewear-text text-base font-medium">
                  {product.category.name}
                </p>
              </div>
            )}
            {product.brand && (
              <div className="space-y-1.5">
                <span className="text-rewear-muted block text-sm font-semibold">
                  Brand
                </span>
                <p className="text-rewear-text text-base font-medium">
                  {product.brand}
                </p>
              </div>
            )}
            {product.color && (
              <div className="space-y-1.5">
                <span className="text-rewear-muted block text-sm font-semibold">
                  Color
                </span>
                <p className="text-rewear-text text-base font-medium">
                  {product.color}
                </p>
              </div>
            )}
          </div>

          {/* Purchase Actions (Figma 53:785) */}
          <div className="space-y-3 pt-2 md:mt-auto">
            <Button
              className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 h-[52px] w-full cursor-pointer rounded-none border-0 text-sm font-normal shadow-none transition-colors disabled:opacity-50"
              disabled={isSoldOut || isPending}
              loading={isPending && !isBuyingNow}
              onClick={handleAddToCart}
            >
              {isSoldOut
                ? 'Sold out / Reserved'
                : alreadyInCart
                  ? 'Already in cart (Add another)'
                  : 'Add to cart'}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                className="bg-rewear-soft text-rewear-text hover:bg-rewear-soft/80 h-[52px] w-full cursor-pointer rounded-none border-0 text-sm font-normal shadow-none transition-colors disabled:opacity-50"
                disabled={isSoldOut || isBuyingNow || isPending}
                loading={isBuyingNow}
                onClick={handleBuyNow}
              >
                {isSoldOut ? 'Unavailable' : 'Buy now'}
              </Button>
              <SaveToWishlistButton productId={product.id} />
            </div>
          </div>
        </div>
      </div>

      <ProductDetailsSection
        product={product}
        media={mediaList}
        onHowToMeasure={() => setHowToMeasureOpen(true)}
      />

      <RelatedProducts products={relatedProducts} shopId={product.shopId} />

      {/* 5. Mobile Sticky Bottom Action Bar (Figma 48:2655) */}
      <div
        data-product-purchase-bar
        className="border-rewear-border fixed right-0 bottom-0 left-0 z-40 flex items-center justify-between gap-3 border-t bg-white p-3.5 px-4 shadow-2xl lg:hidden"
      >
        <div className="min-w-0">
          <span className="text-rewear-muted block text-xs font-medium uppercase">
            {product.size ? `Size ${product.size}` : 'Price'}
          </span>
          <span className="text-rewear-text text-lg font-bold">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 h-10 cursor-pointer rounded-none border-0 px-4 text-sm font-bold shadow-none disabled:opacity-50"
            disabled={isSoldOut || isPending}
            loading={isPending && !isBuyingNow}
            onClick={handleAddToCart}
          >
            {isSoldOut ? 'Sold out' : 'Add to cart'}
          </Button>
          <Button
            variant="outline"
            className="border-rewear-text text-rewear-text hover:bg-rewear-text h-10 cursor-pointer rounded-none border bg-transparent px-4 text-sm font-bold hover:text-white disabled:opacity-50"
            disabled={isSoldOut || isBuyingNow || isPending}
            loading={isBuyingNow}
            onClick={handleBuyNow}
          >
            Buy now
          </Button>
        </div>
      </div>

      {/* Modals */}
      <ProductHowToMeasureModal
        isOpen={howToMeasureOpen}
        onClose={() => setHowToMeasureOpen(false)}
        product={product}
      />
    </div>
  );
}
