'use client';

import Link from 'next/link';

import { AdministrativeDivisionFields } from '@/modules/address';
import { getApiErrorMessage } from '@/shared/api/api-error';
import type { PickupLocationControllerSaveShop200 } from '@/shared/api/models';
import { BaseInputField } from '@/shared/components/ui/input/BaseInputField';

import { usePickupAddressForm } from '../hooks/use-pickup-address-form';

type Props = {
  initial?: PickupLocationControllerSaveShop200['data']['location'] | null;
  shopId: string;
  onBeforeSave: () => Promise<void>;
  onSaving: (saving: boolean) => void;
  onSaved: (response: PickupLocationControllerSaveShop200) => void;
};

export function PickupAddressForm({
  initial,
  shopId,
  onBeforeSave,
  onSaving,
  onSaved,
}: Props) {
  const {
    register,
    errors,
    onSubmit,
    saving,
    apiError,
    message,
    setMessage,
    provinceCode,
    wardCode,
    contactName,
    phone,
    addressLine1,
    provinceName,
    wardName,
    handleProvinceChange,
    handleWardChange,
    provinces,
    wards,
    refetchDivisions,
  } = usePickupAddressForm({
    initial,
    shopId,
    onBeforeSave,
    onSaving,
    onSaved,
  });

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12"
      onChange={() => {
        if (message) setMessage('');
      }}
    >
      {/* Left Column: Form Fields (Figma 63:2256) (7 cols) */}
      <fieldset
        disabled={saving}
        className="min-w-0 space-y-6 lg:col-span-7 xl:col-span-7"
      >
        <BaseInputField
          id="pickup-contact"
          label="Contact name"
          placeholder="e.g. Tran Minh Quan"
          appearance="filled"
          autoComplete="name"
          maxLength={100}
          error={errors.contactName?.message}
          required
          {...register('contactName')}
        />

        <BaseInputField
          id="pickup-phone"
          label="Pickup phone"
          placeholder="e.g. 0918 345 889"
          appearance="filled"
          autoComplete="tel"
          type="tel"
          maxLength={16}
          error={errors.phone?.message}
          required
          {...register('phone')}
        />

        <AdministrativeDivisionFields
          provinceCode={provinceCode}
          wardCode={wardCode}
          onProvinceChange={handleProvinceChange}
          onWardChange={handleWardChange}
          provinces={provinces}
          wards={wards}
          errors={{
            provinceCode: errors.provinceCode?.message,
            wardCode: errors.wardCode?.message,
          }}
          rounded
          provinceLabel="Province / City"
          wardLabel="Ward / Commune"
        />

        <BaseInputField
          id="pickup-street"
          label="Street address"
          placeholder="e.g. 45 Xa Dan"
          appearance="filled"
          autoComplete="street-address"
          maxLength={255}
          error={errors.addressLine1?.message}
          required
          {...register('addressLine1')}
        />

        {/* Shipping carrier notice (Figma 63:2256) */}
        <div className="bg-rewear-soft space-y-1.5 p-4">
          <span className="text-rewear-muted block text-xs font-semibold tracking-wider uppercase">
            Shipping carrier ›
          </span>
          <p className="text-rewear-text text-sm font-medium">
            GHN · Standard delivery
          </p>
        </div>

        {message && (
          <p role="status" className="text-sm font-medium text-emerald-600">
            {message}
          </p>
        )}

        {!!apiError && (
          <div
            role="alert"
            className="border-destructive/30 bg-destructive/10 text-destructive space-y-2 border p-4 text-sm"
          >
            <p>{getApiErrorMessage(apiError)}</p>
            <button
              type="button"
              disabled={saving}
              className="underline"
              onClick={refetchDivisions}
            >
              Retry address directory
            </button>
          </div>
        )}
      </fieldset>

      {/* Right Column: Pickup point Summary Card (Figma 63:2256) (5 cols) */}
      <aside className="space-y-4 lg:col-span-5 xl:col-span-5">
        <div className="bg-rewear-soft border-rewear-border space-y-6 border p-6">
          <h2 className="text-[24px] leading-[30px] font-semibold tracking-[-0.02em]">
            Pickup point
          </h2>

          <div className="text-rewear-muted space-y-2 text-sm leading-6">
            <p className="text-rewear-text font-semibold">
              {contactName.trim() || 'Tran Minh Quan'} ·{' '}
              {phone.trim() || '0918 345 889'}
            </p>
            <p>{addressLine1.trim() || '45 Xa Dan'},</p>
            <p>
              {wardName ? `${wardName} Ward,` : 'Van Mieu — Quoc Tu Giam Ward,'}
            </p>
            <p>{provinceName || 'Hanoi'}</p>
          </div>

          <div className="border-rewear-border border-t pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 disabled:bg-rewear-border disabled:text-rewear-muted flex min-h-12 w-full items-center justify-center text-sm font-semibold transition disabled:cursor-not-allowed"
            >
              {saving ? 'Saving pickup address…' : 'Create shop'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/selling/open"
              className="text-rewear-muted hover:text-rewear-text text-xs underline"
            >
              Back to shop details
            </Link>
          </div>
        </div>
      </aside>
    </form>
  );
}
