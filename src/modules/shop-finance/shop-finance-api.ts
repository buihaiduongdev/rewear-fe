import { axiosClient } from '@/shared/api/axios-client';

type Envelope<T> = { data: T };

export type PayoutStatus =
  'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'CANCELLED' | 'REJECTED' | 'FAILED';

export type RecipientSnapshot = {
  bankCode: string;
  accountNumber: string;
  accountName: string;
};

export type ShopBankAccount = RecipientSnapshot & {
  id: string;
  shopId: string;
  confirmedBy: string;
  confirmedAt: string;
  isDefault: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ShopPayout = {
  id: string;
  shopId: string;
  ownerId: string;
  requestId: string;
  mode: 'EVIDENCE' | 'SIMULATION';
  status: PayoutStatus;
  amount: number;
  bankAccountId: string;
  recipientSnapshot: RecipientSnapshot;
  createdAt: string;
  updatedAt: string;
  dueAt: string | null;
  processedAt: string | null;
  completedAt: string | null;
  bankReference: string | null;
  bankTransferredAt: string | null;
  reason: string | null;
};

export type AdminShopPayout = ShopPayout & {
  transferEvidence: string | null;
  transferEvidenceMediaId: string | null;
  transferEvidenceUrl: string | null;
};

export type ShopFinanceSummary = {
  shopId: string;
  mode: 'EVIDENCE' | 'SIMULATION';
  held: number;
  receivable: number;
  available: number;
  payoutLocked: number;
  paidOut: number;
  paidOutDebt: number;
  heldShortfall: number;
  reviewHeld: number;
  shippingDebit: number;
  settlements: {
    id: string;
    orderId: string;
    amount: number;
    createdAt: string;
  }[];
  entries: {
    id: string;
    orderId: string;
    type: string;
    amount: number;
    createdAt: string;
  }[];
};

export type PayoutOwnerView = {
  accounts: ShopBankAccount[];
  payouts: ShopPayout[];
};

export type PayoutReceiptUploadTicket = {
  id: string;
  uploadUrl: string;
  method: 'PUT';
  headers: Record<string, string>;
};

export type PayoutReceiptDownload = {
  mediaId: string;
  url: string;
  expiresAt: string | null;
};

export type BankAccountInput = RecipientSnapshot & {
  ownerConfirmed: true;
  isDefault: boolean;
};

export type PayoutSuccessInput = RecipientSnapshot & {
  amount: number;
  bankReference: string;
  transferredAt: string;
  evidence: string;
  transferEvidenceMediaId?: string;
};

export const shopFinanceApi = {
  getFinance: (shopId: string) =>
    axiosClient.get<never, Envelope<ShopFinanceSummary>>(
      `/shops/${shopId}/finance`,
    ),
  getOwnerPayouts: (shopId: string) =>
    axiosClient.get<never, Envelope<PayoutOwnerView>>(
      `/shops/${shopId}/finance/payouts`,
    ),
  addBankAccount: (shopId: string, input: BankAccountInput) =>
    axiosClient.post<never, Envelope<ShopBankAccount>>(
      `/shops/${shopId}/finance/bank-accounts`,
      input,
    ),
  deleteBankAccount: (shopId: string, accountId: string) =>
    axiosClient.delete(`/shops/${shopId}/finance/bank-accounts/${accountId}`),
  requestPayout: (
    shopId: string,
    input: {
      requestId: string;
      mode?: 'EVIDENCE' | 'SIMULATION';
      amount: number;
      bankAccountId: string;
    },
  ) =>
    axiosClient.post<never, Envelope<ShopPayout>>(
      `/shops/${shopId}/finance/payouts`,
      { mode: 'EVIDENCE', ...input },
    ),
  cancelPayout: (shopId: string, payoutId: string) =>
    axiosClient.post<never, Envelope<ShopPayout>>(
      `/shops/${shopId}/finance/payouts/${payoutId}/cancel`,
      {},
    ),
  adminListPayouts: () =>
    axiosClient.get<never, Envelope<{ payouts: AdminShopPayout[] }>>(
      '/admin/shop-payouts',
    ),
  adminStartPayout: (payoutId: string) =>
    axiosClient.post<never, Envelope<ShopPayout>>(
      `/admin/shop-payouts/${payoutId}/start`,
      {},
    ),
  adminRejectPayout: (payoutId: string, reason: string) =>
    axiosClient.post<never, Envelope<ShopPayout>>(
      `/admin/shop-payouts/${payoutId}/reject`,
      { reason },
    ),
  adminFailPayout: (
    payoutId: string,
    input: { reason: string; evidence: string },
  ) =>
    axiosClient.post<never, Envelope<ShopPayout>>(
      `/admin/shop-payouts/${payoutId}/failure`,
      input,
    ),
  adminCreateReceiptUploadTicket: (input: {
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';
    sizeBytes: number;
  }) =>
    axiosClient.post<never, Envelope<PayoutReceiptUploadTicket>>(
      '/admin/shop-payouts/receipt-upload-ticket',
      input,
    ),
  adminGetPayoutReceipt: (payoutId: string) =>
    axiosClient.get<never, Envelope<PayoutReceiptDownload>>(
      `/admin/shop-payouts/${payoutId}/receipt`,
    ),
  adminSucceedPayout: (payoutId: string, input: PayoutSuccessInput) =>
    axiosClient.post<never, Envelope<AdminShopPayout>>(
      `/admin/shop-payouts/${payoutId}/success`,
      input,
    ),
};
