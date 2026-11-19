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
      <DialogContent className="max-w-[480px] p-6 space-y-6">
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
          <div className="border border-rewear-text bg-rewear-soft/50 ring-1 ring-rewear-text p-4 text-left transition-all flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-rewear-text" aria-hidden="true">
                  ◉
                </span>
                <div>
                  <p className="text-base font-semibold text-rewear-text">
                    GHN Standard
                  </p>
                </div>
              </div>
              <span className="text-base font-semibold text-rewear-text">
                {fee !== null ? formatPrice(fee) : '—'}
              </span>
            </div>
            <p className="text-xs text-rewear-muted pl-7">
              Estimated arrival: {estimatedDateText}
            </p>
          </div>

          {/* GHTK Fast (Unavailable) */}
          <div className="border border-rewear-border/20 p-4 text-left transition-all flex items-center justify-between gap-3 opacity-50 cursor-not-allowed bg-rewear-soft/20">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-rewear-muted" aria-hidden="true">
                ○
              </span>
              <div>
                <p className="text-base font-semibold text-rewear-text">
                  GHTK Fast
                </p>
                <p className="text-xs text-rewear-muted">Express delivery</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-[11px] px-1.5 h-5 shrink-0 text-amber-700 bg-amber-50 border-amber-200"
            >
              Unavailable
            </Badge>
          </div>

          {/* Viettel Post (Unavailable) */}
          <div className="border border-rewear-border/20 p-4 text-left transition-all flex items-center justify-between gap-3 opacity-50 cursor-not-allowed bg-rewear-soft/20">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-rewear-muted" aria-hidden="true">
                ○
              </span>
              <div>
                <p className="text-base font-semibold text-rewear-text">
                  Viettel Post
                </p>
                <p className="text-xs text-rewear-muted">Standard parcel</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-[11px] px-1.5 h-5 shrink-0 text-amber-700 bg-amber-50 border-amber-200"
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
