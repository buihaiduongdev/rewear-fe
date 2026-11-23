import { ProductConditionDetails } from '@/features/product-detail/components/ProductConditionDetails';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/components/marketplace/ProductPhoto', () => ({
  ProductPhoto: ({ title }: { title: string }) => (
    <span role="img" aria-label={title} />
  ),
}));

describe('ProductConditionDetails', () => {
  it('shows repairs and each flaw with its available photos', () => {
    render(
      <ProductConditionDetails
        repairs="Zipper replaced"
        defects={[
          { description: 'Small stain', mediaIds: ['photo-1', 'missing'] },
          { description: 'Loose thread', mediaIds: [] },
        ]}
        media={[{ id: 'photo-1', url: 'https://example.com/stain.jpg' }]}
      />,
    );
    expect(screen.getByText('Zipper replaced')).toBeDefined();
    expect(screen.getByText('Small stain')).toBeDefined();
    expect(screen.getByText('Loose thread')).toBeDefined();
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(
      screen.getByRole('img', { name: 'Photo of flaw: Small stain' }),
    ).toBeDefined();
  });

  it('does not invent condition details when none are provided', () => {
    const { container } = render(
      <ProductConditionDetails repairs={null} defects={[]} media={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
