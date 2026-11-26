import { orvalRequest } from '@/shared/api/orval-request';
import { uploadPrivateMedia } from '@/shared/api/private-media';

export type ShopApplicationKind = 'INITIAL' | 'RENEWAL';
export type ShopApplicationState =
  'DRAFT' | 'SUBMITTED' | 'NEEDS_INFO' | 'REJECTED' | 'APPROVED';
export type IdentityDocumentType = 'NATIONAL_ID' | 'PASSPORT';
export type IdentityDocumentSlot = 'FRONT' | 'BACK' | 'PASSPORT';

export interface ApplicantIdentity {
  documentType: IdentityDocumentType;
  documentNumber: string;
  issuingCountry: string;
  fullName: string;
  birthDate: string;
  expiresOn: string;
}

export interface ApplicationDocumentView {
  id: string;
  slot: IdentityDocumentSlot;
  mimeType: string;
  sizeBytes: number;
  isSelected: boolean;
}

export interface ShopApplicationSummary {
  id: string;
  shopId: string;
  kind: ShopApplicationKind;
  state: ShopApplicationState;
  submittedAt: string | null;
  reviewedAt: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShopApplicationDetail extends ShopApplicationSummary {
  identity: ApplicantIdentity | null;
  shop: {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
  };
  pickup: {
    id: string;
    contactName: string;
    phone: string;
    addressLine1: string;
    provinceName: string;
    districtName: string;
    wardName: string;
  } | null;
  bank: {
    id: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    confirmedBy: string;
  } | null;
  documents: ApplicationDocumentView[];
}

export interface AdminShopApplicationDetail extends ShopApplicationDetail {
  applicantId: string;
  reviewedById: string | null;
  adminNote: string | null;
}

export interface ShopApplicationPage {
  items: ShopApplicationSummary[];
  totalCount: number;
  limit: number;
  offset: number;
}

export interface BankAccountView {
  id: string;
  shopId: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

type ApiEnvelope<T> = { data: T };

export const KYC_STATE_LABELS: Record<ShopApplicationState, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'In review',
  NEEDS_INFO: 'Action required',
  REJECTED: 'Rejected',
  APPROVED: 'Verified',
};

export function listMyApplications(params?: {
  kind?: ShopApplicationKind;
  state?: ShopApplicationState;
  limit?: number;
  offset?: number;
}) {
  return orvalRequest<ApiEnvelope<ShopApplicationPage>>({
    url: '/api/shop-applications/mine',
    method: 'GET',
    params,
  });
}

export function getMyApplicationDetail(id: string) {
  return orvalRequest<ApiEnvelope<ShopApplicationDetail>>({
    url: `/api/shop-applications/${id}`,
    method: 'GET',
  });
}

export function createShopApplication(shopId: string) {
  return orvalRequest<ApiEnvelope<ShopApplicationDetail>>({
    url: `/api/shops/${shopId}/application`,
    method: 'POST',
  });
}

export function createIdentityRenewal(shopId: string) {
  return orvalRequest<ApiEnvelope<ShopApplicationDetail>>({
    url: `/api/shops/${shopId}/identity-renewals`,
    method: 'POST',
  });
}

export async function attachApplicationDocument(
  applicationId: string,
  slot: IdentityDocumentSlot,
  file: File,
): Promise<ApplicationDocumentView> {
  const mediaId = await uploadPrivateMedia(file);
  const res = await orvalRequest<ApiEnvelope<ApplicationDocumentView>>({
    url: `/api/shop-applications/${applicationId}/documents`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { slot, mediaId },
  });
  return res.data;
}

export function submitShopApplication(
  applicationId: string,
  data: {
    identity: ApplicantIdentity;
    bankAccountId: string;
    documentIds: string[];
  },
) {
  return orvalRequest<ApiEnvelope<ShopApplicationDetail>>({
    url: `/api/shop-applications/${applicationId}/submissions`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export function submitIdentityRenewal(
  applicationId: string,
  data: {
    identity: ApplicantIdentity;
    documentIds: string[];
  },
) {
  return orvalRequest<ApiEnvelope<ShopApplicationDetail>>({
    url: `/api/shop-applications/${applicationId}/renewal-submissions`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export function listShopBankAccounts(shopId: string) {
  return orvalRequest<ApiEnvelope<{ accounts: BankAccountView[] }>>({
    url: `/api/shops/${shopId}/finance/payouts`,
    method: 'GET',
  });
}

export function addShopBankAccount(
  shopId: string,
  data: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
    ownerConfirmed: true;
    isDefault: boolean;
  },
) {
  return orvalRequest<ApiEnvelope<BankAccountView>>({
    url: `/api/shops/${shopId}/finance/bank-accounts`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export function listAdminApplications(params?: {
  kind?: ShopApplicationKind;
  state?: ShopApplicationState;
  limit?: number;
  offset?: number;
}) {
  return orvalRequest<ApiEnvelope<ShopApplicationPage>>({
    url: '/api/shop-applications/admin',
    method: 'GET',
    params,
  });
}

export function getAdminApplicationDetail(id: string) {
  return orvalRequest<ApiEnvelope<AdminShopApplicationDetail>>({
    url: `/api/shop-applications/admin/${id}`,
    method: 'GET',
  });
}

export function decideAdminApplication(
  id: string,
  data: {
    outcome: 'APPROVED' | 'REJECTED' | 'NEEDS_INFO';
    reason: string;
    adminNote: string;
  },
) {
  return orvalRequest<ApiEnvelope<AdminShopApplicationDetail>>({
    url: `/api/shop-applications/admin/${id}/decisions`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export async function openApplicationDocumentDownload(documentId: string) {
  const res = await orvalRequest<
    ApiEnvelope<{
      url: string;
      headers: Record<string, string>;
      expiresAt: string;
    }>
  >({
    url: `/api/shop-application-documents/${documentId}/download`,
    method: 'GET',
  });
  window.open(res.data.url, '_blank', 'noopener,noreferrer');
}

export function getGraceStatus(expiresOn: string | null | undefined) {
  if (!expiresOn) return null;
  const expiry = new Date(`${expiresOn}T23:59:59+07:00`);
  if (Number.isNaN(expiry.getTime())) return null;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.ceil((expiry.getTime() - now) / dayMs);
  if (diffDays > 30) {
    return {
      tone: 'ok' as const,
      label: `Valid until ${expiresOn}`,
      detail: 'Your verified identity document is up to date.',
    };
  }
  if (diffDays >= 0) {
    return {
      tone: 'warning' as const,
      label: `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
      detail:
        'Renew your identity document before expiry to avoid payout or listing interruptions.',
    };
  }
  const graceRemaining = 30 + diffDays;
  if (graceRemaining > 0) {
    return {
      tone: 'danger' as const,
      label: `30-day grace period · ${graceRemaining} day${graceRemaining === 1 ? '' : 's'} left`,
      detail:
        'Your ID has expired. Submit a renewal before the 30-day grace window closes to keep your shop active.',
    };
  }
  return {
    tone: 'danger' as const,
    label: 'Grace period expired',
    detail:
      'Your identity document grace period has elapsed. Submit an identity renewal immediately.',
  };
}
