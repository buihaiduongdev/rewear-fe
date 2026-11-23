import * as React from 'react';

import {
  DraftSavedModal,
  ListingChecklistModal,
  SubmittedForReviewModal,
} from '@/features/seller-dashboard/components/SellerModals';
import {
  type SellerProductItem,
  SellerProductsPage,
} from '@/features/seller-dashboard/components/SellerProductsPage';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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

const sellerProducts: SellerProductItem[] = [
  {
    id: 'one',
    title: 'Lemaire wool coat',
    size: 'M',
    condition: 'Good',
    price: '100₫',
    status: 'Active',
    image: null,
  },
  {
    id: 'two',
    title: 'Tailored wool jacket',
    size: 'S',
    condition: 'Good',
    price: '200₫',
    status: 'Held',
    isLocked: true,
    image: null,
  },
  {
    id: 'three',
    title: 'Pleated wool trousers',
    size: 'M',
    condition: 'Good',
    price: '300₫',
    status: 'In review',
    image: null,
  },
  {
    id: 'four',
    title: 'Cashmere sweater',
    size: 'M',
    condition: 'Good',
    price: '400₫',
    status: 'Draft',
    image: null,
  },
];

describe('SellerProductsPage', () => {
  it('shows an empty state without placeholder products', () => {
    render(<SellerProductsPage products={[]} />);
    expect(screen.getByText('No products yet.')).toBeInTheDocument();
    expect(screen.queryByText('Lemaire wool coat')).not.toBeInTheDocument();
  });
  it('renders products table with headers and initial items', () => {
    render(<SellerProductsPage products={sellerProducts} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Products' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();

    // The supplied products are displayed
    expect(screen.getByText('Lemaire wool coat')).toBeInTheDocument();
    expect(screen.getByText('Tailored wool jacket')).toBeInTheDocument();
    expect(screen.getByText('Pleated wool trousers')).toBeInTheDocument();
    expect(screen.getByText('Cashmere sweater')).toBeInTheDocument();
  });

  it('filters products correctly by search keyword', () => {
    render(<SellerProductsPage products={sellerProducts} />);

    const searchInput = screen.getByPlaceholderText(
      'Search products by title or code',
    );
    fireEvent.change(searchInput, { target: { value: 'Cashmere' } });

    expect(screen.getByText('Cashmere sweater')).toBeInTheDocument();
    expect(screen.queryByText('Lemaire wool coat')).not.toBeInTheDocument();
  });

  it('filters products correctly by status select dropdown', () => {
    render(<SellerProductsPage products={sellerProducts} />);

    const select = screen.getByLabelText('Filter by status');
    fireEvent.change(select, { target: { value: 'Held' } });

    expect(screen.getByText('Tailored wool jacket')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.queryByText('Cashmere sweater')).not.toBeInTheDocument();
  });
});

describe('SellerListingEditorPage and Modals', () => {
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

    rerender(
      <ListingChecklistModal open={false} onOpenChange={onOpenChange} />,
    );
    expect(screen.queryByText('Listing checklist')).not.toBeInTheDocument();
  });

  it('renders DraftSavedModal and handles close', () => {
    const onOpenChange = vi.fn();
    render(<DraftSavedModal open={true} onOpenChange={onOpenChange} />);

    expect(screen.getByText('Draft saved')).toBeInTheDocument();
    expect(screen.getByText(/Your listing stays private/i)).toBeInTheDocument();

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
