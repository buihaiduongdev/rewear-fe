import { Suspense } from 'react';

import type { Metadata } from 'next';

import { ResetPasswordForm } from '@/features/access-account/components/forms/ResetPasswordForm';

type TResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export const metadata: Metadata = { title: 'Choose a new password | RE.WEAR' };

export default function ResetPasswordPage({
  searchParams,
}: TResetPasswordPageProps) {
  return (
    <>
      <div className="flex flex-col gap-6">
        <h1>Choose a new password</h1>
        <p className="text-muted-foreground">
          Use a strong password you do not use elsewhere.
        </p>
      </div>

      <Suspense
        fallback={
          <p role="status" className="text-muted-foreground">
            Loading…
          </p>
        }
      >
        <ResetPasswordContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ResetPasswordContent({ searchParams }: TResetPasswordPageProps) {
  const { token } = await searchParams;

  return <ResetPasswordForm token={token} />;
}
