'use client';

import { AddToCartAction } from '@/modules/cart/components/AddToCartAction';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import { formatCondition, formatPrice } from '@/shared/utils/product';
import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';

import type { HomeProduct } from '../lib/product';

export function ProductPreview({
  handle,
}: {
  handle: Dialog.Handle<HomeProduct>;
}) {
  return (
    <Dialog.Root handle={handle}>
      {({ payload: product }) => (
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Popup className="bg-rewear-surface text-rewear-text fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%-32px)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-6 outline-none md:p-8">
            <Dialog.Close
              className="bg-rewear-surface absolute top-3 right-3 z-10 flex size-11 cursor-pointer items-center justify-center"
              aria-label="Close product preview"
            >
              <X size={20} />
            </Dialog.Close>
            {product && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-rewear-soft relative aspect-[278/348]">
                  <ProductPhoto
                    url={product.coverUrl}
                    title={product.title}
                    sizes="(min-width: 768px) 340px, 80vw"
                  />
                </div>
                <div className="flex flex-col gap-4 md:pt-10">
                  <Dialog.Title className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
                    {product.title ?? 'Untitled piece'}
                  </Dialog.Title>
                  <p className="text-lg font-semibold">
                    {formatPrice(product.price)}
                  </p>
                  <Dialog.Description className="text-rewear-muted text-sm leading-5">
                    {[product.size, formatCondition(product.condition)]
                      .filter(Boolean)
                      .join(' · ')}
                  </Dialog.Description>
                  <p className="whitespace-pre-line">
                    {product.description || 'No additional description.'}
                  </p>
                  <p className="text-sm">
                    Sold by{' '}
                    {product.shop?.name ??
                      product.seller?.fullName ??
                      'an independent seller'}
                  </p>
                  <AddToCartAction product={product} primary />
                  {product.brand && (
                    <p className="text-sm">Brand: {product.brand}</p>
                  )}
                  {product.color && (
                    <p className="text-sm">Color: {product.color}</p>
                  )}
                </div>
              </div>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  );
}
