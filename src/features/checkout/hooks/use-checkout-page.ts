'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { cartQueryKey, useCart } from '@/modules/cart/hooks/use-cart';
import { getApiErrorMessage } from '@/shared/api/api-error';
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
import { useCodControllerPlace } from '@/shared/api/query-generated/cod/cod';
import { useUserAddressControllerFindAll } from '@/shared/api/query-generated/user-addresses/user-addresses';
import { useWalletControllerMine } from '@/shared/api/query-generated/wallet/wallet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import {
  type CheckoutWithCoinsData,
  confirmWalletCheckout,
  createMomoPayment,
  createPayosPayment,
  fetchCoinBalance,
  redirectToExternalUrl,
  reserveWalletCheckout,
  saveLastPaymentSession,
  selectCheckoutCoins,
} from '../api/checkout-payment.api';
import type { PaymentMethodId, ReconciliationMode } from '../types';
import { getShippingEstimateState } from '../utils/shipping-estimate-state';

type WalletBalanceShape = {
  balance?: number;
  simulationBalance?: number;
};

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

  const walletQuery = useWalletControllerMine(
    { limit: 1, offset: 0 },
    {
      query: {
        enabled: enabled && !!id,
        queryKey: ['/api/wallet/mine', session?.user.id],
        retry: false,
      },
    },
  );

  const coinsQuery = useQuery({
    queryKey: ['/api/coins/balance', session?.user.id],
    queryFn: () => fetchCoinBalance(),
    enabled: enabled && !!id,
    retry: false,
  });

  const create = useCheckoutControllerCreate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const cancel = useCheckoutControllerCancel({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const codPlace = useCodControllerPlace({
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
  const [useWallet, setUseWallet] = useState(false);
  const [coinPending, setCoinPending] = useState(false);
  const [placingPayment, setPlacingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [coinDiscountOverride, setCoinDiscountOverride] = useState<
    number | null
  >(null);

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
  const data = checkout.data?.data as CheckoutWithCoinsData | undefined;

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

  const shippingState = getShippingEstimateState(
    quote,
    data?.status ?? 'EMPTY',
  );

  // Wallet balance (supports both verified EVIDENCE pool and SIMULATION sandbox pool)
  const walletRaw = walletQuery.data?.data as WalletBalanceShape | undefined;
  const evidenceWalletBalance = walletRaw?.balance ?? 0;
  const simulationWalletBalance = walletRaw?.simulationBalance ?? 0;
  const walletMode: ReconciliationMode =
    evidenceWalletBalance > 0 || simulationWalletBalance === 0
      ? 'EVIDENCE'
      : 'SIMULATION';
  const availableWalletBalance =
    walletMode === 'EVIDENCE' ? evidenceWalletBalance : simulationWalletBalance;

  // Reward Coins (0.5% earned, usable up to 10% of item subtotal)
  const coinRaw = coinsQuery.data?.data;
  const preferSimulationCoins =
    !useWallet && (paymentMethod === 'MOMO' || paymentMethod === 'PAYOS');
  const coinMode: ReconciliationMode = useWallet
    ? walletMode
    : preferSimulationCoins
      ? 'SIMULATION'
      : (coinRaw?.balance ?? 0) > 0
        ? 'EVIDENCE'
        : 'SIMULATION';
  const availableCoinBalance =
    coinMode === 'SIMULATION'
      ? (coinRaw?.simulationBalance ?? 0)
      : (coinRaw?.balance ?? 0);

  const subtotal = data?.subtotal ?? 0;
  const maxCoinByPolicy = Math.floor(subtotal / 10);
  const maxApplicableCoins = Math.min(availableCoinBalance, maxCoinByPolicy);
  const coinDiscount = coinDiscountOverride ?? data?.coinDiscount ?? 0;
  const useCoins = coinDiscount > 0;

  const grossTotal =
    shippingState.complete && quote?.grandTotal !== null
      ? quote!.grandTotal
      : subtotal;
  const payableTotal = Math.max(0, grossTotal - coinDiscount);
  const canCoverWithWallet =
    payableTotal > 0 && availableWalletBalance >= payableTotal;

  // Turn off wallet toggle automatically if balance no longer covers full total
  const effectiveUseWallet = useWallet && canCoverWithWallet;

  const canPlaceOrder =
    Boolean(data) &&
    data?.status === 'HELD' &&
    shippingState.complete &&
    !placingPayment &&
    !coinPending &&
    !cancel.isPending;

  const handleToggleCoins = async (nextEnabled: boolean) => {
    if (!data || data.status !== 'HELD' || coinPending || placingPayment) {
      return;
    }
    const targetAmount = nextEnabled ? maxApplicableCoins : 0;
    if (nextEnabled && targetAmount <= 0) return;

    setCoinPending(true);
    setPaymentError('');
    try {
      const response = await selectCheckoutCoins(data.id, {
        requestId: crypto.randomUUID(),
        amount: targetAmount,
        mode: coinMode,
      });
      setCoinDiscountOverride(response.data.coinDiscount ?? targetAmount);
      void checkout.refetch();
    } catch (cause) {
      setPaymentError(getApiErrorMessage(cause));
    } finally {
      setCoinPending(false);
    }
  };

  const handleToggleWallet = (nextEnabled: boolean) => {
    setPaymentError('');
    if (nextEnabled && !canCoverWithWallet) return;
    setUseWallet(nextEnabled);
  };

  const handlePlaceOrder = async () => {
    if (!data || !canPlaceOrder) return;
    setPlacingPayment(true);
    setPaymentError('');

    try {
      if (effectiveUseWallet) {
        let finalWalletTotal = payableTotal;
        if (coinDiscount > 0 && data.coinMode && data.coinMode !== walletMode) {
          const matchingCoins =
            walletMode === 'SIMULATION'
              ? (coinRaw?.simulationBalance ?? 0)
              : (coinRaw?.balance ?? 0);
          const alignedAmount = Math.min(matchingCoins, maxCoinByPolicy);
          const updated = await selectCheckoutCoins(data.id, {
            requestId: crypto.randomUUID(),
            amount: alignedAmount,
            mode: walletMode,
          });
          const nextDiscount = updated.data.coinDiscount ?? alignedAmount;
          setCoinDiscountOverride(nextDiscount);
          finalWalletTotal = Math.max(0, grossTotal - nextDiscount);
        }
        const holdResponse = await reserveWalletCheckout(data.id, {
          expectedTotal: finalWalletTotal,
          mode: walletMode,
        });
        await confirmWalletCheckout(holdResponse.data.id);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('activeCheckoutId');
        }
        void client.invalidateQueries({
          queryKey: cartQueryKey(session?.user.id),
        });
        void client.invalidateQueries({
          queryKey: ['/api/wallet/mine', session?.user.id],
        });
        void client.invalidateQueries({ queryKey: ['/api/orders/mine'] });
        router.push('/orders');
        return;
      }

      if (paymentMethod === 'COD') {
        await codPlace.mutateAsync({
          id: data.id,
          data: { expectedTotal: payableTotal },
        });
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('activeCheckoutId');
        }
        void client.invalidateQueries({
          queryKey: cartQueryKey(session?.user.id),
        });
        void client.invalidateQueries({ queryKey: ['/api/orders/mine'] });
        router.push('/orders');
        return;
      }

      // Online gateway payment: MoMo Sandbox or PayOS VietQR
      const requestKey = `rewear.payment.request:${data.id}:${paymentMethod}`;
      let requestId =
        typeof window !== 'undefined'
          ? sessionStorage.getItem(requestKey)
          : null;
      if (!requestId) {
        requestId = crypto.randomUUID();
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(requestKey, requestId);
        }
      }

      const response =
        paymentMethod === 'PAYOS'
          ? await createPayosPayment(data.id, requestId)
          : await createMomoPayment(data.id, requestId);

      const attempt = response.data;
      saveLastPaymentSession({
        paymentId: attempt.id,
        checkoutId: data.id,
        provider: paymentMethod,
        amount: attempt.amount,
      });

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(requestKey);
      }

      if (attempt.payUrl) {
        redirectToExternalUrl(attempt.payUrl);
        return;
      }

      router.push(
        `/payment-result?paymentId=${encodeURIComponent(attempt.id)}&checkoutId=${encodeURIComponent(data.id)}`,
      );
    } catch (cause) {
      setPaymentError(getApiErrorMessage(cause));
      setPlacingPayment(false);
    }
  };

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
    useWallet: effectiveUseWallet,
    handleToggleWallet,
    availableWalletBalance,
    canCoverWithWallet,
    useCoins,
    handleToggleCoins,
    coinPending,
    availableCoinBalance,
    maxApplicableCoins,
    coinDiscount,
    payableTotal,
    canPlaceOrder,
    placingPayment,
    paymentError,
    handlePlaceOrder,
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
