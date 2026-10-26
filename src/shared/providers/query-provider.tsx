'use client';

import { useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import { createQueryClient } from '@/shared/api/query-client';
import { ToastViewport } from '@/shared/components/ui/toast';
import { TOAST_DURATION_MS } from '@/shared/constants/toast';
import { useToastStore } from '@/shared/stores/toast.store';
import {
  MutationCache,
  QueryCache,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function showErrorToast(
  error: unknown,
  durationMs = TOAST_DURATION_MS.DEFAULT,
) {
  useToastStore.getState().addToast({
    type: 'error',
    durationMs,
    title: 'Request failed',
    description: getApiErrorMessage(error),
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    return createQueryClient(
      new MutationCache({
        onSuccess: (_, __, ___, mutation) => {
          if (mutation.options.meta?.skipSuccessToast) return;

          useToastStore.getState().addToast({
            type: 'success',
            durationMs: TOAST_DURATION_MS.DEFAULT,
            title: 'Request completed',
            description: 'Your request was completed successfully.',
          });
        },
        onError: (error, _, __, mutation) => {
          if (mutation.options.meta?.skipErrorToast) return;

          showErrorToast(
            error,
            typeof mutation.options.meta?.toastDurationMs === 'number'
              ? mutation.options.meta.toastDurationMs
              : undefined,
          );
        },
      }),
      new QueryCache({
        onError: (error, query) => {
          if (
            query.options.meta?.skipErrorToast ||
            query.state.data !== undefined
          ) {
            return;
          }

          showErrorToast(error);
        },
      }),
    );
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastViewport />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
