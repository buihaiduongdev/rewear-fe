'use client';

import { X, Ruler, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import type { ProductControllerFindOne200Data } from '@/shared/api/models';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HowToMeasureModalProps extends ModalProps {
  product?: ProductControllerFindOne200Data;
}

export function ProductHowToMeasureModal({ isOpen, onClose, product }: HowToMeasureModalProps) {
  if (!isOpen) return null;

  const m = product?.measurements || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content (Figma 71:2190) */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden border border-rewear-border bg-white p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-rewear-border pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rewear-muted">
              <Ruler size={14} />
              <span>Measurement guide</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-rewear-text">How to measure</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-rewear-muted transition-colors hover:bg-rewear-soft hover:text-rewear-text cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-4 text-xs text-rewear-muted">
          Use a garment that fits you well and lay it flat on a table to measure with a tape.
        </p>

        <div className="mt-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs">
          <div className="border border-rewear-border p-3.5 space-y-1">
            <h4 className="font-bold text-sm text-rewear-text">Chest</h4>
            <p className="text-rewear-muted">
              Measure pit to pit flat across the garment, then double the width.
            </p>
            {m.chest && (
              <p className="text-rewear-text font-semibold pt-1">
                This piece: {m.chest / 2} cm flat / {m.chest} cm around.
              </p>
            )}
          </div>

          <div className="border border-rewear-border p-3.5 space-y-1">
            <h4 className="font-bold text-sm text-rewear-text">Length</h4>
            <p className="text-rewear-muted">
              Measure straight down from the back collar base to the bottom hem.
            </p>
            {m.length && (
              <p className="text-rewear-text font-semibold pt-1">
                This piece: {m.length} cm.
              </p>
            )}
          </div>

          <div className="border border-rewear-border p-3.5 space-y-1">
            <h4 className="font-bold text-sm text-rewear-text">Sleeve</h4>
            <p className="text-rewear-muted">
              Measure from the shoulder seam along the outer arm to the cuff edge.
            </p>
            {m.sleeve && (
              <p className="text-rewear-text font-semibold pt-1">
                This piece: {m.sleeve} cm.
              </p>
            )}
          </div>

          <div className="border border-rewear-border p-3.5 space-y-1">
            <h4 className="font-bold text-sm text-rewear-text">Waist & Inseam</h4>
            <p className="text-rewear-muted">
              Measure straight across waistband doubled for waist; crotch seam down to cuff for inseam.
            </p>
            {(m.waist || m.inseam) && (
              <p className="text-rewear-text font-semibold pt-1">
                {m.waist ? `Waist: ${m.waist} cm · ` : ''}
                {m.inseam ? `Inseam: ${m.inseam} cm` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-rewear-border pt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-rewear-text text-white px-5 py-2 text-sm font-semibold hover:bg-rewear-text/90 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductDeliveryPolicyModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden border border-rewear-border bg-white p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-rewear-border pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rewear-muted">
              <ShieldCheck size={14} className="text-green-600" />
              <span>RE.WEAR Protection</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-rewear-text">Delivery & 72-hour return policy</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-rewear-muted transition-colors hover:bg-rewear-soft hover:text-rewear-text cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-xs text-rewear-text/90 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="border border-rewear-border p-3.5 space-y-1 bg-rewear-soft/30">
            <div className="flex items-center gap-1.5 font-bold text-sm text-rewear-text">
              <Truck size={16} />
              <span>Shipping via Giao Hàng Nhanh (GHN)</span>
            </div>
            <p className="text-rewear-muted">
              Shipping rates are calculated dynamically at checkout based on genuine carrier rates between seller and buyer locations.
            </p>
          </div>

          <div className="border border-rewear-border p-3.5 space-y-1 bg-rewear-soft/30">
            <div className="flex items-center gap-1.5 font-bold text-sm text-rewear-text">
              <PackageCheck size={16} />
              <span>72-hour buyer inspection window</span>
            </div>
            <p className="text-rewear-muted">
              Upon confirmed carrier delivery, buyers have 72 hours to inspect the piece for fit and condition consistency with seller photos and notes.
            </p>
          </div>

          <div className="border border-rewear-border p-3.5 space-y-1 bg-rewear-soft/30">
            <div className="flex items-center gap-1.5 font-bold text-sm text-rewear-text">
              <ShieldCheck size={16} />
              <span>Escrow buyer payment protection</span>
            </div>
            <p className="text-rewear-muted">
              Funds remain secured in platform escrow until the inspection window closes. Verified undisclosed defects are eligible for full dispute return and refund.
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-rewear-border pt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-rewear-text text-white px-5 py-2 text-sm font-semibold hover:bg-rewear-text/90 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
