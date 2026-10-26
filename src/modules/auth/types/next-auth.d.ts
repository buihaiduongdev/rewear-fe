import type { AuthControllerLogin200DataUserRole } from '@/shared/api/models';
import type { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

declare module '@auth/core/types' {
  interface User {
    id?: string;
    fullName?: string;
    role?: AuthControllerLogin200DataUserRole;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }

  interface Session {
    user: {
      id: string;
      fullName: string;
      role: AuthControllerLogin200DataUserRole;
      accessToken: string;
      expiresAt: number;
    } & DefaultSession['user'];
    error?: 'refreshTokenError';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    fullName: string;
    role: AuthControllerLogin200DataUserRole;
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    error?: 'refreshTokenError';
  }
}
