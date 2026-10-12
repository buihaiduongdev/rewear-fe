import axios from 'axios';
import { ZodError } from 'zod';

type TApiErrorBody = {
  message?: string | string[];
};

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<TApiErrorBody>(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join('. ');
    }

    return message || 'The request could not be completed.';
  }

  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? 'The submitted data is invalid.';
  }

  if (error instanceof Error) return error.message;

  return 'Something went wrong. Please try again.';
}
