import { axiosClient } from '@/shared/api/axios-client';

type Envelope<T> = { data: T };

export type ReportTargetType = 'PRODUCT' | 'SHOP';

export type ReportReason =
  | 'COUNTERFEIT'
  | 'PROHIBITED_ITEM'
  | 'MISLEADING_CONTENT'
  | 'OFFENSIVE_CONTENT'
  | 'FRAUD'
  | 'OTHER';

export const REPORT_REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: 'COUNTERFEIT', label: 'Counterfeit or replica item' },
  { value: 'PROHIBITED_ITEM', label: 'Prohibited or restricted item' },
  { value: 'MISLEADING_CONTENT', label: 'Misleading photos or condition' },
  { value: 'OFFENSIVE_CONTENT', label: 'Offensive or inappropriate content' },
  { value: 'FRAUD', label: 'Suspected fraud or scam' },
  { value: 'OTHER', label: 'Other policy violation' },
];

export type CreateReportPayload = {
  requestId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description: string;
  evidenceIds?: string[];
};

export type ViolationReportView = {
  id: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
  createdAt: string;
};

export const reportsApi = {
  create: (payload: CreateReportPayload) =>
    axiosClient.post<never, Envelope<ViolationReportView>>('/reports', {
      ...payload,
      evidenceIds: payload.evidenceIds ?? [],
    }),
};
