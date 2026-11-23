'use client';

import { useState } from 'react';

import type {
  DisputeControllerOpenBodyKind,
  DisputeControllerUploadBodyMimeType,
  DisputeControllerUploadBodyTagsItem,
} from '@/shared/api/models';
import { useCodControllerCancel } from '@/shared/api/query-generated/cod/cod';
import {
  useDisputeControllerConfirm,
  useDisputeControllerDetail,
  useDisputeControllerOpen,
  useDisputeControllerSupplement,
  useDisputeControllerUpload,
} from '@/shared/api/query-generated/disputes/disputes';
import {
  useShipmentControllerBuyerView,
  useShipmentControllerRequest,
} from '@/shared/api/query-generated/shipments/shipments';
import { useQueryClient } from '@tanstack/react-query';

export function useOrderActions(
  id: string,
  showShipment: boolean,
  showDispute: boolean,
  refresh: () => Promise<unknown>,
) {
  const client = useQueryClient();
  const refreshAll = async () => {
    await Promise.all([
      refresh(),
      client.invalidateQueries({ queryKey: ['buyer-orders'] }),
    ]);
  };
  const [issueError, setIssueError] = useState<unknown>(null);
  const [issuePending, setIssuePending] = useState(false);
  const shipment = useShipmentControllerBuyerView(id, {
    query: { enabled: showShipment, retry: false },
  });
  const dispute = useDisputeControllerDetail(id, undefined, {
    query: { enabled: showDispute, retry: false },
  });
  const cancel = useCodControllerCancel({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onSuccess: refreshAll,
    },
  });
  const cancellationRequest = useShipmentControllerRequest({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onSuccess: refreshAll,
    },
  });
  const upload = useDisputeControllerUpload({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const confirm = useDisputeControllerConfirm({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const supplement = useDisputeControllerSupplement({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const open = useDisputeControllerOpen({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const uploadEvidence = async (
    files: File[],
    tags: DisputeControllerUploadBodyTagsItem[],
  ) => {
    const evidenceIds: string[] = [];
    for (const file of files) {
      const ticket = (
        await upload.mutateAsync({
          id,
          data: {
            mimeType: file.type as DisputeControllerUploadBodyMimeType,
            sizeBytes: file.size,
            tags: tags,
          },
        })
      ).data;
      const response = await fetch(ticket.uploadUrl, {
        method: ticket.method,
        headers: ticket.headers,
        body: file,
      });
      if (!response.ok)
        throw new Error('Could not upload evidence. Please try again.');
      await confirm.mutateAsync({ id: ticket.id, data: {} });
      evidenceIds.push(ticket.id);
    }
    return evidenceIds;
  };
  const supplementIssue = async (
    issueId: string,
    files: File[],
    tags: DisputeControllerUploadBodyTagsItem[],
  ) => {
    setIssueError(null);
    setIssuePending(true);
    try {
      const evidenceIds = await uploadEvidence(files, tags);
      await supplement.mutateAsync({ id: issueId, data: { evidenceIds } });
      await Promise.all([refreshAll(), dispute.refetch()]);
    } catch (error) {
      setIssueError(error);
      throw error;
    } finally {
      setIssuePending(false);
    }
  };
  const reportIssue = async (input: {
    productId: string;
    kind: DisputeControllerOpenBodyKind;
    description: string;
    files: File[];
    tags: DisputeControllerUploadBodyTagsItem[];
  }) => {
    setIssueError(null);
    setIssuePending(true);
    try {
      const evidenceIds = await uploadEvidence(input.files, input.tags);
      await open.mutateAsync({
        id,
        data: {
          productId: input.productId,
          kind: input.kind,
          description: input.description.trim(),
          evidenceIds,
        },
      });
      await refreshAll();
    } catch (error) {
      setIssueError(error);
      throw error;
    } finally {
      setIssuePending(false);
    }
  };
  return {
    shipment,
    dispute,
    cancel,
    cancellationRequest,
    requestCancellation: () =>
      cancellationRequest.mutateAsync({ id, data: {} }),
    cancelOrder: () =>
      cancel.mutateAsync({ id, data: { reason: 'CHANGE_OF_MIND' } }),
    reportIssue,
    supplementIssue,
    issueError,
    issuePending,
  };
}
