'use client';

import { useState } from 'react';

import { formatIctDateTime, shortId } from '@/modules/disputes/api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import type {
  CodReconciliationControllerCollectBodyMode,
  CodReconciliationControllerRemitBodyMode,
} from '@/shared/api/models';
import {
  useCodReconciliationControllerCollect,
  useCodReconciliationControllerDetail,
  useCodReconciliationControllerRemit,
} from '@/shared/api/query-generated/cod-reconciliation/cod-reconciliation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { formatPrice } from '@/shared/utils/product';

export function ReconciliationDetailModal({
  orderId,
  onClose,
}: {
  orderId: string;
  onClose: () => void;
}) {
  const detailQuery = useCodReconciliationControllerDetail(orderId, undefined, {
    query: { retry: false },
  });
  const detail = detailQuery.data?.data;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-rewear-border max-h-[90dvh] max-w-[560px] overflow-y-auto rounded-lg border p-8">
        <DialogTitle>COD reconciliation #{shortId(orderId)}</DialogTitle>
        <DialogDescription>
          Collection proof and linked carrier bank remittances.
        </DialogDescription>
        {detailQuery.isPending ? (
          <p role="status" className="text-rewear-muted text-sm">
            Loading detail…
          </p>
        ) : detailQuery.isError || !detail ? (
          <p role="alert" className="text-sm text-[#BA1A1A]">
            Could not load reconciliation detail.
          </p>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="bg-rewear-soft space-y-2 rounded-lg p-4 text-xs">
              <p className="font-semibold">
                Waybill:{' '}
                <span className="font-mono">
                  {detail.collection.waybillCode}
                </span>{' '}
                · {detail.collection.status}
              </p>
              <p>
                Collected: {formatPrice(detail.collection.collectedAmount)} at{' '}
                {formatIctDateTime(detail.collection.collectedAt)}
              </p>
              <p>Reason: {detail.collection.reason}</p>
              <p className="text-rewear-muted">
                Evidence: {detail.collection.evidence}
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">
                Linked remittances ({detail.remittances.length})
              </p>
              {detail.remittances.length === 0 ? (
                <p className="text-rewear-muted text-xs">
                  No carrier remittances allocated yet.
                </p>
              ) : (
                detail.remittances.map((rem) => (
                  <div
                    key={rem.id}
                    className="border-rewear-border rounded-lg border p-3 text-xs"
                  >
                    <div className="flex justify-between font-semibold">
                      <span className="font-mono">{rem.reference}</span>
                      <span className="font-mono">
                        {formatPrice(rem.netAmount)}
                      </span>
                    </div>
                    <p className="text-rewear-muted mt-1">
                      Received {formatIctDateTime(rem.receivedAt)} ·{' '}
                      {rem.reason}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function RecordCollectionModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [orderId, setOrderId] = useState('');
  const [mode, setMode] =
    useState<CodReconciliationControllerCollectBodyMode>('EVIDENCE');
  const [waybillCode, setWaybillCode] = useState('');
  const [collectedAmount, setCollectedAmount] = useState('');
  const [approvedCarrierFee, setApprovedCarrierFee] = useState('');
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [error, setError] = useState('');

  const mutation = useCodReconciliationControllerCollect({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onSuccess: () => void onSaved(),
      onError: (err) => setError(getApiErrorMessage(err)),
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-rewear-border max-h-[90dvh] max-w-[540px] overflow-y-auto rounded-lg border p-8">
        <DialogTitle>Record COD collection</DialogTitle>
        <DialogDescription>
          Log the cash amount collected by the shipping carrier upon delivery.
        </DialogDescription>
        <form
          className="space-y-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            setError('');
            mutation.mutate({
              id: orderId.trim(),
              data: {
                requestId: crypto.randomUUID(),
                mode,
                waybillCode: waybillCode.trim(),
                collectedAmount: Number(collectedAmount),
                approvedCarrierFee: Number(approvedCarrierFee || 0),
                collectedAt: new Date().toISOString(),
                reason: reason.trim(),
                evidence: evidence.trim(),
              },
            });
          }}
        >
          <label className="grid gap-1 text-sm font-semibold">
            Order UUID
            <input
              type="text"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="border-rewear-border min-h-11 rounded-lg border px-3 font-mono text-xs font-normal"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold">
              Mode
              <select
                value={mode}
                onChange={(e) =>
                  setMode(
                    e.target
                      .value as CodReconciliationControllerCollectBodyMode,
                  )
                }
                className="border-rewear-border min-h-11 rounded-lg border bg-white px-3 font-normal"
              >
                <option value="EVIDENCE">Evidence</option>
                <option value="SIMULATION">Simulation</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Waybill code
              <input
                type="text"
                required
                value={waybillCode}
                onChange={(e) => setWaybillCode(e.target.value)}
                placeholder="GHN123456"
                className="border-rewear-border min-h-11 rounded-lg border px-3 font-mono font-normal"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Collected amount (VND)
              <input
                type="number"
                required
                min={0}
                value={collectedAmount}
                onChange={(e) => setCollectedAmount(e.target.value)}
                className="border-rewear-border min-h-11 rounded-lg border px-3 font-mono font-normal"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Carrier fee (VND)
              <input
                type="number"
                required
                min={0}
                value={approvedCarrierFee}
                onChange={(e) => setApprovedCarrierFee(e.target.value)}
                className="border-rewear-border min-h-11 rounded-lg border px-3 font-mono font-normal"
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm font-semibold">
            Reason
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Carrier COD statement verified"
              className="border-rewear-border min-h-11 rounded-lg border px-3 font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Evidence reference
            <textarea
              required
              rows={2}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Link or statement reference number…"
              className="border-rewear-border rounded-lg border p-2.5 font-normal"
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
              disabled={mutation.isPending}
              className="bg-rewear-accent text-rewear-text min-h-11 rounded-lg px-5 text-sm font-semibold disabled:opacity-50"
            >
              {mutation.isPending ? 'Recording…' : 'Save collection'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RecordRemittanceModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [mode, setMode] =
    useState<CodReconciliationControllerRemitBodyMode>('EVIDENCE');
  const [reference, setReference] = useState('');
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [allocations, setAllocations] = useState([
    { orderId: '', cashAmount: '', feeDeducted: '0' },
  ]);
  const [error, setError] = useState('');

  const netAmount = allocations.reduce(
    (sum, item) => sum + (Number(item.cashAmount) || 0),
    0,
  );

  const mutation = useCodReconciliationControllerRemit({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onSuccess: () => void onSaved(),
      onError: (err) => setError(getApiErrorMessage(err)),
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-rewear-border max-h-[90dvh] max-w-[580px] overflow-y-auto rounded-lg border p-8">
        <DialogTitle>Record carrier COD remittance</DialogTitle>
        <DialogDescription>
          Allocate a carrier bank transfer across one or more COD orders. Net
          amount is calculated automatically from allocated cash.
        </DialogDescription>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError('');
            mutation.mutate({
              data: {
                requestId: crypto.randomUUID(),
                mode,
                reference: reference.trim().toUpperCase(),
                netAmount,
                receivedAt: new Date().toISOString(),
                reason: reason.trim(),
                evidence: evidence.trim(),
                allocations: allocations.map((row) => ({
                  orderId: row.orderId.trim(),
                  cashAmount: Number(row.cashAmount) || 0,
                  feeDeducted: Number(row.feeDeducted) || 0,
                })),
              },
            });
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold">
              Mode
              <select
                value={mode}
                onChange={(e) =>
                  setMode(
                    e.target.value as CodReconciliationControllerRemitBodyMode,
                  )
                }
                className="border-rewear-border min-h-11 rounded-lg border bg-white px-3 font-normal"
              >
                <option value="EVIDENCE">Evidence</option>
                <option value="SIMULATION">Simulation</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Bank transfer reference
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="GHN-BATCH-20261126"
                className="border-rewear-border min-h-11 rounded-lg border px-3 font-mono font-normal"
              />
            </label>
          </div>

          <div className="bg-rewear-soft space-y-3 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Order allocations</span>
              <button
                type="button"
                onClick={() =>
                  setAllocations((prev) => [
                    ...prev,
                    { orderId: '', cashAmount: '', feeDeducted: '0' },
                  ])
                }
                className="text-xs font-semibold underline"
              >
                + Add order
              </button>
            </div>
            {allocations.map((row, idx) => (
              <div
                key={idx}
                className="grid gap-2 rounded-lg bg-white p-3 sm:grid-cols-[1.6fr_1fr_1fr]"
              >
                <input
                  type="text"
                  required
                  placeholder="Order UUID"
                  aria-label={`Order UUID ${idx + 1}`}
                  value={row.orderId}
                  onChange={(e) =>
                    setAllocations((prev) =>
                      prev.map((item, i) =>
                        i === idx ? { ...item, orderId: e.target.value } : item,
                      ),
                    )
                  }
                  className="border-rewear-border min-h-11 rounded-lg border px-2.5 font-mono text-xs"
                />
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Cash (VND)"
                  aria-label={`Cash amount ${idx + 1}`}
                  value={row.cashAmount}
                  onChange={(e) =>
                    setAllocations((prev) =>
                      prev.map((item, i) =>
                        i === idx
                          ? { ...item, cashAmount: e.target.value }
                          : item,
                      ),
                    )
                  }
                  className="border-rewear-border min-h-11 rounded-lg border px-2.5 font-mono text-xs"
                />
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Fee (VND)"
                  aria-label={`Fee deducted ${idx + 1}`}
                  value={row.feeDeducted}
                  onChange={(e) =>
                    setAllocations((prev) =>
                      prev.map((item, i) =>
                        i === idx
                          ? { ...item, feeDeducted: e.target.value }
                          : item,
                      ),
                    )
                  }
                  className="border-rewear-border min-h-11 rounded-lg border px-2.5 font-mono text-xs"
                />
              </div>
            ))}
            <div className="flex justify-between text-xs font-semibold">
              <span>Calculated net remittance</span>
              <span className="font-mono tabular-nums">
                {formatPrice(netAmount)}
              </span>
            </div>
          </div>

          <label className="grid gap-1 text-sm font-semibold">
            Reason
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Carrier settlement matched bank credit"
              className="border-rewear-border min-h-11 rounded-lg border px-3 font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Evidence reference
            <textarea
              required
              rows={2}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Bank statement ID or settlement sheet reference…"
              className="border-rewear-border rounded-lg border p-2.5 font-normal"
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
              disabled={mutation.isPending || netAmount <= 0}
              className="bg-rewear-accent text-rewear-text min-h-11 rounded-lg px-5 text-sm font-semibold disabled:opacity-50"
            >
              {mutation.isPending ? 'Recording…' : 'Record remittance'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
