'use client';

import { useEffect } from 'react';

import {
  resetPasswordSchema,
  type TResetPasswordInput,
} from '@/modules/auth/schemas';
import { getPasswordStrengthScore } from '@/modules/auth/validators';
import { useAuthControllerResetPassword } from '@/shared/api/query-generated/auth/auth';
import { TOAST_DURATION_MS } from '@/shared/constants/toast';
import { useToastStore } from '@/shared/stores/toast.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

export function useResetPassword(token?: string) {
  const { mutate, isPending, isSuccess } = useAuthControllerResetPassword({
    mutation: {
      meta: { skipSuccessToast: true, toastDurationMs: TOAST_DURATION_MS.LONG },
      onSuccess: () => {
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Success',
          description: 'Your password has been reset. You can now log in.',
          durationMs: TOAST_DURATION_MS.LONG,
        });
      },
    },
  });
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
        durationMs: TOAST_DURATION_MS.LONG,
      });
  }, [token]);

  const password = useWatch({ control, name: 'newPassword' }) ?? '';
  const passwordStrengthScore = getPasswordStrengthScore(password);
  const onSubmit = handleSubmit(({ newPassword }) => {
    if (!token) {
      return;
    }

    mutate({ data: { token, newPassword } });
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
