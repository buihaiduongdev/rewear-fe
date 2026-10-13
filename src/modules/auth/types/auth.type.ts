import type {
  AUTH_ERROR_MESSAGES,
  AUTH_PROVIDER,
  LOGIN_ERROR_MESSAGES,
} from '../constants';
import type { TRegisterInput, TResetPasswordInput } from '../schemas';

export type TAuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER];

export type TAuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'USER' | 'ADMIN';
  };
};

export type TRegisteredUser = TAuthResponse['user'] & {
  provider: TAuthProvider;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
};

export type TAuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES;

export type TLoginErrorCode = keyof typeof LOGIN_ERROR_MESSAGES;

export type TAuthErrorResponse = {
  code?: TLoginErrorCode;
  message?: string | string[];
};

export type TRegisterPayload = Omit<
  TRegisterInput,
  'acceptedTerms' | 'confirmPassword'
>;

export type TResetPasswordPayload = Pick<TResetPasswordInput, 'newPassword'> & {
  token: string;
};

export type TAuthMessage = {
  message: string;
};
