'use client';

import Link from 'next/link';

import { AUTH_ROUTES } from '@/modules/auth/constants/route.constant';
import { Button } from '@/shared/components/ui/button';
import { EmailInput } from '@/shared/components/ui/input/EmailInput';

import { useVerifyEmail } from '../../hooks/use-verify-email';

type TVerifyEmailFormProps = {
  token?: string;
};

export function VerifyEmailForm({ token }: TVerifyEmailFormProps) {
  const {
    errors,
    isSubmitting,
    isSubmitDisabled,
    isVerifying,
    canVerify,
    isVerified,
    isResent,
    register,
    resend,
    verify,
  } = useVerifyEmail(token);

  if (canVerify) {
    return (
      <div className="flex flex-col gap-6">
        <Button
          disabled={isVerified}
          type="button"
          onClick={verify}
          loading={isVerifying}
          className="inline-flex h-12 w-full items-center justify-center rounded-none border-0 bg-[#c3f832] text-sm leading-5 font-normal text-[#1a1c1d] shadow-none hover:bg-[#b4e82a] hover:no-underline max-[600px]:min-h-[52px]"
        >
          Verify email
        </Button>
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="text-center text-sm leading-5 font-semibold"
        >
          Go to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={resend} noValidate className="flex flex-col gap-6">
      <div>
        <EmailInput
          {...register('email')}
          appearance="filled"
          autoComplete="email"
          placeholder="name@example.com"
          error={errors.email?.message}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitDisabled}
        loading={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center rounded-none border-0 bg-[#c3f832] text-sm leading-5 font-normal text-[#1a1c1d] shadow-none hover:bg-[#b4e82a] hover:no-underline max-[600px]:min-h-[52px]"
      >
        Send a new link
      </Button>
      {isResent && (
        <p role="status">Check your email for a new verification link.</p>
      )}
      <Link
        href={AUTH_ROUTES.LOGIN}
        className="text-center text-sm leading-5 font-semibold"
      >
        Back to log in
      </Link>
    </form>
  );
}
