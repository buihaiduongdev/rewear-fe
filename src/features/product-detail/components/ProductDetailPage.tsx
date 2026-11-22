'use client';

import { useState } from 'react';

import Link from 'next/link';

import { AddToCartAction } from '@/modules/cart/components/AddToCartAction';
import { ShopSummaryCard } from '@/modules/shop';
import { SaveToWishlistButton } from '@/modules/wishlist/components/SaveToWishlistButton';
import { useMediaControllerFindAll } from '@/shared/api/query-generated/product-media/product-media';
import { useProductControllerFindOne } from '@/shared/api/query-generated/products/products';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { TOAST_DURATION_MS } from '@/shared/constants/toast';
import { useToastStore } from '@/shared/stores/toast.store';
import { formatCondition, formatPrice } from '@/shared/utils/product';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  PackageCheck,
  Ruler,
  Share2,
  Truck,
} from 'lucide-react';

import { ProductDetailSkeleton } from '../skeletons/ProductDetailSkeleton';

export function ProductDetailPage({ id }: { id: string }) {
  const addToast = useToastStore((s) => s.addToast);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const {
    data: productResponse,
    isLoading,
    isError,
  } = useProductControllerFindOne(id);
  const { data: mediaResponse } = useMediaControllerFindAll(id);

  const product = productResponse?.data;
  const mediaList = mediaResponse?.data ?? [];

  // Combine cover and mediaList items if needed
  const displayPhotos =
    mediaList.length > 0
      ? mediaList
      : product?.coverUrl
        ? [{ id: 'cover', url: product.coverUrl, position: 0 }]
        : [];

  const activePhotoUrl =
    displayPhotos[selectedMediaIndex]?.url ?? product?.coverUrl ?? null;

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        addToast({
          type: 'success',
          title: 'Product link copied to clipboard',
          durationMs: TOAST_DURATION_MS.DEFAULT,
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Could not copy link',
        durationMs: TOAST_DURATION_MS.DEFAULT,
      });
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="bg-rewear-soft text-rewear-muted mb-4 inline-flex size-16 items-center justify-center rounded-full">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-rewear-text text-2xl font-bold tracking-tight">
          Piece not found
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
            Back to clothing
          </Button>
        </div>
      </div>
    );
  }

  const measurements = product.measurements;
  const hasMeasurements =
    measurements && Object.values(measurements).some(Boolean);
  const defects = product.defects || [];
  const shippingPkg = product.shippingPackage;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb & Navigation */}
      <nav className="text-rewear-muted mb-6 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Link
            href="/products"
            className="hover:text-rewear-text flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Clothing</span>
          </Link>
          <ChevronRight size={14} className="text-rewear-muted/50" />
          {product.category && (
            <>
              <span className="hover:text-rewear-text transition-colors">
                {product.category.name}
              </span>
              <ChevronRight size={14} className="text-rewear-muted/50" />
            </>
          )}
          <span className="text-rewear-text line-clamp-1 max-w-[200px] font-medium sm:max-w-xs">
            {product.title ?? 'Piece details'}
          </span>
        </div>

        <button
          onClick={handleShare}
          className="hover:bg-rewear-soft text-rewear-text flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors"
          title="Share piece"
        >
          {copied ? (
            <Check size={14} className="text-green-600" />
          ) : (
            <Share2 size={14} />
          )}
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>
      </nav>

      {/* Main Grid: Gallery & Details */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left Column: Gallery (7 cols on lg) */}
        <div className="space-y-4 lg:col-span-7">
          {/* Main Photo View */}
          <div className="bg-rewear-soft border-rewear-border relative aspect-[3/4] w-full overflow-hidden rounded-lg border">
            <ProductPhoto
              url={activePhotoUrl}
              title={product.title}
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            {product.status && product.status !== 'ACTIVE' && (
              <div className="absolute top-3 left-3 rounded bg-black/75 px-2.5 py-1 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-sm">
                {product.status === 'SOLD'
                  ? 'Sold'
                  : product.status === 'HELD'
                    ? 'Reserved'
                    : product.status}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {displayPhotos.length > 1 && (
            <div className="flex scrollbar-thin gap-3 overflow-x-auto pb-2">
              {displayPhotos.map((photo, index) => {
                const isSelected = index === selectedMediaIndex;
                return (
                  <button
                    key={photo.id || index}
                    onClick={() => setSelectedMediaIndex(index)}
                    className={`relative size-20 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                      isSelected
                        ? 'border-rewear-accent ring-rewear-accent/20 ring-2'
                        : 'border-rewear-border/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ProductPhoto
                      url={photo.url}
                      title={`Photo ${index + 1}`}
                      sizes="80px"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Actions & Information (5 cols on lg) */}
        <div className="flex flex-col space-y-6 lg:col-span-5">
          {/* Title & Price Header */}
          <div className="border-rewear-border space-y-2 border-b pb-5">
            <div className="flex items-center gap-2">
              {product.brand && (
                <span className="text-rewear-muted text-xs font-semibold tracking-wider uppercase">
                  {product.brand}
                </span>
              )}
              {product.condition && (
                <Badge variant="secondary">
                  {formatCondition(product.condition)}
                </Badge>
              )}
            </div>
            <h1 className="text-rewear-text text-2xl font-bold tracking-tight sm:text-3xl">
              {product.title ?? 'Untitled piece'}
            </h1>
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-rewear-text text-2xl font-extrabold">
                {formatPrice(product.price)}
              </span>
              {product.size && (
                <span className="text-rewear-muted text-sm">
                  Size:{' '}
                  <strong className="text-rewear-text">{product.size}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Key Attributes Pills */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="border-rewear-border rounded-lg border p-3">
              <span className="text-rewear-muted text-xs">Color</span>
              <p className="text-rewear-text font-medium">
                {product.color || 'Not specified'}
              </p>
            </div>
            <div className="border-rewear-border rounded-lg border p-3">
              <span className="text-rewear-muted text-xs">Condition</span>
              <p className="text-rewear-text font-medium">
                {formatCondition(product.condition) || 'Uncategorized'}
              </p>
            </div>
          </div>

          {/* Add to Cart & Save to Wishlist Actions */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <div className="flex-1">
              <AddToCartAction
                product={{
                  id: product.id,
                  title: product.title,
                  size: product.size,
                }}
                primary
              />
            </div>
            <div className="sm:w-48">
              <SaveToWishlistButton productId={product.id} />
            </div>
          </div>

          {/* Seller / Shop Information Card */}
          <ShopSummaryCard
            name={product.shop?.name || 'RE.WEAR Seller'}
            verified
          />

          {/* Description Section */}
          <div className="space-y-3">
            <h3 className="text-rewear-muted text-sm font-semibold tracking-wider uppercase">
              Description
            </h3>
            <div className="text-rewear-text text-sm leading-relaxed whitespace-pre-line">
              {product.description ||
                'The seller has not provided additional descriptions for this piece.'}
            </div>
          </div>

          {/* Measurements Specifications */}
          {hasMeasurements && (
            <div className="border-rewear-border space-y-3 rounded-lg border p-4">
              <div className="text-rewear-text flex items-center gap-2 text-sm font-semibold">
                <Ruler size={16} />
                <span>Measurements (cm)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                {measurements?.chest && (
                  <div>
                    Chest:{' '}
                    <strong className="text-rewear-text">
                      {measurements.chest} cm
                    </strong>
                  </div>
                )}
                {measurements?.waist && (
                  <div>
                    Waist:{' '}
                    <strong className="text-rewear-text">
                      {measurements.waist} cm
                    </strong>
                  </div>
                )}
                {measurements?.hip && (
                  <div>
                    Hips:{' '}
                    <strong className="text-rewear-text">
                      {measurements.hip} cm
                    </strong>
                  </div>
                )}
                {measurements?.length && (
                  <div>
                    Length:{' '}
                    <strong className="text-rewear-text">
                      {measurements.length} cm
                    </strong>
                  </div>
                )}
                {measurements?.shoulder && (
                  <div>
                    Shoulder:{' '}
                    <strong className="text-rewear-text">
                      {measurements.shoulder} cm
                    </strong>
                  </div>
                )}
                {measurements?.sleeve && (
                  <div>
                    Sleeve:{' '}
                    <strong className="text-rewear-text">
                      {measurements.sleeve} cm
                    </strong>
                  </div>
                )}
                {measurements?.inseam && (
                  <div>
                    Inseam:{' '}
                    <strong className="text-rewear-text">
                      {measurements.inseam} cm
                    </strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Defects & Repairs Note if any */}
          {(defects.length > 0 || product.repairs) && (
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                <AlertTriangle size={15} />
                <span>Condition notes & flaws</span>
              </div>
              {product.repairs && (
                <p className="text-xs">
                  <strong>Repairs:</strong> {product.repairs}
                </p>
              )}
              {defects.length > 0 && (
                <div className="space-y-1 text-xs">
                  <strong>Disclosed flaws:</strong>
                  <ul className="list-disc space-y-0.5 pl-4">
                    {defects.map((d, i) => (
                      <li key={i}>{d.description}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Shipping and Package specs */}
          {shippingPkg && (
            <div className="text-rewear-muted border-rewear-border flex items-center gap-3 border-t pt-4 text-xs">
              <Truck size={16} />
              <span>
                Package: {shippingPkg.weightGrams}g ({shippingPkg.lengthCm}x
                {shippingPkg.widthCm}x{shippingPkg.heightCm} cm)
              </span>
              <span className="ml-auto flex items-center gap-1">
                <PackageCheck size={14} />
                Inspection upon delivery
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
