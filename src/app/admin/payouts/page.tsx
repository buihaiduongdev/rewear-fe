import { Suspense } from 'react';

import { AdminPayoutsPage } from '@/features/admin-payouts/components/AdminPayoutsPage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <span className="text-rewear-muted text-sm">
            Loading admin withdrawals…
          </span>
        </div>
      }
    >
      <AdminPayoutsPage />
    </Suspense>
  );
}
