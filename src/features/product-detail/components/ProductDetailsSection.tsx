import Link from 'next/link';

import type { ProductControllerFindOne200Data } from '@/shared/api/models';

import { ProductConditionDetails } from './ProductConditionDetails';

type Props = {
  product: ProductControllerFindOne200Data;
  media: { id: string; url: string }[];
  onHowToMeasure: () => void;
};

export function ProductDetailsSection({
  product,
  media: mediaList,
  onHowToMeasure,
}: Props) {
  const measurements = product.measurements || {};
  const hasMeasurements = Object.values(measurements).some(Boolean);
  const defects = product.defects || [];
  const shopLogo = (product.shop as { logoUrl?: string | null } | undefined)
    ?.logoUrl;
  const shopInitials = (product.shop?.name || 'S')
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <>
      {/* Product description and measurements */}
      <div className="bg-rewear-soft grid gap-10 p-6 sm:p-10 md:grid-cols-2 md:gap-16">
        <section aria-label="Seller" className="md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="text-rewear-text flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-base font-semibold">
              {shopLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shopLogo} alt="" className="size-full object-cover" />
              ) : (
                shopInitials
              )}
            </div>
            <h3 className="text-rewear-text min-w-0 text-xl leading-snug font-semibold break-words">
              {product.shopId ? (
                <Link
                  href={`/shops/${encodeURIComponent(product.shopId)}`}
                  className="decoration-rewear-muted hover:decoration-rewear-text underline underline-offset-4"
                >
                  {product.shop?.name || 'Seller'}{' '}
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                product.shop?.name || 'Seller'
              )}
            </h3>
          </div>
        </section>
        <section className="space-y-5">
          <h2 className="text-rewear-text text-[28px] leading-[34px] font-semibold tracking-tight">
            About this piece
          </h2>
          <p className="text-rewear-text text-base leading-relaxed whitespace-pre-line">
            {product.description ||
              'No detailed description provided by the seller.'}
          </p>
        </section>
        <section className="min-w-0 space-y-6">
          <h2 className="text-rewear-text text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Find your fit.
          </h2>

          {hasMeasurements ? (
            <div className="space-y-3">
              {measurements.chest ? (
                <div className="flex items-center justify-between text-base">
                  <span className="text-rewear-muted">Chest</span>
                  <span className="text-rewear-text text-sm font-semibold">
                    {measurements.chest} cm
                  </span>
                </div>
              ) : null}
              {measurements.length ? (
                <div className="flex items-center justify-between text-base">
                  <span className="text-rewear-muted">Length</span>
                  <span className="text-rewear-text text-sm font-semibold">
                    {measurements.length} cm
                  </span>
                </div>
              ) : null}
              {measurements.sleeve ? (
                <div className="flex items-center justify-between text-base">
                  <span className="text-rewear-muted">Sleeve</span>
                  <span className="text-rewear-text text-sm font-semibold">
                    {measurements.sleeve} cm
                  </span>
                </div>
              ) : null}
              {measurements.waist ? (
                <div className="flex items-center justify-between text-base">
                  <span className="text-rewear-muted">Waist</span>
                  <span className="text-rewear-text text-sm font-semibold">
                    {measurements.waist} cm
                  </span>
                </div>
              ) : null}
              {measurements.hip ? (
                <div className="flex items-center justify-between text-base">
                  <span className="text-rewear-muted">Hip</span>
                  <span className="text-rewear-text text-sm font-semibold">
                    {measurements.hip} cm
                  </span>
                </div>
              ) : null}
              {measurements.shoulder ? (
                <div className="flex items-center justify-between text-base">
                  <span className="text-rewear-muted">Shoulder</span>
                  <span className="text-rewear-text text-sm font-semibold">
                    {measurements.shoulder} cm
                  </span>
                </div>
              ) : null}
              {measurements.inseam ? (
                <div className="flex items-center justify-between text-base">
                  <span className="text-rewear-muted">Inseam</span>
                  <span className="text-rewear-text text-sm font-semibold">
                    {measurements.inseam} cm
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-rewear-muted text-base">
              No measurements provided by the seller.
            </p>
          )}

          {hasMeasurements && (
            <div>
              <button
                type="button"
                onClick={() => onHowToMeasure()}
                className="text-rewear-text cursor-pointer text-sm font-semibold hover:underline"
              >
                How to measure ›
              </button>
            </div>
          )}
        </section>
        <ProductConditionDetails
          repairs={product.repairs}
          defects={defects}
          media={mediaList}
        />
      </div>
    </>
  );
}
