import { AuthControllerRegisterBody } from '@/shared/api/zod-generated/auth/auth';
import z from 'zod';

export const registerSchema = AuthControllerRegisterBody.extend({
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  acceptedTerms: z.boolean().refine((value) => value, {
    message: 'You must accept the terms to create an account.',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type TRegisterInput = z.infer<typeof registerSchema>;
