'use client';

import { useState } from 'react';

import { AdminWorkspaceLayout } from '@/features/admin/AdminWorkspaceLayout';
import {
  DISPUTE_ISSUE_STATUS_LABELS,
  DISPUTE_KIND_LABELS,
  DISPUTE_OUTCOME_LABELS,
  DISPUTE_RESPONSIBILITY_LABELS,
  type DisputeCaseView,
  type DisputeDecisionView,
  type DisputeIssueView,
  executeDisputeRefund,
  formatIctDateTime,
  getAdminDisputeDetail,
  getAdminDisputes,
  openDisputeEvidenceDownload,
  RETURN_STATE_LABELS,
  type ReturnView,
  shortId,
  updateReturnCarrierStatus,
} from '@/modules/disputes/api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { formatPrice } from '@/shared/utils/product';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, FileText, Scale } from 'lucide-react';

import {
  DisputeDecisionDialog,
  ExtendSlaDialog,
  ReturnLabelDialog,
} from './AdminDisputeModals';

type QueueFilter = 'ALL' | 'OPEN' | 'OVERDUE' | 'APPEALS' | 'CLOSED';

export function AdminDisputesPage() {
  const [filter, setFilter] = useState<QueueFilter>('OPEN');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [rulingTarget, setRulingTarget] = useState<{
    issue: DisputeIssueView;
    mode: 'INITIAL' | 'APPEAL';
    decision?: DisputeDecisionView;
  } | null>(null);
  const [extendTarget, setExtendTarget] = useState<DisputeIssueView | null>(
    null,
  );
  const [labelTarget, setLabelTarget] = useState<ReturnView | null>(null);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const queueQuery = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => getAdminDisputes(0),
    retry: false,
  });

  const detailQuery = useQuery({
    queryKey: ['admin-dispute-detail', selectedCaseId],
    queryFn: () => getAdminDisputeDetail(selectedCaseId!),
    enabled: Boolean(selectedCaseId),
    retry: false,
  });

  const cases: DisputeCaseView[] = queueQuery.data?.data ?? [];
  const filteredCases = cases.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'OPEN') return item.state === 'OPEN';
    if (filter === 'CLOSED') return item.state === 'CLOSED';
    if (filter === 'OVERDUE')
      return item.issues.some((issue) => issue.reviewOverdue);
    if (filter === 'APPEALS')
      return item.issues.some((issue) => issue.status === 'APPEAL_REVIEW');
    return true;
  });

  const refreshAll = async (message?: string) => {
    setFeedbackError('');
    if (message) setFeedbackSuccess(message);
    await Promise.all([queueQuery.refetch(), detailQuery.refetch()]);
  };

  const refundMutation = useMutation({
    mutationFn: (decisionId: string) => executeDisputeRefund(decisionId),
    onSuccess: () => refreshAll('Refund execution recorded.'),
    onError: (err) => setFeedbackError(getApiErrorMessage(err)),
  });

  const carrierStatusMutation = useMutation({
    mutationFn: (input: {
      returnId: string;
      status: 'IN_TRANSIT' | 'DELIVERED';
    }) => updateReturnCarrierStatus(input.returnId, input.status),
    onSuccess: () => refreshAll('Return shipment status updated.'),
    onError: (err) => setFeedbackError(getApiErrorMessage(err)),
  });

  const handleDownload = async (evidenceId: string) => {
    setFeedbackError('');
    try {
      await openDisputeEvidenceDownload(evidenceId, true);
    } catch (err) {
      setFeedbackError(getApiErrorMessage(err));
    }
  };

  const detail = detailQuery.data?.data ?? null;

  return (
    <AdminWorkspaceLayout activeNav="disputes" title="Disputes">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.02em]">
              Dispute adjudication
            </h1>
            <p className="text-rewear-muted mt-1 text-sm">
              Inspect buyer and seller evidence, enforce review SLAs, and record
              final rulings.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist">
            {(
              [
                ['OPEN', 'Open'],
                ['OVERDUE', 'SLA Overdue'],
                ['APPEALS', 'Appeals'],
                ['CLOSED', 'Closed'],
                ['ALL', 'All'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={`min-h-11 rounded-lg px-3.5 text-sm font-semibold transition-colors ${
                  filter === key
                    ? 'bg-rewear-text text-white'
                    : 'bg-rewear-soft text-rewear-text hover:bg-rewear-border/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {feedbackError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-[#BA1A1A]/10 p-4 text-sm text-[#BA1A1A]"
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{feedbackError}</span>
          </div>
        )}
        {feedbackSuccess && (
          <p
            role="status"
            className="bg-rewear-accent/40 text-rewear-text rounded-lg p-3.5 text-sm font-medium"
          >
            {feedbackSuccess}
          </p>
        )}

        {queueQuery.isPending ? (
          <p role="status" className="text-rewear-muted text-sm">
            Loading dispute queue…
          </p>
        ) : queueQuery.isError ? (
          <div
            role="alert"
            className="border-rewear-border rounded-lg border bg-white p-6"
          >
            <p className="text-sm">Could not load admin disputes.</p>
            <button
              type="button"
              onClick={() => void queueQuery.refetch()}
              className="mt-3 min-h-11 text-sm font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[310px_minmax(0,1fr)]">
            {/* Queue List */}
            <div className="space-y-3">
              {filteredCases.length === 0 ? (
                <div className="border-rewear-border rounded-lg border bg-white p-6 text-sm">
                  <p className="font-semibold">No disputes in this queue</p>
                  <p className="text-rewear-muted mt-1 text-xs">
                    Switch filters to inspect other cases.
                  </p>
                </div>
              ) : (
                filteredCases.map((item) => {
                  const first = item.issues[0];
                  const overdue = item.issues.some((i) => i.reviewOverdue);
                  const hasAppeal = item.issues.some(
                    (i) => i.status === 'APPEAL_REVIEW',
                  );
                  const active = selectedCaseId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedCaseId(item.id);
                        setFeedbackError('');
                        setFeedbackSuccess('');
                      }}
                      className={`w-full rounded-lg border p-4 text-left transition-colors ${
                        active
                          ? 'border-rewear-text bg-white'
                          : 'border-rewear-border hover:bg-rewear-soft/50 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold">
                          CASE #{shortId(item.id)}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            overdue
                              ? 'bg-[#BA1A1A] text-white'
                              : hasAppeal
                                ? 'bg-rewear-accent text-rewear-text'
                                : 'bg-rewear-soft text-rewear-muted'
                          }`}
                        >
                          {overdue
                            ? 'Overdue SLA'
                            : hasAppeal
                              ? 'Appeal'
                              : item.state}
                        </span>
                      </div>
                      {first && (
                        <>
                          <p className="mt-2 text-sm font-semibold">
                            {DISPUTE_KIND_LABELS[first.kind]}
                          </p>
                          <p className="text-rewear-muted mt-1 line-clamp-2 text-xs">
                            {first.description}
                          </p>
                          <p className="text-rewear-muted mt-2 flex items-center gap-1 font-mono text-[11px]">
                            <Clock size={12} />
                            SLA: {formatIctDateTime(first.reviewDueAt)}
                          </p>
                        </>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Detail & Decision Workspace */}
            <div className="border-rewear-border rounded-lg border bg-white p-6">
              {!selectedCaseId ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Scale size={28} className="text-rewear-muted" />
                  <p className="mt-3 font-semibold">
                    Select a dispute to review
                  </p>
                  <p className="text-rewear-muted mt-1 text-sm">
                    Choose a case from the queue to inspect both parties&apos;
                    evidence and issue a ruling.
                  </p>
                </div>
              ) : detailQuery.isPending ? (
                <p role="status" className="text-rewear-muted text-sm">
                  Loading dispute record…
                </p>
              ) : detailQuery.isError || !detail ? (
                <div role="alert" className="space-y-2 text-sm">
                  <p>Could not load dispute detail.</p>
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
                        Order #{shortId(detail.orderId)} · Buyer #
                        {shortId(detail.buyerId)} · Shop #
                        {shortId(detail.shopId)}
                      </p>
                    </div>
                    <span className="bg-rewear-soft rounded-lg px-3 py-1 text-xs font-semibold">
                      {detail.state}
                    </span>
                  </div>

                  {detail.issues.map((issue) => {
                    const buyerEvidence = detail.evidence.filter((e) =>
                      issue.evidenceIds.includes(e.id),
                    );
                    const buyerMessages = detail.messages.filter(
                      (m) => m.issueId === issue.id && m.party === 'BUYER',
                    );
                    const sellerMessages = detail.messages.filter(
                      (m) => m.issueId === issue.id && m.party === 'SELLER',
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
                      <article key={issue.id} className="space-y-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold">
                              {DISPUTE_KIND_LABELS[issue.kind]}
                            </h3>
                            <p className="mt-1 text-sm leading-6">
                              {issue.description}
                            </p>
                          </div>
                          <span
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                              issue.reviewOverdue
                                ? 'bg-[#BA1A1A] text-white'
                                : 'bg-rewear-soft text-rewear-text'
                            }`}
                          >
                            {DISPUTE_ISSUE_STATUS_LABELS[issue.status]}
                          </span>
                        </div>

                        {/* SLA Info + Extend SLA */}
                        <div className="bg-rewear-soft flex flex-wrap items-center justify-between gap-3 rounded-lg p-4 text-xs">
                          <div className="space-y-1">
                            <p className="font-mono">
                              Review due: {formatIctDateTime(issue.reviewDueAt)}
                              {issue.reviewOverdue ? ' (OVERDUE)' : ''}
                            </p>
                            <p className="text-rewear-muted font-mono">
                              Max SLA: {formatIctDateTime(issue.maxReviewDueAt)}
                            </p>
                            {issue.extensionReason && (
                              <p className="text-rewear-text">
                                Extended: {issue.extensionReason}
                              </p>
                            )}
                          </div>
                          {issue.status === 'ACTIVE' && !issue.extendedAt && (
                            <button
                              type="button"
                              onClick={() => setExtendTarget(issue)}
                              className="border-rewear-text min-h-11 rounded-lg border bg-white px-3.5 text-xs font-semibold"
                            >
                              Extend SLA
                            </button>
                          )}
                        </div>

                        {/* Two-Sided Evidence Viewer */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="border-rewear-border space-y-3 rounded-lg border p-4">
                            <h4 className="text-sm font-semibold">
                              Buyer claim &amp; evidence
                            </h4>
                            <p className="text-sm">{issue.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {buyerEvidence.map((ev) => (
                                <button
                                  key={ev.id}
                                  type="button"
                                  onClick={() => void handleDownload(ev.id)}
                                  className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold"
                                >
                                  <FileText size={13} />
                                  {ev.tags.join(', ') || 'File'}
                                </button>
                              ))}
                            </div>
                            {buyerMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className="bg-rewear-soft space-y-1 rounded-lg p-3 text-xs"
                              >
                                <p className="text-rewear-muted font-mono">
                                  {formatIctDateTime(msg.createdAt)}
                                </p>
                                <p className="text-sm">{msg.text}</p>
                                {msg.evidenceIds.map((id, i) => (
                                  <button
                                    key={id}
                                    type="button"
                                    onClick={() => void handleDownload(id)}
                                    className="mr-2 font-semibold underline"
                                  >
                                    File {i + 1}
                                  </button>
                                ))}
                              </div>
                            ))}
                          </div>

                          <div className="border-rewear-border space-y-3 rounded-lg border p-4">
                            <h4 className="text-sm font-semibold">
                              Seller response &amp; counter-evidence
                            </h4>
                            {sellerMessages.length === 0 ? (
                              <p className="text-rewear-muted text-xs">
                                No seller reply recorded yet. Response SLA:{' '}
                                {formatIctDateTime(issue.sellerRespondBy)}.
                              </p>
                            ) : (
                              sellerMessages.map((msg) => (
                                <div
                                  key={msg.id}
                                  className="bg-rewear-soft space-y-1 rounded-lg p-3 text-xs"
                                >
                                  <p className="text-rewear-muted font-mono">
                                    {formatIctDateTime(msg.createdAt)}
                                  </p>
                                  <p className="text-sm">{msg.text}</p>
                                  {msg.evidenceIds.map((id, i) => (
                                    <button
                                      key={id}
                                      type="button"
                                      onClick={() => void handleDownload(id)}
                                      className="mr-2 font-semibold underline"
                                    >
                                      Counter-evidence {i + 1}
                                    </button>
                                  ))}
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Decision / Appeal / Execution Actions */}
                        {issue.status === 'ACTIVE' && (
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setRulingTarget({ issue, mode: 'INITIAL' })
                              }
                              className="bg-rewear-accent text-rewear-text min-h-11 rounded-lg px-5 text-sm font-semibold"
                            >
                              Record ruling
                            </button>
                          </div>
                        )}

                        {decision && (
                          <div className="border-rewear-border space-y-3 rounded-lg border bg-[#F9F9FB] p-4 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold">
                                Ruling:{' '}
                                {
                                  DISPUTE_OUTCOME_LABELS[
                                    decision.finalOutcome ?? decision.outcome
                                  ]
                                }
                              </span>
                              <span className="font-mono text-xs font-bold tabular-nums">
                                Refund:{' '}
                                {formatPrice(
                                  decision.finalRefundAmount ??
                                    decision.refundAmount ??
                                    0,
                                )}{' '}
                                / Item {formatPrice(decision.itemPrice)}
                              </span>
                            </div>
                            <p className="text-rewear-muted text-xs">
                              Responsibility:{' '}
                              {
                                DISPUTE_RESPONSIBILITY_LABELS[
                                  decision.responsibility
                                ]
                              }{' '}
                              · Decided {formatIctDateTime(decision.decidedAt)}
                            </p>
                            <p>{decision.finalReason ?? decision.reason}</p>

                            {appeal && (
                              <div className="border-rewear-border space-y-2 rounded-lg border bg-white p-4">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold">
                                    Appeal filed by {appeal.party}
                                  </span>
                                  <span className="text-rewear-muted font-mono">
                                    Due {formatIctDateTime(appeal.reviewDueAt)}
                                  </span>
                                </div>
                                <p className="text-sm">{appeal.reason}</p>
                                {appeal.evidenceIds.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {appeal.evidenceIds.map((evId, idx) => (
                                      <button
                                        key={evId}
                                        type="button"
                                        onClick={() =>
                                          void handleDownload(evId)
                                        }
                                        className="text-xs font-semibold underline"
                                      >
                                        Appeal attachment {idx + 1}
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {issue.status === 'APPEAL_REVIEW' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRulingTarget({
                                        issue,
                                        mode: 'APPEAL',
                                        decision,
                                      })
                                    }
                                    className="bg-rewear-accent text-rewear-text min-h-11 rounded-lg px-4 text-xs font-semibold"
                                  >
                                    Conclude appeal
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Return Logistics Controls */}
                            {returnCase && (
                              <div className="border-rewear-border space-y-3 rounded-lg border bg-white p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <span className="font-semibold">
                                    Return shipment ·{' '}
                                    {RETURN_STATE_LABELS[returnCase.state]}
                                  </span>
                                  <span className="font-mono font-bold">
                                    {returnCase.labelCode ?? 'No waybill yet'}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {returnCase.state === 'WAITING_LABEL' && (
                                    <button
                                      type="button"
                                      onClick={() => setLabelTarget(returnCase)}
                                      className="bg-rewear-text min-h-11 rounded-lg px-4 text-xs font-semibold text-white"
                                    >
                                      Issue return label
                                    </button>
                                  )}
                                  {returnCase.state === 'AWAITING_HANDOVER' && (
                                    <button
                                      type="button"
                                      disabled={carrierStatusMutation.isPending}
                                      onClick={() =>
                                        carrierStatusMutation.mutate({
                                          returnId: returnCase.id,
                                          status: 'IN_TRANSIT',
                                        })
                                      }
                                      className="border-rewear-border min-h-11 rounded-lg border px-3 text-xs font-semibold"
                                    >
                                      Mark In Transit
                                    </button>
                                  )}
                                  {returnCase.state === 'IN_TRANSIT' && (
                                    <button
                                      type="button"
                                      disabled={carrierStatusMutation.isPending}
                                      onClick={() =>
                                        carrierStatusMutation.mutate({
                                          returnId: returnCase.id,
                                          status: 'DELIVERED',
                                        })
                                      }
                                      className="border-rewear-border min-h-11 rounded-lg border px-3 text-xs font-semibold"
                                    >
                                      Mark Delivered
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {issue.status === 'AWAITING_EXECUTION' && (
                              <button
                                type="button"
                                disabled={refundMutation.isPending}
                                onClick={() =>
                                  refundMutation.mutate(decision.id)
                                }
                                className="bg-rewear-text min-h-11 rounded-lg px-5 text-sm font-semibold text-white disabled:opacity-50"
                              >
                                {refundMutation.isPending
                                  ? 'Executing refund…'
                                  : 'Execute refund'}
                              </button>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Record Ruling / Conclude Appeal Dialog */}
      {rulingTarget && (
        <DisputeDecisionDialog
          target={rulingTarget}
          onClose={() => setRulingTarget(null)}
          onDone={async () => {
            const label =
              rulingTarget.mode === 'APPEAL'
                ? 'Appeal decision recorded.'
                : 'Dispute decision recorded.';
            setRulingTarget(null);
            await refreshAll(label);
          }}
        />
      )}

      {/* Extend SLA Dialog */}
      {extendTarget && (
        <ExtendSlaDialog
          issue={extendTarget}
          onClose={() => setExtendTarget(null)}
          onDone={async () => {
            setExtendTarget(null);
            await refreshAll('Review SLA extended to 5 business days.');
          }}
        />
      )}

      {/* Issue Return Label Dialog */}
      {labelTarget && (
        <ReturnLabelDialog
          returnCase={labelTarget}
          onClose={() => setLabelTarget(null)}
          onDone={async () => {
            setLabelTarget(null);
            await refreshAll('Return waybill issued.');
          }}
        />
      )}
    </AdminWorkspaceLayout>
  );
}
