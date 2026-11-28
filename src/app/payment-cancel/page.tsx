import { Suspense } from 'react';

import { PaymentCancelPage } from '@/features/checkout/components/PaymentCancelPage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <span className="text-rewear-muted text-sm">Loading…</span>
        </div>
      }
    >
      <PaymentCancelPage />
    </Suspense>
  );
}
