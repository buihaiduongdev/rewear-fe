import { Suspense } from 'react';

import Link from 'next/link';

import { LoginForm } from '@/features/access-account/components/forms/LoginForm';
import { AUTH_ERROR_MESSAGES } from '@/modules/auth/constants/auth.constant';
import { AUTH_ROUTES } from '@/modules/auth/constants/route.constant';
import { TAuthErrorCode } from '@/modules/auth/types';

type TLoginPageProps = {
  searchParams: Promise<{
    error?: TAuthErrorCode;
    callbackUrl?: string;
  }>;
};

export default function LoginPage({ searchParams }: TLoginPageProps) {
  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-foreground mb-2 text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm">
          Log in to your Rewear account
        </p>
      </div>

      <Suspense
        fallback={
          <p role="status" className="text-muted-foreground text-sm">
            Loading…
          </p>
        }
      >
        <LoginContent searchParams={searchParams} />
      </Suspense>

      <p className="text-muted-foreground mt-8 text-center text-sm">
        Don’t have an account?{' '}
        <Link
          href={AUTH_ROUTES.REGISTER}
          className="text-primary font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}

async function LoginContent({ searchParams }: TLoginPageProps) {
  const { error, callbackUrl } = await searchParams;

  return (
    <LoginForm
      authError={
        error
          ? (AUTH_ERROR_MESSAGES[error] ?? AUTH_ERROR_MESSAGES.AppDefault)
          : undefined
      }
      callbackUrl={callbackUrl}
    />
  );
}
