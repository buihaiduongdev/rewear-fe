'use client';
import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  paymentControllerCreate,
  paymentControllerFind,
  paymentControllerReconcile,
} from '@/shared/api/generated/payments/payments';
import { getCartControllerFindMineQueryKey } from '@/shared/api/query-generated/cart/cart';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import {
  isPendingPayment,
  PAYMENT_POLL_INTERVAL,
  safePayosUrl,
} from '../payment-state';
import {
  getPaymentContext,
  getPaymentRequestId,
  savePaymentContext,
} from '../payment-storage';

export function usePaymentSession(checkoutId?: string) {
  const { data: session, status } = useSession();
  const userId = session?.user.id ?? '';
  const enabled = status === 'authenticated' && !session?.error;
  const client = useQueryClient();
  const router = useRouter();
  const busy = useRef(false);
  const [selection, setSelection] = useState<{
    userId: string;
    checkoutId: string;
    paymentId: string;
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const context =
    selection?.userId === userId &&
    (!checkoutId || selection.checkoutId === checkoutId)
      ? selection
      : enabled && typeof window !== 'undefined'
        ? getPaymentContext(userId, checkoutId)
        : null;
  const paymentId = context?.paymentId ?? '';
  const payment = useQuery({
    queryKey: ['payos-payment', userId, paymentId],
    enabled: enabled && !!paymentId,
    queryFn: ({ signal }) => paymentControllerFind(paymentId, { signal }),
    retry: false,
    refetchInterval: (query) =>
      query.state.data &&
      isPendingPayment(query.state.data.data.state) &&
      query.state.dataUpdateCount < 24
        ? PAYMENT_POLL_INTERVAL
        : false,
  });
  const reconcile = useMutation({
    mutationFn: () => paymentControllerReconcile(paymentId),
    meta: { skipSuccessToast: true, skipErrorToast: true },
    onSuccess: async (response) => {
      client.setQueryData(['payos-payment', userId, paymentId], response);
      await Promise.all([
        client.invalidateQueries({
          queryKey: ['/api/checkouts', response.data.checkoutId, userId],
        }),
        client.invalidateQueries({
          queryKey: [...getCartControllerFindMineQueryKey(), userId],
        }),
        client.invalidateQueries({ queryKey: ['buyer-orders', userId] }),
      ]);
    },
  });
  const settledCheckout =
    payment.data?.data.state === 'PAID' ? payment.data.data.checkoutId : null;
  useEffect(() => {
    if (!settledCheckout) return;
    void client.invalidateQueries({
      queryKey: [...getCartControllerFindMineQueryKey(), userId],
    });
    void client.invalidateQueries({ queryKey: ['buyer-orders', userId] });
    void client.invalidateQueries({
      queryKey: ['/api/checkouts', settledCheckout, userId],
    });
  }, [client, settledCheckout, userId]);
  const create = useMutation({
    mutationFn: async () => {
      if (!checkoutId || !enabled) throw new Error('Sign in before paying.');
      if (context && payment.data?.data.state !== 'FAILED')
        throw new Error('Check the existing payment before trying again.');
      const previousFailedId =
        payment.data?.data.state === 'FAILED'
          ? payment.data.data.id
          : undefined;
      const requestId = getPaymentRequestId(
        userId,
        checkoutId,
        previousFailedId,
      );
      const response = await paymentControllerCreate(
        checkoutId,
        { requestId },
        { timeout: 45000 },
      );
      setSelection({ userId, checkoutId, paymentId: response.data.id });
      client.setQueryData(
        ['payos-payment', userId, response.data.id],
        response,
      );
      savePaymentContext(userId, { checkoutId, paymentId: response.data.id });
      return response;
    },
    meta: { skipSuccessToast: true, skipErrorToast: true },
  });
  const pay = async (expectedTotal?: number | null) => {
    if (busy.current) return;
    busy.current = true;
    setLocalError(null);
    try {
      const response =
        context && payment.data?.data.state !== 'FAILED'
          ? payment.data
          : await create.mutateAsync();
      if (!response)
        throw new Error('Check payment status before trying again.');
      savePaymentContext(userId, {
        checkoutId: response.data.checkoutId,
        paymentId: response.data.id,
      });
      if (
        expectedTotal !== undefined &&
        expectedTotal !== null &&
        response.data.amount !== expectedTotal
      )
        throw new Error(
          'The payment total changed. Review the confirmed amount before continuing to PayOS.',
        );
      if (response.data.state === 'PENDING') {
        const url = safePayosUrl(response.data.payUrl);
        if (!url)
          throw new Error(
            'The payment link is not ready. Check payment status before trying again.',
          );
        window.location.assign(url);
      } else router.push('/payment-result');
    } catch (error) {
      setLocalError(getApiErrorMessage(error));
    } finally {
      busy.current = false;
    }
  };
  return {
    authLoading: status === 'loading',
    enabled,
    context,
    payment,
    pay,
    creating: create.isPending,
    checkStatus: () => {
      setLocalError(null);
      if (paymentId) reconcile.mutate();
    },
    checking: reconcile.isPending,
    error:
      localError ||
      (reconcile.error ? getApiErrorMessage(reconcile.error) : null),
  };
}
