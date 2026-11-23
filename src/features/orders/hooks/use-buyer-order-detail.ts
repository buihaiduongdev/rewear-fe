'use client';

import { useOrderSettlementControllerConfirmReceipt } from '@/shared/api/query-generated/order-receipt-and-settlement/order-receipt-and-settlement';
import { useOrderControllerBuyerDetail } from '@/shared/api/query-generated/orders/orders';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export function useBuyerOrderDetail(id: string) {
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;
  const client = useQueryClient();
  const order = useOrderControllerBuyerDetail(id, {
    query: {
      enabled: enabled && Boolean(id),
      queryKey: ['buyer-order', session?.user.id, id],
      retry: false,
    },
  });
  const receipt = useOrderSettlementControllerConfirmReceipt({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onSuccess: async () => {
        await Promise.all([
          order.refetch(),
          client.invalidateQueries({
            queryKey: ['buyer-orders', session?.user.id],
          }),
        ]);
      },
    },
  });
  return {
    enabled,
    authLoading: status === 'loading',
    order,
    receipt,
    confirmReceipt: () => receipt.mutateAsync({ id, data: {} }),
  };
}
