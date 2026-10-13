import { Suspense } from 'react';

import { ResetPasswordForm } from '@/features/access-account/components/forms/ResetPasswordForm';

type TResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default function ResetPasswordPage({
  searchParams,
}: TResetPasswordPageProps) {
  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-foreground mb-2 text-2xl font-semibold tracking-tight">
          Choose a new password
        </h1>
        <p className="text-muted-foreground text-sm">
          Use a strong password you do not use elsewhere.
        </p>
      </div>

      <Suspense
        fallback={
          <p role="status" className="text-muted-foreground text-sm">
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
