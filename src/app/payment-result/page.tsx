import { Suspense } from 'react';

import { PaymentResultPage } from '@/features/payment/components/PaymentResultPage';

export default function Page() {
  return (
    <Suspense fallback={<p role="status">Loading payment…</p>}>
      <PaymentResultPage mode="result" />
    </Suspense>
  );
}
