import z from 'zod';

import { AUTH_VALIDATION } from '../constants/auth.constant';

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(
        AUTH_VALIDATION.password.min,
        `Password must be at least ${AUTH_VALIDATION.password.min} characters`,
      )
      .max(
        AUTH_VALIDATION.password.max,
        `Password must not exceed ${AUTH_VALIDATION.password.max} characters`,
      ),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type TResetPasswordInput = z.infer<typeof resetPasswordSchema>;
