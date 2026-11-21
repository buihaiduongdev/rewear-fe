import { Suspense } from 'react';

import { PickupAddressPage } from '@/features/pickup/components/PickupAddressPage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="bg-rewear-surface text-rewear-muted min-h-dvh p-12 text-sm">
          Loading pickup settings…
        </div>
      }
    >
      <PickupAddressPage />
    </Suspense>
  );
}
