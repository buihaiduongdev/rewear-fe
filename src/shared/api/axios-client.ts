import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

import { axiosConfig } from './axios-config';

export const axiosClient = axios.create(axiosConfig);

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
