'use client';

import { registerSchema, type TRegisterInput } from '@/modules/auth/schemas';
import { useAuthControllerRegister } from '@/shared/api/query-generated/auth/auth';
import { TOAST_DURATION_MS } from '@/shared/constants/toast';
import { useToastStore } from '@/shared/stores/toast.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

export function useRegister() {
  const { mutate, isPending, isSuccess } = useAuthControllerRegister({
    mutation: {
      meta: { skipSuccessToast: true, toastDurationMs: TOAST_DURATION_MS.LONG },
      onSuccess: () => {
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Check your email',
          description:
            'We sent a verification link. Check your email to activate your account.',
          durationMs: TOAST_DURATION_MS.LONG,
        });
      },
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

  const isChecked = useWatch({ control, name: 'acceptedTerms' }) ?? false;
  const onSubmit = handleSubmit(({ fullName, email, password }) => {
    mutate({ data: { fullName, email, password } });
  });

  return {
    errors,
    isSubmitDisabled: !isValid,
    isPending,
    isSuccess,
    isChecked,
    onSubmit,
    register,
    setValue,
  };
}
