import { Suspense } from 'react';

import { VerifyEmailForm } from '@/features/access-account/components/forms/VerifyEmailForm';

type TVerifyEmailPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default function VerifyEmailPage({
  searchParams,
}: TVerifyEmailPageProps) {
  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-foreground mb-2 text-2xl font-semibold tracking-tight">
          Verify your email
        </h1>
        <p className="text-muted-foreground text-sm">
          Confirm your email address to activate your Rewear account.
        </p>
      </div>

      <Suspense
        fallback={
          <p role="status" className="text-muted-foreground text-sm">
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
