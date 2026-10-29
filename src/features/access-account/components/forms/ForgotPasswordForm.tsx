'use client';

import Link from 'next/link';

import { AUTH_ROUTES } from '@/modules/auth/constants/route.constant';
import { Button } from '@/shared/components/ui/button';
import { EmailInput } from '@/shared/components/ui/input/EmailInput';

import { useForgotPassword } from '../../hooks/use-forgot-password';

export function ForgotPasswordForm() {
  const { errors, isPending, isSuccess, isSubmitDisabled, onSubmit, register } =
    useForgotPassword();
  if (isSuccess)
    return (
      <div className="flex flex-col gap-6" role="status">
        <h1>Check your inbox</h1>
        <p>
          If this email has an account, a password reset link will arrive. Check
          your spam folder too.
        </p>
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="text-sm leading-5 font-semibold"
        >
          Back to sign in
        </Link>
      </div>
    );
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <h1>Reset password</h1>
      <EmailInput
        {...register('email')}
        appearance="filled"
        autoComplete="email"
        placeholder="name@example.com"
        error={errors.email?.message}
      />
      <Button
        type="submit"
        disabled={isSubmitDisabled}
        loading={isPending}
        className="inline-flex h-12 w-full items-center justify-center rounded-none border-0 bg-[#c3f832] text-sm leading-5 font-normal text-[#1a1c1d] shadow-none hover:bg-[#b4e82a] hover:no-underline max-[600px]:min-h-[52px]"
      >
        Send reset link
      </Button>
    </form>
  );
}
