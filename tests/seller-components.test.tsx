import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SellerProductsPage } from '@/features/seller-dashboard/components/SellerProductsPage';
import { SellerListingEditorPage } from '@/features/seller-dashboard/components/SellerListingEditorPage';
import {
  ListingChecklistModal,
  DraftSavedModal,
  SubmittedForReviewModal,
} from '@/features/seller-dashboard/components/SellerModals';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    unoptimized: _unoptimized,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    unoptimized?: boolean;
  }) => {
    void _fill;
    void _unoptimized;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('SellerProductsPage', () => {
  it('renders products table with headers and initial items', () => {
    render(<SellerProductsPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Products' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();

    // Default Figma items
    expect(screen.getByText('Lemaire wool coat')).toBeInTheDocument();
    expect(screen.getByText('Tailored wool jacket')).toBeInTheDocument();
    expect(screen.getByText('Pleated wool trousers')).toBeInTheDocument();
    expect(screen.getByText('Cashmere sweater')).toBeInTheDocument();
  });

  it('filters products correctly by search keyword', () => {
    render(<SellerProductsPage />);

    const searchInput = screen.getByPlaceholderText(
      'Search products by title or code',
    );
    fireEvent.change(searchInput, { target: { value: 'Cashmere' } });

    expect(screen.getByText('Cashmere sweater')).toBeInTheDocument();
    expect(screen.queryByText('Lemaire wool coat')).not.toBeInTheDocument();
  });

  it('filters products correctly by status select dropdown', () => {
    render(<SellerProductsPage />);

    const select = screen.getByLabelText('Filter by status');
    fireEvent.change(select, { target: { value: 'Held' } });

    expect(screen.getByText('Tailored wool jacket')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.queryByText('Cashmere sweater')).not.toBeInTheDocument();
  });
});

describe('SellerListingEditorPage and Modals', () => {
  it('renders listing editor form fields and photos', () => {
    render(<SellerListingEditorPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Create listing' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Lemaire wool coat');
    expect(screen.getByLabelText('Category')).toHaveValue('Outerwear');
    expect(screen.getByLabelText('Size')).toHaveValue('M');
    expect(screen.getByLabelText('Condition')).toHaveValue('Very good');
    expect(screen.getByLabelText('Price')).toHaveValue('580.000₫');
    expect(screen.getByLabelText('Measurements')).toHaveValue(
      'Chest 104 cm · Length 112 cm',
    );
    expect(screen.getByLabelText('Disclosed defects / repairs')).toHaveValue(
      'No visible flaws or repairs declared',
    );

    expect(screen.getByText('Submit for review')).toBeInTheDocument();
    expect(screen.getByText('Save draft')).toBeInTheDocument();
  });

  it('opens and closes ListingChecklistModal', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ListingChecklistModal open={true} onOpenChange={onOpenChange} />,
    );

    expect(screen.getByText('Listing checklist')).toBeInTheDocument();
    expect(
      screen.getByText('Add front, back and label photos.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Held items cannot be edited or hidden.'),
    ).toBeInTheDocument();

    const closeBtn = screen.getByText('Close ×');
    fireEvent.click(closeBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(<ListingChecklistModal open={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByText('Listing checklist')).not.toBeInTheDocument();
  });

  it('renders DraftSavedModal and handles close', () => {
    const onOpenChange = vi.fn();
    render(<DraftSavedModal open={true} onOpenChange={onOpenChange} />);

    expect(screen.getByText('Draft saved')).toBeInTheDocument();
    expect(
      screen.getByText(/Your listing stays private/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close ×'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders SubmittedForReviewModal and handles view products action', () => {
    const onOpenChange = vi.fn();
    const onViewProducts = vi.fn();
    render(
      <SubmittedForReviewModal
        open={true}
        onOpenChange={onOpenChange}
        onViewProducts={onViewProducts}
      />,
    );

    expect(screen.getByText('Submitted for review')).toBeInTheDocument();
    expect(
      screen.getByText(/Your listing appears in Products/i),
    ).toBeInTheDocument();

    const viewProductsBtn = screen.getByRole('button', {
      name: 'View products',
    });
    fireEvent.click(viewProductsBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onViewProducts).toHaveBeenCalled();
  });
});
