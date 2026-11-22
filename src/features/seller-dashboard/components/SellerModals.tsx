'use client';

import { Dialog, DialogContent } from '@/shared/components/ui/dialog';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Figma 48:242 — Listing checklist
 */
export function ListingChecklistModal({ open, onOpenChange }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-rewear-surface text-rewear-text border-rewear-border max-w-[520px] rounded-none border p-8 shadow-xl outline-none"
      >
        <div className="flex flex-col space-y-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-rewear-text hover:text-rewear-muted self-start text-sm font-semibold transition"
          >
            Close ×
          </button>

          <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Listing checklist
          </h2>

          <div className="space-y-4 text-base leading-6">
            <p className="text-rewear-text">Add front, back and label photos.</p>
            <p className="text-rewear-text">Show every defect in a close-up.</p>
            <p className="text-rewear-text">Include size, measurements and repairs.</p>
            <p className="text-rewear-text">Submit for content review before publishing.</p>
            <p className="text-rewear-muted">Held items cannot be edited or hidden.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Figma 56:2067 — Seller / Draft saved
 */
export function DraftSavedModal({ open, onOpenChange }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-rewear-surface text-rewear-text border-rewear-border max-w-[440px] rounded-none border p-6 shadow-xl outline-none"
      >
        <div className="flex flex-col space-y-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-rewear-text hover:text-rewear-muted self-start text-sm font-semibold transition"
          >
            Close ×
          </button>

          <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Draft saved
          </h2>

          <p className="text-rewear-text text-base leading-6">
            Your listing stays private.
            <br />
            Continue editing from Products.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Figma 56:2060 — Seller / Listing submitted
 */
export function SubmittedForReviewModal({
  open,
  onOpenChange,
  onViewProducts,
}: ModalProps & { onViewProducts?: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-rewear-surface text-rewear-text border-rewear-border max-w-[440px] rounded-none border p-6 shadow-xl outline-none"
      >
        <div className="flex flex-col space-y-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-rewear-text hover:text-rewear-muted self-start text-sm font-semibold transition"
          >
            Close ×
          </button>

          <div className="space-y-3">
            <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
              Submitted for review
            </h2>

            <p className="text-rewear-text text-base leading-6">
              Your listing appears in Products.
              <br />
              It becomes visible after approval.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onViewProducts?.();
            }}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex h-12 w-full items-center justify-center text-sm font-semibold transition"
          >
            View products
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
