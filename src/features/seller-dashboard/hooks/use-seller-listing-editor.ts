'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { getApiErrorMessage } from '@/shared/api/api-error';
import { axiosClient } from '@/shared/api/axios-client';
import type { MediaControllerConfirmUploadBodyAngle } from '@/shared/api/models';
import { categoryControllerFindAll } from '@/shared/api/query-generated/categories/categories';
import {
  mediaControllerConfirmUpload,
  mediaControllerCreateUploadTicket,
  mediaControllerDelete,
  mediaControllerFindForManagement,
  mediaControllerSetCover,
} from '@/shared/api/query-generated/product-media/product-media';
import {
  productControllerCreate,
  productControllerFindManaged,
  productControllerSubmit,
  productControllerUpdate,
} from '@/shared/api/query-generated/products/products';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getListingBody,
  listingMeasurementFields,
} from '../utils/listing-form';

type SuggestDescriptionResponseEnvelope = {
  data?: {
    description?: string;
    model?: string;
  };
};

type SuggestDescriptionPayload = {
  title: string;
  categoryName?: string;
  brand?: string;
  condition?: 'FAIR' | 'GOOD' | 'EXCELLENT' | 'PRISTINE';
  size?: string;
  color?: string;
  measurements?: Record<string, number>;
  repairs?: string;
  defects?: string[];
  notes?: string;
};

export function useSellerListingEditor(shopId: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [productId, setProductId] = useState(searchParams.get('id') ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [angle, setAngle] =
    useState<NonNullable<MediaControllerConfirmUploadBodyAngle>>('FRONT');
  const queryClient = useQueryClient();
  const request = { headers: { 'x-shop-id': shopId } };

  const product = useQuery({
    queryKey: ['seller-product', shopId, productId],
    queryFn: () => productControllerFindManaged(productId, request),
    enabled: !!shopId && !!productId,
  });
  const categories = useQuery({
    queryKey: ['listing-categories'],
    queryFn: () => categoryControllerFindAll(),
  });
  const media = useQuery({
    queryKey: ['seller-product-media', shopId, productId],
    queryFn: () => mediaControllerFindForManagement(productId, request),
    enabled: !!shopId && !!productId,
  });

  async function save(form: HTMLFormElement, submit: boolean) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const body = getListingBody(form);
      let id = productId;
      let updatedStatus = product.data?.data.status;

      if (id) {
        const updated = await productControllerUpdate(id, body, request);
        updatedStatus = updated?.data?.status ?? updatedStatus;
      } else {
        const created = await productControllerCreate(
          { ...body, shopId },
          request,
        );
        id = created.data.id;
        updatedStatus = created.data.status;
        setProductId(id);
        router.replace(`/selling/new?id=${encodeURIComponent(id)}`);
      }

      await queryClient.invalidateQueries({ queryKey: ['seller-my-products'] });
      await queryClient.invalidateQueries({
        queryKey: ['seller-product', shopId, id],
      });

      if (updatedStatus === 'PENDING_REVIEW') {
        setMessage(
          'Changes saved. Listing has been queued for admin re-review.',
        );
      } else if (submit) {
        await productControllerSubmit(id, request);
        await queryClient.invalidateQueries({
          queryKey: ['seller-product', shopId, id],
        });
        setMessage('Listing submitted for review.');
      } else {
        setMessage('Draft saved.');
      }
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function suggestDescription(
    form: HTMLFormElement,
    notes = '',
  ): Promise<string | null> {
    setAiError('');
    const data = new FormData(form);
    const readText = (key: string) => String(data.get(key) ?? '').trim();

    const title = readText('title');
    if (!title) {
      setAiError('Enter a listing title before requesting an AI description.');
      return null;
    }

    const categoryId = readText('categoryId');
    const categoryName = categories.data?.data.find(
      (cat) => cat.id === categoryId,
    )?.name;
    const condition = readText('condition') as
      SuggestDescriptionPayload['condition'] | '';
    const brand = readText('brand');
    const size = readText('size');
    const color = readText('color');
    const repairs = readText('repairs');
    const trimmedNotes = notes.trim();

    const measurements: Record<string, number> = {};
    for (const field of listingMeasurementFields) {
      const raw = readText(field);
      const parsed = raw ? Number(raw) : NaN;
      if (Number.isFinite(parsed) && parsed > 0) {
        measurements[field] = parsed;
      }
    }

    const existingDefects = (product.data?.data.defects ?? [])
      .map((defect) => defect.description.trim())
      .filter(Boolean);

    const payload: SuggestDescriptionPayload = {
      title,
      ...(categoryName ? { categoryName } : {}),
      ...(brand ? { brand } : {}),
      ...(condition ? { condition } : {}),
      ...(size ? { size } : {}),
      ...(color ? { color } : {}),
      ...(Object.keys(measurements).length > 0 ? { measurements } : {}),
      ...(repairs ? { repairs } : {}),
      ...(existingDefects.length > 0 ? { defects: existingDefects } : {}),
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    };

    setAiSuggesting(true);
    try {
      const response = (await axiosClient.post(
        '/products/suggest-description',
        payload,
        {
          headers: { 'x-shop-id': shopId },
          timeout: 20_000,
        },
      )) as SuggestDescriptionResponseEnvelope;

      const suggested = response?.data?.description?.trim();
      if (!suggested) {
        setAiError(
          'AI could not generate a description right now. Please try again or write one manually.',
        );
        return null;
      }
      setAiModel(response?.data?.model ?? 'Gemini AI');
      return suggested;
    } catch (cause) {
      const apiMessage = getApiErrorMessage(cause);
      setAiError(
        apiMessage ||
          'AI description suggestion is currently unavailable. You can still write your description manually.',
      );
      return null;
    } finally {
      setAiSuggesting(false);
    }
  }

  async function upload(file: File) {
    if (!productId) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const info = { mimeType: file.type, sizeBytes: file.size };
      const ticket = (
        await mediaControllerCreateUploadTicket(productId, info, request)
      ).data;
      const response = await fetch(ticket.uploadUrl, {
        method: ticket.method,
        headers: ticket.headers,
        body: file,
      });
      if (!response.ok) throw new Error('Image upload failed.');
      await mediaControllerConfirmUpload(
        productId,
        { ...info, storageKey: ticket.storageKey, angle },
        request,
      );
      await media.refetch();
      setMessage('Photo uploaded.');
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function updatePhoto(action: 'delete' | 'cover', id: string) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (action === 'delete')
        await mediaControllerDelete(productId, id, request);
      else await mediaControllerSetCover(productId, id, request);
      await media.refetch();
      await queryClient.invalidateQueries({ queryKey: ['seller-my-products'] });
      setMessage(
        action === 'delete' ? 'Photo removed.' : 'Cover photo updated.',
      );
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return {
    productId,
    busy,
    message,
    error,
    aiSuggesting,
    aiError,
    aiModel,
    angle,
    setAngle,
    product,
    categories,
    media,
    save,
    suggestDescription,
    upload,
    updatePhoto,
  };
}
