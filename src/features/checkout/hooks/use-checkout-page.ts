'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { cartQueryKey, useCart } from '@/modules/cart/hooks/use-cart';
import type {
  CheckoutControllerQuote200Data,
  UserAddressControllerCreate201Data,
  UserAddressControllerFindAll200,
} from '@/shared/api/models';
import {
  useCheckoutControllerCancel,
  useCheckoutControllerCreate,
  useCheckoutControllerFind,
} from '@/shared/api/query-generated/checkout/checkout';
import { useUserAddressControllerFindAll } from '@/shared/api/query-generated/user-addresses/user-addresses';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import type { PaymentMethodId } from '../types';
import { getShippingEstimateState } from '../utils/shipping-estimate-state';

export function useCheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const client = useQueryClient();
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;
  const cart = useCart();
  const addresses = useUserAddressControllerFindAll({
    query: {
      enabled: enabled && !id,
      queryKey: ['/api/user-addresses', session?.user.id],
    },
  });
  const checkout = useCheckoutControllerFind(id, {
    query: {
      enabled: enabled && !!id,
      queryKey: ['/api/checkouts', id, session?.user.id],
      refetchInterval: 5000,
      retry: false,
    },
  });
  const create = useCheckoutControllerCreate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const cancel = useCheckoutControllerCancel({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const [lastQuote, setLastQuote] = useState<{
    checkoutId: string;
    data: CheckoutControllerQuote200Data;
  }>();
  const quote = lastQuote?.checkoutId === id ? lastQuote.data : undefined;
  const [addressId, setAddressId] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('MOMO');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (!id && typeof window !== 'undefined') {
      const activeId = sessionStorage.getItem('activeCheckoutId');
      if (activeId) {
        router.replace(`/checkout?id=${activeId}`);
      }
    }
  }, [id, router]);

  const handleAddressCreated = (
    address: UserAddressControllerCreate201Data,
  ) => {
    client.setQueryData<UserAddressControllerFindAll200>(
      ['/api/user-addresses', session?.user.id],
      (previous) => ({
        statusCode: 200,
        message: previous?.message ?? 'Addresses loaded',
        data: [
          ...(previous?.data ?? []).map((a) =>
            address.isDefault ? { ...a, isDefault: false } : a,
          ),
          address,
        ],
      }),
    );
    setAddressId(address.id);
    void client.invalidateQueries({
      queryKey: ['/api/user-addresses', session?.user.id],
    });
  };

  const availableItems =
    cart.data?.data.groups
      .flatMap((g) => g.items)
      .filter((i) => i.availability === 'AVAILABLE' && i.product) ?? [];

  const selectedAddressObj =
    addresses.data?.data.find((a) => a.id === addressId) ||
    addresses.data?.data.find((a) => a.isDefault) ||
    addresses.data?.data[0];

  const selectedAddress = selectedAddressObj?.id || '';

  const data = checkout.data?.data;

  useEffect(() => {
    if (
      !id &&
      typeof window !== 'undefined' &&
      !(window as unknown as { Cypress?: unknown }).Cypress
    ) {
      const activeId = sessionStorage.getItem('activeCheckoutId');
      if (activeId) {
        router.replace(`/checkout?id=${activeId}`);
      } else {
        router.replace('/cart');
      }
    }
  }, [id, router]);

  useEffect(() => {
    if (
      data?.status &&
      data.status !== 'HELD' &&
      typeof window !== 'undefined'
    ) {
      sessionStorage.removeItem('activeCheckoutId');
    }
  }, [data?.status]);

  useEffect(() => {
    if (
      data?.status === 'CANCELLED' &&
      typeof window !== 'undefined' &&
      !(window as unknown as { Cypress?: unknown }).Cypress
    ) {
      router.replace('/cart');
    }
  }, [data?.status, router]);

  const handleCancelAndReturnToCart = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('activeCheckoutId');
      window.dispatchEvent(new Event('storage'));
    }
    if (data?.id && data.status === 'HELD') {
      cancel.mutate(
        { id: data.id },
        {
          onSettled: () => {
            void client.invalidateQueries({
              queryKey: cartQueryKey(session?.user.id),
            });
            router.push('/cart');
          },
        },
      );
    } else {
      router.push('/cart');
    }
  };
  const shippingState = getShippingEstimateState(
    quote,
    data?.status ?? 'EMPTY',
  );
  const error =
    create.error ||
    cancel.error ||
    checkout.error ||
    (!id && (cart.error || addresses.error));

  const reserve = () => {
    if (!availableItems.length || !selectedAddress) return;
    const productIds = availableItems.map((i) => i.productId).sort();
    const key = `rewear.checkout.request:${session?.user.id}:${selectedAddress}:${productIds.join(',')}`;
    let requestId = sessionStorage.getItem(key);
    if (!requestId) {
      requestId = crypto.randomUUID();
      sessionStorage.setItem(key, requestId);
    }
    create.mutate(
      { data: { requestId, addressId: selectedAddress, productIds } },
      {
        onSuccess: (response) => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('activeCheckoutId', response.data.id);
            sessionStorage.removeItem(key);
          }
          void client.invalidateQueries({
            queryKey: cartQueryKey(session?.user.id),
          });
          router.replace(`/checkout?id=${response.data.id}`);
        },
      },
    );
  };

  const handleQuote = (quoteData: CheckoutControllerQuote200Data) => {
    if (id) setLastQuote({ checkoutId: id, data: quoteData });
  };

  const handleCancelCheckout = () => {
    if (!data) return;
    cancel.mutate(
      { id: data.id },
      {
        onSuccess: () => {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('activeCheckoutId');
          }
          setCancelOpen(false);
          void checkout.refetch();
          void client.invalidateQueries({
            queryKey: cartQueryKey(session?.user.id),
          });
        },
      },
    );
  };

  return {
    router,
    id,
    enabled,
    addresses,
    checkout,
    create,
    cancel,
    quote,
    setAddressId,
    cancelOpen,
    setCancelOpen,
    addressModalOpen,
    setAddressModalOpen,
    paymentMethod,
    setPaymentMethod,
    paymentModalOpen,
    setPaymentModalOpen,
    handleAddressCreated,
    availableItems,
    selectedAddressObj,
    selectedAddress,
    data,
    handleCancelAndReturnToCart,
    handleCancelCheckout,
    handleQuote,
    shippingState,
    error,
    reserve,
  };
}
