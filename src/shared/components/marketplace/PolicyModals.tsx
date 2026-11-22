'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

export type PolicyModalType = 'help' | 'returns' | 'privacy' | null;

type Props = {
  openType: PolicyModalType;
  onClose: () => void;
};

export function PolicyModals({ openType, onClose }: Props) {
  const isOpen = openType !== null;
  const isPrivacy = openType === 'privacy';

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="border-rewear-border bg-rewear-surface max-w-[520px] rounded-none border p-8 shadow-2xl sm:max-w-[520px]"
      >
        <div className="flex items-center justify-between pb-2">
          <button
            type="button"
            onClick={onClose}
            className="text-rewear-muted hover:text-rewear-text cursor-pointer text-sm font-semibold transition"
          >
            Close ×
          </button>
        </div>

        {isPrivacy ? (
          /* Privacy Policy Modal */
          <div className="space-y-6">
            <DialogHeader className="gap-2">
              <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
                Privacy policy
              </DialogTitle>
              <DialogDescription className="text-rewear-text text-base leading-6">
                How RE.WEAR protects your personal data and marketplace
                transactions.
              </DialogDescription>
            </DialogHeader>

            {/* Escrow & Payment Protection Box */}
            <div className="bg-rewear-soft space-y-2 p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Secure payment</span>
                <span className="text-rewear-muted">Escrow protected</span>
              </div>
              <p className="text-rewear-muted text-sm leading-5">
                Funds unlock 72 hours after delivery, covered by RE.WEAR Buyer &
                Seller Escrow Protection.
              </p>
            </div>

            {/* Shipping & Delivery Privacy Disclosures */}
            <div className="space-y-4 text-base leading-6">
              <span className="text-rewear-text block text-sm font-semibold">
                Data &amp; shipping disclosures ›
              </span>
              <p className="text-rewear-muted">
                Your dispatch and delivery address is securely passed to
                logistics partners strictly for order
                fulfillment.
              </p>
              <p className="text-rewear-muted">
                Personal contact details and account credentials stay protected
                and are never sold to external third-party advertisers.
              </p>
            </div>
          </div>
        ) : (
          /* Figma 48:114 / 67:419: Buying secondhand & Returns Modal */
          <div className="space-y-6">
            <DialogHeader className="gap-2">
              <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
                Buying secondhand
              </DialogTitle>
              <DialogDescription className="text-rewear-text text-base leading-6">
                Check the photos, measurements and disclosed flaws before
                buying.
              </DialogDescription>
            </DialogHeader>

            {/* Figma 48:118 - Report an issue Box */}
            <div className="bg-rewear-soft space-y-2 p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Report an issue</span>
                <span className="text-rewear-muted">Within 72h of delivery</span>
              </div>
              <p className="text-rewear-muted text-sm leading-5">
                Confirming receipt does not shorten this window.
              </p>
            </div>

            {/* Figma 48:122 - Returns & refunds Disclosure */}
            <div className="space-y-4 text-base leading-6">
              <span className="text-rewear-text block text-sm font-semibold">
                Returns &amp; refunds ›
              </span>
              <p className="text-rewear-muted">
                Approved returns are refunded after the return is verified.
              </p>
              <p className="text-rewear-muted">
                Partial returns cover approved items. Shipping refunds require
                review. Buyer-caused damage and disclosed flaws are not
                seller-fault refunds.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
