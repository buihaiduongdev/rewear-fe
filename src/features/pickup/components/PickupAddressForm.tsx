'use client';

import Link from 'next/link';

import { AdministrativeDivisionFields } from '@/modules/address';
import { getApiErrorMessage } from '@/shared/api/api-error';
import type { PickupLocationControllerSaveShop200 } from '@/shared/api/models';
import { BaseInputField } from '@/shared/components/ui/input/BaseInputField';

import { usePickupAddressForm } from '../hooks/use-pickup-address-form';
import { GhnPickupProvider } from './GhnPickupProvider';

type Props = {
  initial?: PickupLocationControllerSaveShop200['data']['location'] | null;
  shopId: string;
  isEditing?: boolean;
  onBeforeSave: () => Promise<void>;
  onSaving: (saving: boolean) => void;
  onSaved: (response: PickupLocationControllerSaveShop200) => void;
};

export function PickupAddressForm({
  initial,
  shopId,
  isEditing = false,
  onBeforeSave,
  onSaving,
  onSaved,
}: Props) {
  const {
    ghn,
    disconnectGhn,
    connectGhn,
    addressNeedsSave,
    ghnStatus,
    connectionError,
    register,
    errors,
    onSubmit,
    saving,
    apiError,
    message,
    setMessage,
    provinceId,
    districtId,
    wardCode,
    contactName,
    phone,
    addressLine1,
    provinceName,
    districtName,
    wardName,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    provinces,
    districts,
    wards,
    refetchDivisions,
  } = usePickupAddressForm({
    initial,
    shopId,
    onBeforeSave,
    onSaving,
    onSaved,
  });

  const connection = initial as
    | (typeof initial & { ghnSyncStatus?: string; ghnShopId?: number | null })
    | null;
  const syncStatus = ghnStatus ?? connection?.ghnSyncStatus;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12"
      onChange={() => {
        if (message) setMessage('');
      }}
    >
      {/* Left Column: Form Fields (7 cols) */}
      <fieldset
        disabled={saving}
        className="min-w-0 space-y-6 lg:col-span-7 xl:col-span-7"
      >
        <BaseInputField
          id="pickup-contact"
          label="Contact name"
          placeholder="Enter contact name"
          appearance="filled"
          autoComplete="name"
          maxLength={100}
          error={errors.contactName ? 'Enter a valid contact name.' : undefined}
          required
          {...register('contactName')}
        />

        <BaseInputField
          id="pickup-phone"
          label="Pickup phone"
          placeholder="Enter phone number"
          appearance="filled"
          autoComplete="tel"
          type="tel"
          maxLength={16}
          error={
            errors.phone
              ? 'Enter a valid phone number (8–15 digits).'
              : undefined
          }
          required
          {...register('phone')}
        />

        <AdministrativeDivisionFields
          provinceId={provinceId}
          districtId={districtId}
          wardCode={wardCode}
          onProvinceChange={handleProvinceChange}
          onDistrictChange={handleDistrictChange}
          onWardChange={handleWardChange}
          provinces={provinces}
          districts={districts}
          wards={wards}
          errors={{
            provinceId: errors.provinceId
              ? 'Select a province/city'
              : undefined,
            districtId: errors.districtId ? 'Select a district' : undefined,
            wardCode: errors.wardCode ? 'Select a ward/commune' : undefined,
          }}
          rounded
          provinceLabel="Province / City"
          districtLabel="District"
          wardLabel="Ward / Commune"
        />

        <BaseInputField
          id="pickup-street"
          label="Street address"
          placeholder="Enter street address"
          appearance="filled"
          autoComplete="street-address"
          maxLength={255}
          error={
            errors.addressLine1 ? 'Enter a valid street address.' : undefined
          }
          required
          {...register('addressLine1')}
        />

        {isEditing && (
          <div className="bg-rewear-soft space-y-4 p-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">Pickup shipping providers</h2>
            </div>
            <GhnPickupProvider
              ghn={ghn}
              status={syncStatus}
              shopId={connection?.ghnShopId}
              connectionError={connectionError}
              onDisconnect={disconnectGhn}
              onConnect={connectGhn}
              addressNeedsSave={addressNeedsSave}
              connecting={saving}
            />
          </div>
        )}

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

      {/* Right Column: Context Summary Card (5 cols) */}
      <aside className="space-y-4 lg:col-span-5 xl:col-span-5">
        <div className="bg-rewear-soft border-rewear-border space-y-6 border p-6">
          <h2 className="text-[24px] leading-[30px] font-semibold tracking-[-0.02em]">
            Pickup address
          </h2>

          <div className="text-rewear-muted space-y-2 text-sm leading-6">
            {(contactName.trim() || phone.trim()) && (
              <p className="text-rewear-text font-semibold">
                {[contactName.trim(), phone.trim()].filter(Boolean).join(' · ')}
              </p>
            )}
            {addressLine1.trim() && <p>{addressLine1.trim()}</p>}
            {(wardName || districtName || provinceName) && (
              <p>
                {[wardName, districtName, provinceName]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
            {!contactName.trim() &&
              !phone.trim() &&
              !addressLine1.trim() &&
              !wardName &&
              !districtName &&
              !provinceName && <p>No pickup details yet.</p>}
          </div>

          <div className="border-rewear-border border-t pt-4">
            <button
              type="submit"
              disabled={saving || !addressNeedsSave}
              className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 disabled:bg-rewear-border disabled:text-rewear-muted flex min-h-12 w-full items-center justify-center text-sm font-semibold transition disabled:cursor-not-allowed"
            >
              {saving
                ? 'Saving pickup address…'
                : isEditing
                  ? 'Save pickup address'
                  : 'Create shop'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href={isEditing ? '/selling' : '/selling/open'}
              className="text-rewear-muted hover:text-rewear-text text-xs underline"
            >
              {isEditing ? 'Back to shop settings' : 'Back to shop details'}
            </Link>
          </div>
        </div>
      </aside>
    </form>
  );
}
