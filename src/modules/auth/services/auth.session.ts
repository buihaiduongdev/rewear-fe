import { authControllerRefresh } from '@/shared/api/generated/auth/auth';
import type { AuthControllerLogin200 } from '@/shared/api/models';
import { decodeJwt } from 'jose';
import ms from 'ms';

const getExpMs = (token: string) => (decodeJwt(token).exp ?? 0) * ms('1s');

export const buildAuthToken = <T extends object>(
  target: T,
  response: AuthControllerLogin200['data'],
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

const refreshPromises = new Map<
  string,
  Promise<AuthControllerLogin200['data'] | null>
>();

export function getRefreshToken(refreshToken: string) {
  const existingPromise = refreshPromises.get(refreshToken);
  if (existingPromise) {
    return existingPromise;
  }

  const refreshPromise = authControllerRefresh({ refreshToken })
    .then((response) => response.data)
    .catch(() => null)
    .finally(() => refreshPromises.delete(refreshToken));

  refreshPromises.set(refreshToken, refreshPromise);
  return refreshPromise;
}
