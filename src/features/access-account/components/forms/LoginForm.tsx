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
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <OAuthButtons callbackUrl={callbackUrl} appearance="login" />
      <EmailInput
        {...register('email')}
        appearance="filled"
        autoComplete="email"
        placeholder="name@example.com"
        error={errors.email?.message}
      />
      <PasswordInput
        {...register('password')}
        appearance="filled"
        autoComplete="current-password"
        placeholder="Enter password"
        error={errors.password?.message}
      />
      <Link
        href={AUTH_ROUTES.FORGOT_PASSWORD}
        className="w-fit text-sm leading-5 font-semibold hover:underline"
      >
        Forgot password?
      </Link>
      <Button
        type="submit"
        disabled={isSubmitDisabled}
        loading={isPending}
        className="h-12 w-full rounded-[8px] bg-[#c3f832] text-sm font-normal text-[#1a1c1d] shadow-none hover:bg-[#b4e82a]"
      >
        Sign in
      </Button>
      <p className="text-sm leading-5 font-semibold">
        New here?{' '}
        <Link
          href={AUTH_ROUTES.REGISTER}
          className="underline-offset-4 hover:underline"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}
