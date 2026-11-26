'use client';

import { useState } from 'react';

import {
  attachDisputeEvidence,
  confirmReturnReceipt,
  DISPUTE_ISSUE_STATUS_LABELS,
  DISPUTE_KIND_LABELS,
  DISPUTE_OUTCOME_LABELS,
  type DisputeCaseView,
  formatIctDateTime,
  getDisputeByOrder,
  getShopDisputes,
  openDisputeEvidenceDownload,
  replyToDisputeIssue,
  RETURN_STATE_LABELS,
  shortId,
  submitDisputeAppeal,
} from '@/modules/disputes/api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { formatPrice } from '@/shared/utils/product';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Clock, FileText, PackageCheck } from 'lucide-react';

interface SellerReturnsSectionProps {
  shopId: string;
  enabled: boolean;
}

type FilterTab = 'ALL' | 'OPEN' | 'CLOSED';

export function SellerReturnsSection({
  shopId,
  enabled,
}: SellerReturnsSectionProps) {
  const [filter, setFilter] = useState<FilterTab>('ALL');
  const [selectedCase, setSelectedCase] = useState<DisputeCaseView | null>(
    null,
  );
  const [replyText, setReplyText] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [appealReason, setAppealReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [renderedAt] = useState(() => Date.now());

  const listQuery = useQuery({
    queryKey: ['seller-shop-disputes', shopId],
    queryFn: () => getShopDisputes(shopId),
    enabled: enabled && Boolean(shopId),
    retry: false,
  });

  const detailQuery = useQuery({
    queryKey: ['seller-dispute-detail', selectedCase?.orderId],
    queryFn: () => getDisputeByOrder(selectedCase!.orderId),
    enabled: enabled && Boolean(selectedCase?.orderId),
    retry: false,
  });

  const cases = listQuery.data?.data ?? [];
  const filteredCases = cases.filter((c) =>
    filter === 'ALL' ? true : c.state === filter,
  );

  const replyMutation = useMutation({
    mutationFn: async (input: {
      orderId: string;
      issueId: string;
      text: string;
      files: File[];
    }) => {
      const evidenceIds: string[] = [];
      for (const file of input.files) {
        const uploaded = await attachDisputeEvidence(input.orderId, file, [
          'PACKING',
        ]);
        evidenceIds.push(uploaded.id);
      }
      return replyToDisputeIssue(input.issueId, {
        text: input.text.trim(),
        evidenceIds,
      });
    },
    onSuccess: async () => {
      setReplyText('');
      setReplyFiles([]);
      setActionError('');
      setActionSuccess('Your response has been submitted.');
      await Promise.all([listQuery.refetch(), detailQuery.refetch()]);
    },
    onError: (err) => {
      setActionSuccess('');
      setActionError(getApiErrorMessage(err));
    },
  });

  const confirmReceiptMutation = useMutation({
    mutationFn: (returnId: string) => confirmReturnReceipt(returnId),
    onSuccess: async () => {
      setActionError('');
      setActionSuccess('Return receipt confirmed.');
      await Promise.all([listQuery.refetch(), detailQuery.refetch()]);
    },
    onError: (err) => {
      setActionSuccess('');
      setActionError(getApiErrorMessage(err));
    },
  });

  const appealMutation = useMutation({
    mutationFn: (input: { decisionId: string; reason: string }) =>
      submitDisputeAppeal(input.decisionId, {
        reason: input.reason.trim(),
        evidenceIds: [],
      }),
    onSuccess: async () => {
      setAppealReason('');
      setActionError('');
      setActionSuccess('Reconsideration appeal submitted.');
      await Promise.all([listQuery.refetch(), detailQuery.refetch()]);
    },
    onError: (err) => {
      setActionSuccess('');
      setActionError(getApiErrorMessage(err));
    },
  });

  const handleDownload = async (evidenceId: string) => {
    setActionError('');
    try {
      await openDisputeEvidenceDownload(evidenceId, false);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const detail = detailQuery.data?.data;

  return (
    <section className="mx-auto max-w-[960px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.02em]">
            Returns &amp; disputes
          </h1>
          <p className="text-rewear-muted mt-1 text-sm">
            Respond to buyer claims within 1 business day and confirm returned
            parcels upon arrival.
          </p>
        </div>

        <div className="flex gap-2" role="tablist" aria-label="Filter returns">
          {(['ALL', 'OPEN', 'CLOSED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={filter === tab}
              onClick={() => setFilter(tab)}
              className={`min-h-11 rounded-lg px-4 text-sm font-semibold transition-colors ${
                filter === tab
                  ? 'bg-rewear-text text-white'
                  : 'bg-rewear-soft text-rewear-text hover:bg-rewear-border/60'
              }`}
            >
              {tab === 'ALL'
                ? `All (${cases.length})`
                : tab === 'OPEN'
                  ? 'Open'
                  : 'Closed'}
            </button>
          ))}
        </div>
      </div>

      {listQuery.isPending ? (
        <p role="status" className="text-rewear-muted text-sm">
          Loading shop disputes…
        </p>
      ) : listQuery.isError ? (
        <div role="alert" className="border-rewear-border border bg-white p-6">
          <p className="text-sm">Could not load shop returns and disputes.</p>
          <button
            type="button"
            onClick={() => void listQuery.refetch()}
            className="mt-3 min-h-11 text-sm font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="border-rewear-border rounded-lg border bg-white p-8 text-center">
          <p className="font-semibold">No returns or disputes found</p>
          <p className="text-rewear-muted mt-1 text-sm">
            Buyer issue reports and return requests for your shop will appear
            here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Case Queue */}
          <div className="space-y-3">
            {filteredCases.map((item) => {
              const primaryIssue = item.issues[0];
              const isSelected = selectedCase?.id === item.id;
              const isOverdue = item.issues.some((i) => i.reviewOverdue);
              const sellerDueSoon =
                primaryIssue &&
                primaryIssue.status === 'ACTIVE' &&
                new Date(primaryIssue.sellerRespondBy).getTime() <=
                  renderedAt + 24 * 60 * 60 * 1000;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedCase(item);
                    setActionError('');
                    setActionSuccess('');
                  }}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    isSelected
                      ? 'border-rewear-text bg-white'
                      : 'border-rewear-border hover:bg-rewear-soft/60 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold">
                      CASE #{shortId(item.id)}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        isOverdue
                          ? 'bg-[#BA1A1A]/10 text-[#BA1A1A]'
                          : sellerDueSoon
                            ? 'bg-rewear-accent text-rewear-text'
                            : 'bg-rewear-soft text-rewear-muted'
                      }`}
                    >
                      {isOverdue
                        ? 'SLA overdue'
                        : sellerDueSoon
                          ? 'Response due'
                          : item.state}
                    </span>
                  </div>
                  {primaryIssue && (
                    <>
                      <p className="mt-2 text-sm font-semibold">
                        {DISPUTE_KIND_LABELS[primaryIssue.kind]}
                      </p>
                      <p className="text-rewear-muted mt-1 line-clamp-2 text-xs">
                        {primaryIssue.description}
                      </p>
                      <div className="text-rewear-muted mt-2.5 flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock size={12} />
                        <span>
                          Due {formatIctDateTime(primaryIssue.sellerRespondBy)}
                        </span>
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Case Detail */}
          <div className="border-rewear-border rounded-lg border bg-white p-6">
            {!selectedCase ? (
              <p className="text-rewear-muted text-sm">
                Select a return or dispute case from the list to inspect buyer
                evidence and submit your response.
              </p>
            ) : detailQuery.isPending ? (
              <p role="status" className="text-rewear-muted text-sm">
                Loading case details…
              </p>
            ) : detailQuery.isError || !detail ? (
              <div role="alert" className="space-y-2 text-sm">
                <p>Could not load case details.</p>
                <button
                  type="button"
                  onClick={() => void detailQuery.refetch()}
                  className="min-h-11 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border-rewear-border flex flex-wrap items-center justify-between gap-2 border-b pb-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Case #{shortId(detail.id)}
                    </h2>
                    <p className="text-rewear-muted font-mono text-xs">
                      Order #{shortId(detail.orderId)} · Opened{' '}
                      {formatIctDateTime(detail.createdAt)}
                    </p>
                  </div>
                  <span className="bg-rewear-soft rounded-lg px-3 py-1 text-xs font-semibold">
                    {detail.state}
                  </span>
                </div>

                {actionError && (
                  <p
                    role="alert"
                    className="rounded-lg bg-[#BA1A1A]/10 p-3 text-sm text-[#BA1A1A]"
                  >
                    {actionError}
                  </p>
                )}
                {actionSuccess && (
                  <p
                    role="status"
                    className="bg-rewear-accent/40 text-rewear-text rounded-lg p-3 text-sm font-medium"
                  >
                    {actionSuccess}
                  </p>
                )}

                {detail.issues.map((issue) => {
                  const issueEvidence = detail.evidence.filter((e) =>
                    issue.evidenceIds.includes(e.id),
                  );
                  const messages = detail.messages.filter(
                    (m) => m.issueId === issue.id,
                  );
                  const decision = detail.decisions.find(
                    (d) => d.issueId === issue.id,
                  );
                  const appeal = decision
                    ? detail.appeals.find((a) => a.decisionId === decision.id)
                    : undefined;
                  const returnCase = decision
                    ? detail.returns.find((r) => r.decisionId === decision.id)
                    : undefined;

                  return (
                    <div key={issue.id} className="space-y-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">
                            {DISPUTE_KIND_LABELS[issue.kind]}
                          </h3>
                          <p className="mt-1 text-sm leading-6">
                            {issue.description}
                          </p>
                        </div>
                        <span className="bg-rewear-soft rounded-lg px-2.5 py-1 text-xs font-semibold">
                          {DISPUTE_ISSUE_STATUS_LABELS[issue.status]}
                        </span>
                      </div>

                      {/* SLA Bar */}
                      <div className="bg-rewear-soft grid gap-3 rounded-lg p-4 text-xs sm:grid-cols-2">
                        <div>
                          <span className="text-rewear-muted block font-semibold">
                            Seller response SLA
                          </span>
                          <span className="mt-0.5 block font-mono">
                            {formatIctDateTime(issue.sellerRespondBy)}
                          </span>
                        </div>
                        <div>
                          <span className="text-rewear-muted block font-semibold">
                            Admin review due
                          </span>
                          <span
                            className={`mt-0.5 block font-mono ${
                              issue.reviewOverdue
                                ? 'font-bold text-[#BA1A1A]'
                                : ''
                            }`}
                          >
                            {formatIctDateTime(issue.reviewDueAt)}
                          </span>
                        </div>
                      </div>

                      {/* Buyer Evidence */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">
                          Buyer evidence ({issueEvidence.length})
                        </h4>
                        {issueEvidence.length === 0 ? (
                          <p className="text-rewear-muted text-xs">
                            No files attached.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {issueEvidence.map((ev) => (
                              <button
                                key={ev.id}
                                type="button"
                                onClick={() => void handleDownload(ev.id)}
                                className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs font-semibold"
                              >
                                <FileText size={14} />
                                {ev.tags.join(', ') || 'Evidence'}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Conversation Thread */}
                      {messages.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">
                            Replies ({messages.length})
                          </h4>
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className="bg-rewear-soft space-y-1 rounded-lg p-3 text-sm"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold">
                                  {msg.party}
                                </span>
                                <span className="text-rewear-muted font-mono">
                                  {formatIctDateTime(msg.createdAt)}
                                </span>
                              </div>
                              <p>{msg.text}</p>
                              {msg.evidenceIds.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {msg.evidenceIds.map((evId, idx) => (
                                    <button
                                      key={evId}
                                      type="button"
                                      onClick={() => void handleDownload(evId)}
                                      className="text-xs font-semibold underline"
                                    >
                                      Counter-evidence {idx + 1}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Seller Response Form */}
                      {issue.status === 'ACTIVE' && (
                        <form
                          className="border-rewear-border space-y-3 rounded-lg border p-4"
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!replyText.trim()) return;
                            replyMutation.mutate({
                              orderId: detail.orderId,
                              issueId: issue.id,
                              text: replyText,
                              files: replyFiles,
                            });
                          }}
                        >
                          <h4 className="text-sm font-semibold">
                            Submit seller response &amp; counter-evidence
                          </h4>
                          <textarea
                            rows={3}
                            required
                            maxLength={2000}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Explain your packing record, disclosed flaws, or shipping details…"
                            className="border-rewear-border w-full rounded-lg border p-2.5 text-sm"
                          />
                          <label className="grid gap-1 text-xs font-semibold">
                            Counter-evidence photos/video (optional)
                            <input
                              type="file"
                              multiple
                              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                              onChange={(e) =>
                                setReplyFiles(Array.from(e.target.files ?? []))
                              }
                              className="font-normal"
                            />
                          </label>
                          <button
                            type="submit"
                            disabled={
                              replyMutation.isPending || !replyText.trim()
                            }
                            className="bg-rewear-accent text-rewear-text min-h-11 rounded-lg px-5 text-sm font-semibold disabled:opacity-50"
                          >
                            {replyMutation.isPending
                              ? 'Submitting…'
                              : 'Send seller response'}
                          </button>
                        </form>
                      )}

                      {/* Ruling & Return Receipt Confirmation */}
                      {decision && (
                        <div className="border-rewear-border space-y-3 rounded-lg border bg-[#F9F9FB] p-4 text-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold">
                              Admin ruling:{' '}
                              {
                                DISPUTE_OUTCOME_LABELS[
                                  decision.finalOutcome ?? decision.outcome
                                ]
                              }
                            </span>
                            {(decision.finalRefundAmount ??
                              decision.refundAmount) != null && (
                              <span className="font-mono font-bold tabular-nums">
                                {formatPrice(
                                  decision.finalRefundAmount ??
                                    decision.refundAmount ??
                                    0,
                                )}
                              </span>
                            )}
                          </div>
                          <p className="text-rewear-muted">
                            {decision.finalReason ?? decision.reason}
                          </p>

                          {issue.status === 'AWAITING_APPEAL' &&
                            !decision.finalizedAt &&
                            !appeal && (
                              <form
                                className="border-rewear-border space-y-2 border-t pt-3"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!appealReason.trim()) return;
                                  appealMutation.mutate({
                                    decisionId: decision.id,
                                    reason: appealReason,
                                  });
                                }}
                              >
                                <label className="grid gap-1 text-xs font-semibold">
                                  Request reconsideration (due{' '}
                                  {formatIctDateTime(decision.appealUntil)})
                                  <textarea
                                    rows={2}
                                    required
                                    maxLength={2000}
                                    value={appealReason}
                                    onChange={(e) =>
                                      setAppealReason(e.target.value)
                                    }
                                    placeholder="State grounds for appealing this ruling…"
                                    className="border-rewear-border rounded-lg border bg-white p-2 font-normal"
                                  />
                                </label>
                                <button
                                  type="submit"
                                  disabled={
                                    appealMutation.isPending ||
                                    !appealReason.trim()
                                  }
                                  className="border-rewear-text min-h-11 rounded-lg border px-4 text-xs font-semibold disabled:opacity-50"
                                >
                                  {appealMutation.isPending
                                    ? 'Submitting…'
                                    : 'Submit appeal'}
                                </button>
                              </form>
                            )}
                        </div>
                      )}

                      {returnCase && (
                        <div className="border-rewear-border space-y-3 rounded-lg border p-4 text-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-2 font-semibold">
                              <PackageCheck size={16} />
                              Return parcel ·{' '}
                              {RETURN_STATE_LABELS[returnCase.state]}
                            </span>
                            {returnCase.labelCode && (
                              <span className="font-mono text-xs font-bold">
                                {returnCase.labelCode}
                              </span>
                            )}
                          </div>
                          {returnCase.deliveredAt && (
                            <p className="text-rewear-muted text-xs">
                              Delivered to shop:{' '}
                              {formatIctDateTime(returnCase.deliveredAt)}
                            </p>
                          )}
                          {(returnCase.state === 'IN_TRANSIT' ||
                            returnCase.state === 'AWAITING_HANDOVER') && (
                            <button
                              type="button"
                              disabled={confirmReceiptMutation.isPending}
                              onClick={() =>
                                confirmReceiptMutation.mutate(returnCase.id)
                              }
                              className="bg-rewear-text min-h-11 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50"
                            >
                              {confirmReceiptMutation.isPending
                                ? 'Confirming…'
                                : 'Confirm returned item received'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
