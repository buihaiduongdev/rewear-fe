import { Suspense } from 'react';

import { WalletPage } from '@/features/wallet/components/WalletPage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <span className="text-rewear-muted text-sm">Loading wallet…</span>
        </div>
      }
    >
      <WalletPage />
    </Suspense>
  );
}
