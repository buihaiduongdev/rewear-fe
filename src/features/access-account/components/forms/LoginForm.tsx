'use client';

import Link from 'next/link';

import { AUTH_ROUTES } from '@/modules/auth/constants/route.constant';
import { Button } from '@/shared/components/ui/button';
import { EmailInput } from '@/shared/components/ui/input/EmailInput';
import { PasswordInput } from '@/shared/components/ui/input/PasswordInput';

import { useLogin } from '../../hooks/use-login';
import { OAuthButtons } from '../OAuthButtons';

type TLoginFormProps = {
  authError?: string;
  callbackUrl?: string;
};

export function LoginForm({ authError, callbackUrl = '/' }: TLoginFormProps) {
  const { errors, isPending, isSubmitDisabled, onSubmit, register } = useLogin(
    callbackUrl,
    authError,
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="min-h-[13rem]">
        <EmailInput {...register('email')} error={errors.email?.message} />
        <PasswordInput
          {...register('password')}
          error={errors.password?.message}
        />
      </div>

      <Link
        href={AUTH_ROUTES.FORGOT_PASSWORD}
        className="text-primary -mt-2 mb-2.5 block text-right text-xs font-medium hover:underline"
      >
        Forgot password?
      </Link>

      <Button
        type="submit"
        disabled={isSubmitDisabled}
        loading={isPending}
        className="h-10 w-full text-sm"
      >
        Log in
      </Button>

      <OAuthButtons callbackUrl={callbackUrl} />
    </form>
  );
}
