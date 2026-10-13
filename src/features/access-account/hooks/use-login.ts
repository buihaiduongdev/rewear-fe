'use client';

import { useEffect } from 'react';

import { LOGIN_ERROR_MESSAGES } from '@/modules/auth/constants/auth.constant';
import { loginSchema, type TLoginInput } from '@/modules/auth/schemas';
import { type TLoginErrorCode } from '@/modules/auth/types';
import { useToastStore } from '@/shared/stores/toast.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';

export function useLogin(callbackUrl: string, authError?: string) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TLoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (authError) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Login failed',
        description: authError,
        durationMs: 10000,
      });
    }
  }, [authError]);

  const { mutate, isPending } = useMutation({
    meta: { skipErrorToast: true },
    mutationFn: async ({ email, password }: TLoginInput) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        redirectTo: callbackUrl,
      });
      if (!result || result.error) {
        throw new Error(result?.code ?? result?.error ?? 'unavailable');
      }
      return result;
    },
    onSuccess: (result) => {
      if (result.url) window.location.assign(result.url);
    },
    onError: (error) => {
      const message =
        LOGIN_ERROR_MESSAGES[error.message as TLoginErrorCode] ??
        LOGIN_ERROR_MESSAGES.unavailable;
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Login failed',
        description: message,
        durationMs: 10000,
      });
    },
  });

  const onSubmit = handleSubmit((payload) => {
    mutate(payload);
  });

  return {
    errors,
    isSubmitDisabled: !isValid,
    isPending,
    onSubmit,
    register,
  };
}
