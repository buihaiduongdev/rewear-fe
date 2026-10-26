'use client';

import { useRouter } from 'next/navigation';

import { AUTH_ROUTES } from '@/modules/auth/constants/route.constant';
import {
  useAuthControllerResendVerification,
  useAuthControllerVerifyEmail,
} from '@/shared/api/query-generated/auth/auth';
import { AuthControllerResendVerificationBody } from '@/shared/api/zod-generated/auth/auth';
import { TOAST_DURATION_MS } from '@/shared/constants/toast';
import { useToastStore } from '@/shared/stores/toast.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export function useVerifyEmail(token?: string) {
  const router = useRouter();
  const {
    mutate: verifyMutate,
    isPending: isVerifying,
    isSuccess: isVerified,
    isError: isVerifyError,
  } = useAuthControllerVerifyEmail({
    mutation: {
      meta: { skipSuccessToast: true, toastDurationMs: TOAST_DURATION_MS.LONG },
      onSuccess: () => {
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Success',
          description: 'Your email has been verified. You can now log in.',
          durationMs: TOAST_DURATION_MS.LONG,
        });
        router.replace(AUTH_ROUTES.LOGIN);
      },
    },
  });
  const {
    mutate: resendMutate,
    isPending: isSubmitting,
    isSuccess: isResent,
  } = useAuthControllerResendVerification({
    mutation: {
      meta: { skipSuccessToast: true, toastDurationMs: TOAST_DURATION_MS.LONG },
      onSuccess: () => {
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Check your email',
          description: 'Check your email for a new verification link.',
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
    resolver: zodResolver(AuthControllerResendVerificationBody),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  const verify = () => {
    if (!token) {
      return;
    }

    verifyMutate({ data: { token } });
  };

  const resend = handleSubmit((payload) => {
    resendMutate({ data: payload });
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
