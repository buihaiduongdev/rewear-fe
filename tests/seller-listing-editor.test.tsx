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
  axiosPost: vi.fn(),
  replace: vi.fn(),
  search: '',
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: api.replace }),
  useSearchParams: () => new URLSearchParams(api.search),
}));
vi.mock('@/shared/api/axios-client', () => ({
  axiosClient: {
    post: api.axiosPost,
  },
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
  mediaControllerDelete: vi.fn(),
  mediaControllerSetCover: vi.fn(),
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
    api.categories.mockResolvedValue({
      data: [{ id: 'cat-1', name: 'Outerwear', isActive: true }],
    });
    api.media.mockResolvedValue({ data: [] });
  });

  it('creates a draft using the current shop and entered data', async () => {
    api.create.mockResolvedValue({
      data: { id: 'product-1', status: 'DRAFT' },
    });
    api.find.mockResolvedValue({
      data: {
        id: 'product-1',
        title: 'Coat',
        status: 'DRAFT',
        measurements: {},
      },
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
      data: {
        id: 'product-2',
        title: 'Existing',
        status: 'DRAFT',
        measurements: {},
      },
    });
    api.update.mockResolvedValue({ data: { status: 'DRAFT' } });
    api.submit.mockResolvedValue({ data: { status: 'PENDING_REVIEW' } });
    renderEditor();
    expect(await screen.findByDisplayValue('Existing')).toBeInTheDocument();
    expect(
      screen.queryByText(/Saving changes triggers Admin re-review/i),
    ).not.toBeInTheDocument();
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

  it('calls Gemini AI suggest-description and populates the description field', async () => {
    api.axiosPost.mockResolvedValue({
      data: {
        description: 'Áo khoác dạ dáng dài tình trạng rất mới, form đứng đẹp.',
        model: 'gemini-2.5-flash',
      },
    });
    renderEditor();
    expect(
      await screen.findByRole('option', { name: 'Outerwear' }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Wool Overcoat' },
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'cat-1' },
    });
    fireEvent.change(screen.getByLabelText('Condition'), {
      target: { value: 'EXCELLENT' },
    });
    fireEvent.change(screen.getByLabelText('Brand'), {
      target: { value: 'Uniqlo' },
    });
    fireEvent.change(screen.getByLabelText('Size'), {
      target: { value: 'M' },
    });
    fireEvent.change(screen.getByLabelText('AI notes (optional)'), {
      target: { value: 'Worn twice only' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Suggest description with AI/i }),
    );

    await waitFor(() =>
      expect(api.axiosPost).toHaveBeenCalledWith(
        '/products/suggest-description',
        expect.objectContaining({
          title: 'Wool Overcoat',
          categoryName: 'Outerwear',
          condition: 'EXCELLENT',
          brand: 'Uniqlo',
          size: 'M',
          notes: 'Worn twice only',
        }),
        expect.objectContaining({
          headers: { 'x-shop-id': 'shop-1' },
        }),
      ),
    );

    expect(screen.getByLabelText('Description')).toHaveValue(
      'Áo khoác dạ dáng dài tình trạng rất mới, form đứng đẹp.',
    );
  });

  it('shows a user-friendly error when Gemini AI suggestion fails', async () => {
    api.axiosPost.mockRejectedValue(
      new Error('AI description suggestion is currently unavailable'),
    );
    renderEditor();
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Denim Jacket' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Suggest description with AI/i }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'AI description suggestion is currently unavailable',
    );
  });

  it('displays the re-moderation warning banner when editing an ACTIVE listing', async () => {
    api.search = 'id=product-live';
    api.find.mockResolvedValue({
      data: {
        id: 'product-live',
        title: 'Live Trench Coat',
        status: 'ACTIVE',
        measurements: {},
      },
    });
    renderEditor();

    expect(
      await screen.findByDisplayValue('Live Trench Coat'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Saving changes triggers Admin re-review/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save changes for review' }),
    ).toBeInTheDocument();
  });
});
