'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Ruler, 
  AlertTriangle, 
  Truck, 
  PackageCheck, 
  Share2, 
  Check,
  ChevronRight
} from 'lucide-react';

import { useProductControllerFindOne } from '@/shared/api/query-generated/products/products';
import { useMediaControllerFindAll } from '@/shared/api/query-generated/product-media/product-media';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { AddToCartAction } from '@/modules/cart/components/AddToCartAction';
import { ShopSummaryCard } from '@/modules/shop';
import { formatCondition, formatPrice } from '@/shared/utils/product';
import { Button } from '@/shared/components/ui/button';
import { TOAST_DURATION_MS } from '@/shared/constants/toast';
import { useToastStore } from '@/shared/stores/toast.store';
import { ProductDetailSkeleton } from '../skeletons/ProductDetailSkeleton';

export function ProductDetailPage({ id }: { id: string }) {
  const addToast = useToastStore((s) => s.addToast);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const { data: productResponse, isLoading, isError } = useProductControllerFindOne(id);
  const { data: mediaResponse } = useMediaControllerFindAll(id);

  const product = productResponse?.data;
  const mediaList = mediaResponse?.data ?? [];

  // Combine cover and mediaList items if needed
  const displayPhotos = mediaList.length > 0 
    ? mediaList 
    : product?.coverUrl 
      ? [{ id: 'cover', url: product.coverUrl, position: 0 }] 
      : [];

  const activePhotoUrl = displayPhotos[selectedMediaIndex]?.url ?? product?.coverUrl ?? null;

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        addToast({
          type: 'success',
          title: 'Đã sao chép liên kết sản phẩm',
          durationMs: TOAST_DURATION_MS.DEFAULT,
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Không thể sao chép liên kết',
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
        <div className="inline-flex size-16 items-center justify-center rounded-full bg-rewear-soft text-rewear-muted mb-4">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-rewear-text">
          Không tìm thấy sản phẩm
        </h1>
        <p className="mt-2 text-sm text-rewear-muted">
          Sản phẩm có thể đã bị gỡ hoặc đường dẫn không chính xác.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90"
            render={<Link href="/products" />}
            nativeButton={false}
          >
            Quay lại danh mục
          </Button>
        </div>
      </div>
    );
  }

  const measurements = product.measurements;
  const hasMeasurements = measurements && Object.values(measurements).some(Boolean);
  const defects = product.defects || [];
  const shippingPkg = product.shippingPackage;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb & Navigation */}
      <nav className="mb-6 flex items-center justify-between text-sm text-rewear-muted">
        <div className="flex items-center space-x-2">
          <Link href="/products" className="hover:text-rewear-text flex items-center gap-1 transition-colors">
            <ArrowLeft size={16} />
            <span>Danh mục</span>
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
          <span className="line-clamp-1 max-w-[200px] text-rewear-text font-medium sm:max-w-xs">
            {product.title ?? 'Chi tiết món đồ'}
          </span>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium hover:bg-rewear-soft text-rewear-text transition-colors"
          title="Chia sẻ sản phẩm"
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Share2 size={14} />}
          <span>{copied ? 'Đã sao chép' : 'Chia sẻ'}</span>
        </button>
      </nav>

      {/* Main Grid: Gallery & Details */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left Column: Gallery (7 cols on lg) */}
        <div className="space-y-4 lg:col-span-7">
          {/* Main Photo View */}
          <div className="bg-rewear-soft relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-rewear-border">
            <ProductPhoto
              url={activePhotoUrl}
              title={product.title}
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            {product.status && product.status !== 'ACTIVE' && (
              <div className="absolute top-3 left-3 rounded bg-black/75 px-2.5 py-1 text-xs font-semibold text-white uppercase tracking-wider backdrop-blur-sm">
                {product.status === 'SOLD' ? 'Đã bán' : product.status === 'HELD' ? 'Đang giữ hàng' : product.status}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {displayPhotos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {displayPhotos.map((photo, index) => {
                const isSelected = index === selectedMediaIndex;
                return (
                  <button
                    key={photo.id || index}
                    onClick={() => setSelectedMediaIndex(index)}
                    className={`relative size-20 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                      isSelected
                        ? 'border-rewear-accent ring-2 ring-rewear-accent/20'
                        : 'border-rewear-border/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ProductPhoto
                      url={photo.url}
                      title={`Ảnh nhỏ ${index + 1}`}
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
          <div className="space-y-2 border-b border-rewear-border pb-5">
            <div className="flex items-center gap-2">
              {product.brand && (
                <span className="text-xs font-semibold uppercase tracking-wider text-rewear-muted">
                  {product.brand}
                </span>
              )}
              {product.condition && (
                <span className="inline-flex items-center rounded-full bg-rewear-soft px-2.5 py-0.5 text-xs font-medium text-rewear-text">
                  {formatCondition(product.condition)}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-rewear-text sm:text-3xl">
              {product.title ?? 'Untitled piece'}
            </h1>
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl font-extrabold text-rewear-text">
                {formatPrice(product.price)}
              </span>
              {product.size && (
                <span className="text-sm text-rewear-muted">
                  Kích cỡ: <strong className="text-rewear-text">{product.size}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Key Attributes Pills */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-rewear-border p-3">
              <span className="text-xs text-rewear-muted">Màu sắc</span>
              <p className="font-medium text-rewear-text">{product.color || 'Chưa cập nhật'}</p>
            </div>
            <div className="rounded-lg border border-rewear-border p-3">
              <span className="text-xs text-rewear-muted">Tình trạng</span>
              <p className="font-medium text-rewear-text">
                {formatCondition(product.condition) || 'Chưa phân loại'}
              </p>
            </div>
          </div>

          {/* Add to Cart Primary Action */}
          <div className="pt-2">
            <AddToCartAction
              product={{
                id: product.id,
                title: product.title,
                size: product.size,
              }}
              primary
            />
          </div>

          {/* Seller / Shop Information Card */}
          <ShopSummaryCard
            name={product.shop?.name || 'Người bán RE.WEAR'}
            verified
          />

          {/* Description Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-rewear-muted">
              Mô tả chi tiết
            </h3>
            <div className="whitespace-pre-line text-sm leading-relaxed text-rewear-text">
              {product.description || 'Người bán chưa cung cấp thêm mô tả chi tiết cho sản phẩm này.'}
            </div>
          </div>

          {/* Measurements Specifications */}
          {hasMeasurements && (
            <div className="space-y-3 rounded-lg border border-rewear-border p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-rewear-text">
                <Ruler size={16} />
                <span>Số đo chi tiết (cm)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                {measurements?.chest && (
                  <div>Vòng ngực: <strong className="text-rewear-text">{measurements.chest} cm</strong></div>
                )}
                {measurements?.waist && (
                  <div>Vòng eo: <strong className="text-rewear-text">{measurements.waist} cm</strong></div>
                )}
                {measurements?.hip && (
                  <div>Vòng mông: <strong className="text-rewear-text">{measurements.hip} cm</strong></div>
                )}
                {measurements?.length && (
                  <div>Chiều dài: <strong className="text-rewear-text">{measurements.length} cm</strong></div>
                )}
                {measurements?.shoulder && (
                  <div>Rộng vai: <strong className="text-rewear-text">{measurements.shoulder} cm</strong></div>
                )}
                {measurements?.sleeve && (
                  <div>Dài tay: <strong className="text-rewear-text">{measurements.sleeve} cm</strong></div>
                )}
                {measurements?.inseam && (
                  <div>Đáy quần (inseam): <strong className="text-rewear-text">{measurements.inseam} cm</strong></div>
                )}
              </div>
            </div>
          )}

          {/* Defects & Repairs Note if any */}
          {(defects.length > 0 || product.repairs) && (
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                <AlertTriangle size={15} />
                <span>Lưu ý tình trạng & Lỗi nhỏ</span>
              </div>
              {product.repairs && (
                <p className="text-xs">
                  <strong>Đã sửa chữa:</strong> {product.repairs}
                </p>
              )}
              {defects.length > 0 && (
                <div className="space-y-1 text-xs">
                  <strong>Lỗi được ghi nhận:</strong>
                  <ul className="list-disc pl-4 space-y-0.5">
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
            <div className="flex items-center gap-3 text-xs text-rewear-muted border-t border-rewear-border pt-4">
              <Truck size={16} />
              <span>
                Đóng gói: {shippingPkg.weightGrams}g ({shippingPkg.lengthCm}x{shippingPkg.widthCm}x{shippingPkg.heightCm} cm)
              </span>
              <span className="flex items-center gap-1 ml-auto">
                <PackageCheck size={14} />
                Kiểm hàng trước khi nhận
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
