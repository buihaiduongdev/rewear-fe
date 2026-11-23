'use client';

import type { ProductControllerFindOne200Data } from '@/shared/api/models';
import { Ruler, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HowToMeasureModalProps extends ModalProps {
  product?: ProductControllerFindOne200Data;
}

export function ProductHowToMeasureModal({
  isOpen,
  onClose,
  product,
}: HowToMeasureModalProps) {
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
      <div className="border-rewear-border animate-in fade-in zoom-in-95 relative z-10 w-full max-w-lg overflow-hidden border bg-white p-6 shadow-2xl duration-150 sm:p-8">
        <div className="border-rewear-border flex items-start justify-between border-b pb-4">
          <div>
            <div className="text-rewear-muted flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
              <Ruler size={14} />
              <span>Measurement guide</span>
            </div>
            <h2 className="text-rewear-text text-xl font-bold tracking-tight">
              How to measure
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-rewear-muted hover:bg-rewear-soft hover:text-rewear-text cursor-pointer rounded p-1 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-rewear-muted mt-4 text-xs">
          Use a garment that fits you well and lay it flat on a table to measure
          with a tape.
        </p>

        <div className="mt-5 max-h-[60vh] space-y-4 overflow-y-auto pr-1 text-xs">
          {(
            [
              ['chest', 'Chest', 'Measure across the chest, under the arms.'],
              [
                'length',
                'Length',
                'Measure from the top of the garment to the hem.',
              ],
              [
                'sleeve',
                'Sleeve',
                'Measure from the shoulder seam to the cuff.',
              ],
              ['waist', 'Waist', 'Measure across the waistband.'],
              ['hip', 'Hip', 'Measure across the widest part of the hip.'],
              ['shoulder', 'Shoulder', 'Measure between the shoulder seams.'],
              ['inseam', 'Inseam', 'Measure from the crotch seam to the hem.'],
            ] as const
          )
            .filter(([key]) => m[key] != null)
            .map(([key, label, instruction]) => (
              <div
                key={key}
                className="border-rewear-border space-y-1 border p-3.5"
              >
                <h4 className="text-rewear-text text-sm font-bold">{label}</h4>
                <p className="text-rewear-muted">{instruction}</p>
              </div>
            ))}
        </div>

        <div className="border-rewear-border mt-6 flex justify-end border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-rewear-text hover:bg-rewear-text/90 cursor-pointer px-5 py-2 text-sm font-semibold text-white transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
