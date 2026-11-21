'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { type TToast, useToastStore } from '@/shared/stores/toast.store';
import {
  AlertCircleIcon,
  ArrowRight01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

function ToastIcon({ type }: { type: TToast['type'] }) {
  if (type === 'success') {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center bg-[#c4f82a] text-[#181a1b]">
        <HugeiconsIcon
          icon={CheckmarkCircle01Icon}
          size={16}
          strokeWidth={2.25}
        />
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center bg-white text-[#c92a2a]">
        <HugeiconsIcon icon={AlertCircleIcon} size={16} strokeWidth={2} />
      </div>
    );
  }

  return (
    <div className="flex size-7 shrink-0 items-center justify-center border border-[#d4d6d8] bg-white text-[#181a1b]">
      <HugeiconsIcon icon={InformationCircleIcon} size={16} strokeWidth={2} />
    </div>
  );
}

function ToastItem({ toast }: { toast: TToast }) {
  const removeToast = useToastStore((state) => state.removeToast);
  const [remainingMs, setRemainingMs] = useState(toast.durationMs);

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  useEffect(() => {
    if (!toast.durationMs || toast.durationMs <= 0) return;

    const updateRemainingMs = () => {
      const nextRemainingMs = Math.max(
        0,
        toast.durationMs - (Date.now() - toast.createdAt),
      );

      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0) removeToast(toast.id);
    };

    updateRemainingMs();
    const intervalId = window.setInterval(updateRemainingMs, 50);

    return () => window.clearInterval(intervalId);
  }, [removeToast, toast.createdAt, toast.durationMs, toast.id]);

  const progressPercent =
    toast.durationMs > 0
      ? Math.max(0, Math.min(100, (remainingMs / toast.durationMs) * 100))
      : 0;

  const containerClasses = isSuccess
    ? 'bg-[#181a1b] text-white border border-[#181a1b] shadow-[4px_4px_0px_0px_#c4f82a]'
    : isError
      ? 'bg-[#c92a2a] text-white border border-[#c92a2a] shadow-[4px_4px_0px_0px_#181a1b]'
      : 'bg-[#f4f4f4] text-[#181a1b] border-[1.5px] border-[#181a1b] shadow-[4px_4px_0px_0px_#181a1b]';

  const actionTextClasses = isSuccess
    ? 'text-[#c4f82a] hover:opacity-85'
    : isError
      ? 'text-white underline underline-offset-4 hover:opacity-85'
      : 'text-[#181a1b] underline underline-offset-4 hover:opacity-85';

  const closeButtonClasses = isSuccess
    ? 'text-[#a1a5a8] hover:text-white'
    : isError
      ? 'text-white/80 hover:text-white'
      : 'text-[#5a5d60] hover:text-[#181a1b]';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-none transition-all ${containerClasses}`}
    >
      <div className="flex items-start gap-3 p-[14px_16px]">
        {toast.thumbnail ? (
          <div className="flex size-11 shrink-0 items-center justify-center border border-[#e2e2e2] bg-[#ecece9]">
            {toast.thumbnail}
          </div>
        ) : (
          <ToastIcon type={toast.type} />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-heading text-sm leading-tight font-semibold">
              {toast.title}
            </p>
            {toast.meta && (
              <span
                className={`shrink-0 font-mono text-[13px] font-semibold tabular-nums ${
                  isSuccess
                    ? 'text-[#c4f82a]'
                    : isError
                      ? 'text-white'
                      : 'text-[#181a1b]'
                }`}
              >
                {toast.meta}
              </span>
            )}
          </div>

          {toast.description && (
            <p
              className={`mt-1 text-[13px] leading-relaxed ${
                isSuccess
                  ? 'text-[#d4d6d8]'
                  : isError
                    ? 'text-white/90'
                    : 'text-[#5a5d60]'
              }`}
            >
              {toast.description}
            </p>
          )}

          {(toast.actionLabel || toast.href) && (
            <div className="mt-2 -ml-2">
              {toast.href ? (
                <Link
                  href={toast.href}
                  className={`inline-flex min-h-[44px] items-center gap-1.5 px-2 text-[13px] font-semibold transition-opacity ${actionTextClasses}`}
                >
                  <span>{toast.actionLabel ?? 'View details'}</span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={14}
                    strokeWidth={2}
                  />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    toast.onAction?.();
                    removeToast(toast.id);
                  }}
                  className={`inline-flex min-h-[44px] items-center gap-1.5 px-2 text-[13px] font-semibold transition-opacity ${actionTextClasses}`}
                >
                  <span>{toast.actionLabel}</span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={14}
                    strokeWidth={2}
                  />
                </button>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => removeToast(toast.id)}
          aria-label="Close notification"
          className={`-mt-2 -mr-2 flex size-11 shrink-0 items-center justify-center transition-colors ${closeButtonClasses}`}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} />
        </button>
      </div>

      {toast.durationMs > 0 && (
        <div className="h-[2px] w-full bg-black/10">
          <div
            style={{ width: `${progressPercent}%` }}
            className={`h-full transition-[width] duration-75 ease-linear ${
              isSuccess ? 'bg-[#c4f82a]' : isError ? 'bg-white' : 'bg-[#181a1b]'
            }`}
          />
        </div>
      )}
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col gap-2.5 sm:right-6 sm:left-auto sm:w-[400px]"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
