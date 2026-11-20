'use client';

import { AdministrativeDivisionFields } from '@/modules/address';
import { getApiErrorMessage } from '@/shared/api/api-error';
import type { PickupLocationControllerSaveShop200 } from '@/shared/api/models';
import { Button } from '@/shared/components/ui/button';
import { BaseInputField } from '@/shared/components/ui/input/BaseInputField';

import { usePickupAddressForm } from '../hooks/use-pickup-address-form';

type Props = {
  initial: PickupLocationControllerSaveShop200['data']['location'];
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
      className="w-full max-w-[720px] space-y-6"
      onChange={() => {
        if (message) setMessage('');
      }}
    >
      <fieldset disabled={saving} className="min-w-0 space-y-6">
        <BaseInputField
          id="pickup-contact"
          label="Contact name"
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
          appearance="filled"
          autoComplete="street-address"
          maxLength={255}
          error={errors.addressLine1?.message}
          required
          {...register('addressLine1')}
        />

        <Button
          type="submit"
          variant="ghost"
          loading={saving}
          className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent h-[52px] w-full rounded-none px-5 text-sm font-normal sm:w-[360px]"
        >
          Save pickup address
        </Button>
      </fieldset>

      {message && <p role="status">{message}</p>}

      {!!apiError && (
        <div role="alert" className="space-y-2">
          <p>{getApiErrorMessage(apiError)}</p>
          <button
            type="button"
            disabled={saving}
            className="min-h-11 underline"
            onClick={refetchDivisions}
          >
            Retry address directory
          </button>
        </div>
      )}
    </form>
  );
}
