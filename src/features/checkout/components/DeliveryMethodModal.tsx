'use client';

import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { formatPrice } from '@/shared/utils/product';

export type DeliveryMethodModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopName: string;
  fee: number | null;
  estimatedDateText: string;
};

export function DeliveryMethodModal({
  open,
  onOpenChange,
  shopName,
  fee,
  estimatedDateText,
}: DeliveryMethodModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] space-y-6 p-6">
        <DialogHeader>
          <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Delivery method · {shopName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Select a shipping carrier for {shopName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Active GHN Standard */}
          <div className="border-rewear-text bg-rewear-soft/50 ring-rewear-text flex flex-col gap-2 border p-4 text-left ring-1 transition-all">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="text-rewear-text text-lg font-bold"
                  aria-hidden="true"
                >
                  ◉
                </span>
                <div>
                  <p className="text-rewear-text text-base font-semibold">
                    GHN Standard
                  </p>
                </div>
              </div>
              <span className="text-rewear-text text-base font-semibold">
                {fee !== null ? formatPrice(fee) : '—'}
              </span>
            </div>
            <p className="text-rewear-muted pl-7 text-xs">
              Estimated arrival: {estimatedDateText}
            </p>
          </div>

          {/* GHTK Fast (Unavailable) */}
          <div className="border-rewear-border/20 bg-rewear-soft/20 flex cursor-not-allowed items-center justify-between gap-3 border p-4 text-left opacity-50 transition-all">
            <div className="flex items-center gap-3">
              <span
                className="text-rewear-muted text-lg font-bold"
                aria-hidden="true"
              >
                ○
              </span>
              <div>
                <p className="text-rewear-text text-base font-semibold">
                  GHTK Fast
                </p>
                <p className="text-rewear-muted text-xs">Express delivery</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="h-5 shrink-0 border-amber-200 bg-amber-50 px-1.5 text-[11px] text-amber-700"
            >
              Unavailable
            </Badge>
          </div>

          {/* Viettel Post (Unavailable) */}
          <div className="border-rewear-border/20 bg-rewear-soft/20 flex cursor-not-allowed items-center justify-between gap-3 border p-4 text-left opacity-50 transition-all">
            <div className="flex items-center gap-3">
              <span
                className="text-rewear-muted text-lg font-bold"
                aria-hidden="true"
              >
                ○
              </span>
              <div>
                <p className="text-rewear-text text-base font-semibold">
                  Viettel Post
                </p>
                <p className="text-rewear-muted text-xs">Standard parcel</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="h-5 shrink-0 border-amber-200 bg-amber-50 px-1.5 text-[11px] text-amber-700"
            >
              Unavailable
            </Badge>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-rewear-accent text-rewear-text flex h-12 w-full cursor-pointer items-center justify-center text-sm font-semibold transition-opacity hover:opacity-90"
          >
            Use this delivery method
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
