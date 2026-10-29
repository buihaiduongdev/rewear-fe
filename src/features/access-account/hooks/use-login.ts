'use client';

import { useEffect } from 'react';

import { LOGIN_ERROR_MESSAGES } from '@/modules/auth/constants/auth.constant';
import { type TLoginErrorCode } from '@/modules/auth/constants/auth.constant';
import { AuthControllerLoginBody } from '@/shared/api/zod-generated/auth/auth';
import { TOAST_DURATION_MS } from '@/shared/constants/toast';
import { useToastStore } from '@/shared/stores/toast.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

export function useLogin(callbackUrl: string, authError?: string) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(AuthControllerLoginBody),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (authError) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Login failed',
        description: authError,
        durationMs: TOAST_DURATION_MS.LONG,
      });
    }
  }, [authError]);

  const { mutate, isPending } = useMutation({
    meta: { skipErrorToast: true },
    mutationFn: async ({
      email,
      password,
    }: z.output<typeof AuthControllerLoginBody>) => {
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
        durationMs: TOAST_DURATION_MS.LONG,
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
