import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

import { axiosConfig } from './axios-config';

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const axiosClient = axios.create(axiosConfig);

let refreshPromise: Promise<string | null> | null = null;
let isSigningOut = false;

async function requestRefreshedToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = (await response.json()) as { accessToken?: string };
        if (data.accessToken) {
          return data.accessToken;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

axiosClient.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined' && !config.headers.Authorization) {
    const session = await getSession();
    if (session?.error === 'refreshTokenError') {
      await signOut({ redirectTo: '/login' });
      throw new Error('Your session has expired. Please log in again.');
    }

    // Proactively refresh when access token is near expiration (<60s)
    if (
      session?.user?.expiresAt &&
      Date.now() >= session.user.expiresAt - 60_000
    ) {
      const refreshedToken = await requestRefreshedToken();
      if (refreshedToken) {
        config.headers.Authorization = `Bearer ${refreshedToken}`;
      } else if (session?.user?.accessToken) {
        config.headers.Authorization = `Bearer ${session.user.accessToken}`;
      }
    } else if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }
  }

  // Attach X-Shop-Id when targeting shop-scoped routes if not already provided
  const headers = config.headers;
  const hasShopHeader =
    (typeof headers.get === 'function' &&
      (headers.get('x-shop-id') || headers.get('X-Shop-Id'))) ||
    headers['x-shop-id'] ||
    headers['X-Shop-Id'];

  if (!hasShopHeader && config.url) {
    const match = config.url.match(
      /\/shops\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(?:\/|$)/,
    );
    if (match) {
      if (typeof headers.set === 'function') {
        headers.set('x-shop-id', match[1]);
      } else {
        headers['x-shop-id'] = match[1];
      }
    }
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined'
    ) {
      const originalRequest = error.config as RetryRequestConfig;
      const isAuthRoute = originalRequest?.url?.includes('/auth/');

      // If the request hasn't been retried yet and is not an auth route, attempt to refresh and retry
      if (originalRequest && !originalRequest._retry && !isAuthRoute) {
        originalRequest._retry = true;

        const newAccessToken = await requestRefreshedToken();
        if (newAccessToken) {
          if (originalRequest.headers) {
            if (typeof originalRequest.headers.set === 'function') {
              originalRequest.headers.set(
                'Authorization',
                `Bearer ${newAccessToken}`,
              );
            } else {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
          }
          return axiosClient(originalRequest);
        }
      }

      // If refresh failed or request already retried, sign out cleanly
      if (!isSigningOut) {
        isSigningOut = true;
        try {
          await signOut({ redirectTo: '/login' });
        } catch {
          // ignore signout errors
        } finally {
          isSigningOut = false;
        }
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
