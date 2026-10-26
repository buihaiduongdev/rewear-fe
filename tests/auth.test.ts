import { registerSchema, resetPasswordSchema } from '@/modules/auth/schemas';
import { describe, expect, it } from 'vitest';

describe('Auth form schemas', () => {
  it('requires matching passwords and acceptance of terms', () => {
    expect(
      registerSchema.safeParse({
        fullName: 'An',
        email: 'an@example.com',
        password: 'Password123!',
        confirmPassword: 'Different',
        acceptedTerms: false,
      }).success,
    ).toBe(false);
    expect(
      resetPasswordSchema.safeParse({
        newPassword: 'Password123!',
        confirmPassword: 'Different',
      }).success,
    ).toBe(false);
  });
});
