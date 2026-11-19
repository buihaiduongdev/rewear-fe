import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductDetailPage } from '@/features/product-detail/components/ProductDetailPage';
import { ProductDetailSkeleton } from '@/features/product-detail/skeletons/ProductDetailSkeleton';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Sản phẩm | RE.WEAR`,
    description: `Chi tiết sản phẩm ${id} trên sàn thời trang cũ RE.WEAR`,
  };
}

async function ProductDetailContent({ params }: Props) {
  const { id } = await params;
  return <ProductDetailPage id={id} />;
}

export default function ProductDetailRoute({ params }: Props) {
  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh [--foreground:var(--color-rewear-text)] [--muted-foreground:var(--color-rewear-muted)]">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailContent params={params} />
      </Suspense>
    </div>
  );
}
