import { Suspense } from 'react';

import { BuyerOrderDetailPage } from '@/features/orders/components/BuyerOrderDetailPage';
import { OrderDetailSkeleton } from '@/features/orders/skeletons/OrderDetailSkeleton';

interface Props {
  params: Promise<{ id: string }>;
}

async function OrderDetailContent({ params }: Props) {
  const { id } = await params;
  return <BuyerOrderDetailPage id={id} />;
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={<OrderDetailSkeleton fullPage />}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}
