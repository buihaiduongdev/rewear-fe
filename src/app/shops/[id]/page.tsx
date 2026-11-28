import { Suspense } from 'react';

import type { Metadata } from 'next';

import { ShopStorefrontPage } from '@/features/shop-storefront/components/ShopStorefrontPage';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: 'Shop storefront | RE.WEAR',
    description: `Browse curated secondhand clothing from shop ${id} on RE.WEAR.`,
  };
}

async function ShopStorefrontContent({ params }: Props) {
  const { id } = await params;
  return <ShopStorefrontPage shopId={id} />;
}

export default function ShopStorefrontRoute({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="text-rewear-muted flex min-h-dvh items-center justify-center text-sm">
          Loading shop storefront…
        </div>
      }
    >
      <ShopStorefrontContent params={params} />
    </Suspense>
  );
}
