import { env } from '@/shared/config/env';
import axios from 'axios';
import ms from 'ms';
import { getSession, signOut } from 'next-auth/react';

export const axiosClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: ms('10s'),
});

axiosClient.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined' && !config.headers.Authorization) {
    const session = await getSession();
    if (session?.error === 'refreshTokenError') {
      await signOut({ redirectTo: '/login' });
      throw new Error('Your session has expired. Please log in again.');
    }
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error: unknown) => Promise.reject(error),
);

export default axiosClient;
