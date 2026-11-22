import type { ProductControllerUpdateBody } from '@/shared/api/models';

export const listingMeasurementFields = [
  'chest',
  'waist',
  'hip',
  'length',
  'shoulder',
  'sleeve',
  'inseam',
] as const;

export function getListingBody(
  form: HTMLFormElement,
): ProductControllerUpdateBody {
  const data = new FormData(form);
  const text = (key: string) => String(data.get(key) ?? '').trim();
  const number = (key: string) => (text(key) ? Number(text(key)) : null);
  const measurements = Object.fromEntries(
    listingMeasurementFields.flatMap((field) =>
      number(field) === null ? [] : [[field, number(field)]],
    ),
  );
  const dimensions = [
    'weightGrams',
    'lengthCm',
    'widthCm',
    'heightCm',
  ] as const;
  const supplied = dimensions.filter((field) => number(field) !== null);
  if (supplied.length && supplied.length !== dimensions.length)
    throw new Error('Enter all package dimensions and weight.');
  return {
    title: text('title') || null,
    description: text('description') || null,
    categoryId: text('categoryId') || null,
    condition: (text('condition') ||
      null) as ProductControllerUpdateBody['condition'],
    size: text('size') || null,
    brand: text('brand') || null,
    color: text('color') || null,
    price: number('price'),
    measurements,
    ...(supplied.length
      ? {
          shippingPackage: {
            weightGrams: number('weightGrams')!,
            lengthCm: number('lengthCm')!,
            widthCm: number('widthCm')!,
            heightCm: number('heightCm')!,
          },
        }
      : {}),
    repairs: text('repairs') || null,
  };
}
