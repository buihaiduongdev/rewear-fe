'use client';

import { useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { useShopMemberships } from '@/modules/shop/hooks/use-shop-memberships';
import type { PickupLocationControllerSaveShop200 } from '@/shared/api/models';
import { usePickupLocationControllerFindShop } from '@/shared/api/query-generated/pickup-locations/pickup-locations';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export function usePickupAddressPage() {
  const searchParams = useSearchParams();
  const queryShopId = searchParams.get('shopId') || '';
  const { data: session, status } = useSession();
  const client = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [savedLocation, setSavedLocation] = useState<
    PickupLocationControllerSaveShop200['data']['location'] | null
  >(null);
  const enabled = status === 'authenticated' && !session?.error;

  const memberships = useShopMemberships(enabled, session?.user.id);

  const activeMembership = useMemo(() => {
    const owned = memberships.data?.data.filter(
      (m) => m.memberRole === 'OWNER' && m.status === 'ACTIVE',
    );
    if (!owned || owned.length === 0) return null;
    if (queryShopId) {
      return owned.find((m) => m.shopId === queryShopId) ?? owned[0];
    }
    return owned[0];
  }, [queryShopId, memberships.data?.data]);

  const shopId = activeMembership?.shopId || queryShopId || '';
  const currentShop = activeMembership?.shop;

  const shopKey = ['pickup-location', session?.user.id, 'shop', shopId];
  const key = shopKey;
  const shop = usePickupLocationControllerFindShop(shopId, {
    query: {
      enabled: enabled && !!shopId,
      queryKey: shopKey,
      retry: false,
      refetchOnWindowFocus: false,
    },
    request: {
      headers: shopId ? { 'x-shop-id': shopId } : undefined,
    },
  });

  const selected = shop;
  const error = selected.error || memberships.error;

  const shopInitials = useMemo(() => {
    const name = currentShop?.name || 'My shop';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [currentShop?.name]);

  const shopSlug = useMemo(() => {
    const name = currentShop?.name || 'hanoi-archive';
    return name
      .toLowerCase()
      .replace(/[đĐ]/g, 'd')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, [currentShop?.name]);

  const activeAddress = savedLocation ?? selected.data?.data.location;

  const isOnboardingQuery = searchParams.get('onboarding') === 'true';
  const hasExistingLocation = Boolean(
    selected.data?.data.location?.addressLine1,
  );
  const isSettingsMode = hasExistingLocation && !isOnboardingQuery && !isReady;

  const handleSaved = (response: PickupLocationControllerSaveShop200) => {
    client.setQueryData(key, response);
    setSavedLocation(response.data.location);
    if (!isSettingsMode) setIsReady(true);
  };
  const handleBeforeSave = () => client.cancelQueries({ queryKey: key });
  return {
    session,
    saving,
    setSaving,
    isReady,
    enabled,
    memberships,
    shopId,
    currentShop,
    selected,
    error,
    shopInitials,
    shopSlug,
    activeAddress,
    hasExistingLocation,
    isSettingsMode,
    openSettings: () => setIsReady(false),
    handleSaved,
    handleBeforeSave,
  };
}
