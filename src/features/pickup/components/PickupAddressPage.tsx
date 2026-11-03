'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  usePickupLocationControllerFindPersonal,
  usePickupLocationControllerFindShop,
} from '@/shared/api/query-generated/pickup-locations/pickup-locations';
import { useShopControllerFindMine } from '@/shared/api/query-generated/shops/shops';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { PickupAddressForm } from './PickupAddressForm';

export function PickupAddressPage() {
  const { data: session, status } = useSession();
  const client = useQueryClient();
  const [shopId, setShopId] = useState('');
  const [saving, setSaving] = useState(false);
  const enabled = status === 'authenticated' && !session?.error;
  const personalKey = ['pickup-location', session?.user.id, 'personal'];
  const shopKey = ['pickup-location', session?.user.id, 'shop', shopId];
  const key = shopId ? shopKey : personalKey;
  const personal = usePickupLocationControllerFindPersonal({
    query: {
      enabled: enabled && !shopId,
      queryKey: personalKey,
      retry: false,
      refetchOnWindowFocus: false,
    },
  });
  const shop = usePickupLocationControllerFindShop(shopId, {
    query: {
      enabled: enabled && !!shopId,
      queryKey: shopKey,
      retry: false,
      refetchOnWindowFocus: false,
    },
  });
  const memberships = useShopControllerFindMine({
    query: { enabled, queryKey: ['pickup-shop-memberships', session?.user.id] },
  });
  const selected = shopId ? shop : personal;
  const error = selected.error || memberships.error;
  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh">
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
          Seller workspace
        </span>
        <Link
          href="/selling/packages"
          className="inline-flex min-h-11 items-center"
        >
          Back to workspace
        </Link>
      </header>
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1280px] space-y-8 px-4 py-6 md:p-12"
      >
        <p className="text-rewear-muted text-sm leading-5 font-semibold">
          {shopId ? 'Shop settings' : 'Seller settings'} / Pickup
        </p>
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
          Update pickup address
        </h1>
        <label className="block max-w-[720px] space-y-2">
          <span className="block text-sm font-semibold">Selling as</span>
          <select
            aria-label="Selling as"
            className="border-rewear-border min-h-11 w-full min-w-0 border bg-transparent px-3 text-base"
            value={shopId}
            disabled={saving || memberships.isPending}
            onChange={(e) => setShopId(e.target.value)}
          >
            <option value="">Personal seller</option>
            {memberships.data?.data
              .filter((m) => m.memberRole === 'OWNER' && m.status === 'ACTIVE')
              .map((m) => (
                <option key={m.shopId} value={m.shopId}>
                  {m.shop.name}
                  {m.shop.status === 'INACTIVE' ? ' (inactive)' : ''}
                </option>
              ))}
          </select>
        </label>
        {!!error && (
          <div role="alert">
            <p>{getApiErrorMessage(error)}</p>
            <button
              type="button"
              disabled={saving}
              className="min-h-11 underline"
              onClick={() => {
                void memberships.refetch();
                void selected.refetch();
              }}
            >
              Try again
            </button>
          </div>
        )}
        {selected.isPending && <p role="status">Loading pickup address…</p>}
        {enabled && !selected.error && selected.data && (
          <PickupAddressForm
            key={`${session?.user.id}:${shopId}`}
            initial={selected.data.data.location}
            shopId={shopId}
            onBeforeSave={() => client.cancelQueries({ queryKey: key })}
            onSaving={setSaving}
            onSaved={(response) => client.setQueryData(key, response)}
          />
        )}
        <Link
          href="/selling/packages"
          className="inline-flex min-h-11 items-center text-sm font-semibold"
        >
          Back to workspace
        </Link>
      </main>
    </div>
  );
}
