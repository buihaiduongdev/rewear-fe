import {
  authControllerLogin,
  authControllerLogout,
  authControllerOauth,
} from '@/shared/api/generated/auth/auth';
import { AuthControllerLoginBody } from '@/shared/api/zod-generated/auth/auth';
import { AccessDenied } from '@auth/core/errors';
import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import { buildAuthToken, getRefreshToken } from './auth.session';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = AuthControllerLoginBody.safeParse({
          email: credentials.email,
          password: credentials.password,
        });
        if (!parsed.success) {
          return null;
        }

        try {
          const response = await authControllerLogin({
            email: parsed.data.email,
            password: parsed.data.password,
          });

          return buildAuthToken({}, response.data);
        } catch (error) {
          const loginError = new CredentialsSignin();
          loginError.code =
            error instanceof Error && typeof error.cause === 'string'
              ? error.cause
              : 'unavailable';
          throw loginError;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === 'credentials') {
        return { ...token, ...user };
      }

      if (account) {
        if (account.provider !== 'google') {
          throw new AccessDenied('Unsupported OAuth provider.');
        }

        const oauthToken = account.id_token || account.access_token;
        if (!oauthToken) {
          throw new AccessDenied('Google did not return an OAuth token.');
        }

        try {
          const response = await authControllerOauth({
            provider: account.provider,
            token: oauthToken,
          });
          return buildAuthToken(token, response.data);
        } catch (error) {
          throw new AccessDenied(
            error instanceof Error ? error.message : undefined,
          );
        }
      }

      if (Date.now() < token.expiresAt) {
        return token;
      }

      if (!token.refreshToken) {
        return { ...token, error: 'refreshTokenError' as const };
      }

      const refreshedToken = await getRefreshToken(token.refreshToken);
      if (!refreshedToken) {
        return { ...token, error: 'refreshTokenError' as const };
      }

      return buildAuthToken(token, refreshedToken);
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email ?? '';
      session.user.fullName = token.fullName;
      session.user.role = token.role;
      session.user.accessToken = token.accessToken;
      session.user.expiresAt = token.expiresAt;
      session.error = token.error;
      return session;
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  events: {
    async signOut(message) {
      if ('token' in message && message.token?.refreshToken) {
        await authControllerLogout({
          refreshToken: message.token.refreshToken,
        }).catch(() => undefined);
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
