'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  REPORT_REASON_OPTIONS,
  type ReportReason,
  reportsApi,
  type ReportTargetType,
} from '@/modules/reports/reports-api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { useToastStore } from '@/shared/stores/toast.store';
import { useMutation } from '@tanstack/react-query';
import { Flag } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function ReportViolationDialog({
  productId,
  shopId,
}: {
  productId: string;
  shopId?: string;
}) {
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;
  const addToast = useToastStore((s) => s.addToast);

  const [open, setOpen] = useState(false);
  const [targetType, setTargetType] = useState<ReportTargetType>('PRODUCT');
  const [reason, setReason] = useState<ReportReason>('MISLEADING_CONTENT');
  const [description, setDescription] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: (idempotencyId: string) =>
      reportsApi.create({
        requestId: idempotencyId,
        targetType,
        targetId: targetType === 'SHOP' && shopId ? shopId : productId,
        reason,
        description: description.trim(),
      }),
    onSuccess: () => {
      setOpen(false);
      setDescription('');
      setRequestId(null);
      setError(null);
      addToast({
        type: 'success',
        title: 'Report submitted',
        description: 'Our moderation team will review your report shortly.',
        durationMs: 4000,
      });
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  if (!enabled) {
    return (
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(`/products/${productId}`)}`}
        className="text-rewear-muted hover:text-rewear-text inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold"
      >
        <Flag size={14} aria-hidden="true" />
        Report
      </Link>
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (description.trim().length < 10) {
      setError('Please describe the issue in at least 10 characters.');
      return;
    }
    const id = requestId ?? crypto.randomUUID();
    setRequestId(id);
    submitMutation.mutate(id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setRequestId(null);
          setOpen(true);
        }}
        className="text-rewear-muted hover:text-rewear-text inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold"
      >
        <Flag size={14} aria-hidden="true" />
        Report listing / shop
      </button>

      <DialogContent
        showCloseButton={false}
        className="bg-rewear-surface text-rewear-text border-rewear-border max-w-[500px] rounded-none border p-8 shadow-xl outline-none"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-rewear-text hover:text-rewear-muted text-sm font-semibold"
          >
            Close ×
          </button>

          <div className="space-y-1">
            <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
              Report violation
            </h2>
            <p className="text-rewear-muted text-sm">
              Help keep RE.WEAR trustworthy by flagging counterfeit, misleading,
              or prohibited items.
            </p>
          </div>

          {shopId && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={targetType === 'PRODUCT'}
                onClick={() => {
                  setTargetType('PRODUCT');
                  setRequestId(null);
                }}
                className={`min-h-11 border text-xs font-semibold transition ${
                  targetType === 'PRODUCT'
                    ? 'border-rewear-text bg-rewear-text text-white'
                    : 'border-rewear-border bg-rewear-soft text-rewear-text'
                }`}
              >
                This listing
              </button>
              <button
                type="button"
                aria-pressed={targetType === 'SHOP'}
                onClick={() => {
                  setTargetType('SHOP');
                  setRequestId(null);
                }}
                className={`min-h-11 border text-xs font-semibold transition ${
                  targetType === 'SHOP'
                    ? 'border-rewear-text bg-rewear-text text-white'
                    : 'border-rewear-border bg-rewear-soft text-rewear-text'
                }`}
              >
                This shop
              </button>
            </div>
          )}

          <div className="bg-rewear-soft space-y-1 p-3.5">
            <label
              htmlFor="report-reason"
              className="text-rewear-muted block text-xs font-semibold"
            >
              Reason
            </label>
            <select
              id="report-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value as ReportReason);
                setRequestId(null);
              }}
              className="w-full bg-transparent text-sm font-semibold outline-none"
            >
              {REPORT_REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-rewear-soft space-y-1 p-3.5">
            <label
              htmlFor="report-description"
              className="text-rewear-muted block text-xs font-semibold"
            >
              Details (at least 10 characters)
            </label>
            <textarea
              id="report-description"
              rows={3}
              required
              minLength={10}
              maxLength={4000}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setRequestId(null);
              }}
              placeholder="Explain what looks counterfeit, misleading, or violates policy…"
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
            disabled={submitMutation.isPending}
            className="h-12 w-full bg-red-700 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Submitting report…' : 'Submit report'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
