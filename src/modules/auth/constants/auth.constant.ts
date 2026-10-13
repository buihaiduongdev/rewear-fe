export const AUTH_VALIDATION = {
  fullName: {
    min: 1,
    max: 255,
  },
  email: {
    max: 255,
  },
  password: {
    min: 8,
    max: 72,
  },
} as const;

export const AUTH_PROVIDER = {
  credentials: 'credentials',
  google: 'google',
} as const;

export const LOGIN_ERROR_MESSAGES = {
  invalid_credentials: 'Invalid email or password.',
  email_unverified: 'Please verify your email before logging in.',
  unavailable: 'Unable to log in right now. Please try again.',
} as const;

export const AUTH_ERROR_MESSAGES = {
  AppDefault:
    'We couldn’t log you in. Please check your credentials and try again.',
  CredentialsSignin: 'Invalid email or password.',
  OAuthAccountNotLinked:
    'This email is already associated with another login provider.',
  OAuthSignin: 'Unable to connect to OAuth provider.',
  OAuthCallbackError: 'An error occurred during OAuth authentication.',
  AccessDenied: 'Google sign-in could not be completed. Please try again.',
  SessionRequired: 'Your session has expired. Please log in again.',
} as const;
