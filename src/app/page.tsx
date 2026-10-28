import { Suspense } from 'react';

import type { Metadata } from 'next';

import { HomePage } from '@/features/home/components/HomePage';

export const metadata: Metadata = {
  title: 'RE.WEAR — Good pieces. Next chapter.',
  description:
    'Discover pre-owned clothing from independent sellers across Vietnam. Find your next piece on RE.WEAR.',
};

export default function Home() {
  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh [--foreground:var(--color-rewear-text)] [--muted-foreground:var(--color-rewear-muted)]">
      <Suspense
        fallback={
          <div
            role="status"
            className="flex min-h-screen items-center justify-center"
          >
            Loading RE.WEAR…
          </div>
        }
      >
        <HomePage />
      </Suspense>
    </div>
  );
}
