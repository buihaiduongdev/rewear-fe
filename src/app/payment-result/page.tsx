import { Suspense } from 'react';

import { PaymentResultPage } from '@/features/checkout/components/PaymentResultPage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <span className="text-rewear-muted text-sm">
            Checking payment status…
          </span>
        </div>
      }
    >
      <PaymentResultPage />
    </Suspense>
  );
}
