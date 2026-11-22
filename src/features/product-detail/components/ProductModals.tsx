'use client';

import { X, Ruler, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import type {
  ProductControllerFindOne200Data,
  ProductControllerFindOne200DataDefectsItem
} from '@/shared/api/models';
import { formatCondition } from '@/shared/utils/product';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FullDetailsModalProps extends ModalProps {
  product: ProductControllerFindOne200Data;
}

export function ProductFullDetailsModal({ isOpen, onClose, product }: FullDetailsModalProps) {
  if (!isOpen) return null;

  const measurements = product.measurements || {};
  const measurementEntries: [string, number][] = Object.entries(measurements).filter(
    (entry): entry is [string, number] => typeof entry[1] === 'number',
  );
  const defects = product.defects || [];
  const shippingPkg = product.shippingPackage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content (Figma 71:2159) */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden border border-rewear-border bg-white p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-rewear-border pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-rewear-muted">
              {product.brand || 'Item details'}
            </span>
            <h2 className="text-xl font-bold tracking-tight text-rewear-text">
              {product.title || 'Full details'}
            </h2>
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

        <div className="mt-6 max-h-[70vh] space-y-6 overflow-y-auto pr-1 text-sm">
          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="font-semibold text-rewear-text">Description</h3>
            <p className="leading-relaxed text-rewear-text/80 whitespace-pre-line">
              {product.description || 'No detailed description provided by the seller.'}
            </p>
          </div>

          {/* Condition */}
          <div className="space-y-1.5 border-t border-rewear-border pt-4">
            <h3 className="font-semibold text-rewear-text">Condition</h3>
            <p className="text-rewear-text/80">
              <strong className="text-rewear-text">{formatCondition(product.condition)}</strong>
              {product.repairs ? ` · Disclosed repairs: ${product.repairs}` : ''}
            </p>
            {defects.length > 0 && (
              <div className="mt-2 rounded bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
                <span className="font-semibold block mb-1">Disclosed defects:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {defects.map((d: ProductControllerFindOne200DataDefectsItem, i: number) => (
                    <li key={`defect-${i}`}>{d.description}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Size & Measurements */}
          <div className="space-y-2 border-t border-rewear-border pt-4">
            <h3 className="font-semibold text-rewear-text">Size & measurements</h3>
            <p className="text-rewear-text/80">
              Tag size: <strong className="text-rewear-text">{product.size || 'One size'}</strong>
            </p>
            {measurementEntries.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                {measurementEntries.map(([key, val]) => {
                  const labels: Record<string, string> = {
                    chest: 'Chest',
                    waist: 'Waist',
                    hip: 'Hip',
                    length: 'Length',
                    shoulder: 'Shoulder',
                    sleeve: 'Sleeve',
                    inseam: 'Inseam',
                  };
                  return (
                    <div key={key} className="border border-rewear-border bg-rewear-soft/40 p-2">
                      <span className="text-rewear-muted block">{labels[key] || key}</span>
                      <span className="font-semibold text-rewear-text">{val} cm</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-rewear-muted">No custom flat measurements recorded by seller.</p>
            )}
          </div>

          {/* Shipping Package */}
          {shippingPkg && (
            <div className="space-y-1.5 border-t border-rewear-border pt-4 text-xs text-rewear-muted">
              <h3 className="font-semibold text-rewear-text text-sm">Package specifications</h3>
              <p>
                Weight: {shippingPkg.weightGrams}g · Parcel dimensions: {shippingPkg.lengthCm} ×{' '}
                {shippingPkg.widthCm} × {shippingPkg.heightCm} cm
              </p>
            </div>
          )}
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
