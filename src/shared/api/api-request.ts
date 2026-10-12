import type { AxiosRequestConfig } from 'axios';

import { axiosClient } from './axios-client';

export type TApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export async function apiRequest<T>(
  config: AxiosRequestConfig,
  accessToken?: string,
) {
  const response = await axiosClient.request<never, TApiEnvelope<T>>({
    ...config,
    headers: accessToken
      ? { ...config.headers, Authorization: `Bearer ${accessToken}` }
      : config.headers,
  });

  return response.data;
}
