import type {
  CheckoutControllerFind200,
  PaymentControllerCreate200Data,
} from '@/shared/api/models';
import { orvalRequest } from '@/shared/api/orval-request';
import { paymentControllerCreate } from '@/shared/api/query-generated/payments/payments';

import type { LastPaymentSession, ReconciliationMode } from '../types';

export type PaymentAttemptView = PaymentControllerCreate200Data & {
  provider?: 'MOMO' | 'PAYOS';
};

type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

export type CoinBalanceData = {
  balance: number;
  heldBalance: number;
  simulationBalance: number;
  simulationHeldBalance: number;
};

export type WalletCheckoutHoldData = {
  id: string;
  checkoutId: string;
  amount: number;
  mode: ReconciliationMode;
  state: 'HELD' | 'CAPTURED' | 'RELEASED' | 'EXPIRED';
  expiresAt: string;
  capturedAt: string | null;
  releasedAt: string | null;
};

export type CheckoutWithCoinsData = CheckoutControllerFind200['data'] & {
  coinDiscount?: number;
  coinMode?: ReconciliationMode | null;
};

const LAST_PAYMENT_STORAGE_KEY = 'rewear.lastPayment';

export function createMomoPayment(checkoutId: string, requestId: string) {
  return paymentControllerCreate(checkoutId, { requestId }) as Promise<
    ApiEnvelope<PaymentAttemptView>
  >;
}

export function createPayosPayment(checkoutId: string, requestId: string) {
  return orvalRequest<ApiEnvelope<PaymentAttemptView>>({
    url: `/api/checkouts/${checkoutId}/payments/payos`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { requestId },
  });
}

export function fetchCoinBalance() {
  return orvalRequest<ApiEnvelope<CoinBalanceData>>({
    url: '/api/coins/balance',
    method: 'GET',
  });
}

export function selectCheckoutCoins(
  checkoutId: string,
  body: { requestId: string; amount: number; mode: ReconciliationMode },
) {
  return orvalRequest<ApiEnvelope<CheckoutWithCoinsData>>({
    url: `/api/checkouts/${checkoutId}/coins`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export function reserveWalletCheckout(
  checkoutId: string,
  body: { expectedTotal: number; mode: ReconciliationMode },
) {
  return orvalRequest<ApiEnvelope<WalletCheckoutHoldData>>({
    url: `/api/checkouts/${checkoutId}/payments/wallet`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  });
}

export function confirmWalletCheckout(holdId: string) {
  return orvalRequest<ApiEnvelope<WalletCheckoutHoldData>>({
    url: `/api/wallet/checkouts/${holdId}/confirm`,
    method: 'POST',
  });
}

export function releaseWalletCheckout(holdId: string) {
  return orvalRequest<ApiEnvelope<WalletCheckoutHoldData>>({
    url: `/api/wallet/checkouts/${holdId}/release`,
    method: 'POST',
  });
}

export function saveLastPaymentSession(session: LastPaymentSession) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(LAST_PAYMENT_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

export function readLastPaymentSession(): LastPaymentSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LAST_PAYMENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LastPaymentSession>;
    if (!parsed.paymentId || !parsed.checkoutId) return null;
    return {
      paymentId: parsed.paymentId,
      checkoutId: parsed.checkoutId,
      provider: parsed.provider === 'PAYOS' ? 'PAYOS' : 'MOMO',
      amount: typeof parsed.amount === 'number' ? parsed.amount : 0,
    };
  } catch {
    return null;
  }
}

export function clearLastPaymentSession() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(LAST_PAYMENT_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function redirectToExternalUrl(url: string) {
  if (typeof window !== 'undefined') {
    window.location.assign(url);
  }
}
