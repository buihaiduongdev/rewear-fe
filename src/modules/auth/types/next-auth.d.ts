import type { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

type TUserRole = 'USER' | 'ADMIN';

declare module 'next-auth' {
  interface User {
    id?: string;
    fullName?: string;
    role?: TUserRole;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }

  interface Session {
    user: {
      id: string;
      fullName: string;
      role: TUserRole;
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
    role: TUserRole;
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    error?: 'refreshTokenError';
  }
}
