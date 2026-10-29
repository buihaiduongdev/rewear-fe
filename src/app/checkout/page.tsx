import { Suspense } from 'react';

import { CheckoutPage } from '@/features/checkout/components/CheckoutPage';

export default function Page() {
  return (
    <Suspense fallback={<p role="status">Loading checkout…</p>}>
      <CheckoutPage />
    </Suspense>
  );
}
