import { Suspense } from 'react';

import type { Metadata } from 'next';

import { LoginForm } from '@/features/access-account/components/forms/LoginForm';
import { LoginShell } from '@/features/access-account/components/LoginShell';
import {
  AUTH_ERROR_MESSAGES,
  type TAuthErrorCode,
} from '@/modules/auth/constants/auth.constant';

export const metadata: Metadata = {
  title: 'Sign in | RE.WEAR',
  description: 'Sign in to your RE.WEAR account.',
};

type TLoginPageProps = {
  searchParams: Promise<{
    error?: TAuthErrorCode;
    callbackUrl?: string;
  }>;
};

export default function LoginPage({ searchParams }: TLoginPageProps) {
  return (
    <LoginShell>
      <h1 className="text-[40px] leading-[46px] font-semibold tracking-[-0.8px]">
        Sign in
      </h1>
      <Suspense
        fallback={
          <p role="status" className="text-muted-foreground text-sm">
            Loading…
          </p>
        }
      >
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </LoginShell>
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
