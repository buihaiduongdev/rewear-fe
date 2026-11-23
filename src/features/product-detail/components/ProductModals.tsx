'use client';

import { X, Ruler } from 'lucide-react';
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

        <div className="mt-5 max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-xs">
          {([
            ['chest', 'Chest', 'Measure across the chest, under the arms.'],
            ['length', 'Length', 'Measure from the top of the garment to the hem.'],
            ['sleeve', 'Sleeve', 'Measure from the shoulder seam to the cuff.'],
            ['waist', 'Waist', 'Measure across the waistband.'],
            ['hip', 'Hip', 'Measure across the widest part of the hip.'],
            ['shoulder', 'Shoulder', 'Measure between the shoulder seams.'],
            ['inseam', 'Inseam', 'Measure from the crotch seam to the hem.'],
          ] as const).filter(([key]) => m[key] != null).map(([key, label, instruction]) => (
            <div key={key} className="border border-rewear-border p-3.5 space-y-1">
              <h4 className="font-bold text-sm text-rewear-text">{label}</h4>
              <p className="text-rewear-muted">{instruction}</p>
            </div>
          ))}
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
