import type {
  OrderControllerShopList200DataItem,
  OrderControllerShopListStatus,
} from '@/shared/api/models';

export type SellerOrderFilter = 'all' | OrderControllerShopListStatus;

const SELLER_ORDER_STATUS_LABELS: Record<
  OrderControllerShopListStatus,
  string
> = {
  waiting: 'Awaiting payment',
  pending: 'Awaiting confirmation',
  preparing: 'Preparing',
  shipping: 'Shipping',
  delivered: 'Delivered',
  completed: 'Completed',
  dispute: 'In dispute',
  returns: 'Return in progress',
  cancelled: 'Cancelled',
};

export function getSellerItemText(
  item: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = item[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function getSellerAddressLines(
  address: Record<string, unknown>,
): string[] {
  return [
    [
      getSellerItemText(address, 'recipientName'),
      getSellerItemText(address, 'phone'),
    ]
      .filter(Boolean)
      .join(' · '),
    [
      getSellerItemText(address, 'addressLine1'),
      getSellerItemText(address, 'addressLine2'),
    ]
      .filter(Boolean)
      .join(', '),
    [
      getSellerItemText(address, 'wardName'),
      getSellerItemText(address, 'provinceName'),
    ]
      .filter(Boolean)
      .join(', '),
  ].filter(Boolean);
}

export const SELLER_ORDER_FILTER_TABS: {
  key: SellerOrderFilter;
  label: string;
}[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
  { key: 'dispute', label: 'Disputed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function getSellerOrderStatusLabel(
  status: OrderControllerShopListStatus,
): string {
  return SELLER_ORDER_STATUS_LABELS[status] ?? status;
}

export function getSellerOrderStatusClass(
  status: OrderControllerShopListStatus,
): string {
  switch (status) {
    case 'pending':
      return 'border-amber-300 bg-amber-50 text-amber-900';
    case 'preparing':
      return 'border-sky-300 bg-sky-50 text-sky-900';
    case 'shipping':
      return 'border-indigo-300 bg-indigo-50 text-indigo-900';
    case 'delivered':
      return 'border-emerald-300 bg-emerald-50 text-emerald-900';
    case 'completed':
      return 'border-rewear-text bg-rewear-text text-rewear-surface';
    case 'dispute':
    case 'returns':
      return 'border-[#BA1A1A]/40 bg-red-50 text-[#BA1A1A]';
    case 'cancelled':
      return 'border-rewear-border bg-rewear-soft text-rewear-muted';
    default:
      return 'border-rewear-border bg-rewear-soft text-rewear-text';
  }
}

export function getOrderDisplayCode(
  order: OrderControllerShopList200DataItem,
): string {
  const code = (order as { orderCode?: string }).orderCode;
  return code && code.trim() ? code : order.id;
}

export function hasPendingCodCancelRequest(
  order: OrderControllerShopList200DataItem,
): boolean {
  return Boolean(order.cancelRequestedAt && !order.cancelState);
}

export function formatDeadlineCountdown(
  deadlineIso: string | null | undefined,
  nowMs: number,
): { text: string; overdue: boolean } | null {
  if (!deadlineIso) return null;
  const targetMs = new Date(deadlineIso).getTime();
  if (Number.isNaN(targetMs)) return null;
  const diffMs = targetMs - nowMs;
  if (diffMs <= 0) {
    return { text: 'Overdue', overdue: true };
  }
  const totalMinutes = Math.ceil(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return { text: `${hours}h ${minutes}m left`, overdue: false };
  }
  return { text: `${minutes}m left`, overdue: false };
}

export function getEscrowSummary(
  order: OrderControllerShopList200DataItem,
  nowMs: number,
): {
  badge: string;
  detail: string;
  tone: 'active' | 'settled' | 'hold';
} | null {
  if (order.status === 'completed') {
    return {
      badge: 'Settled',
      detail: 'Funds released to your shop balance.',
      tone: 'settled',
    };
  }
  if (order.status === 'dispute') {
    return {
      badge: 'Escrow on hold',
      detail: 'Settlement paused while dispute is under review.',
      tone: 'hold',
    };
  }
  if (order.status !== 'delivered') return null;

  const countdown = formatDeadlineCountdown(order.disputeDeadlineAt, nowMs);
  if (countdown && !countdown.overdue) {
    return {
      badge: `Escrow · ${countdown.text}`,
      detail: order.receiptConfirmedAt
        ? 'Buyer confirmed receipt. 72h protection window remains open until settlement.'
        : '72h buyer protection window is active before automatic settlement.',
      tone: 'active',
    };
  }

  return {
    badge: 'Ready for settlement',
    detail: '72h protection window closed. Payout will settle to shop funds.',
    tone: 'settled',
  };
}

export function formatVietnamDateTime(iso: string): string {
  return `${new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso))} ICT`;
}
