import { Suspense } from 'react';

import type { Metadata } from 'next';

import { VerifyEmailForm } from '@/features/access-account/components/forms/VerifyEmailForm';

type TVerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export const metadata: Metadata = { title: 'Verify your email | RE.WEAR' };

export default function VerifyEmailPage({
  searchParams,
}: TVerifyEmailPageProps) {
  return (
    <>
      <div className="flex flex-col gap-6">
        <h1>Verify your email</h1>
        <p className="text-muted-foreground">
          Confirm your email address to activate your Rewear account.
        </p>
      </div>

      <Suspense
        fallback={
          <p role="status" className="text-muted-foreground">
            Loading…
          </p>
        }
      >
        <VerifyEmailContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function VerifyEmailContent({ searchParams }: TVerifyEmailPageProps) {
  const { token } = await searchParams;

  return <VerifyEmailForm token={token} />;
}
