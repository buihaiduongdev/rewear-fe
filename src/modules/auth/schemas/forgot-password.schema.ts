import z from 'zod';

import { AUTH_VALIDATION } from '../constants/auth.constant';

export const forgotPasswordSchema = z.object({
  email: z
    .email({ message: 'Invalid email address' })
    .max(
      AUTH_VALIDATION.email.max,
      `Email must not exceed ${AUTH_VALIDATION.email.max} characters`,
    )
    .transform((value) => value.toLowerCase()),
});

export type TForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
