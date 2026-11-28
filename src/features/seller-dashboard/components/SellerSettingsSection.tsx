'use client';

import { type ChangeEvent, type FormEvent, useState } from 'react';

import Link from 'next/link';

import { uploadShopLogo } from '@/modules/shop/api/shop-logo';
import { shopMembershipsQueryKey } from '@/modules/shop/hooks/use-shop-memberships';
import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  getShopControllerFindOneQueryKey,
  useShopControllerUpdate,
} from '@/shared/api/query-generated/shops/shops';
import { useToastStore } from '@/shared/stores/toast.store';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink, MapPin, Package } from 'lucide-react';

import { SellerBankAccountsSection } from './SellerBankAccountsSection';
import { SellerTeamSection } from './SellerTeamSection';

export type SellerSettingsSectionProps = {
  shopId: string;
  initialName: string;
  initialDescription: string;
  initialStatus: 'ACTIVE' | 'INACTIVE';
  shopLogo?: string | null;
  isOwner: boolean;
};

export function SellerSettingsSection({
  shopId,
  initialName,
  initialDescription,
  initialStatus,
  shopLogo,
  isOwner,
}: SellerSettingsSectionProps) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(initialStatus);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [validationError, setValidationError] = useState('');

  const updateShop = useShopControllerUpdate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Shop name is required.');
      return;
    }
    setValidationError('');

    try {
      await updateShop.mutateAsync({
        shopId,
        data: {
          name: trimmedName,
          description: description.trim() || null,
          status,
        },
      });
      await queryClient.invalidateQueries({
        queryKey: shopMembershipsQueryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: getShopControllerFindOneQueryKey(shopId),
      });
      addToast({
        type: 'success',
        title: 'Shop settings saved',
        durationMs: 3000,
      });
    } catch {
      // Displayed inline
    }
  };

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (
      !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(
        file.type,
      ) ||
      file.size <= 0 ||
      file.size > 5 * 1024 * 1024
    ) {
      setLogoError('Choose a JPG, PNG, WebP or AVIF image up to 5 MB.');
      return;
    }

    setLogoError('');
    setLogoUploading(true);
    try {
      await uploadShopLogo(shopId, file);
      await queryClient.invalidateQueries({
        queryKey: shopMembershipsQueryKey,
      });
      addToast({
        type: 'success',
        title: 'Shop logo updated',
        durationMs: 3000,
      });
    } catch (error) {
      setLogoError(getApiErrorMessage(error));
    } finally {
      setLogoUploading(false);
    }
  };

  return (
    <div className="max-w-[960px] space-y-8">
      {/* Header (Figma 48:1079) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[32px] md:leading-[38px]">
            Shop settings
          </h1>
          <p className="text-rewear-muted mt-1 text-sm">
            Manage your storefront profile, shipping configuration, payouts, and
            team access.
          </p>
        </div>
        <Link
          href={`/shops/${encodeURIComponent(shopId)}`}
          className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 items-center gap-2 border px-4 text-sm font-semibold transition"
        >
          View storefront
          <ExternalLink size={14} aria-hidden="true" />
        </Link>
      </div>

      {/* Shop Profile Form */}
      <section
        aria-labelledby="shop-profile-heading"
        className="border-rewear-border space-y-6 border bg-white p-6"
      >
        <h2 id="shop-profile-heading" className="text-lg font-semibold">
          Shop profile
        </h2>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-rewear-text text-rewear-accent flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-base font-bold">
            {shopLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shopLogo}
                alt={initialName}
                className="size-full object-cover"
              />
            ) : (
              <span>{initialName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="space-y-1">
            <input
              id="settings-shop-logo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={logoUploading}
              onChange={(e) => void handleLogoChange(e)}
              className="sr-only"
            />
            <label
              htmlFor="settings-shop-logo"
              className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 cursor-pointer items-center border px-4 text-sm font-semibold"
            >
              {logoUploading ? 'Uploading logo…' : 'Update logo'}
            </label>
            <p className="text-rewear-muted text-xs">
              JPG, PNG, WebP or AVIF, up to 5 MB.
            </p>
            {logoError && (
              <p role="alert" className="text-destructive text-xs">
                {logoError}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveProfile} noValidate className="space-y-4">
          <div className="space-y-1">
            <div className="bg-rewear-soft space-y-1.5 rounded-lg px-4 py-3">
              <label
                htmlFor="shop-settings-name"
                className="block text-sm font-semibold"
              >
                Shop name
              </label>
              <input
                id="shop-settings-name"
                type="text"
                maxLength={100}
                value={name}
                disabled={updateShop.isPending}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationError) setValidationError('');
                }}
                className="h-6 w-full bg-transparent text-base focus:outline-none"
              />
            </div>
            {validationError && (
              <p role="alert" className="text-destructive text-xs">
                {validationError}
              </p>
            )}
          </div>

          <div className="bg-rewear-soft space-y-1.5 rounded-lg px-4 py-3">
            <label
              htmlFor="shop-settings-description"
              className="block text-sm font-semibold"
            >
              About your shop
            </label>
            <textarea
              id="shop-settings-description"
              rows={3}
              maxLength={1000}
              value={description}
              disabled={updateShop.isPending}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell buyers what you curate and where you ship from."
              className="w-full resize-y bg-transparent text-base focus:outline-none"
            />
          </div>

          <div className="bg-rewear-soft space-y-1.5 rounded-lg px-4 py-3">
            <label
              htmlFor="shop-settings-status"
              className="block text-sm font-semibold"
            >
              Shop visibility
            </label>
            <select
              id="shop-settings-status"
              value={status}
              disabled={updateShop.isPending}
              onChange={(e) =>
                setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')
              }
              className="h-7 w-full bg-transparent text-base focus:outline-none"
            >
              <option value="ACTIVE">Active (visible to buyers)</option>
              <option value="INACTIVE">Inactive (paused)</option>
            </select>
          </div>

          {!!updateShop.error && (
            <p role="alert" className="text-destructive text-sm">
              {getApiErrorMessage(updateShop.error)}
            </p>
          )}

          <button
            type="submit"
            disabled={updateShop.isPending}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 inline-flex min-h-11 cursor-pointer items-center px-6 text-sm font-semibold transition disabled:opacity-50"
          >
            {updateShop.isPending ? 'Saving…' : 'Save shop profile'}
          </button>
        </form>
      </section>

      {/* Shipping & Fulfillment Shortcuts */}
      <section
        aria-labelledby="shop-logistics-heading"
        className="grid gap-4 md:grid-cols-2"
      >
        <h2 id="shop-logistics-heading" className="sr-only">
          Shipping and packaging settings
        </h2>
        <div className="border-rewear-border flex flex-col justify-between gap-4 border bg-white p-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold">
              <MapPin size={16} aria-hidden="true" />
              <h3>Pickup address</h3>
            </div>
            <p className="text-rewear-muted text-sm leading-5">
              Manage your pickup contact, Vietnam address, and GHN carrier
              connection.
            </p>
          </div>
          <Link
            href={`/selling/pickup?shopId=${encodeURIComponent(shopId)}`}
            className="text-rewear-text inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
          >
            Manage pickup address →
          </Link>
        </div>

        <div className="border-rewear-border flex flex-col justify-between gap-4 border bg-white p-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold">
              <Package size={16} aria-hidden="true" />
              <h3>Packaging presets</h3>
            </div>
            <p className="text-rewear-muted text-sm leading-5">
              Configure packed weight and outer dimensions for your listings.
            </p>
          </div>
          <Link
            href="/selling/packages"
            className="text-rewear-text inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
          >
            Manage packaging presets →
          </Link>
        </div>
      </section>

      {/* Payout Bank Accounts */}
      <SellerBankAccountsSection shopId={shopId} isOwner={isOwner} />

      {/* Team & RBAC Permissions */}
      <SellerTeamSection
        shopId={shopId}
        shopName={name.trim() || initialName}
        isOwner={isOwner}
      />
    </div>
  );
}
