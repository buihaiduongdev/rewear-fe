'use client';

import Link from 'next/link';

import { AUTH_ROUTES } from '@/modules/auth/constants/route.constant';
import { Button } from '@/shared/components/ui/button';
import { EmailInput } from '@/shared/components/ui/input/EmailInput';

import { useForgotPassword } from '../../hooks/use-forgot-password';

export function ForgotPasswordForm() {
  const { errors, isPending, isSubmitDisabled, onSubmit, register } =
    useForgotPassword();

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="min-h-[6rem]">
        <EmailInput {...register('email')} error={errors.email?.message} />
      </div>

      <Button
        type="submit"
        disabled={isSubmitDisabled}
        loading={isPending}
        className="mt-2 h-10 w-full text-sm"
      >
        Send reset instructions
      </Button>

      <div className="mt-6 text-center">
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="text-primary text-sm font-medium hover:underline"
        >
          Back to log in
        </Link>
      </div>
    </form>
  );
}
