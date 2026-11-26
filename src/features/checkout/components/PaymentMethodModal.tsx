'use client';

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from 'cn';

import type { PaymentMethodId } from '../types';

export type { PaymentMethodId } from '../types';

export type PaymentMethodOption = {
  id: PaymentMethodId;
  name: string;
  description: string;
  badge?: string;
};

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'MOMO',
    name: 'MoMo Sandbox',
    description: 'Pay online via MoMo e-wallet or QR code',
    badge: 'Instant',
  },
  {
    id: 'PAYOS',
    name: 'PayOS VietQR',
    description: 'Bank transfer via VietQR with instant verification',
    badge: 'VietQR',
  },
  {
    id: 'COD',
    name: 'Cash on Delivery (COD)',
    description: 'Pay in cash when GHN delivers your parcel',
  },
];

export function getPaymentMethodLabel(method: PaymentMethodId): string {
  const found = PAYMENT_METHODS.find((item) => item.id === method);
  return found?.name ?? 'MoMo Sandbox';
}

export type PaymentMethodModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMethod: PaymentMethodId;
  onSelectMethod: (method: PaymentMethodId) => void;
};

export function PaymentMethodModal({
  open,
  onOpenChange,
  selectedMethod,
  onSelectMethod,
}: PaymentMethodModalProps) {
  const [tempMethod, setTempMethod] = useState<PaymentMethodId>(selectedMethod);

  const handleClose = () => {
    setTempMethod(selectedMethod);
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setTempMethod(selectedMethod);
    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    onSelectMethod(tempMethod);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="border-rewear-border bg-rewear-surface max-w-[520px] space-y-6 rounded-none border p-6 sm:p-8"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="text-rewear-muted hover:text-rewear-text min-h-11 cursor-pointer text-sm font-semibold"
          >
            Close ×
          </button>
        </div>

        <DialogHeader className="gap-1">
          <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Payment method
          </DialogTitle>
          <DialogDescription className="text-rewear-muted text-sm">
            Choose how you want to pay for this checkout.
          </DialogDescription>
        </DialogHeader>

        <div
          className="space-y-3"
          role="radiogroup"
          aria-label="Payment method"
        >
          {PAYMENT_METHODS.map((method) => {
            const isSelected = method.id === tempMethod;
            return (
              <button
                key={method.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setTempMethod(method.id)}
                className={cn(
                  'flex min-h-[64px] w-full cursor-pointer items-center justify-between gap-3 border p-4 text-left transition-colors',
                  isSelected
                    ? 'border-rewear-text bg-rewear-soft/70 ring-rewear-text ring-1'
                    : 'border-rewear-border bg-rewear-surface hover:border-rewear-text/60',
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border',
                      isSelected
                        ? 'border-rewear-text bg-rewear-text'
                        : 'border-rewear-muted bg-transparent',
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <span className="bg-rewear-accent size-2 rounded-full" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-rewear-text text-base font-semibold">
                      {method.name}
                    </p>
                    <p className="text-rewear-muted text-xs">
                      {method.description}
                    </p>
                  </div>
                </div>

                {method.badge && (
                  <span className="border-rewear-border bg-rewear-surface text-rewear-muted shrink-0 border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase">
                    {method.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="bg-rewear-accent text-rewear-text flex h-12 w-full cursor-pointer items-center justify-center text-sm font-semibold transition-opacity hover:opacity-90"
        >
          Use selected method
        </button>
      </DialogContent>
    </Dialog>
  );
}
