import type { OrderControllerBuyerListStatus } from '@/shared/api/models';
import { PRODUCT_CONDITION_LABELS } from '@/shared/utils/product';

export const ORDER_STATUS_LABELS: Record<
  OrderControllerBuyerListStatus,
  string
> = {
  waiting: 'Awaiting payment',
  pending: 'Awaiting seller confirmation',
  preparing: 'Preparing',
  shipping: 'Shipping',
  delivered: 'Delivered',
  completed: 'Completed',
  dispute: 'In dispute',
  returns: 'Return in progress',
  cancelled: 'Cancelled',
};

export function getItemText(
  item: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = item[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function getAddressLines(address: Record<string, unknown>): string[] {
  const lines = [
    [getItemText(address, 'recipientName'), getItemText(address, 'phone')]
      .filter(Boolean)
      .join(' · '),
    [getItemText(address, 'addressLine1'), getItemText(address, 'addressLine2')]
      .filter(Boolean)
      .join(', '),
    [getItemText(address, 'wardName'), getItemText(address, 'provinceName')]
      .filter(Boolean)
      .join(', '),
  ];
  return lines.filter(Boolean);
}

export function getItemCondition(
  item: Record<string, unknown>,
): string | undefined {
  const value = getItemText(item, 'condition');
  return value && value in PRODUCT_CONDITION_LABELS
    ? PRODUCT_CONDITION_LABELS[value as keyof typeof PRODUCT_CONDITION_LABELS]
    : value;
}
