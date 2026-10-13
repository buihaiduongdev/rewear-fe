import { useToastStore } from '@/shared/stores/toast.store';
import { mutationOptions } from '@tanstack/react-query';

import {
  forgotPassword,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from './auth.api';

export const registerMutationOptions = () =>
  mutationOptions({
    mutationFn: register,
    meta: { skipSuccessToast: true, toastDurationMs: 10000 },
    onSuccess: () => {
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Check your email',
        description:
          'We sent a verification link. Check your email to activate your account.',
        durationMs: 10000,
      });
    },
  });

export const forgotPasswordMutationOptions = () =>
  mutationOptions({
    mutationFn: forgotPassword,
    meta: { skipSuccessToast: true, toastDurationMs: 10000 },
    onSuccess: () => {
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Check your email',
        description:
          'If an account exists for that email, you’ll receive a password reset link.',
        durationMs: 10000,
      });
    },
  });

export const resetPasswordMutationOptions = () =>
  mutationOptions({
    mutationFn: resetPassword,
    meta: { skipSuccessToast: true, toastDurationMs: 10000 },
    onSuccess: () => {
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Success',
        description: 'Your password has been reset. You can now log in.',
        durationMs: 10000,
      });
    },
  });

export const verifyEmailMutationOptions = () =>
  mutationOptions({
    mutationFn: verifyEmail,
    meta: { skipSuccessToast: true, toastDurationMs: 10000 },
    onSuccess: () => {
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Success',
        description: 'Your email has been verified. You can now log in.',
        durationMs: 10000,
      });
    },
  });

export const resendVerificationMutationOptions = () =>
  mutationOptions({
    mutationFn: resendVerification,
    meta: { skipSuccessToast: true, toastDurationMs: 10000 },
    onSuccess: () => {
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Check your email',
        description: 'Check your email for a new verification link.',
        durationMs: 10000,
      });
    },
  });
