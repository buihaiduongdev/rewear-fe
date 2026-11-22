'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { getApiErrorMessage } from '@/shared/api/api-error';
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

import { getListingBody } from '../utils/listing-form';

export function useSellerListingEditor(shopId: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [productId, setProductId] = useState(searchParams.get('id') ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
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
      if (id) await productControllerUpdate(id, body, request);
      else {
        const created = await productControllerCreate(
          { ...body, shopId },
          request,
        );
        id = created.data.id;
        setProductId(id);
        router.replace(`/selling/new?id=${encodeURIComponent(id)}`);
      }
      await queryClient.invalidateQueries({ queryKey: ['seller-my-products'] });
      await queryClient.invalidateQueries({
        queryKey: ['seller-product', shopId, id],
      });
      if (submit) {
        await productControllerSubmit(id, request);
        setMessage('Listing submitted for review.');
      } else setMessage('Draft saved.');
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setBusy(false);
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
    angle,
    setAngle,
    product,
    categories,
    media,
    save,
    upload,
    updatePhoto,
  };
}
