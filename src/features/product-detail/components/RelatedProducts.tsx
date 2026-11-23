import Link from 'next/link';

import type { ProductControllerFindAll200DataDataItem } from '@/shared/api/models';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { formatCondition, formatPrice } from '@/shared/utils/product';

export function RelatedProducts({
  products,
  shopId,
}: {
  products: ProductControllerFindAll200DataDataItem[];
  shopId: string;
}) {
  return (
    <>
      {/* 4. More from this seller / More to explore (Figma 53:821) */}
      {products.length > 0 && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-rewear-text text-[36px] leading-[44px] font-semibold tracking-[-0.02em] sm:text-[40px] sm:leading-[46px]">
              More to explore.
            </h2>
            {shopId && (
              <Link
                href={`/products?shopId=${encodeURIComponent(shopId)}`}
                className="text-rewear-text text-sm font-semibold hover:underline"
              >
                Browse all →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {products.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="group flex cursor-pointer flex-col"
              >
                <div className="bg-rewear-soft border-rewear-border relative aspect-[278/348] w-full overflow-hidden border">
                  <ProductPhoto
                    url={item.coverUrl}
                    title={item.title}
                    sizes="(min-width: 1024px) 278px, 50vw"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                </div>
                <div className="flex items-start justify-between gap-3 pt-3">
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-rewear-text line-clamp-2 text-base leading-snug group-hover:underline">
                      {item.title ?? 'Untitled piece'}
                    </h3>
                    <p className="text-rewear-muted text-sm font-semibold">
                      {[item.size, formatCondition(item.condition)]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <span className="text-rewear-text shrink-0 pt-0.5 text-sm font-semibold">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
