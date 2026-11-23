import type { ProductControllerFindOne200DataDefectsItem } from '@/shared/api/models';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';

type ProductConditionDetailsProps = {
  repairs: string | null;
  defects: ProductControllerFindOne200DataDefectsItem[];
  media: { id: string; url: string }[];
};

export function ProductConditionDetails({
  repairs,
  defects,
  media,
}: ProductConditionDetailsProps) {
  if (!repairs && defects.length === 0) return null;

  return (
    <section aria-label="Condition details" className="space-y-8 md:col-span-2">
      <h2 className="text-rewear-text text-[28px] leading-[34px] font-semibold tracking-tight">
        Condition details
      </h2>
      {repairs && (
        <div className="space-y-2">
          <h3 className="text-rewear-text text-base font-semibold">
            Repairs & alterations
          </h3>
          <p className="text-rewear-text text-base leading-relaxed whitespace-pre-line">
            {repairs}
          </p>
        </div>
      )}
      {defects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-rewear-text text-base font-semibold">
            Disclosed flaws
          </h3>
          <ul className="space-y-6">
            {defects.map((defect, index) => {
              const photos = defect.mediaIds.flatMap((id) => {
                const photo = media.find((item) => item.id === id);
                return photo ? [photo] : [];
              });
              return (
                <li
                  key={`${index}-${defect.description}`}
                  className="space-y-3"
                >
                  <p className="text-rewear-text text-base leading-relaxed whitespace-pre-line">
                    {defect.description}
                  </p>
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative size-24 overflow-hidden bg-white"
                        >
                          <ProductPhoto
                            url={photo.url}
                            title={`Photo of flaw: ${defect.description}`}
                            sizes="96px"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
