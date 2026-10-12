import axios from 'axios';
import ms from 'ms';

import { env } from '@/shared/config/env';

export const axiosClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: ms('10s'),
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error: unknown) => Promise.reject(error),
);

export default axiosClient;
