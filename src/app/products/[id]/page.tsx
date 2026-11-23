import { Suspense } from 'react';

import type { Metadata } from 'next';

import { ProductDetailPage } from '@/features/product-detail/components/ProductDetailPage';
import { ProductDetailShell } from '@/features/product-detail/components/ProductDetailShell';
import { ProductDetailSkeleton } from '@/features/product-detail/skeletons/ProductDetailSkeleton';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Piece | RE.WEAR`,
    description: `Pre-owned clothing piece ${id} on RE.WEAR`,
  };
}

async function ProductDetailContent({ params }: Props) {
  const { id } = await params;
  return <ProductDetailPage id={id} />;
}

export default function ProductDetailRoute({ params }: Props) {
  return (
    <ProductDetailShell>
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailContent params={params} />
      </Suspense>
    </ProductDetailShell>
  );
}
