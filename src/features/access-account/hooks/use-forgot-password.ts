'use client';

import { useAuthControllerForgotPassword } from '@/shared/api/query-generated/auth/auth';
import { AuthControllerForgotPasswordBody } from '@/shared/api/zod-generated/auth/auth';
import { TOAST_DURATION_MS } from '@/shared/constants/toast';
import { useToastStore } from '@/shared/stores/toast.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export function useForgotPassword() {
  const { mutate, isPending, isSuccess } = useAuthControllerForgotPassword({
    mutation: {
      meta: { skipSuccessToast: true, toastDurationMs: TOAST_DURATION_MS.LONG },
      onSuccess: () => {
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Check your email',
          description:
            'If an account exists for that email, you’ll receive a password reset link.',
          durationMs: TOAST_DURATION_MS.LONG,
        });
      },
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(AuthControllerForgotPasswordBody),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  const onSubmit = handleSubmit(({ email }) => {
    mutate({ data: { email } });
  });

  return {
    errors,
    isSubmitDisabled: !isValid,
    isPending,
    isSuccess,
    onSubmit,
    register,
  };
}
