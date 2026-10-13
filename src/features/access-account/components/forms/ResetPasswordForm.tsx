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

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="min-h-[15rem]">
        <PasswordInput
          id="newPassword"
          label="New password"
          {...register('newPassword')}
          error={errors.newPassword?.message}
        />
        <PasswordStrengthMeter score={passwordStrengthScore} />
        <PasswordInput
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
        className="h-10 w-full text-sm"
      >
        Reset password
      </Button>

      <Link
        href={isSuccess ? AUTH_ROUTES.LOGIN : AUTH_ROUTES.FORGOT_PASSWORD}
        className="text-primary mt-6 block text-center text-sm font-medium hover:underline"
      >
        {isSuccess ? 'Go to log in' : 'Request a new reset link'}
      </Link>
    </form>
  );
}
