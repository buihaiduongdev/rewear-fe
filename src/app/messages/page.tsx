import { Suspense } from 'react';

import { BuyerMessagesPage } from '@/features/messages/components/BuyerMessagesPage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <span className="text-rewear-muted text-sm">Loading messages…</span>
        </div>
      }
    >
      <BuyerMessagesPage />
    </Suspense>
  );
}
