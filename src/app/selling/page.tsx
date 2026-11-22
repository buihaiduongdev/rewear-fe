import * as React from 'react';
import { SellerDashboardPage } from '@/features/seller-dashboard/components/SellerDashboardPage';

export default function Page() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <span className="text-rewear-muted text-sm">
            Loading seller workspace...
          </span>
        </div>
      }
    >
      <SellerDashboardPage />
    </React.Suspense>
  );
}
