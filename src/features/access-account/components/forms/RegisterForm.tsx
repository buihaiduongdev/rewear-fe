'use client';

import Link from 'next/link';

import { AUTH_ROUTES } from '@/modules/auth/constants/route.constant';
import { Button } from '@/shared/components/ui/button';
import { EmailInput } from '@/shared/components/ui/input/EmailInput';
import { FullNameInput } from '@/shared/components/ui/input/FullNameInput';
import { PasswordInput } from '@/shared/components/ui/input/PasswordInput';

import { useRegister } from '../../hooks/use-register';
import { TermsAgreement } from '../TermsAgreement';

export function RegisterForm() {
  const {
    errors,
    isChecked,
    isPending,
    isSuccess,
    isSubmitDisabled,
    onSubmit,
    register,
    setValue,
  } = useRegister();
  if (isSuccess)
    return (
      <div className="flex flex-col gap-6" role="status">
        <h1>Check your email</h1>
        <p>Open the link we sent to verify your account.</p>
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
      <h1>Create account</h1>
      <FullNameInput
        {...register('fullName')}
        appearance="filled"
        autoComplete="name"
        placeholder="Your name"
        error={errors.fullName?.message}
      />
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
        autoComplete="new-password"
        placeholder="Create a password"
        error={errors.password?.message}
      />
      <PasswordInput
        id="confirmPassword"
        label="Confirm password"
        {...register('confirmPassword')}
        appearance="filled"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        placeholder="Confirm your password"
      />
      <TermsAgreement
        isChecked={isChecked}
        onCheckedChange={(checked) =>
          setValue('acceptedTerms', checked, { shouldValidate: true })
        }
        error={errors.acceptedTerms?.message}
      />
      <Button
        type="submit"
        disabled={isSubmitDisabled}
        loading={isPending}
        className="inline-flex h-12 w-full items-center justify-center rounded-none border-0 bg-[#f3f3f5] text-sm leading-5 font-normal text-[#1a1c1d] shadow-none hover:bg-[#e2e2e4] hover:no-underline max-[600px]:min-h-[52px]"
      >
        Create account
      </Button>
    </form>
  );
}
