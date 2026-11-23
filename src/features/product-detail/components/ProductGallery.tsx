'use client';

import { useState } from 'react';

import type { ProductControllerFindOne200Data } from '@/shared/api/models';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';

type Props = {
  product: ProductControllerFindOne200Data;
  photos: { id: string; url: string }[];
  isSoldOut: boolean | undefined;
};

export function ProductGallery({
  product,
  photos: displayPhotos,
  isSoldOut,
}: Props) {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const activePhotoUrl =
    displayPhotos[selectedMediaIndex]?.url ?? product.coverUrl ?? null;
  return (
    <>
      {/* Left Column: Seller Photography Gallery */}
      <div className="space-y-4 md:col-span-6">
        {/* Main Stage Photo (Figma 53:762) */}
        <div className="bg-rewear-soft border-rewear-border relative aspect-[4/5] w-full overflow-hidden border">
          <ProductPhoto
            url={activePhotoUrl}
            title={product.title}
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          {isSoldOut && (
            <div className="absolute top-4 left-4 bg-black/85 px-3 py-1.5 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-xs">
              {product.status === 'SOLD'
                ? 'Sold'
                : product.status === 'HELD'
                  ? 'Reserved'
                  : product.status}
            </div>
          )}
        </div>

        {/* Thumbnail Selector Strip (Figma 53:763) */}
        {displayPhotos.length > 1 && (
          <div className="space-y-3">
            <div className="flex scrollbar-thin gap-[15px] overflow-x-auto pb-1">
              {displayPhotos.map((photo, index) => {
                const isSelected = index === selectedMediaIndex;
                return (
                  <button
                    key={`thumb-${photo.id || 'photo'}-${index}`}
                    type="button"
                    onClick={() => setSelectedMediaIndex(index)}
                    className={`relative size-[100px] shrink-0 cursor-pointer overflow-hidden border-2 transition-all sm:size-[120px] ${
                      isSelected
                        ? 'border-rewear-text ring-rewear-text ring-1'
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
    </>
  );
}
