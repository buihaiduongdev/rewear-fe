'use client';

import { Button } from '@/shared/components/ui/button';
import { EmailInput } from '@/shared/components/ui/input/EmailInput';
import { FullNameInput } from '@/shared/components/ui/input/FullNameInput';
import { PasswordInput } from '@/shared/components/ui/input/PasswordInput';

import { useRegister } from '../../hooks/use-register';
import { OAuthButtons } from '../OAuthButtons';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';
import { TermsAgreement } from '../TermsAgreement';

export function RegisterForm() {
  const {
    errors,
    isChecked,
    isPending,
    isSubmitDisabled,
    onSubmit,
    passwordStrengthScore,
    register,
    setValue,
  } = useRegister();

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="min-h-[22rem]">
        <FullNameInput
          {...register('fullName')}
          error={errors.fullName?.message}
        />
        <EmailInput {...register('email')} error={errors.email?.message} />
        <PasswordInput
          {...register('password')}
          error={errors.password?.message}
        />
        <PasswordStrengthMeter score={passwordStrengthScore} />
        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          placeholder="Confirm your password"
        />
      </div>

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
        className="mt-2 h-10 w-full text-sm"
      >
        Create account
      </Button>

      <OAuthButtons />
    </form>
  );
}
