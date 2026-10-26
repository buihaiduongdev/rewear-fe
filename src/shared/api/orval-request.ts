import axios, { type AxiosRequestConfig } from 'axios';

import { getApiErrorMessage } from './api-error';
import { axiosClient } from './axios-client';
import { axiosConfig } from './axios-config';
import {
  AuthControllerForgotPasswordResponse,
  AuthControllerLoginResponse,
  AuthControllerLogoutResponse,
  AuthControllerOauthResponse,
  AuthControllerRefreshResponse,
  AuthControllerRegisterResponse,
  AuthControllerResendVerificationResponse,
  AuthControllerResetPasswordResponse,
  AuthControllerVerifyEmailResponse,
} from './zod-generated/auth/auth';

const authResponses = {
  '/auth/register': AuthControllerRegisterResponse,
  '/auth/login': AuthControllerLoginResponse,
  '/auth/oauth': AuthControllerOauthResponse,
  '/auth/refresh': AuthControllerRefreshResponse,
  '/auth/logout': AuthControllerLogoutResponse,
  '/auth/verify-email': AuthControllerVerifyEmailResponse,
  '/auth/resend-verification': AuthControllerResendVerificationResponse,
  '/auth/forgot-password': AuthControllerForgotPasswordResponse,
  '/auth/reset-password': AuthControllerResetPasswordResponse,
};

// The public base URL already contains /api; OpenAPI paths contain it too.
export async function orvalRequest<T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> {
  const url = config.url?.replace(/^\/api(?=\/|$)/, '') ?? '';
  const request = { ...config, ...options, url };

  // Auth also runs inside Auth.js on the server and must never fetch a session.
  if (url.startsWith('/auth/')) {
    try {
      const response = await axios.request<T>({
        ...axiosConfig,
        ...request,
      });
      const schema = authResponses[url as keyof typeof authResponses];
      return schema ? (schema.parse(response.data) as T) : response.data;
    } catch (error) {
      if (!axios.isAxiosError<{ code?: string }>(error)) {
        throw error;
      }
      throw new Error(getApiErrorMessage(error), {
        cause: error.response?.data?.code ?? 'unavailable',
      });
    }
  }

  // This instance unwraps Axios responses and attaches the browser session token.
  return axiosClient.request(request) as Promise<T>;
}
