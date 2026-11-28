import type { PaymentControllerFind200Data } from '@/shared/api/models';

export type PaymentState = PaymentControllerFind200Data['state'];
export type PaymentReturnMode = 'result' | 'cancel';
export const PAYMENT_POLL_INTERVAL = 5000;
export const PAYMENT_POLL_WINDOW = 120000;
export function isPendingPayment(state: PaymentState) {
  return state === 'CREATING' || state === 'PENDING' || state === 'UNKNOWN';
}
export function safePayosUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      url.hostname === 'pay.payos.vn' &&
      !url.username &&
      !url.password &&
      !url.port
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function getPaymentPresentation(
  state: PaymentState,
  mode: PaymentReturnMode,
) {
  switch (state) {
    case 'PAID':
      return {
        title: 'Payment confirmed',
        description:
          'Your orders have been placed and are awaiting seller confirmation.',
      };
    case 'FAILED':
      return {
        title: 'Payment was not completed',
        description:
          'No successful payment has been confirmed. Check your reservation before trying again.',
      };
    case 'REFUND_REQUIRED':
      return {
        title: 'Payment needs review',
        description:
          'We received a payment that could not be applied to this checkout. Do not pay again. Contact support to review your refund.',
      };
    case 'REFUNDED':
      return {
        title: 'Payment refunded',
        description:
          'The server records this payment as refunded. See the payment details or contact support if you need help.',
      };
    default:
      return mode === 'cancel'
        ? {
            title: 'Payment not confirmed yet',
            description:
              'You returned from PayOS. We will check the payment before you try again. Your checkout has not been cancelled automatically.',
          }
        : {
            title: 'Confirming your payment',
            description:
              'Already charged? We will confirm the result before updating your orders. Please wait before paying again.',
          };
  }
}
