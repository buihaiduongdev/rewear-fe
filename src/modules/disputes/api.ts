import { orvalRequest } from '@/shared/api/orval-request';
import { uploadPrivateMedia } from '@/shared/api/private-media';

export type DisputeCaseState = 'OPEN' | 'CLOSED';
export type DisputeIssueState =
  | 'ACTIVE'
  | 'AWAITING_APPEAL'
  | 'APPEAL_REVIEW'
  | 'AWAITING_EXECUTION'
  | 'RESOLVED_NO_REFUND'
  | 'RESOLVED_REFUND';
export type DisputeKind =
  'WRONG_ITEM' | 'NOT_AS_DESCRIBED' | 'MISSING_ITEM' | 'TRANSIT_DAMAGE';
export type DisputeParty = 'BUYER' | 'SELLER';
export type DisputeDecisionOutcome =
  'UPHOLD_CLAIM' | 'REJECT_CLAIM' | 'REQUIRE_RETURN';
export type DisputeResponsibility =
  'SELLER' | 'BUYER' | 'CARRIER' | 'UNDETERMINED';
export type ReturnState =
  'WAITING_LABEL' | 'AWAITING_HANDOVER' | 'IN_TRANSIT' | 'READY' | 'EXPIRED';
export type DisputeEvidenceTag =
  | 'ISSUE'
  | 'UNBOX'
  | 'PARCEL'
  | 'LABEL'
  | 'RECEIVED_ITEMS'
  | 'DAMAGE'
  | 'PACKING'
  | 'RETURN_ITEM'
  | 'RETURN_PARCEL'
  | 'RETURN_LABEL';
export type ReconciliationMode = 'EVIDENCE' | 'SIMULATION';

export interface DisputeEvidenceView {
  id: string;
  mimeType: string;
  sizeBytes: number;
  tags: string[];
}

export interface DisputeIssueView {
  id: string;
  caseId: string;
  productId: string;
  kind: DisputeKind;
  description: string;
  evidenceIds: string[];
  status: DisputeIssueState;
  sellerRespondBy: string;
  reviewDueAt: string;
  maxReviewDueAt: string;
  extendedAt: string | null;
  extensionReason: string | null;
  reviewOverdue: boolean;
  createdAt: string;
}

export interface DisputeMessageView {
  id: string;
  issueId: string;
  actorId: string;
  party: DisputeParty;
  text: string;
  evidenceIds: string[];
  createdAt: string;
}

export interface DisputeDecisionView {
  id: string;
  issueId: string;
  actorId: string;
  outcome: DisputeDecisionOutcome;
  responsibility: DisputeResponsibility;
  reason: string;
  itemPrice: number;
  refundAmount: number | null;
  decidedAt: string;
  appealUntil: string;
  finalizedAt: string | null;
  finalOutcome: DisputeDecisionOutcome | null;
  finalRefundAmount: number | null;
  finalReason: string | null;
  finalActorId: string | null;
}

export interface DisputeAppealView {
  id: string;
  decisionId: string;
  actorId: string;
  party: DisputeParty;
  reason: string;
  evidenceIds: string[];
  filedAt: string;
  reviewDueAt: string;
  reviewOverdue: boolean;
}

export interface ReturnView {
  id: string;
  decisionId: string;
  orderId: string;
  productId: string;
  state: ReturnState;
  mode: ReconciliationMode | null;
  labelCode: string | null;
  instructions: string | null;
  handoverBy: string | null;
  handoverAt: string | null;
  deliveredAt: string | null;
  readyAt: string | null;
}

export interface DisputeCaseView {
  id: string;
  orderId: string;
  buyerId: string;
  shopId: string;
  state: DisputeCaseState;
  createdAt: string;
  issues: DisputeIssueView[];
}

export interface DisputeCaseDetail extends DisputeCaseView {
  messages: DisputeMessageView[];
  evidence: DisputeEvidenceView[];
  decisions: DisputeDecisionView[];
  appeals: DisputeAppealView[];
  returns: ReturnView[];
}

export interface RefundCreditView {
  id: string;
  decisionId: string;
  orderId: string;
  mode: ReconciliationMode;
  amount: number;
  commissionReversed: number;
  sellerDebit: number;
  createdAt: string;
}

export interface DisputeDecisionInput {
  outcome: DisputeDecisionOutcome;
  responsibility: DisputeResponsibility;
  reason: string;
  refundAmount?: number | null;
}

export interface ReturnLabelInput {
  mode: ReconciliationMode;
  waybillCode?: string;
  instructions?: string;
}

type ApiEnvelope<T> = { data: T };

export const DISPUTE_KIND_LABELS: Record<DisputeKind, string> = {
  WRONG_ITEM: 'Wrong item',
  NOT_AS_DESCRIBED: 'Not as described',
  MISSING_ITEM: 'Missing item',
  TRANSIT_DAMAGE: 'Damaged in transit',
};

export const DISPUTE_ISSUE_STATUS_LABELS: Record<DisputeIssueState, string> = {
  ACTIVE: 'Under review',
  AWAITING_APPEAL: 'Decision issued · Appeal window',
  APPEAL_REVIEW: 'Appeal under review',
  AWAITING_EXECUTION: 'Awaiting return / refund',
  RESOLVED_NO_REFUND: 'Closed · No refund',
  RESOLVED_REFUND: 'Resolved · Refunded',
};

