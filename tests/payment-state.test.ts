import {
  getPaymentPresentation,
  isPendingPayment,
  safePayosUrl,
} from '@/modules/payment/payment-state';
import {
  clearPaymentRequestId,
  getPaymentContext,
  getPaymentRequestId,
  savePaymentContext,
} from '@/modules/payment/payment-storage';
import { beforeEach, describe, expect, it } from 'vitest';

describe('verified payment state', () => {
  it('only treats server PAID as success, never a cancelled callback', () => {
    expect(getPaymentPresentation('PAID', 'cancel').title).toBe(
      'Payment confirmed',
    );
    expect(getPaymentPresentation('UNKNOWN', 'result').title).toBe(
      'Confirming your payment',
    );
    expect(getPaymentPresentation('PENDING', 'cancel').title).toBe(
      'Payment not confirmed yet',
    );
    expect(getPaymentPresentation('REFUND_REQUIRED', 'result').title).toBe(
      'Payment needs review',
    );
    expect(isPendingPayment('UNKNOWN')).toBe(true);
    expect(isPendingPayment('FAILED')).toBe(false);
  });
  it('only redirects to the hosted HTTPS PayOS checkout', () => {
    expect(safePayosUrl('https://pay.payos.vn/web/checkout/abc')).toBeTruthy();
    for (const url of [
      'javascript:alert(1)',
      'http://pay.payos.vn/x',
      'https://pay.payos.vn.evil.test',
      'https://evil.test',
      'https://x:secret@pay.payos.vn/x',
    ])
      expect(safePayosUrl(url)).toBeNull();
  });
});
describe('payment browser context', () => {
  beforeEach(() => sessionStorage.clear());
  it('scopes context to buyer and checkout and preserves the same request on retry', () => {
    const id = getPaymentRequestId('buyer', 'checkout');
    expect(getPaymentRequestId('buyer', 'checkout')).toBe(id);
    clearPaymentRequestId('buyer', 'checkout');
    expect(getPaymentRequestId('buyer', 'checkout')).not.toBe(id);
    savePaymentContext('buyer', {
      checkoutId: 'checkout',
      paymentId: 'payment',
    });
    expect(getPaymentContext('buyer', 'checkout')?.paymentId).toBe('payment');
    expect(getPaymentContext('stranger')).toBeNull();
    expect(getPaymentContext('buyer', 'another')).toBeNull();
  });
  it('handles corrupt browser storage without guessing a transaction', () => {
    sessionStorage.setItem('rewear.payos.context:buyer', 'not json');
    expect(getPaymentContext('buyer')).toBeNull();
  });
});
