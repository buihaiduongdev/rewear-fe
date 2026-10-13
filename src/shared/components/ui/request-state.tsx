'use client';

import { useEffect } from 'react';

import { useToastStore } from '@/shared/stores/toast.store';
import { InboxIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export function ErrorNotice({ message }: { message: string }) {
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    addToast({
      type: 'error',
      durationMs: 4000,
      title: 'Request failed',
      description: message,
    });
  }, [addToast, message]);

  return null;
}

export function EmptyPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-6 py-10 text-center">
      <HugeiconsIcon
        icon={InboxIcon}
        size={24}
        className="text-muted-foreground"
      />
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 max-w-sm text-xs">
        {description}
      </p>
    </div>
  );
}

export function LoadingPanel({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-border divide-y" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex h-16 items-center gap-3 px-4">
          <div className="bg-muted size-8 animate-pulse rounded-md" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-3 w-1/3 animate-pulse rounded-sm" />
            <div className="bg-muted h-2.5 w-1/2 animate-pulse rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
