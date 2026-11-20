'use client';

import { useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from 'cn';

export type PaymentMethodId = 'MOMO' | 'VNPAY' | 'ZALOPAY' | 'CARD';

export type PaymentMethodOption = {
  id: PaymentMethodId;
  name: string;
  category: string;
  available: boolean;
  statusText?: string;
};

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'MOMO',
    name: 'MoMo',
    category: 'Wallet',
    available: true,
  },
  {
    id: 'VNPAY',
    name: 'VNPAY',
    category: 'Bank app / QR code',
    available: false,
    statusText: 'Unavailable',
  },
  {
    id: 'ZALOPAY',
    name: 'ZaloPay',
    category: 'Wallet',
    available: false,
    statusText: 'Unavailable',
  },
  {
    id: 'CARD',
    name: 'Bank card',
    category: 'Domestic / Visa / Mastercard',
    available: false,
    statusText: 'Unavailable',
  },
];

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

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTempMethod(selectedMethod);
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    onSelectMethod(tempMethod);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[480px] space-y-6 p-6">
        <DialogHeader>
          <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Payment method
          </DialogTitle>
          <DialogDescription className="sr-only">
            Payment method selection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = method.id === tempMethod;
            return (
              <div
                key={method.id}
                role={method.available ? 'button' : undefined}
                tabIndex={method.available ? 0 : -1}
                aria-disabled={!method.available}
                onClick={() => {
                  if (method.available) {
                    setTempMethod(method.id);
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    method.available &&
                    (e.key === 'Enter' || e.key === ' ')
                  ) {
                    setTempMethod(method.id);
                  }
                }}
                className={cn(
                  'flex items-center justify-between gap-3 border p-4 text-left transition-all',
                  method.available
                    ? 'cursor-pointer'
                    : 'bg-rewear-soft/30 cursor-not-allowed opacity-50',
                  isSelected && method.available
                    ? 'border-rewear-text bg-rewear-soft/50 ring-rewear-text ring-1'
                    : method.available
                      ? 'border-rewear-border/40 hover:border-rewear-border bg-rewear-surface'
                      : 'border-rewear-border/20',
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'text-lg font-bold',
                      isSelected ? 'text-rewear-text' : 'text-rewear-muted',
                    )}
                    aria-hidden="true"
                  >
                    {isSelected ? '◉' : '○'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-rewear-text text-base font-semibold">
                      {method.name}
                    </p>
                    <p className="text-rewear-muted truncate text-xs">
                      {method.category}
                    </p>
                  </div>
                </div>

                {!method.available && method.statusText && (
                  <Badge
                    variant="outline"
                    className="h-5 shrink-0 border-amber-200 bg-amber-50 px-1.5 text-[11px] text-amber-700"
                  >
                    {method.statusText}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-rewear-accent text-rewear-text flex h-12 w-full cursor-pointer items-center justify-center text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Use this payment method
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
