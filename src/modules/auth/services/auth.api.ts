import { env } from '@/shared/config/env';
import { decodeJwt } from 'jose';
import ms from 'ms';

import type { TForgotPasswordInput } from '../schemas';
import type {
  TAuthErrorResponse,
  TAuthMessage,
  TAuthProvider,
  TAuthResponse,
  TRegisteredUser,
  TRegisterPayload,
  TResetPasswordPayload,
} from '../types';

type TAuthApiEnvelope<T> = {
  data: T;
};

const getExpMs = (token: string) => (decodeJwt(token).exp ?? 0) * ms('1s');

const authFetchOptions = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  cache: 'no-store',
} as const;

const getApiBaseUrl = () => env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');

export const buildAuthToken = <T extends object>(
  target: T,
  response: TAuthResponse,
) => ({
  ...target,
  error: undefined,
  id: response.user.id,
  email: response.user.email,
  fullName: response.user.fullName,
  role: response.user.role,
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
  expiresAt: getExpMs(response.accessToken),
});

async function postAuth<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}/auth/${path}`, {
    ...authFetchOptions,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as TAuthErrorResponse | null;
    const rawMessage = body?.message;
    const fallbackMessage = 'Something went wrong. Please try again.';
    const message = Array.isArray(rawMessage)
      ? (rawMessage[0] ?? fallbackMessage)
      : (rawMessage ?? fallbackMessage);

    throw new Error(message, { cause: body?.code ?? 'unavailable' });
  }

  const body = (await response.json()) as TAuthApiEnvelope<T>;
  return body.data;
}

export function register(payload: TRegisterPayload) {
  return postAuth<TRegisteredUser>('register', payload);
}

export function forgotPassword(payload: TForgotPasswordInput) {
  return postAuth<TAuthMessage>('forgot-password', payload);
}

export function resetPassword(payload: TResetPasswordPayload) {
  return postAuth<TAuthMessage>('reset-password', payload);
}

export function verifyEmail(token: string) {
  return postAuth<TAuthMessage>('verify-email', { token });
}

export function resendVerification(payload: TForgotPasswordInput) {
  return postAuth<TAuthMessage>('resend-verification', payload);
}

export function login(payload: {
  provider: TAuthProvider;
  email?: string;
  password?: string;
  token?: string;
}) {
  return postAuth<TAuthResponse>('login', payload);
}

const refreshPromises = new Map<string, Promise<TAuthResponse | null>>();

export function getRefreshToken(refreshToken: string) {
  const existingPromise = refreshPromises.get(refreshToken);
  if (existingPromise) {
    return existingPromise;
  }

  const refreshPromise = postAuth<TAuthResponse>('refresh', { refreshToken })
    .catch(() => null)
    .finally(() => refreshPromises.delete(refreshToken));

  refreshPromises.set(refreshToken, refreshPromise);
  return refreshPromise;
}

export async function logout(refreshToken: string) {
  await postAuth<void>('logout', { refreshToken });
}
