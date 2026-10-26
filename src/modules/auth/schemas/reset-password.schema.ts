import { AuthControllerResetPasswordBody } from '@/shared/api/zod-generated/auth/auth';
import z from 'zod';

export const resetPasswordSchema = AuthControllerResetPasswordBody.omit({
  token: true,
})
  .extend({
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type TResetPasswordInput = z.infer<typeof resetPasswordSchema>;
