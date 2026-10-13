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
    register,
    resend,
    verify,
  } = useVerifyEmail(token);

  if (canVerify) {
    return (
      <div>
        <Button
          disabled={isVerified}
          type="button"
          onClick={verify}
          loading={isVerifying}
          className="h-10 w-full text-sm"
        >
          Verify email
        </Button>
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="text-primary mt-6 block text-center text-sm font-medium hover:underline"
        >
          Go to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={resend} noValidate>
      <div className="min-h-[6rem]">
        <EmailInput {...register('email')} error={errors.email?.message} />
      </div>

      <Button
        type="submit"
        disabled={isSubmitDisabled}
        loading={isSubmitting}
        className="h-10 w-full text-sm"
      >
        Send a new link
      </Button>
      <Link
        href={AUTH_ROUTES.LOGIN}
        className="text-primary mt-6 block text-center text-sm font-medium hover:underline"
      >
        Back to log in
      </Link>
    </form>
  );
}
