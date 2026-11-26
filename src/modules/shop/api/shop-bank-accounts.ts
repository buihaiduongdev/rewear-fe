import { orvalRequest } from '@/shared/api/orval-request';

export type ShopBankAccount = {
  id: string;
  shopId: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  confirmedBy: string;
  confirmedAt: string;
  isDefault: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ShopPayoutOverviewResponse = {
  statusCode: number;
  message: string;
  data: {
    accounts: ShopBankAccount[];
    payouts: unknown[];
  };
};

export type ShopBankAccountResponse = {
  statusCode: number;
  message: string;
  data: ShopBankAccount;
};

export type ShopBankAccountInput = {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  ownerConfirmed: true;
  isDefault: boolean;
};

export const BANK_CODE_REGEX = /^[A-Z0-9_-]{2,40}$/;
export const ACCOUNT_NUMBER_REGEX = /^[0-9]{4,40}$/;

export const COMMON_VN_BANKS = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'MB', name: 'MB Bank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'CTG', name: 'VietinBank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'STB', name: 'Sacombank' },
] as const;

export type BankAccountValidationErrors = {
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  ownerConfirmed?: string;
};

export function validateBankAccountFields(values: {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  ownerConfirmed: boolean;
}): BankAccountValidationErrors {
  const errors: BankAccountValidationErrors = {};
  const bankCode = values.bankCode.trim().toUpperCase();
  const accountNumber = values.accountNumber.replace(/\s+/g, '');
  const accountName = values.accountName.trim();

  if (!BANK_CODE_REGEX.test(bankCode)) {
    errors.bankCode =
      'Enter a valid bank code (2–40 uppercase letters, digits, _ or -).';
  }
  if (!ACCOUNT_NUMBER_REGEX.test(accountNumber)) {
    errors.accountNumber = 'Enter a valid account number (4–40 digits).';
  }
  if (accountName.length < 2 || accountName.length > 150) {
    errors.accountName = 'Account holder name must be 2–150 characters.';
  }
  if (!values.ownerConfirmed) {
    errors.ownerConfirmed =
      'Please confirm this payout account belongs to the shop owner.';
  }
  return errors;
}

export const shopBankAccountsQueryKey = (shopId: string) =>
  [`/api/shops/${shopId}/finance/payouts`] as const;

export function fetchShopPayoutOverview(shopId: string, signal?: AbortSignal) {
  return orvalRequest<ShopPayoutOverviewResponse>({
    url: `/api/shops/${shopId}/finance/payouts`,
    method: 'GET',
    signal,
  });
}

export function createShopBankAccount(
  shopId: string,
  data: ShopBankAccountInput,
) {
  return orvalRequest<ShopBankAccountResponse>({
    url: `/api/shops/${shopId}/finance/bank-accounts`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export function updateShopBankAccount(
  shopId: string,
  accountId: string,
  data: ShopBankAccountInput,
) {
  return orvalRequest<ShopBankAccountResponse>({
    url: `/api/shops/${shopId}/finance/bank-accounts/${accountId}`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export function deleteShopBankAccount(shopId: string, accountId: string) {
  return orvalRequest<void>({
    url: `/api/shops/${shopId}/finance/bank-accounts/${accountId}`,
    method: 'DELETE',
  });
}
