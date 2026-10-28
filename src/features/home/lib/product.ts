import type { ProductControllerFindAll200DataItemsItem } from '@/shared/api/models';

export type HomeProduct = ProductControllerFindAll200DataItemsItem;

export const PRODUCT_CONDITION_LABELS: Record<
  NonNullable<HomeProduct['condition']>,
  string
> = {
  PRISTINE: 'Like new',
  EXCELLENT: 'Very good',
  GOOD: 'Good',
  FAIR: 'Fair',
};

export const formatCondition = (condition: HomeProduct['condition']) =>
  condition ? PRODUCT_CONDITION_LABELS[condition] : null;

export const formatPrice = (price: number | null) =>
  price === null
    ? 'Price unavailable'
    : new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(price);
