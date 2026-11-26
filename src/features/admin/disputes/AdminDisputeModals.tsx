'use client';

import { useState } from 'react';

import {
  concludeDisputeAppeal,
  createReturnLabel,
  decideDisputeIssue,
  type DisputeDecisionOutcome,
  type DisputeDecisionView,
  type DisputeIssueView,
  type DisputeResponsibility,
  extendDisputeSla,
  formatIctDateTime,
  type ReconciliationMode,
  type ReturnView,
} from '@/modules/disputes/api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';

export function DisputeDecisionDialog({
  target,
  onClose,
  onDone,
}: {
  target: {
    issue: DisputeIssueView;
    mode: 'INITIAL' | 'APPEAL';
    decision?: DisputeDecisionView;
  };
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [outcome, setOutcome] = useState<DisputeDecisionOutcome>(
    target.decision?.outcome ?? 'UPHOLD_CLAIM',
  );
  const [responsibility, setResponsibility] = useState<DisputeResponsibility>(
    target.decision?.responsibility ?? 'SELLER',
  );
  const [refundAmount, setRefundAmount] = useState(
    target.decision?.refundAmount ? String(target.decision.refundAmount) : '',
  );
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        outcome,
        responsibility,
        reason: reason.trim(),
        refundAmount:
          outcome === 'REJECT_CLAIM'
            ? null
            : refundAmount.trim()
              ? Number(refundAmount)
              : null,
      };
      return target.mode === 'APPEAL' && target.decision
        ? concludeDisputeAppeal(target.decision.id, payload)
        : decideDisputeIssue(target.issue.id, payload);
    },
    onSuccess: () => onDone(),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-rewear-border max-w-[540px] rounded-lg border p-8">
        <DialogTitle>
          {target.mode === 'APPEAL'
            ? 'Conclude reconsideration appeal'
            : 'Record dispute ruling'}
        </DialogTitle>
        <DialogDescription>
          Select the adjudication outcome, responsible party, and concise ruling
          reason visible to buyer and seller.
        </DialogDescription>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!reason.trim()) return;
            setError('');
            mutation.mutate();
          }}
        >
          <label className="grid gap-1.5 text-sm font-semibold">
            Outcome
            <select
              value={outcome}
              onChange={(e) =>
                setOutcome(e.target.value as DisputeDecisionOutcome)
              }
              className="border-rewear-border min-h-11 rounded-lg border bg-white px-3 font-normal"
            >
              <option value="UPHOLD_CLAIM">Approve refund (no return)</option>
              <option value="REQUIRE_RETURN">
                Require return before refund
              </option>
              <option value="REJECT_CLAIM">Reject claim</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Fault / responsibility
            <select
              value={responsibility}
              onChange={(e) =>
                setResponsibility(e.target.value as DisputeResponsibility)
              }
              className="border-rewear-border min-h-11 rounded-lg border bg-white px-3 font-normal"
            >
              <option value="SELLER">Seller</option>
              <option value="BUYER">Buyer</option>
              <option value="CARRIER">Carrier</option>
              <option value="UNDETERMINED">Undetermined</option>
            </select>
          </label>
          {outcome !== 'REJECT_CLAIM' && (
            <label className="grid gap-1.5 text-sm font-semibold">
              Refund amount in VND (leave blank for full item price)
              <input
                type="number"
                min={1}
                step={1000}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="e.g. 250000"
                className="border-rewear-border min-h-11 rounded-lg border px-3 font-mono font-normal"
              />
            </label>
          )}
          <label className="grid gap-1.5 text-sm font-semibold">
            Ruling reason
            <textarea
              required
              rows={4}
              maxLength={2000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Document evidence findings and refund/return terms…"
              className="border-rewear-border rounded-lg border p-3 font-normal"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-[#BA1A1A]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border-rewear-border min-h-11 rounded-lg border px-4 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !reason.trim()}
              className="bg-rewear-accent text-rewear-text min-h-11 rounded-lg px-5 text-sm font-semibold disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving…' : 'Confirm ruling'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ExtendSlaDialog({
  issue,
  onClose,
  onDone,
}: {
  issue: DisputeIssueView;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => extendDisputeSla(issue.id, reason.trim()),
    onSuccess: () => onDone(),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-rewear-border max-w-[480px] rounded-lg border p-8">
        <DialogTitle>Extend review SLA</DialogTitle>
        <DialogDescription>
          Extend this issue&apos;s review window from 3 to 5 business days (max{' '}
          {formatIctDateTime(issue.maxReviewDueAt)}).
        </DialogDescription>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!reason.trim()) return;
            setError('');
            mutation.mutate();
          }}
        >
          <label className="grid gap-1.5 text-sm font-semibold">
            Reason for extension
            <textarea
              required
              rows={3}
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Waiting for carrier transit investigation report…"
              className="border-rewear-border rounded-lg border p-3 font-normal"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-[#BA1A1A]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border-rewear-border min-h-11 rounded-lg border px-4 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !reason.trim()}
              className="bg-rewear-text min-h-11 rounded-lg px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {mutation.isPending ? 'Extending…' : 'Extend SLA'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ReturnLabelDialog({
  returnCase,
  onClose,
  onDone,
}: {
  returnCase: ReturnView;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [mode, setMode] = useState<ReconciliationMode>('SIMULATION');
  const [waybillCode, setWaybillCode] = useState('');
  const [instructions, setInstructions] = useState(
    'Prepaid return label; hand over parcel within 5 days.',
  );
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      createReturnLabel(returnCase.id, {
        mode,
        waybillCode: waybillCode.trim(),
        instructions: instructions.trim() || undefined,
      }),
    onSuccess: () => onDone(),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-rewear-border max-w-[480px] rounded-lg border p-8">
        <DialogTitle>Issue return shipping label</DialogTitle>
        <DialogDescription>
          Assign a carrier waybill and instructions so the buyer can ship the
          item back within 5 days.
        </DialogDescription>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!waybillCode.trim()) return;
            setError('');
            mutation.mutate();
          }}
        >
          <label className="grid gap-1.5 text-sm font-semibold">
            Mode
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ReconciliationMode)}
              className="border-rewear-border min-h-11 rounded-lg border bg-white px-3 font-normal"
            >
              <option value="SIMULATION">Simulation</option>
              <option value="EVIDENCE">Evidence (Live carrier)</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Waybill / tracking code
            <input
              type="text"
              required
              maxLength={128}
              value={waybillCode}
              onChange={(e) => setWaybillCode(e.target.value)}
              placeholder="e.g. GHN-RET-4091"
              className="border-rewear-border min-h-11 rounded-lg border px-3 font-mono font-normal"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Instructions
            <textarea
              rows={2}
              maxLength={1000}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="border-rewear-border rounded-lg border p-2.5 font-normal"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-[#BA1A1A]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border-rewear-border min-h-11 rounded-lg border px-4 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !waybillCode.trim()}
              className="bg-rewear-accent text-rewear-text min-h-11 rounded-lg px-5 text-sm font-semibold disabled:opacity-50"
            >
              {mutation.isPending ? 'Issuing…' : 'Issue label'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
