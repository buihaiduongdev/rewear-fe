'use client';

import { useState } from 'react';

import {
  type AdminShopPayout,
  shopFinanceApi,
} from '@/modules/shop-finance/shop-finance-api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { formatPrice } from '@/shared/utils/product';
import { useMutation } from '@tanstack/react-query';
import { ExternalLink, Upload } from 'lucide-react';

const ALLOWED_RECEIPT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

type ReceiptMimeType = (typeof ALLOWED_RECEIPT_TYPES)[number];

function toDateTimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function RecordTransferModal({
  payout,
  onClose,
  onSuccess,
}: {
  payout: AdminShopPayout;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [bankReference, setBankReference] = useState('');
  const [transferredAt, setTransferredAt] = useState(() =>
    toDateTimeLocal(new Date()),
  );
  const [evidenceNote, setEvidenceNote] = useState(
    `Bank transfer to ${payout.recipientSnapshot.bankCode} ${payout.recipientSnapshot.accountNumber}`,
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const succeedMutation = useMutation({
    mutationFn: async () => {
      let mediaId = uploadedMediaId;

      if (receiptFile && !mediaId) {
        if (
          !ALLOWED_RECEIPT_TYPES.includes(receiptFile.type as ReceiptMimeType)
        ) {
          throw new Error('Receipt must be a JPG, PNG, WebP, or AVIF image.');
        }
        setUploadingReceipt(true);
        try {
          const ticketRes = await shopFinanceApi.adminCreateReceiptUploadTicket(
            {
              mimeType: receiptFile.type as ReceiptMimeType,
              sizeBytes: receiptFile.size,
            },
          );
          const ticket = ticketRes.data;
          const uploadRes = await fetch(ticket.uploadUrl, {
            method: ticket.method,
            headers: {
              ...ticket.headers,
              'Content-Type': receiptFile.type,
            },
            body: receiptFile,
          });
          if (!uploadRes.ok) {
            throw new Error('Failed to upload UNC receipt image to storage.');
          }
          mediaId = ticket.id;
          setUploadedMediaId(ticket.id);
        } finally {
          setUploadingReceipt(false);
        }
      }

      return shopFinanceApi.adminSucceedPayout(payout.id, {
        bankCode: payout.recipientSnapshot.bankCode,
        accountNumber: payout.recipientSnapshot.accountNumber,
        accountName: payout.recipientSnapshot.accountName,
        amount: payout.amount,
        bankReference: bankReference.trim(),
        transferredAt: new Date(transferredAt).toISOString(),
        evidence: evidenceNote.trim(),
        ...(mediaId ? { transferEvidenceMediaId: mediaId } : {}),
      });
    },
    onSuccess: () => onSuccess(),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!bankReference.trim()) {
      setError('Enter the bank transfer reference number.');
      return;
    }
    if (!evidenceNote.trim()) {
      setError('Enter a transfer note or reconciliation reference.');
      return;
    }
    succeedMutation.mutate();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-rewear-surface text-rewear-text border-rewear-border max-h-[90dvh] max-w-[560px] overflow-y-auto rounded-none border p-8 shadow-xl outline-none"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <button
            type="button"
            onClick={onClose}
            className="text-rewear-text hover:text-rewear-muted text-sm font-semibold"
          >
            Close ×
          </button>

          <div className="space-y-1">
            <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
              Record completed transfer
            </h2>
            <p className="text-rewear-muted font-mono text-sm">
              {payout.requestId} · {formatPrice(payout.amount)} →{' '}
              {payout.recipientSnapshot.bankCode}{' '}
              {payout.recipientSnapshot.accountNumber} (
              {payout.recipientSnapshot.accountName})
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-rewear-soft space-y-1 p-3.5">
              <label
                htmlFor="payout-bank-ref"
                className="text-rewear-muted block text-xs font-semibold"
              >
                Bank reference / transaction code
              </label>
              <input
                id="payout-bank-ref"
                type="text"
                required
                placeholder="FT26112600012345"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-semibold outline-none"
              />
            </div>

            <div className="bg-rewear-soft space-y-1 p-3.5">
              <label
                htmlFor="payout-transferred-at"
                className="text-rewear-muted block text-xs font-semibold"
              >
                Transfer date &amp; time
              </label>
              <input
                id="payout-transferred-at"
                type="datetime-local"
                required
                value={transferredAt}
                onChange={(e) => setTransferredAt(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold outline-none"
              />
            </div>

            <div className="bg-rewear-soft space-y-1 p-3.5">
              <label
                htmlFor="payout-evidence"
                className="text-rewear-muted block text-xs font-semibold"
              >
                Transfer evidence note
              </label>
              <textarea
                id="payout-evidence"
                rows={2}
                required
                value={evidenceNote}
                onChange={(e) => setEvidenceNote(e.target.value)}
                className="w-full resize-none bg-transparent text-sm outline-none"
              />
            </div>

            <div className="border-rewear-border space-y-2 border border-dashed p-4">
              <label
                htmlFor="payout-receipt-file"
                className="flex cursor-pointer items-center gap-2 text-sm font-semibold"
              >
                <Upload size={16} aria-hidden="true" />
                <span>Upload UNC bank receipt image</span>
              </label>
              <input
                id="payout-receipt-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(e) => {
                  setReceiptFile(e.target.files?.[0] ?? null);
                  setUploadedMediaId(null);
                }}
                className="text-rewear-muted block w-full text-xs"
              />
              {receiptFile && (
                <p className="text-rewear-text text-xs font-medium">
                  Selected: {receiptFile.name} (
                  {Math.max(1, Math.round(receiptFile.size / 1024))} KB)
                </p>
              )}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={succeedMutation.isPending || uploadingReceipt}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 h-12 w-full text-sm font-semibold transition disabled:opacity-50"
          >
            {uploadingReceipt
              ? 'Uploading UNC receipt…'
              : succeedMutation.isPending
                ? 'Confirming transfer…'
                : 'Confirm transfer'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RejectPayoutModal({
  payout,
  onClose,
  onSuccess,
}: {
  payout: AdminShopPayout;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      shopFinanceApi.adminRejectPayout(payout.id, reason.trim()),
    onSuccess: () => onSuccess(),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-rewear-surface text-rewear-text border-rewear-border max-w-[480px] rounded-none border p-8 shadow-xl outline-none"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!reason.trim()) {
              setError('Enter a reason for rejecting this payout.');
              return;
            }
            mutation.mutate();
          }}
          className="space-y-5"
        >
          <button
            type="button"
            onClick={onClose}
            className="text-rewear-text hover:text-rewear-muted text-sm font-semibold"
          >
            Close ×
          </button>
          <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Reject withdrawal
          </h2>
          <div className="bg-rewear-soft space-y-1 p-3.5">
            <label
              htmlFor="reject-reason"
              className="text-rewear-muted block text-xs font-semibold"
            >
              Rejection reason
            </label>
            <textarea
              id="reject-reason"
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Account name mismatch or verification issue…"
              className="w-full resize-none bg-transparent text-sm outline-none"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="h-12 w-full bg-red-700 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-50"
          >
            {mutation.isPending ? 'Rejecting…' : 'Confirm rejection'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FailPayoutModal({
  payout,
  onClose,
  onSuccess,
}: {
  payout: AdminShopPayout;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      shopFinanceApi.adminFailPayout(payout.id, {
        reason: reason.trim(),
        evidence: evidence.trim(),
      }),
    onSuccess: () => onSuccess(),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-rewear-surface text-rewear-text border-rewear-border max-w-[480px] rounded-none border p-8 shadow-xl outline-none"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!reason.trim() || !evidence.trim()) {
              setError('Provide both failure reason and bank evidence.');
              return;
            }
            mutation.mutate();
          }}
          className="space-y-5"
        >
          <button
            type="button"
            onClick={onClose}
            className="text-rewear-text hover:text-rewear-muted text-sm font-semibold"
          >
            Close ×
          </button>
          <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Reconcile failed transfer
          </h2>
          <div className="space-y-3">
            <div className="bg-rewear-soft space-y-1 p-3.5">
              <label
                htmlFor="fail-reason"
                className="text-rewear-muted block text-xs font-semibold"
              >
                Failure reason
              </label>
              <input
                id="fail-reason"
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Bank rejected beneficiary account"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <div className="bg-rewear-soft space-y-1 p-3.5">
              <label
                htmlFor="fail-evidence"
                className="text-rewear-muted block text-xs font-semibold"
              >
                Reconciliation evidence
              </label>
              <textarea
                id="fail-evidence"
                rows={3}
                required
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Bank statement reversal reference…"
                className="w-full resize-none bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="h-12 w-full bg-red-700 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-50"
          >
            {mutation.isPending ? 'Recording failure…' : 'Mark transfer failed'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ReceiptPreviewModal({
  payout,
  url,
  loading,
  error,
  onClose,
}: {
  payout: AdminShopPayout;
  url: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-rewear-surface text-rewear-text border-rewear-border max-w-[640px] rounded-none border p-8 shadow-xl outline-none"
      >
        <div className="space-y-5">
          <button
            type="button"
            onClick={onClose}
            className="text-rewear-text hover:text-rewear-muted text-sm font-semibold"
          >
            Close ×
          </button>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">UNC bank receipt</h2>
            <p className="text-rewear-muted font-mono text-xs">
              {payout.requestId} · Ref: {payout.bankReference ?? '—'}
            </p>
          </div>
          {loading ? (
            <p role="status" className="text-rewear-muted text-sm">
              Loading receipt image…
            </p>
          ) : error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : url ? (
            <div className="space-y-3">
              <div className="border-rewear-border bg-rewear-soft max-h-[60vh] overflow-auto border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`UNC bank receipt for ${payout.requestId}`}
                  className="mx-auto max-h-[55vh] w-auto object-contain"
                />
              </div>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
              >
                Open full image
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          ) : (
            <p className="text-rewear-muted text-sm">
              No receipt image attached.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
