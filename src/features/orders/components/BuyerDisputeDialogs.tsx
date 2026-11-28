'use client';

import { useState } from 'react';

import {
  attachDisputeEvidence,
  type DisputeDecisionView,
  formatIctDateTime,
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
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';

export function BuyerReturnLabelDialog({
  labelTarget,
  shopName,
  onClose,
}: {
  labelTarget: ReturnView | null;
  shopName: string;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={Boolean(labelTarget)}
      onOpenChange={(open) => {
        if (!open) onClose();
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
  );
}

export function AppealDecisionDialog({
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
