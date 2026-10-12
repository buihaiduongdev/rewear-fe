import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import ms from 'ms';

function shouldRetry(failureCount: number, error: unknown) {
  const status = isAxiosError(error) ? error.response?.status : undefined;

  if (status && status >= 400 && status < 500) return false;

  return failureCount < 1;
}

export function createQueryClient(
  mutationCache?: MutationCache,
  queryCache?: QueryCache,
) {
  return new QueryClient({
    mutationCache,
    queryCache,
    defaultOptions: {
      queries: {
        gcTime: ms('5m'),
        refetchOnWindowFocus: false,
        retry: shouldRetry,
        staleTime: ms('1m'),
      },
      mutations: {
        retry: false,
      },
    },
  });
}
