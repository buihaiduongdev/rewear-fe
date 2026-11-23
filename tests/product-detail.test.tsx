import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  ProductHowToMeasureModal
} from '@/features/product-detail/components/ProductModals';
import type { ProductControllerFindOne200Data } from '@/shared/api/models';

const mockProduct: ProductControllerFindOne200Data = {
  id: 'prod-lemaire-1',
  shopId: 'shop-hanoi-1',
  categoryId: 'cat-outerwear-1',
  title: 'Relaxed double-breasted wool coat',
  description: 'Charcoal heather, 100% virgin wool. Relaxed cut, fully lined.',
  condition: 'EXCELLENT',
  size: 'FR 48 / M',
  color: 'Charcoal',
  brand: 'Lemaire',
  price: 580000,
  measurements: {
    chest: 104,
    length: 112,
    sleeve: 64,
  },
  repairs: 'Reinforced extra horn button',
  defects: [{ description: 'Faint scuff on inner bottom hem lining', mediaIds: [] }],
  shippingPackage: {
    weightGrams: 850,
    lengthCm: 40,
    widthCm: 30,
    heightCm: 15,
  },
  status: 'ACTIVE',
  mediaCount: 3,
  coverUrl: null,
  publishedAt: null,
  heldUntil: null,
  soldAt: null,
  createdAt: '2026-11-22T00:00:00.000Z',
  updatedAt: '2026-11-22T00:00:00.000Z',
  category: { id: 'cat-outerwear-1', name: 'Outerwear', slug: 'outerwear' },
  shop: { id: 'shop-hanoi-1', name: 'Hanoi Archive' },
};

describe('ProductModals', () => {
  it('renders ProductHowToMeasureModal with custom measurements guide in English', () => {
    const handleClose = vi.fn();
    render(<ProductHowToMeasureModal isOpen={true} onClose={handleClose} product={mockProduct} />);

    expect(screen.getByText('How to measure')).toBeDefined();
    expect(screen.getByText('Chest')).toBeDefined();
    expect(screen.getByText('Length')).toBeDefined();
    expect(screen.getByText('Sleeve')).toBeDefined();
    expect(screen.queryByText('Waist')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(handleClose).toHaveBeenCalledOnce();
  });

});
