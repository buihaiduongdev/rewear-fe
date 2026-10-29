import { env } from '@/shared/config/env';
import type { AxiosRequestConfig } from 'axios';
import ms from 'ms';

export const axiosConfig = {
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: ms('10s'),
} satisfies AxiosRequestConfig;
