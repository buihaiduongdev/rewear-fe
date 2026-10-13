'use client';

import { useEffect } from 'react';

import {
  resetPasswordSchema,
  type TResetPasswordInput,
} from '@/modules/auth/schemas';
import { resetPasswordMutationOptions } from '@/modules/auth/services/auth.query';
import { getPasswordStrengthScore } from '@/modules/auth/validators';
import { useToastStore } from '@/shared/stores/toast.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';

export function useResetPassword(token?: string) {
  const { mutate, isPending, isSuccess } = useMutation(
    resetPasswordMutationOptions(),
  );
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<TResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!token)
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Invalid reset link',
        description: 'Please request a new password reset link.',
        durationMs: 10000,
      });
  }, [token]);

  const password = useWatch({ control, name: 'newPassword' }) ?? '';
  const passwordStrengthScore = getPasswordStrengthScore(password);
  const onSubmit = handleSubmit(({ newPassword }) => {
    if (!token) {
      return;
    }

    mutate({ token, newPassword });
  });

  return {
    errors,
    isSubmitDisabled: !isValid || !token || isSuccess,
    isPending,
    isSuccess,
    passwordStrengthScore,
    onSubmit,
    register,
  };
}
