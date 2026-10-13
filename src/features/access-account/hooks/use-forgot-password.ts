'use client';

import {
  forgotPasswordSchema,
  type TForgotPasswordInput,
} from '@/modules/auth/schemas';
import { forgotPasswordMutationOptions } from '@/modules/auth/services/auth.query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

export function useForgotPassword() {
  const { mutate, isPending, isSuccess } = useMutation(
    forgotPasswordMutationOptions(),
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  const onSubmit = handleSubmit(({ email }) => {
    mutate({ email });
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
