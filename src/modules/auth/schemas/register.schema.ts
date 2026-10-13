import z from 'zod';

import { AUTH_VALIDATION } from '../constants/auth.constant';

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(
        AUTH_VALIDATION.fullName.min,
        `Full name must be at least ${AUTH_VALIDATION.fullName.min} characters`,
      )
      .max(
        AUTH_VALIDATION.fullName.max,
        `Full name must not exceed ${AUTH_VALIDATION.fullName.max} characters`,
      ),
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
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptedTerms: z.boolean().refine((value) => value, {
      message: 'You must accept the terms to create an account.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type TRegisterInput = z.infer<typeof registerSchema>;
