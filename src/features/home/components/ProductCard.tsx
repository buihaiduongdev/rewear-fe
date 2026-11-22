'use client';

import { useSyncExternalStore } from 'react';

import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import {
  formatCondition,
  formatPrice,
  type Product,
} from '@/shared/utils/product';
import { Dialog } from '@base-ui/react/dialog';

function subscribeToStorage(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getShopLogo(shopId: string | undefined): string | null {
  if (typeof window === 'undefined' || !shopId) return null;
  try {
    return localStorage.getItem(`rewear_shop_logo_${shopId}`);
  } catch {
    return null;
  }
}

export function ProductCard({
  product,
  handle,
  onSelectShop,
}: {
  product: Product;
  handle: Dialog.Handle<Product>;
  onSelectShop?: (shopId: string) => void;
}) {
  const shopId = product.shop?.id;
  const localLogo = useSyncExternalStore(
    subscribeToStorage,
    () => getShopLogo(shopId),
    () => null,
  );
  const logoUrl =
    (product.shop as { logoUrl?: string | null } | undefined)?.logoUrl ??
    localLogo;

  const shopElement = product.shop?.name ? (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onSelectShop?.(product.shop.id);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            onSelectShop?.(product.shop.id);
          }
        }}
        className="hover:text-rewear-text inline-flex items-center gap-1.5 cursor-pointer hover:underline align-middle"
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
      </span>
      {' · '}
    </>
  ) : null;

  return (
    <article className="min-w-0">
      <Dialog.Trigger
        handle={handle}
        payload={product}
        className="group flex w-full cursor-pointer flex-col gap-3 text-left outline-offset-4 md:gap-3.5"
        aria-label={`View ${product.title ?? 'Untitled piece'}`}
      >
        <div className="bg-rewear-soft relative aspect-[278/348] w-full overflow-hidden">
          <ProductPhoto url={product.coverUrl} title={product.title} />
        </div>
        <div className="flex w-full min-w-0 flex-col gap-3 md:flex-row md:gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <h3 className="line-clamp-2 min-h-12 text-base leading-6 group-hover:underline">
              {product.title ?? 'Untitled piece'}
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
      </Dialog.Trigger>
    </article>
  );
}
