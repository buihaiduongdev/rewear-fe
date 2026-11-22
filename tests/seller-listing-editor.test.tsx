import { SellerListingEditorPage } from '@/features/seller-dashboard/components/SellerListingEditorPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  submit: vi.fn(),
  find: vi.fn(),
  categories: vi.fn(),
  media: vi.fn(),
  replace: vi.fn(),
  search: '',
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: api.replace }),
  useSearchParams: () => new URLSearchParams(api.search),
}));
vi.mock('@/shared/api/query-generated/categories/categories', () => ({
  categoryControllerFindAll: api.categories,
}));
vi.mock('@/shared/api/query-generated/products/products', () => ({
  productControllerCreate: api.create,
  productControllerFindManaged: api.find,
  productControllerSubmit: api.submit,
  productControllerUpdate: api.update,
}));
vi.mock('@/shared/api/query-generated/product-media/product-media', () => ({
  mediaControllerFindForManagement: api.media,
  mediaControllerCreateUploadTicket: vi.fn(),
  mediaControllerConfirmUpload: vi.fn(),
}));
function renderEditor() {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <SellerListingEditorPage shopId="shop-1" />
    </QueryClientProvider>,
  );
}

describe('seller listing editor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.search = '';
    api.categories.mockResolvedValue({ data: [] });
    api.media.mockResolvedValue({ data: [] });
  });
  it('creates a draft using the current shop and entered data', async () => {
    api.create.mockResolvedValue({ data: { id: 'product-1' } });
    api.find.mockResolvedValue({
      data: { id: 'product-1', title: 'Coat', measurements: {} },
    });
    renderEditor();
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Coat' },
    });
    fireEvent.change(screen.getByLabelText('Price (VND)'), {
      target: { value: '200000' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() =>
      expect(api.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Coat',
          price: 200000,
          shopId: 'shop-1',
        }),
        { headers: { 'x-shop-id': 'shop-1' } },
      ),
    );
    expect(api.replace).toHaveBeenCalledWith('/selling/new?id=product-1');
  });
  it('loads an existing listing and submits only after saving', async () => {
    api.search = 'id=product-2';
    api.find.mockResolvedValue({
      data: { id: 'product-2', title: 'Existing', measurements: {} },
    });
    api.update.mockResolvedValue({ data: {} });
    api.submit.mockResolvedValue({ data: {} });
    renderEditor();
    expect(await screen.findByDisplayValue('Existing')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Submit for review' }));
    await waitFor(() =>
      expect(api.submit).toHaveBeenCalledWith('product-2', {
        headers: { 'x-shop-id': 'shop-1' },
      }),
    );
    expect(api.update.mock.invocationCallOrder[0]).toBeLessThan(
      api.submit.mock.invocationCallOrder[0],
    );
  });
  it('shows API errors instead of reporting a successful save', async () => {
    api.create.mockRejectedValue(new Error('Save failed'));
    renderEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Save failed');
    expect(api.replace).not.toHaveBeenCalled();
  });
});
