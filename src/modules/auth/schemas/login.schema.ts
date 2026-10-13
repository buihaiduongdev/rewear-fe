import z from 'zod';

import { AUTH_VALIDATION } from '../constants/auth.constant';

export const loginSchema = z.object({
  email: z
    .email({ message: 'Invalid email address' })
    .max(
      AUTH_VALIDATION.email.max,
      `Email must not exceed ${AUTH_VALIDATION.email.max} characters`,
    )
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(
      AUTH_VALIDATION.password.min,
      `Password must be at least ${AUTH_VALIDATION.password.min} characters`,
    )
    .max(
      AUTH_VALIDATION.password.max,
      `Password must not exceed ${AUTH_VALIDATION.password.max} characters`,
    ),
});

export type TLoginInput = z.infer<typeof loginSchema>;
