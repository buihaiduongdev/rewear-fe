'use client';

import Link from 'next/link';

import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import {
  formatCondition,
  formatPrice,
  type Product,
} from '@/shared/utils/product';

export function ProductCard({
  product,
  onSelectShop,
}: {
  product: Product;
  onSelectShop?: (shopId: string) => void;
}) {
  const logoUrl =
    (product.shop as { logoUrl?: string | null } | undefined)?.logoUrl ?? null;

  const shopElement =
    product.shop?.name && onSelectShop ? (
      <>
        <button
          type="button"
          onClick={() => onSelectShop(product.shop.id)}
          className="hover:text-rewear-text inline-flex cursor-pointer items-center gap-1.5 align-middle hover:underline"
          title={`Filter by @${product.shop.name}`}
        >
          <span className="border-rewear-border bg-rewear-text text-rewear-accent relative inline-flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full text-[9px] font-bold">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={product.shop.name}
                className="size-full object-cover"
              />
            ) : (
              product.shop.name.charAt(0).toUpperCase()
            )}
          </span>
          <span>@{product.shop.name}</span>
        </button>
        {' · '}
      </>
    ) : null;

  return (
    <article className="min-w-0">
      <Link
        href={`/products/${product.id}`}
        aria-label={`View ${product.title ?? 'Untitled piece'}`}
        className="group block outline-offset-4"
      >
        <div className="bg-rewear-soft relative aspect-[278/348] w-full overflow-hidden">
          <ProductPhoto url={product.coverUrl} title={product.title} />
        </div>
      </Link>
      <div className="mt-3 flex w-full min-w-0 flex-col gap-3 md:mt-3.5 md:flex-row">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="line-clamp-2 min-h-12 text-base leading-6">
            <Link href={`/products/${product.id}`} className="hover:underline">
              {product.title ?? 'Untitled piece'}
            </Link>
          </h3>
          <p className="text-rewear-muted hidden text-sm leading-5 font-semibold md:block">
            {shopElement}
            {[product.size, formatCondition(product.condition)]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <p className="shrink-0 text-base leading-6 md:text-sm md:leading-5 md:font-semibold">
          {formatPrice(product.price)}
        </p>
        <p className="text-rewear-muted text-sm leading-5 font-semibold md:hidden">
          {shopElement}
          {[product.size, formatCondition(product.condition)]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
    </article>
  );
}
