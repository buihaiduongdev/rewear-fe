'use client';

import type { ShopControllerFindAll200DataItem } from '@/shared/api/models';
import { useProductControllerFindAll } from '@/shared/api/query-generated/products/products';

import { ProductPhoto } from './ProductPhoto';

export function ShopCard({
  shop,
  onExplore,
}: {
  shop: ShopControllerFindAll200DataItem;
  onExplore: (shopId: string) => void;
}) {
  const products = useProductControllerFindAll(
    { shopId: shop.id, pageSize: 3 },
    {
      query: { meta: { skipErrorToast: true } },
    },
  );
  const items = products.data?.data.items ?? [];

  return (
    <article className="flex min-w-0 flex-col gap-3 md:gap-5">
      <div className="grid grid-cols-3 gap-2">
        {items.length > 0 ? (
          items.map((product) => (
            <div
              key={product.id}
              className="bg-rewear-soft relative aspect-[114/128]"
            >
              <ProductPhoto
                url={product.coverUrl}
                title={product.title}
                sizes="(min-width: 1280px) 187px, (min-width: 768px) 15vw, 29vw"
              />
            </div>
          ))
        ) : (
          <div className="bg-rewear-soft text-rewear-muted col-span-3 flex min-h-32 items-center justify-center text-sm md:min-h-52">
            {products.isPending
              ? 'Loading shop clothing…'
              : products.isError
                ? 'Shop photos unavailable'
                : 'New pieces coming soon'}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:gap-6">
        <div className="min-w-0 space-y-2">
          <h3 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            {shop.name}
          </h3>
          {shop.description && (
            <p className="line-clamp-2 text-base leading-6">
              {shop.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onExplore(shop.id)}
          className="w-fit shrink-0 cursor-pointer text-left text-sm leading-5 font-semibold underline-offset-4 hover:underline max-md:min-h-11"
        >
          Explore shop <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}
