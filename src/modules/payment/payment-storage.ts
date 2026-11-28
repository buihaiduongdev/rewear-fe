type PaymentContext = { checkoutId: string; paymentId: string };
const contextKey = (userId: string) => `rewear.payos.context:${userId}`;
const requestKey = (userId: string, checkoutId: string) =>
  `rewear.payos.request:${userId}:${checkoutId}`;
export function savePaymentContext(userId: string, context: PaymentContext) {
  sessionStorage.setItem(contextKey(userId), JSON.stringify(context));
}
export function getPaymentContext(
  userId: string,
  checkoutId?: string,
): PaymentContext | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(contextKey(userId)) ?? 'null',
    );
    if (
      !value ||
      typeof value.checkoutId !== 'string' ||
      typeof value.paymentId !== 'string' ||
      !value.paymentId ||
      !value.checkoutId
    )
      return null;
    if (checkoutId && value.checkoutId !== checkoutId) return null;
    return { checkoutId: value.checkoutId, paymentId: value.paymentId };
  } catch {
    return null;
  }
}
export function getPaymentRequestId(
  userId: string,
  checkoutId: string,
  previousFailedId?: string,
) {
  const key =
    requestKey(userId, checkoutId) +
    (previousFailedId ? `:${previousFailedId}` : '');
  const saved = sessionStorage.getItem(key);
  if (saved) return saved;
  const requestId = crypto.randomUUID();
  sessionStorage.setItem(key, requestId);
  return requestId;
}
export function clearPaymentRequestId(userId: string, checkoutId: string) {
  sessionStorage.removeItem(requestKey(userId, checkoutId));
}
