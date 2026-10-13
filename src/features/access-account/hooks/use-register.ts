'use client';

import { useRouter } from 'next/navigation';

import { AUTH_ROUTES } from '@/modules/auth/constants/route.constant';
import { registerSchema, type TRegisterInput } from '@/modules/auth/schemas';
import { registerMutationOptions } from '@/modules/auth/services/auth.query';
import { getPasswordStrengthScore } from '@/modules/auth/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';

export function useRegister() {
  const router = useRouter();
  const options = registerMutationOptions();
  const { mutate, isPending, isSuccess } = useMutation({
    ...options,
    onSuccess: (...args) => {
      options.onSuccess?.(...args);
      router.replace(AUTH_ROUTES.LOGIN);
    },
  });
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<TRegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
    mode: 'onChange',
  });

  const password = useWatch({ control, name: 'password' }) ?? '';
  const isChecked = useWatch({ control, name: 'acceptedTerms' }) ?? false;
  const passwordStrengthScore = getPasswordStrengthScore(password);
  const onSubmit = handleSubmit(({ fullName, email, password }) => {
    mutate({ fullName, email, password });
  });

  return {
    errors,
    isSubmitDisabled: !isValid,
    isPending,
    isSuccess,
    isChecked,
    passwordStrengthScore,
    onSubmit,
    register,
    setValue,
  };
}
