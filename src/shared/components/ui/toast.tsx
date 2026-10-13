'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { type TToast, useToastStore } from '@/shared/stores/toast.store';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

function ToastItem({ toast }: { toast: TToast }) {
  const removeToast = useToastStore((state) => state.removeToast);
  const [remainingMs, setRemainingMs] = useState(toast.durationMs);
  const progress = remainingMs / toast.durationMs;
  const remainingSeconds = Math.ceil(remainingMs / 1_000);
  const circleLength = 2 * Math.PI * 10;
  const isError = toast.type === 'error';

  useEffect(() => {
    const updateRemainingMs = () => {
      const nextRemainingMs = Math.max(
        0,
        toast.durationMs - (Date.now() - toast.createdAt),
      );

      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0) removeToast(toast.id);
    };

    updateRemainingMs();
    const intervalId = window.setInterval(updateRemainingMs, 100);

    return () => window.clearInterval(intervalId);
  }, [removeToast, toast.createdAt, toast.durationMs, toast.id]);

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`bg-card shadow-card pointer-events-auto rounded-lg border p-4 ${
        isError ? 'border-destructive/25' : 'border-success/25'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="relative grid size-8 shrink-0 place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isError ? 'text-destructive/20' : 'text-success/20'}
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={circleLength}
              strokeDashoffset={circleLength * (1 - progress)}
              className={
                isError
                  ? 'text-destructive transition-[stroke-dashoffset] duration-100'
                  : 'text-success transition-[stroke-dashoffset] duration-100'
              }
            />
          </svg>
          <span
            className={`text-[0.625rem] font-semibold ${
              isError ? 'text-destructive' : 'text-success'
            }`}
          >
            {remainingSeconds}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-semibold">{toast.title}</p>
          <p className="text-muted-foreground mt-0.5 text-xs leading-5">
            {toast.description}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {toast.href && (
              <Button
                size="sm"
                variant={isError ? 'destructive' : 'success'}
                nativeButton={false}
                render={<Link href={toast.href} />}
              >
                {toast.actionLabel}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeToast(toast.id)}
            >
              <HugeiconsIcon icon={Cancel01Icon} />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col gap-2 sm:left-auto sm:w-96"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