export const DISPUTE_OUTCOME_LABELS: Record<DisputeDecisionOutcome, string> = {
  UPHOLD_CLAIM: 'Approve refund (no return)',
  REQUIRE_RETURN: 'Require return before refund',
  REJECT_CLAIM: 'Reject claim',
};

export const DISPUTE_RESPONSIBILITY_LABELS: Record<
  DisputeResponsibility,
  string
> = {
  SELLER: 'Seller',
  BUYER: 'Buyer',
  CARRIER: 'Carrier',
  UNDETERMINED: 'Undetermined',
};

export const RETURN_STATE_LABELS: Record<ReturnState, string> = {
  WAITING_LABEL: 'Awaiting return label',
  AWAITING_HANDOVER: 'Ready to ship back',
  IN_TRANSIT: 'Return in transit',
  READY: 'Return verified',
  EXPIRED: 'Return window expired',
};

export function formatIctDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(date)} ICT`;
}

export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export async function attachDisputeEvidence(
  orderId: string,
  file: File,
  tags: DisputeEvidenceTag[],
): Promise<DisputeEvidenceView> {
  const mediaId = await uploadPrivateMedia(file);
  const res = await orvalRequest<ApiEnvelope<DisputeEvidenceView>>({
    url: `/api/orders/${orderId}/dispute-evidence`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { mediaId, tags },
  });
  return res.data;
}

export function getDisputeByOrder(orderId: string, offset = 0) {
  return orvalRequest<ApiEnvelope<DisputeCaseDetail>>({
    url: `/api/orders/${orderId}/dispute`,
    method: 'GET',
    params: { offset },
  });
}

export function getShopDisputes(shopId: string, offset = 0) {
  return orvalRequest<ApiEnvelope<DisputeCaseView[]>>({
    url: `/api/shops/${shopId}/disputes`,
    method: 'GET',
    params: { offset },
  });
}

export function getAdminDisputes(offset = 0) {
  return orvalRequest<ApiEnvelope<DisputeCaseView[]>>({
    url: '/api/admin/disputes',
    method: 'GET',
    params: { offset },
  });
}

export function getAdminDisputeDetail(caseId: string, offset = 0) {
  return orvalRequest<ApiEnvelope<DisputeCaseDetail>>({
    url: `/api/admin/disputes/${caseId}`,
    method: 'GET',
    params: { offset },
  });
}

export function replyToDisputeIssue(
  issueId: string,
  data: { text: string; evidenceIds: string[] },
) {
  return orvalRequest<ApiEnvelope<DisputeMessageView>>({
    url: `/api/dispute-issues/${issueId}/replies`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export function submitDisputeAppeal(
  decisionId: string,
  data: { reason: string; evidenceIds: string[] },
) {
  return orvalRequest<ApiEnvelope<DisputeAppealView>>({
    url: `/api/dispute-decisions/${decisionId}/appeals`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export function extendDisputeSla(issueId: string, reason: string) {
  return orvalRequest<ApiEnvelope<DisputeIssueView>>({
    url: `/api/admin/dispute-issues/${issueId}/extend`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { reason },
  });
}

export function decideDisputeIssue(
  issueId: string,
  data: DisputeDecisionInput,
) {
  return orvalRequest<ApiEnvelope<DisputeDecisionView>>({
    url: `/api/admin/dispute-issues/${issueId}/decision`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export function concludeDisputeAppeal(
  decisionId: string,
  data: DisputeDecisionInput,
) {
  return orvalRequest<ApiEnvelope<DisputeDecisionView>>({
    url: `/api/admin/dispute-decisions/${decisionId}/appeal-decision`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export function executeDisputeRefund(decisionId: string) {
  return orvalRequest<ApiEnvelope<RefundCreditView | null>>({
    url: `/api/admin/dispute-decisions/${decisionId}/refund`,
    method: 'POST',
  });
}

export function createReturnLabel(returnId: string, data: ReturnLabelInput) {
  return orvalRequest<ApiEnvelope<ReturnView>>({
    url: `/api/admin/dispute-returns/${returnId}/label`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
}

export function handoverReturn(returnId: string) {
  return orvalRequest<ApiEnvelope<ReturnView>>({
    url: `/api/dispute-returns/${returnId}/handover`,
    method: 'POST',
  });
}

export function updateReturnCarrierStatus(
  returnId: string,
  status: 'IN_TRANSIT' | 'DELIVERED',
) {
  return orvalRequest<ApiEnvelope<ReturnView>>({
    url: `/api/admin/dispute-returns/${returnId}/status`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { status },
  });
}

export function confirmReturnReceipt(returnId: string) {
  return orvalRequest<ApiEnvelope<ReturnView>>({
    url: `/api/dispute-returns/${returnId}/confirm-receipt`,
    method: 'POST',
  });
}

export async function openDisputeEvidenceDownload(
  evidenceId: string,
  isAdmin = false,
) {
  const url = isAdmin
    ? `/api/admin/dispute-evidence/${evidenceId}/download`
    : `/api/dispute-evidence/${evidenceId}/download`;
  const res = await orvalRequest<
    ApiEnvelope<{
      url: string;
      headers: Record<string, string>;
      expiresAt: string;
    }>
  >({ url, method: 'GET' });
  window.open(res.data.url, '_blank', 'noopener,noreferrer');
}
