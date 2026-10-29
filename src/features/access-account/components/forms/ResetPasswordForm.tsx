'use client';

import Link from 'next/link';

import { AUTH_ROUTES } from '@/modules/auth/constants/route.constant';
import { Button } from '@/shared/components/ui/button';
import { PasswordInput } from '@/shared/components/ui/input/PasswordInput';

import { useResetPassword } from '../../hooks/use-reset-password';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';

type TResetPasswordFormProps = {
  token?: string;
};

export function ResetPasswordForm({ token }: TResetPasswordFormProps) {
  const {
    errors,
    isPending,
    isSubmitDisabled,
    isSuccess,
    onSubmit,
    passwordStrengthScore,
    register,
  } = useResetPassword(token);

  if (!token)
    return (
      <div className="flex flex-col gap-6">
        <p role="alert">
          This reset link is missing or invalid. Request a new link to continue.
        </p>
        <Link
          href={AUTH_ROUTES.FORGOT_PASSWORD}
          className="inline-flex h-12 w-full items-center justify-center rounded-none border-0 bg-[#c3f832] text-sm leading-5 font-normal text-[#1a1c1d] shadow-none hover:bg-[#b4e82a] hover:no-underline max-[600px]:min-h-[52px]"
        >
          Request a new reset link
        </Link>
      </div>
    );

  if (isSuccess)
    return (
      <div className="flex flex-col gap-6" role="status">
        <p>Your password has been reset. You can now sign in.</p>
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="inline-flex h-12 w-full items-center justify-center rounded-none border-0 bg-[#c3f832] text-sm leading-5 font-normal text-[#1a1c1d] shadow-none hover:bg-[#b4e82a] hover:no-underline max-[600px]:min-h-[52px]"
        >
          Back to sign in
        </Link>
      </div>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <PasswordInput
          appearance="filled"
          autoComplete="new-password"
          id="newPassword"
          label="New password"
          {...register('newPassword')}
          error={errors.newPassword?.message}
        />
        <PasswordStrengthMeter score={passwordStrengthScore} />
        <PasswordInput
          appearance="filled"
          autoComplete="new-password"
          id="confirmPassword"
          label="Confirm new password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitDisabled}
        loading={isPending}
        className="inline-flex h-12 w-full items-center justify-center rounded-none border-0 bg-[#c3f832] text-sm leading-5 font-normal text-[#1a1c1d] shadow-none hover:bg-[#b4e82a] hover:no-underline max-[600px]:min-h-[52px]"
      >
        Reset password
      </Button>

      <Link
        href={AUTH_ROUTES.FORGOT_PASSWORD}
        className="text-center text-sm leading-5 font-semibold"
      >
        Request a new reset link
      </Link>
    </form>
  );
}
