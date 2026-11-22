import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  ProductFullDetailsModal,
  ProductHowToMeasureModal,
  ProductDeliveryPolicyModal
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
  it('renders ProductFullDetailsModal with full details in English when open', () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <ProductFullDetailsModal isOpen={false} onClose={handleClose} product={mockProduct} />,
    );
    expect(screen.queryByText('Description')).toBeNull();

    rerender(<ProductFullDetailsModal isOpen={true} onClose={handleClose} product={mockProduct} />);
    expect(screen.getByText('Description')).toBeDefined();
    expect(screen.getByText('Lemaire')).toBeDefined();
    expect(screen.getByText('Relaxed double-breasted wool coat')).toBeDefined();
    expect(screen.getByText(/Charcoal heather, 100% virgin wool/)).toBeDefined();
    expect(screen.getByText(/104 cm/)).toBeDefined();
    expect(screen.getByText(/112 cm/)).toBeDefined();
    expect(screen.getByText(/Faint scuff on inner bottom hem lining/)).toBeDefined();
    expect(screen.getByText(/850g/)).toBeDefined();

    fireEvent.click(screen.getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('renders ProductHowToMeasureModal with custom measurements guide in English', () => {
    const handleClose = vi.fn();
    render(<ProductHowToMeasureModal isOpen={true} onClose={handleClose} product={mockProduct} />);

    expect(screen.getByText('How to measure')).toBeDefined();
    expect(screen.getByText(/This piece: 52 cm flat \/ 104 cm around/)).toBeDefined();
    expect(screen.getByText(/This piece: 112 cm/)).toBeDefined();
    expect(screen.getByText(/This piece: 64 cm/)).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('renders ProductDeliveryPolicyModal with 72-hour return protection details in English', () => {
    const handleClose = vi.fn();
    render(<ProductDeliveryPolicyModal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('Delivery & 72-hour return policy')).toBeDefined();
    expect(screen.getByText(/Shipping via Giao Hàng Nhanh \(GHN\)/)).toBeDefined();
    expect(screen.getByText(/72-hour buyer inspection window/)).toBeDefined();
    expect(screen.getByText(/Escrow buyer payment protection/)).toBeDefined();

    fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[0]);
    expect(handleClose).toHaveBeenCalledOnce();
  });
});
