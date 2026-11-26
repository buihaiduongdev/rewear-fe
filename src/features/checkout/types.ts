export type PaymentMethodId = 'MOMO' | 'PAYOS' | 'COD';

export type ReconciliationMode = 'EVIDENCE' | 'SIMULATION';

export type LastPaymentSession = {
  paymentId: string;
  checkoutId: string;
  provider: 'MOMO' | 'PAYOS';
  amount: number;
};
