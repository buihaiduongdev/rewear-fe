'use client';

import { useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';

export function ConfirmReceiptDialog({
  confirmReceipt,
  pending,
  error,
}: {
  confirmReceipt: () => Promise<unknown>;
  pending: boolean;
  error: unknown;
}) {
  const [open, setOpen] = useState(false);
  const confirm = async () => {
    try {
      await confirmReceipt();
      setOpen(false);
    } catch {
      // The mutation exposes the error to the dialog.
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-rewear-accent min-h-12 w-full px-4 text-sm font-semibold"
      >
        Confirm receipt
      </button>
      <DialogContent className="space-y-4">
        <DialogTitle>Confirm you received your order?</DialogTitle>
        <DialogDescription>
          Please check your items before confirming receipt.
        </DialogDescription>
        {Boolean(error) && (
          <p role="alert" className="text-sm text-red-700">
            {getApiErrorMessage(error)}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={pending}
            className="min-h-11 px-4"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={pending}
            className="bg-rewear-accent min-h-11 px-5 font-semibold disabled:opacity-50"
          >
            {pending ? 'Confirming…' : 'Confirm receipt'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
