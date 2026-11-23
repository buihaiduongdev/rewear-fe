'use client';

import { type FormEvent, useId, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  shopMembershipsQueryKey,
  useShopMemberships,
} from '@/modules/shop/hooks/use-shop-memberships';
import { useShopControllerCreate } from '@/shared/api/query-generated/shops/shops';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function useOpenShop() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const shopNameInputId = useId();
  const shopAboutInputId = useId();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');

  const isAuthenticated = status === 'authenticated' && !session?.error;

  const memberships = useShopMemberships(isAuthenticated, session?.user.id);

  const existingShop = useMemo(() => {
    return memberships.data?.data.find(
      (m) => m.memberRole === 'OWNER' && m.status === 'ACTIVE',
    );
  }, [memberships.data?.data]);

  const createShop = useShopControllerCreate();

  const slug = useMemo(() => {
    const raw = name.trim() || 'your-shop';
    return slugify(raw);
  }, [name]);

  const initials = useMemo(() => {
    const trimmed = name.trim();
    if (!trimmed) return 'HA';
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }, [name]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(`rewear.vn/shops/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const data = {
        name: name.trim(),
        description: description.trim() || null,
        ...(logoPreview.trim() ? { logoUrl: logoPreview.trim() } : {}),
      };
      const result = await createShop.mutateAsync({ data });

      await queryClient.invalidateQueries({
        queryKey: shopMembershipsQueryKey,
      });

      const newShopId = result.data.id;

      router.push(
        `/selling/pickup?shopId=${encodeURIComponent(newShopId)}&onboarding=true`,
      );
    } catch {
      // Error handled by createShop.error
    }
  };

  return {
    shopNameInputId,
    shopAboutInputId,
    name,
    setName,
    description,
    setDescription,
    copied,
    logoPreview,
    setLogoPreview,
    isAuthenticated,
    memberships,
    existingShop,
    createShop,
    slug,
    initials,
    handleCopyUrl,
    handleSubmit,
  };
}
