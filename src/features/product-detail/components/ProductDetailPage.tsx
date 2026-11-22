'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';

import {
  useProductControllerFindOne,
  useProductControllerFindAll
} from '@/shared/api/query-generated/products/products';
import { useMediaControllerFindAll } from '@/shared/api/query-generated/product-media/product-media';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { useAddCartItem, useCart } from '@/modules/cart/hooks/use-cart';
import { SaveToWishlistButton } from '@/modules/wishlist/components/SaveToWishlistButton';
import { formatCondition, formatPrice } from '@/shared/utils/product';
import { Button } from '@/shared/components/ui/button';
import { TOAST_DURATION_MS } from '@/shared/constants/toast';
import { useToastStore } from '@/shared/stores/toast.store';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { ProductDetailSkeleton } from '../skeletons/ProductDetailSkeleton';
import {
  ProductHowToMeasureModal
} from './ProductModals';

export function ProductDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const addToast = useToastStore((s) => s.addToast);
  const cart = useCart();
  const addCartItem = useAddCartItem();

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Modals state
  const [howToMeasureOpen, setHowToMeasureOpen] = useState(false);

  // 1. Fetch main product data
  const { data: productResponse, isLoading, isError } = useProductControllerFindOne(id);
  const product = productResponse?.data;

  // 2. Fetch full seller photography
  const { data: mediaResponse } = useMediaControllerFindAll(id, {
    query: { enabled: !!product?.id },
  });
  const mediaList = mediaResponse?.data ?? [];

  // 3. Fetch "More from this seller"
  const shopId = product?.shopId;
  const shopLogo = (product?.shop as { logoUrl?: string | null } | undefined)?.logoUrl;
  const { data: shopProductsResponse } = useProductControllerFindAll(
    shopId ? { 'filter.shopId': [`$eq:${shopId}`], limit: 5 } : undefined,
    {
      query: { enabled: !!shopId },
    },
  );

  // 4. Fetch fallback category products if seller has only 1 item
  const categoryId = product?.categoryId;
  const { data: categoryProductsResponse } = useProductControllerFindAll(
    categoryId ? { 'filter.categoryId': [`$eq:${categoryId}`], limit: 5 } : undefined,
    {
      query: { enabled: !!categoryId },
    },
  );

  // Prepare photos gallery
  const displayPhotos = mediaList.length > 0
    ? mediaList
    : product?.coverUrl
      ? [{ id: 'cover', url: product.coverUrl, position: 0 }]
      : [];

  const activePhotoUrl = displayPhotos[selectedMediaIndex]?.url ?? product?.coverUrl ?? null;

  // Related products (filter out current product)
  const sellerProducts = (shopProductsResponse?.data?.data || [])
    .filter((item) => item.id !== product?.id)
    .slice(0, 4);

  const relatedProducts = sellerProducts.length >= 2
    ? sellerProducts
    : (categoryProductsResponse?.data?.data || [])
        .filter((item) => item.id !== product?.id)
        .slice(0, 4);

  const isSoldOut = product?.status && product.status !== 'ACTIVE';
  const alreadyInCart = cart.data?.data.groups.some((group) =>
    group.items.some((item) => item.productId === product?.id),
  );

  const handleAddToCart = () => {
    if (!product) return;
    if (authStatus !== 'authenticated' || session?.error) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/products/${product.id}`)}`);
      return;
    }

    addCartItem.mutate(
      { productId: product.id, data: {} },
      {
        onSuccess: () => {
          addToast({
            type: 'success',
            title: 'Added to cart',
            description: [product.title, product.size].filter(Boolean).join(' · '),
            durationMs: TOAST_DURATION_MS.DEFAULT,
            href: '/cart',
            actionLabel: 'View cart',
          });
        },
        onError: (err) => {
          addToast({
            type: 'error',
            title: 'Could not add to cart',
            description: getApiErrorMessage(err),
            durationMs: TOAST_DURATION_MS.DEFAULT,
          });
        },
      },
    );
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (authStatus !== 'authenticated' || session?.error) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/checkout`)}`);
      return;
    }

    if (alreadyInCart) {
      router.push('/checkout');
      return;
    }

    try {
      setIsBuyingNow(true);
      await addCartItem.mutateAsync({ productId: product.id, data: {} });
      router.push('/checkout');
    } catch (err) {
      setIsBuyingNow(false);
      addToast({
        type: 'error',
        title: 'Could not process purchase',
        description: getApiErrorMessage(err),
        durationMs: TOAST_DURATION_MS.DEFAULT,
      });
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <div className="inline-flex size-16 items-center justify-center rounded-full bg-rewear-soft text-rewear-muted mb-4">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-rewear-text">
          Product not found
        </h1>
        <p className="mt-2 text-sm text-rewear-muted">
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

  const measurements = product.measurements || {};
  const hasMeasurements = Object.values(measurements).some(Boolean);
  const defects = product.defects || [];
  const hasNotes = Boolean(product.repairs || defects.length > 0);

  // Shop initials fallback
  const shopInitials = (product.shop?.name || 'S')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 pb-8 lg:pb-16 font-sans space-y-16">
      {/* 1. Breadcrumbs (Figma 53:755) */}
      <nav className="flex items-center gap-4 text-sm font-semibold">
        <Link href="/products" className="text-rewear-text hover:underline transition-colors">
          Shop
        </Link>
        <span className="text-rewear-muted">/</span>
        {product.category ? (
          <>
            <Link
              href={`/products?categoryId=${encodeURIComponent(product.category.id)}`}
              className="text-rewear-text hover:underline transition-colors"
            >
              {product.category.name}
            </Link>
            <span className="text-rewear-muted">/</span>
          </>
        ) : null}
        <span className="text-rewear-muted">
          {product.brand ? product.brand : product.title ?? 'Piece details'}
        </span>
      </nav>

      {/* 2. Main Editorial Stage: Two-Column Canvas (Figma 53:760 / 1:3581) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-14">
        {/* Left Column: Seller Photography Gallery */}
        <div className="space-y-4 md:col-span-6">
          {/* Main Stage Photo (Figma 53:762) */}
          <div className="bg-rewear-soft relative aspect-[4/5] w-full overflow-hidden border border-rewear-border">
            <ProductPhoto
              url={activePhotoUrl}
              title={product.title}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            {isSoldOut && (
              <div className="absolute top-4 left-4 bg-black/85 px-3 py-1.5 text-xs font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                {product.status === 'SOLD' ? 'Sold' : product.status === 'HELD' ? 'Reserved' : product.status}
              </div>
            )}
          </div>

          {/* Thumbnail Selector Strip (Figma 53:763) */}
          {displayPhotos.length > 1 && (
            <div className="space-y-3">
              <div className="flex gap-[15px] overflow-x-auto pb-1 scrollbar-thin">
                {displayPhotos.map((photo, index) => {
                  const isSelected = index === selectedMediaIndex;
                  return (
                    <button
                      key={`thumb-${photo.id || 'photo'}-${index}`}
                      type="button"
                      onClick={() => setSelectedMediaIndex(index)}
                      className={`relative size-[100px] sm:size-[120px] shrink-0 overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-rewear-text ring-1 ring-rewear-text'
                          : 'border-rewear-border opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`Inspect photo ${index + 1}`}
                    >
                      <ProductPhoto
                        url={photo.url}
                        title={`Thumbnail ${index + 1}`}
                        sizes="120px"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Complete Purchase Information */}
        <div className={`flex flex-col gap-6 md:col-span-6 ${displayPhotos.length > 1 ? 'md:pb-[136px]' : ''}`}>
          {/* Brand, Title & Price (Figma 53:771) */}
          <div className="space-y-4">
            {product.brand && (
              <span className="text-base text-rewear-text block">
                {product.brand}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-rewear-text leading-tight">
              {product.title ?? 'Untitled piece'}
            </h1>
            <div>
              <span className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-rewear-text leading-tight">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* Size & Condition Side-by-side (Figma 53:775) */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <span className="text-sm font-semibold text-rewear-muted block">
                Size
              </span>
              <p className="text-base font-medium text-rewear-text">
                {product.size || 'One size'}
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-semibold text-rewear-muted block">
                Condition
              </span>
              <p className="text-base font-medium text-rewear-text">
                {formatCondition(product.condition)}
              </p>
            </div>
          </div>

          {/* Seller Condition Disclosure / Seller's note (Figma 53:782) */}
          {hasNotes && (
            <div className="bg-rewear-soft p-5 space-y-2">
              <span className="text-sm font-semibold text-rewear-text block">
                Seller’s note
              </span>
              <p className="text-base text-rewear-text leading-normal">
                {[
                  product.repairs ? `Repairs: ${product.repairs}` : '',
                  defects.length > 0 ? `Disclosed flaws: ${defects.map((d) => d.description).join(', ')}` : '',
                ]
                  .filter(Boolean)
                  .join('. ')}
              </p>
            </div>
          )}

          {/* Purchase Actions (Figma 53:785) */}
          <div className="space-y-3 pt-2 md:mt-auto">
            <Button
              className="h-[52px] w-full rounded-none border-0 bg-rewear-accent text-rewear-text text-sm font-normal shadow-none hover:bg-rewear-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
              disabled={isSoldOut || addCartItem.isPending}
              loading={addCartItem.isPending && !isBuyingNow}
              onClick={handleAddToCart}
            >
              {isSoldOut ? 'Sold out / Reserved' : alreadyInCart ? 'Already in cart (Add another)' : 'Add to cart'}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                className="h-[52px] w-full rounded-none border-0 bg-rewear-soft text-rewear-text text-sm font-normal shadow-none hover:bg-rewear-soft/80 transition-colors disabled:opacity-50 cursor-pointer"
                disabled={isSoldOut || isBuyingNow || addCartItem.isPending}
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

      {/* Product description and measurements */}
      <div className="grid gap-10 bg-rewear-soft p-6 sm:p-10 md:grid-cols-2 md:gap-16">
        <section aria-label="Seller" className="md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-base font-semibold text-rewear-text">
              {shopLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shopLogo} alt="" className="size-full object-cover" />
              ) : shopInitials}
            </div>
            <h3 className="min-w-0 break-words text-xl font-semibold leading-snug text-rewear-text">
              {product.shopId ? (
                <Link
                  href={`/products?shopId=${encodeURIComponent(product.shopId)}`}
                  className="underline decoration-rewear-muted underline-offset-4 hover:decoration-rewear-text"
                >
                  {product.shop?.name || 'Seller'} <span aria-hidden="true">→</span>
                </Link>
              ) : (
                product.shop?.name || 'Seller'
              )}
            </h3>
          </div>
        </section>
        <section className="space-y-5">
          <h2 className="text-[28px] leading-[34px] font-semibold tracking-tight text-rewear-text">
            About this piece
          </h2>
          <p className="whitespace-pre-line text-base leading-relaxed text-rewear-text">
            {product.description || 'No detailed description provided by the seller.'}
          </p>
        </section>
        <section className="min-w-0 space-y-6">
          <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-rewear-text">
            Find your fit.
          </h2>

          {hasMeasurements ? (
            <div className="space-y-3">
              {measurements.chest ? (
                <div className="flex justify-between items-center text-base">
                  <span className="text-rewear-muted">Chest</span>
                  <span className="text-sm font-semibold text-rewear-text">{measurements.chest} cm</span>
                </div>
              ) : null}
              {measurements.length ? (
                <div className="flex justify-between items-center text-base">
                  <span className="text-rewear-muted">Length</span>
                  <span className="text-sm font-semibold text-rewear-text">{measurements.length} cm</span>
                </div>
              ) : null}
              {measurements.sleeve ? (
                <div className="flex justify-between items-center text-base">
                  <span className="text-rewear-muted">Sleeve</span>
                  <span className="text-sm font-semibold text-rewear-text">{measurements.sleeve} cm</span>
                </div>
              ) : null}
              {measurements.waist ? (
                <div className="flex justify-between items-center text-base">
                  <span className="text-rewear-muted">Waist</span>
                  <span className="text-sm font-semibold text-rewear-text">{measurements.waist} cm</span>
                </div>
              ) : null}
              {measurements.hip ? (
                <div className="flex justify-between items-center text-base">
                  <span className="text-rewear-muted">Hip</span>
                  <span className="text-sm font-semibold text-rewear-text">{measurements.hip} cm</span>
                </div>
              ) : null}
              {measurements.shoulder ? (
                <div className="flex justify-between items-center text-base">
                  <span className="text-rewear-muted">Shoulder</span>
                  <span className="text-sm font-semibold text-rewear-text">{measurements.shoulder} cm</span>
                </div>
              ) : null}
              {measurements.inseam ? (
                <div className="flex justify-between items-center text-base">
                  <span className="text-rewear-muted">Inseam</span>
                  <span className="text-sm font-semibold text-rewear-text">{measurements.inseam} cm</span>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-base text-rewear-muted">
              No measurements provided by the seller.
            </p>
          )}

          {hasMeasurements && <div>
            <button
              type="button"
              onClick={() => setHowToMeasureOpen(true)}
              className="text-sm font-semibold text-rewear-text hover:underline cursor-pointer"
            >
              How to measure ›
            </button>
          </div>}
        </section>
      </div>

      {/* 4. More from this seller / More to explore (Figma 53:821) */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-[36px] sm:text-[40px] font-semibold tracking-[-0.02em] text-rewear-text leading-[44px] sm:leading-[46px]">
              More to explore.
            </h2>
            {product.shopId && (
              <Link
                href={`/products?shopId=${encodeURIComponent(product.shopId)}`}
                className="text-sm font-semibold text-rewear-text hover:underline"
              >
                Browse all →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="group flex flex-col cursor-pointer"
              >
                <div className="bg-rewear-soft relative aspect-[278/348] w-full overflow-hidden border border-rewear-border">
                  <ProductPhoto
                    url={item.coverUrl}
                    title={item.title}
                    sizes="(min-width: 1024px) 278px, 50vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
                <div className="flex justify-between items-start gap-3 pt-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-base text-rewear-text line-clamp-2 leading-snug group-hover:underline">
                      {item.title ?? 'Untitled piece'}
                    </h3>
                    <p className="text-sm font-semibold text-rewear-muted">
                      {[item.size, formatCondition(item.condition)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-rewear-text shrink-0 pt-0.5">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 5. Mobile Sticky Bottom Action Bar (Figma 48:2655) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-rewear-border p-3.5 px-4 flex items-center justify-between gap-3 shadow-2xl">
        <div className="min-w-0">
          <span className="text-xs text-rewear-muted uppercase font-medium block">
            {product.size ? `Size ${product.size}` : 'Price'}
          </span>
          <span className="text-lg font-bold text-rewear-text">
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            className="h-10 px-4 rounded-none border-0 bg-rewear-accent text-rewear-text text-sm font-bold shadow-none hover:bg-rewear-accent/90 disabled:opacity-50 cursor-pointer"
            disabled={isSoldOut || addCartItem.isPending}
            loading={addCartItem.isPending && !isBuyingNow}
            onClick={handleAddToCart}
          >
            {isSoldOut ? 'Sold out' : 'Add to cart'}
          </Button>
          <Button
            variant="outline"
            className="h-10 px-4 rounded-none border border-rewear-text text-rewear-text text-sm font-bold bg-transparent hover:bg-rewear-text hover:text-white disabled:opacity-50 cursor-pointer"
            disabled={isSoldOut || isBuyingNow || addCartItem.isPending}
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
