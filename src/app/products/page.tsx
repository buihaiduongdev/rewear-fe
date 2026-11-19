import { Suspense } from 'react';

import type { Metadata } from 'next';

import { ProductsPage } from '@/features/home/components/ProductsPage';
import { CatalogSkeleton } from '@/features/home/skeletons/CatalogSkeleton';

export const metadata: Metadata = { title: 'Clothing | RE.WEAR' };

export default function Products() {
  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh [--foreground:var(--color-rewear-text)] [--muted-foreground:var(--color-rewear-muted)]">
      <Suspense fallback={<CatalogSkeleton />}>
        <ProductsPage />
      </Suspense>
    </div>
  );
}
