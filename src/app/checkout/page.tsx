import { Suspense } from 'react';

import { CheckoutPage } from '@/features/checkout/components/CheckoutPage';
import { CheckoutSkeleton } from '@/features/checkout/components/CheckoutSkeleton';

export default function Page() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutPage />
    </Suspense>
  );
}
