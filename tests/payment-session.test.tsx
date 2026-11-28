import type { ReactNode } from 'react';

import { usePaymentSession } from '@/modules/payment/hooks/use-payment-session';
import { savePaymentContext } from '@/modules/payment/payment-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  find: vi.fn(),
  reconcile: vi.fn(),
  push: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    status: 'authenticated',
    data: { user: { id: 'buyer' } },
  }),
}));
vi.mock('@/shared/api/generated/payments/payments', () => ({
  paymentControllerCreate: mocks.create,
  paymentControllerFind: mocks.find,
  paymentControllerReconcile: mocks.reconcile,
}));
const response = (id = 'new', state = 'UNKNOWN', amount = 230000) => ({
  statusCode: 200,
  message: 'OK',
  data: {
    id,
    checkoutId: 'checkout',
    amount,
    state,
    payUrl: null,
    paidAt: null,
    refunds: [],
  },
});
function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => usePaymentSession('checkout'), { wrapper });
}
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  mocks.find.mockResolvedValue(response());
});
it('keeps one request id when the server response is lost and blocks double clicks', async () => {
  mocks.create.mockRejectedValue(new Error('Timeout'));
  const { result } = setup();
  await act(async () => {
    await Promise.all([result.current.pay(230000), result.current.pay(230000)]);
  });
  expect(mocks.create).toHaveBeenCalledTimes(1);
  await act(async () => {
    await result.current.pay(230000);
  });
  expect(mocks.create).toHaveBeenCalledTimes(2);
  expect(mocks.create.mock.calls[0][1].requestId).toBe(
    mocks.create.mock.calls[1][1].requestId,
  );
});
it('preserves a retry request across lost responses after a known failed payment', async () => {
  savePaymentContext('buyer', { checkoutId: 'checkout', paymentId: 'failed' });
  mocks.find.mockResolvedValue(response('failed', 'FAILED'));
  mocks.create.mockRejectedValue(new Error('Timeout'));
  const { result } = setup();
  await waitFor(() =>
    expect(result.current.payment.data?.data.state).toBe('FAILED'),
  );
  await act(async () => {
    await result.current.pay(230000);
  });
  await act(async () => {
    await result.current.pay(230000);
  });
  expect(mocks.create.mock.calls[0][1].requestId).toBe(
    mocks.create.mock.calls[1][1].requestId,
  );
});
it('requires review if the server payment amount changed', async () => {
  mocks.create.mockResolvedValue(response('new', 'PENDING', 250000));
  mocks.find.mockResolvedValue(response('new', 'PENDING', 250000));
  const { result } = setup();
  await act(async () => {
    await result.current.pay(230000);
  });
  await waitFor(() => expect(result.current.context?.paymentId).toBe('new'));
  expect(result.current.error).toMatch(/total changed/i);
  expect(mocks.push).not.toHaveBeenCalled();
});
it('retains an attempt in memory and avoids navigation when browser context cannot be saved', async () => {
  mocks.create.mockResolvedValue(response());
  const { result } = setup();
  const original = Storage.prototype.setItem;
  let writes = 0;
  const spy = vi
    .spyOn(Storage.prototype, 'setItem')
    .mockImplementation(function (this: Storage, key, value) {
      if (++writes === 2) throw new Error('Storage full');
      return original.call(this, key, value);
    });
  try {
    await act(async () => {
      await result.current.pay(230000);
    });
    await waitFor(() => expect(result.current.context?.paymentId).toBe('new'));
    expect(mocks.push).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
  } finally {
    spy.mockRestore();
  }
});
it('tries to persist context again before continuing an existing payment', async () => {
  savePaymentContext('buyer', { checkoutId: 'checkout', paymentId: 'pending' });
  mocks.find.mockResolvedValue(response('pending', 'PENDING'));
  const { result } = setup();
  await waitFor(() =>
    expect(result.current.payment.data?.data.state).toBe('PENDING'),
  );
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage full');
  });
  try {
    await act(async () => {
      await result.current.pay(230000);
    });
    expect(spy).toHaveBeenCalledWith(
      'rewear.payos.context:buyer',
      JSON.stringify({ checkoutId: 'checkout', paymentId: 'pending' }),
    );
    expect(result.current.error).toBeTruthy();
    expect(mocks.push).not.toHaveBeenCalled();
  } finally {
    spy.mockRestore();
  }
});
