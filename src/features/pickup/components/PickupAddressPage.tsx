'use client';

import { useMemo, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type { PickupLocationControllerSaveShop200 } from '@/shared/api/models';
import { usePickupLocationControllerFindShop } from '@/shared/api/query-generated/pickup-locations/pickup-locations';
import { useShopControllerFindMine } from '@/shared/api/query-generated/shops/shops';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { PickupAddressForm } from './PickupAddressForm';

export function PickupAddressPage() {
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

  const memberships = useShopControllerFindMine({
    query: { enabled, queryKey: ['pickup-shop-memberships', session?.user.id] },
  });

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
    const name = currentShop?.name || 'Hanoi Archive';
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

  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh">
      {/* Top Header (Figma 63:2256 / 63:2291 / 63:2315) */}
      <header className="mx-auto flex min-h-20 w-full max-w-[1280px] items-center justify-between gap-6 px-4 text-sm leading-5 font-semibold md:px-8">
        <Link
          href="/"
          aria-label="RE.WEAR home"
          className="flex min-h-11 items-center"
        >
          <Image
            src="/brands/rewear-wordmark.svg"
            alt="RE.WEAR"
            width={91}
            height={16}
            className="h-auto w-[60px]"
            unoptimized
          />
        </Link>
        <span className="text-rewear-muted hidden sm:block">
          {isSettingsMode || isReady ? 'Seller workspace' : 'Shop setup'}
        </span>
        <Link
          href={isSettingsMode || isReady ? '/selling' : '/'}
          className="inline-flex min-h-11 items-center"
        >
          {isSettingsMode || isReady
            ? 'Back to workspace'
            : 'Back to marketplace'}
        </Link>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-[1280px] space-y-8 px-4 py-6 md:p-12"
      >
        {/* Stepper Timeline (Only during initial onboarding: Figma 63:2256 / 63:2291) */}
        {!isSettingsMode && (
          <div className="mx-auto max-w-[720px] py-2">
            <div className="flex items-center">
              {/* Step 1: Shop details (Completed) */}
              <div className="flex flex-col items-center">
                <div className="bg-rewear-text flex size-4 items-center justify-center rounded-full" />
                <span className="text-rewear-text mt-2 text-xs font-semibold whitespace-nowrap">
                  Shop details
                </span>
              </div>

              {/* Line 1 */}
              <div className="bg-rewear-text mx-2 h-0.5 flex-1" />

              {/* Step 2: Pickup address */}
              <div className="flex flex-col items-center">
                <div
                  className={
                    isReady
                      ? 'bg-rewear-text flex size-4 items-center justify-center rounded-full'
                      : 'border-rewear-text bg-rewear-accent flex size-4 items-center justify-center rounded-full border-2'
                  }
                />
                <span className="text-rewear-text mt-2 text-xs font-semibold whitespace-nowrap">
                  Pickup address
                </span>
              </div>

              {/* Line 2 */}
              <div
                className={
                  isReady
                    ? 'bg-rewear-text mx-2 h-0.5 flex-1'
                    : 'bg-rewear-border mx-2 h-0.5 flex-1'
                }
              />

              {/* Step 3: Shop ready */}
              <div className="flex flex-col items-center">
                <div
                  className={
                    isReady
                      ? 'border-rewear-text bg-rewear-accent flex size-4 items-center justify-center rounded-full border-2'
                      : 'border-rewear-border bg-rewear-surface flex size-4 items-center justify-center rounded-full border'
                  }
                />
                <span
                  className={
                    isReady
                      ? 'text-rewear-text mt-2 text-xs font-semibold whitespace-nowrap'
                      : 'text-rewear-muted mt-2 text-xs whitespace-nowrap'
                  }
                >
                  Shop ready
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Shop is Ready Screen (Figma 63:2291) */}
        {isReady ? (
          <div className="space-y-8">
            <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
              Your shop is ready
            </h1>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Left Card: Shop Details & Action (Figma 63:2291) */}
              <div className="bg-rewear-soft border-rewear-border space-y-6 border p-8 lg:col-span-7 xl:col-span-7">
                <div className="flex items-center gap-4">
                  <div className="bg-rewear-text text-rewear-accent flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xl font-bold">
                    <span>{shopInitials}</span>
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-rewear-text truncate text-xl font-semibold">
                      {currentShop?.name || 'Hanoi Archive'}
                    </p>
                    <span className="text-rewear-muted block truncate font-mono text-xs">
                      rewear.vn/shops/{shopSlug}
                    </span>
                  </div>
                </div>

                <p className="text-rewear-muted text-sm leading-6">
                  {currentShop?.description ||
                    'Curated pre-owned clothing, based in Hanoi.'}
                </p>

                {activeAddress && (
                  <div className="border-rewear-border border-t pt-4 text-xs leading-5">
                    <p className="text-rewear-text font-semibold">
                      {activeAddress.addressLine1}
                    </p>
                    <p className="text-rewear-muted">
                      {activeAddress.contactName} · {activeAddress.phone}
                    </p>
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <Link
                    href="/selling"
                    className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex min-h-12 w-full items-center justify-center text-sm font-semibold transition"
                  >
                    Open seller workspace
                  </Link>
                  <Link
                    href={`/selling/pickup?shopId=${encodeURIComponent(shopId)}`}
                    className="text-rewear-muted hover:text-rewear-text block text-center text-xs font-semibold underline"
                  >
                    Manage pickup address
                  </Link>
                </div>
              </div>

              {/* Right Card: Setup complete Checklist (Figma 63:2291) */}
              <aside className="lg:col-span-5 xl:col-span-5">
                <div className="bg-rewear-soft border-rewear-border space-y-6 border p-8">
                  <h2 className="text-[24px] leading-[30px] font-semibold tracking-[-0.02em]">
                    Setup complete
                  </h2>
                  <ul className="text-rewear-text space-y-4 text-sm font-medium">
                    <li className="flex items-center gap-3">
                      <span className="text-rewear-accent font-bold">✓</span>
                      <span>Shop profile saved</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-rewear-accent font-bold">✓</span>
                      <span>Pickup point registered</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-rewear-accent font-bold">✓</span>
                      <span>GHN · Standard delivery</span>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          /* Set / Update pickup address Screen (Figma 63:2256 / 63:2315) */
          <div className="space-y-8">
            <div className="space-y-1">
              {isSettingsMode && (
                <p className="text-rewear-muted text-xs font-semibold tracking-wider uppercase">
                  Shop settings / Pickup
                </p>
              )}
              <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
                {isSettingsMode
                  ? 'Update pickup address'
                  : 'Set your pickup address'}
              </h1>
              {isSettingsMode && (
                <p className="text-rewear-muted text-sm">
                  Manage the dispatch warehouse and contact details for Giao
                  Hàng Nhanh (GHN) carrier pickup.
                </p>
              )}
            </div>

            {/* Error banner */}
            {!!error && (
              <div
                role="alert"
                className="border-destructive/30 bg-destructive/10 text-destructive border p-4 text-sm"
              >
                <p>{getApiErrorMessage(error)}</p>
                <button
                  type="button"
                  disabled={saving}
                  className="mt-2 text-xs font-semibold underline"
                  onClick={() => {
                    void memberships.refetch();
                    void selected.refetch();
                  }}
                >
                  Try again
                </button>
              </div>
            )}

            {/* Zero State if User has no shop */}
            {!memberships.isPending && !shopId && (
              <div className="border-rewear-border space-y-4 border p-8 text-center">
                <p className="text-rewear-muted text-base">
                  You need to open a shop before configuring a pickup address.
                </p>
                <Link
                  href="/selling/open"
                  className="bg-rewear-accent text-rewear-text inline-flex min-h-11 items-center px-6 text-sm font-semibold"
                >
                  Open your shop
                </Link>
              </div>
            )}

            {/* Loading placeholder */}
            {shopId && (selected.isPending || memberships.isPending) && (
              <p role="status" className="text-rewear-muted text-sm">
                Loading pickup address…
              </p>
            )}

            {/* Main Form + Preview Grid (Figma 63:2256 / 63:2315) */}
            {enabled && !!shopId && !selected.error && (
              <PickupAddressForm
                key={`${session?.user.id}:${shopId}:${hasExistingLocation ? 'edit' : 'new'}`}
                initial={selected.data?.data.location}
                shopId={shopId}
                isEditing={isSettingsMode}
                onBeforeSave={() => client.cancelQueries({ queryKey: key })}
                onSaving={setSaving}
                onSaved={(response) => {
                  client.setQueryData(key, response);
                  setSavedLocation(response.data.location);
                  if (!isSettingsMode) {
                    setIsReady(true);
                  }
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
