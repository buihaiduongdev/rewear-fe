'use client';

import { useRouter } from 'next/navigation';

import { AUTH_ROUTES } from '@/modules/auth/constants/route.constant';
import {
  forgotPasswordSchema,
  type TForgotPasswordInput,
} from '@/modules/auth/schemas';
import {
  resendVerificationMutationOptions,
  verifyEmailMutationOptions,
} from '@/modules/auth/services/auth.query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

export function useVerifyEmail(token?: string) {
  const router = useRouter();
  const options = verifyEmailMutationOptions();
  const {
    mutate: verifyMutate,
    isPending: isVerifying,
    isSuccess: isVerified,
    isError: isVerifyError,
  } = useMutation({
    ...options,
    onSuccess: (...args) => {
      options.onSuccess?.(...args);
      router.replace(AUTH_ROUTES.LOGIN);
    },
  });
  const {
    mutate: resendMutate,
    isPending: isSubmitting,
    isSuccess: isResent,
  } = useMutation(resendVerificationMutationOptions());
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  const verify = () => {
    if (!token) {
      return;
    }

    verifyMutate(token);
  };

  const resend = handleSubmit((payload) => {
    resendMutate(payload);
  });

  return {
    errors,
    isSubmitDisabled: !isValid,
    isVerifying,
    canVerify: Boolean(token) && !isVerifyError,
    isVerified,
    isSubmitting,
    isResent,
    register,
    resend,
    verify,
  };
}
