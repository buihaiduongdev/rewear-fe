'use client';

import { useState } from 'react';

import {
  attachDisputeEvidence,
  DISPUTE_ISSUE_STATUS_LABELS,
  DISPUTE_KIND_LABELS,
  DISPUTE_OUTCOME_LABELS,
  DISPUTE_RESPONSIBILITY_LABELS,
  type DisputeDecisionView,
  type DisputeIssueView,
  formatIctDateTime,
  getDisputeByOrder,
  handoverReturn,
  openDisputeEvidenceDownload,
  replyToDisputeIssue,
  RETURN_STATE_LABELS,
  type ReturnView,
  shortId,
  submitDisputeAppeal,
} from '@/modules/disputes/api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { formatPrice } from '@/shared/utils/product';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, FileText, PackageCheck, RotateCcw } from 'lucide-react';

interface BuyerDisputePanelProps {
  orderId: string;
  shopName: string;
  enabled: boolean;
  onUpdated?: () => Promise<unknown>;
}

export function BuyerDisputePanel({
  orderId,
  shopName,
  enabled,
  onUpdated,
}: BuyerDisputePanelProps) {
  const queryClient = useQueryClient();
  const [appealTarget, setAppealTarget] = useState<DisputeDecisionView | null>(
    null,
  );
  const [labelTarget, setLabelTarget] = useState<ReturnView | null>(null);
  const [replyIssueId, setReplyIssueId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [replyError, setReplyError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [renderedAt] = useState(() => Date.now());

  const disputeQuery = useQuery({
    queryKey: ['buyer-order-dispute', orderId],
    queryFn: () => getDisputeByOrder(orderId),
    enabled: enabled && Boolean(orderId),
    retry: false,
  });

  const refreshDispute = async () => {
    await Promise.all([
      disputeQuery.refetch(),
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] }),
      onUpdated?.(),
    ]);
  };

  const replyMutation = useMutation({
    mutationFn: async (input: {
      issueId: string;
      text: string;
      files: File[];
    }) => {
      const evidenceIds: string[] = [];
      for (const file of input.files) {
        const uploaded = await attachDisputeEvidence(orderId, file, ['ISSUE']);
        evidenceIds.push(uploaded.id);
      }
      return replyToDisputeIssue(input.issueId, {
        text: input.text.trim(),
        evidenceIds,
      });
    },
    onSuccess: async () => {
      setReplyIssueId(null);
      setReplyText('');
      setReplyFiles([]);
      setReplyError('');
      await refreshDispute();
    },
    onError: (err) => setReplyError(getApiErrorMessage(err)),
  });

  const handoverMutation = useMutation({
    mutationFn: (returnId: string) => handoverReturn(returnId),
    onSuccess: () => refreshDispute(),
  });

  const handleDownload = async (evidenceId: string) => {
    setDownloadError('');
    try {
      await openDisputeEvidenceDownload(evidenceId, false);
    } catch (err) {
      setDownloadError(getApiErrorMessage(err));
    }
  };

  const detail = disputeQuery.data?.data;

  return (
    <section
      aria-label="Returns and disputes"
      className="border-rewear-border bg-rewear-surface space-y-6 border p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em]">
            Returns &amp; disputes
          </h2>
          {detail && (
            <p className="text-rewear-muted mt-1 font-mono text-xs">
              CASE #{shortId(detail.id)} · {detail.state}
            </p>
          )}
        </div>
        {detail && (
          <span
            className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold ${
              detail.state === 'OPEN'
                ? 'bg-rewear-accent text-rewear-text'
                : 'bg-rewear-soft text-rewear-muted'
            }`}
          >
            {detail.state === 'OPEN' ? 'Open case' : 'Closed case'}
          </span>
        )}
      </div>

      {downloadError && (
        <p role="alert" className="text-sm text-[#BA1A1A]">
          {downloadError}
        </p>
      )}

      {disputeQuery.isPending ? (
        <p role="status" className="text-rewear-muted text-sm">
          Loading dispute details…
        </p>
      ) : disputeQuery.isError ? (
        <div role="alert" className="space-y-2 text-sm">
          <p>Could not load dispute details for this order.</p>
          <button
            type="button"
            className="min-h-11 font-semibold underline"
            onClick={() => void disputeQuery.refetch()}
          >
            Retry
          </button>
        </div>
      ) : !detail || detail.issues.length === 0 ? (
        <p className="text-rewear-muted text-sm">
          No dispute issues have been opened for this order.
        </p>
      ) : (
        <div className="space-y-6">
          {detail.issues.map((issue: DisputeIssueView) => {
            const issueMessages = detail.messages.filter(
              (m) => m.issueId === issue.id,
            );
            const decision =
              detail.decisions.find((d) => d.issueId === issue.id) ?? null;
            const appeal = decision
              ? (detail.appeals.find((a) => a.decisionId === decision.id) ??
                null)
              : null;
            const returnCase = decision
              ? (detail.returns.find((r) => r.decisionId === decision.id) ??
                null)
              : null;
            const appealDeadlineMs = decision
              ? new Date(decision.appealUntil).getTime()
              : 0;
            const canAppeal =
              Boolean(decision) &&
              issue.status === 'AWAITING_APPEAL' &&
              !decision?.finalizedAt &&
              !appeal &&
              appealDeadlineMs > renderedAt;
            const issueEvidence = detail.evidence.filter((e) =>
              issue.evidenceIds.includes(e.id),
            );

            return (
              <article
                key={issue.id}
                className="border-rewear-border space-y-5 border-t pt-5 first:border-t-0 first:pt-0"
              >
                {/* Issue Summary & SLA Banner */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      {DISPUTE_KIND_LABELS[issue.kind] ?? issue.kind}
                    </h3>
                    <p className="text-sm leading-6">{issue.description}</p>
                  </div>
                  <span
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      issue.reviewOverdue
                        ? 'bg-[#BA1A1A]/10 text-[#BA1A1A]'
                        : 'bg-rewear-soft text-rewear-text'
                    }`}
                  >
                    {DISPUTE_ISSUE_STATUS_LABELS[issue.status] ?? issue.status}
                  </span>
                </div>

                {/* SLA Deadlines */}
                <div className="bg-rewear-soft grid gap-3 rounded-lg p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-rewear-muted text-xs font-semibold">
                      Seller response due
                    </p>
                    <p className="mt-0.5 font-mono text-xs">
                      {formatIctDateTime(issue.sellerRespondBy)}
                    </p>
                  </div>
                  <div>
                    <p className="text-rewear-muted text-xs font-semibold">
                      Admin review SLA
                    </p>
                    <p
                      className={`mt-0.5 font-mono text-xs ${
                        issue.reviewOverdue ? 'font-bold text-[#BA1A1A]' : ''
                      }`}
                    >
                      {formatIctDateTime(issue.reviewDueAt)}
                      {issue.reviewOverdue ? ' · Overdue' : ''}
                    </p>
                  </div>
                  {issue.extendedAt && issue.extensionReason && (
                    <div className="sm:col-span-2">
                      <p className="text-rewear-muted text-xs font-semibold">
                        SLA extension note
                      </p>
                      <p className="mt-0.5 text-xs">{issue.extensionReason}</p>
                    </div>
                  )}
                </div>

                {/* Submitted Evidence */}
                {issueEvidence.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Submitted evidence</p>
                    <div className="flex flex-wrap gap-2">
                      {issueEvidence.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => void handleDownload(ev.id)}
                          className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs font-semibold"
                        >
                          <FileText size={14} />
                          <span>{ev.tags.join(', ') || 'Attachment'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Ruling Card */}
                {decision && (
                  <div className="border-rewear-border space-y-4 rounded-lg border bg-[#F9F9FB] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-base font-semibold">Admin ruling</h4>
                      <span className="bg-rewear-text text-rewear-surface rounded-lg px-2.5 py-1 text-xs font-semibold">
                        {
                          DISPUTE_OUTCOME_LABELS[
                            decision.finalOutcome ?? decision.outcome
                          ]
                        }
                      </span>
                    </div>

                    <dl className="grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-rewear-muted text-xs">
                          Responsibility
                        </dt>
                        <dd className="mt-0.5 font-semibold">
                          {
                            DISPUTE_RESPONSIBILITY_LABELS[
                              decision.responsibility
                            ]
                          }
                        </dd>
                      </div>
                      <div>
                        <dt className="text-rewear-muted text-xs">
                          Approved refund
                        </dt>
                        <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums">
                          {(decision.finalRefundAmount ??
                            decision.refundAmount) != null
                            ? formatPrice(
                                decision.finalRefundAmount ??
                                  decision.refundAmount ??
                                  0,
                              )
                            : '0₫'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-rewear-muted text-xs">
                          Reconsideration deadline
                        </dt>
                        <dd className="mt-0.5 font-mono text-xs">
                          {formatIctDateTime(decision.appealUntil)}
                        </dd>
                      </div>
                    </dl>

                    <div className="space-y-1 text-sm">
                      <p className="text-rewear-muted text-xs font-semibold">
                        Decision rationale
                      </p>
                      <p>{decision.finalReason ?? decision.reason}</p>
                    </div>

                    {appeal ? (
                      <div className="border-rewear-border bg-rewear-surface space-y-1.5 rounded-lg border p-4 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold">
                            Reconsideration requested ({appeal.party})
                          </p>
                          <span className="text-rewear-muted font-mono text-xs">
                            Filed {formatIctDateTime(appeal.filedAt)}
                          </span>
                        </div>
                        <p>{appeal.reason}</p>
                        <p className="text-rewear-muted text-xs">
                          Review due: {formatIctDateTime(appeal.reviewDueAt)}
                        </p>
                      </div>
                    ) : canAppeal ? (
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <p className="text-rewear-muted text-xs">
                          You may submit a one-time reconsideration request
                          within 2 business days of the ruling.
                        </p>
                        <button
                          type="button"
                          onClick={() => setAppealTarget(decision)}
                          className="border-rewear-text hover:bg-rewear-text inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors hover:text-white"
                        >
                          <RotateCcw size={15} />
                          Request reconsideration
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Return Shipping Tracking Panel */}
                {returnCase && (
                  <div className="border-rewear-border bg-rewear-surface space-y-4 rounded-lg border p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <PackageCheck size={18} />
                        <h4 className="text-base font-semibold">
                          Return shipping
                        </h4>
                      </div>
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          returnCase.state === 'EXPIRED'
                            ? 'bg-[#BA1A1A]/10 text-[#BA1A1A]'
                            : returnCase.state === 'READY'
                              ? 'bg-rewear-accent text-rewear-text'
                              : 'bg-rewear-soft text-rewear-text'
                        }`}
                      >
                        {RETURN_STATE_LABELS[returnCase.state]}
                      </span>
                    </div>

                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-rewear-muted text-xs">
                          Return waybill / tracking
                        </dt>
                        <dd className="mt-0.5 font-mono text-xs font-bold">
                          {returnCase.labelCode ??
                            'Pending admin carrier booking'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-rewear-muted text-xs">
                          Handover deadline
                        </dt>
                        <dd className="mt-0.5 font-mono text-xs">
                          {formatIctDateTime(returnCase.handoverBy)}
                        </dd>
                      </div>
                      {returnCase.handoverAt && (
                        <div>
                          <dt className="text-rewear-muted text-xs">
                            Handed over to carrier
                          </dt>
                          <dd className="mt-0.5 font-mono text-xs">
                            {formatIctDateTime(returnCase.handoverAt)}
                          </dd>
                        </div>
                      )}
                      {returnCase.deliveredAt && (
                        <div>
                          <dt className="text-rewear-muted text-xs">
                            Delivered to seller
                          </dt>
                          <dd className="mt-0.5 font-mono text-xs">
                            {formatIctDateTime(returnCase.deliveredAt)}
                          </dd>
                        </div>
                      )}
                    </dl>

                    {returnCase.instructions && (
                      <p className="text-rewear-muted text-sm">
                        {returnCase.instructions}
                      </p>
                    )}

                    {handoverMutation.isError && (
                      <p role="alert" className="text-sm text-[#BA1A1A]">
                        {getApiErrorMessage(handoverMutation.error)}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setLabelTarget(returnCase)}
                        className="border-rewear-border hover:bg-rewear-soft min-h-11 rounded-lg border px-4 text-sm font-semibold"
                      >
                        View return label
                      </button>
                      {returnCase.state === 'AWAITING_HANDOVER' && (
                        <button
                          type="button"
                          disabled={handoverMutation.isPending}
                          onClick={() => handoverMutation.mutate(returnCase.id)}
                          className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 min-h-11 rounded-lg px-4 text-sm font-semibold disabled:opacity-50"
                        >
                          {handoverMutation.isPending
                            ? 'Confirming…'
                            : 'Confirm parcel handed over'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Conversation Thread & Buyer Reply */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      Case replies ({issueMessages.length})
                    </h4>
                    {issue.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() =>
                          setReplyIssueId(
                            replyIssueId === issue.id ? null : issue.id,
                          )
                        }
                        className="min-h-11 text-sm font-semibold underline"
                      >
                        {replyIssueId === issue.id
                          ? 'Cancel reply'
                          : 'Add reply'}
                      </button>
                    )}
                  </div>

                  {issueMessages.length > 0 && (
                    <div className="space-y-2.5">
                      {issueMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className="bg-rewear-soft space-y-1.5 rounded-lg p-3.5 text-sm"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-semibold">{msg.party}</span>
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
                                  Attachment {idx + 1}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {replyIssueId === issue.id && (
                    <form
                      className="border-rewear-border space-y-3 rounded-lg border p-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!replyText.trim()) return;
                        setReplyError('');
                        replyMutation.mutate({
                          issueId: issue.id,
                          text: replyText,
                          files: replyFiles,
                        });
                      }}
                    >
                      <label className="grid gap-1 text-sm font-semibold">
                        Additional note
                        <textarea
                          rows={3}
                          maxLength={2000}
                          required
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Share any clarification or follow-up details for the reviewer…"
                          className="border-rewear-border rounded-lg border p-2.5 font-normal"
                        />
                      </label>
                      <label className="grid gap-1 text-sm font-semibold">
                        Supporting photos or video (optional)
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                          onChange={(e) =>
                            setReplyFiles(Array.from(e.target.files ?? []))
                          }
                          className="text-xs font-normal"
                        />
                      </label>
                      {replyError && (
                        <p role="alert" className="text-sm text-[#BA1A1A]">
                          {replyError}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={replyMutation.isPending || !replyText.trim()}
                        className="bg-rewear-text min-h-11 rounded-lg px-5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {replyMutation.isPending ? 'Sending…' : 'Send reply'}
                      </button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* One-time Appeal / Reconsideration Dialog */}
      {appealTarget && (
        <AppealDecisionDialog
          orderId={orderId}
          decision={appealTarget}
          onClose={() => setAppealTarget(null)}
          onSubmitted={async () => {
            setAppealTarget(null);
            await refreshDispute();
          }}
        />
      )}

      {/* Return Label Dialog matching Figma 48:716 */}
      <Dialog
        open={Boolean(labelTarget)}
        onOpenChange={(open) => {
          if (!open) setLabelTarget(null);
        }}
      >
        <DialogContent className="border-rewear-border max-w-[520px] rounded-lg border p-8">
          <DialogTitle>Return shipping</DialogTitle>
          <DialogDescription>
            {labelTarget
              ? `Return #${shortId(labelTarget.id)} — keep your carrier drop-off receipt until the seller verifies the returned item.`
              : ''}
          </DialogDescription>
          {labelTarget && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-rewear-muted">Recipient</span>
                <span className="font-semibold">{shopName}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-rewear-muted">Reference / Waybill</span>
                <span className="font-mono font-bold">
                  {labelTarget.labelCode ?? 'Awaiting carrier booking'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-rewear-muted">Send back by</span>
                <span className="font-mono text-xs">
                  {formatIctDateTime(labelTarget.handoverBy)}
                </span>
              </div>
              <p className="text-rewear-muted leading-6">
                {labelTarget.instructions ??
                  'Do not ship to an unconfirmed address. Once delivered back to the seller, the seller has 48 hours to confirm receipt before refund release.'}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function AppealDecisionDialog({
  orderId,
  decision,
  onClose,
  onSubmitted,
}: {
  orderId: string;
  decision: DisputeDecisionView;
  onClose: () => void;
  onSubmitted: () => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');

  const appealMutation = useMutation({
    mutationFn: async () => {
      const evidenceIds: string[] = [];
      for (const file of files) {
        const uploaded = await attachDisputeEvidence(orderId, file, ['ISSUE']);
        evidenceIds.push(uploaded.id);
      }
      return submitDisputeAppeal(decision.id, {
        reason: reason.trim(),
        evidenceIds,
      });
    },
    onSuccess: () => onSubmitted(),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-rewear-border max-w-[520px] rounded-lg border p-8">
        <DialogTitle>Request reconsideration</DialogTitle>
        <DialogDescription>
          You can submit one appeal within 2 business days of the ruling (before{' '}
          {formatIctDateTime(decision.appealUntil)}). Explain what was missed or
          attach new evidence.
        </DialogDescription>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!reason.trim()) return;
            setError('');
            appealMutation.mutate();
          }}
        >
          <label className="grid gap-1.5 text-sm font-semibold">
            Appeal reason
            <textarea
              required
              rows={4}
              maxLength={2000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the ruling should be reconsidered…"
              className="border-rewear-border rounded-lg border p-3 font-normal"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Additional evidence (optional)
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="text-xs font-normal"
            />
          </label>
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-[#BA1A1A]/10 p-3 text-sm text-[#BA1A1A]"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={appealMutation.isPending}
              className="border-rewear-border min-h-11 rounded-lg border px-4 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={appealMutation.isPending || !reason.trim()}
              className="bg-rewear-accent text-rewear-text min-h-11 rounded-lg px-5 text-sm font-semibold disabled:opacity-50"
            >
              {appealMutation.isPending ? 'Submitting…' : 'Submit appeal'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
