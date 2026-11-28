'use client';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type { UserAddressControllerCreate201Data } from '@/shared/api/models';
import { Button } from '@/shared/components/ui/button';
import { BaseInputField } from '@/shared/components/ui/input/BaseInputField';

import {
  type UserAddressFormValues,
  useUserAddressForm,
} from '../hooks/use-user-address-form';
import { AdministrativeDivisionFields } from './AdministrativeDivisionFields';

export type UserAddressFormProps = {
  addressId?: string;
  initialValues?: Partial<UserAddressFormValues>;
  onSuccess: (address: UserAddressControllerCreate201Data) => void;
  onCancel?: () => void;
  className?: string;
};

export function UserAddressForm({
  addressId,
  initialValues,
  onSuccess,
  onCancel,
  className = '',
}: UserAddressFormProps) {
  const {
    register,
    errors,
    onSubmit,
    isPending,
    createError,
    divisionError,
    refetchDivisions,
    provinceId,
    districtId,
    wardCode,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    provinces,
    districts,
    wards,
  } = useUserAddressForm({
    addressId,
    initialValues,
    onSuccess,
  });

  return (
    <form onSubmit={onSubmit} noValidate className={`space-y-6 ${className}`}>
      <fieldset disabled={isPending} className="min-w-0 space-y-6">
        <BaseInputField
          id="delivery-recipient"
          label="Recipient"
          placeholder="e.g. Tran Minh Quan"
          appearance="filled"
          autoComplete="name"
          maxLength={100}
          error={errors.recipientName?.message}
          required
          {...register('recipientName')}
        />

        <BaseInputField
          id="delivery-phone"
          label="Phone"
          placeholder="e.g. 0918 345 889"
          appearance="filled"
          type="tel"
          autoComplete="tel"
          maxLength={16}
          error={errors.phone?.message}
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
            provinceId: errors.provinceId?.message,
            districtId: errors.districtId?.message,
            wardCode: errors.wardCode?.message,
          }}
          provinceLabel="Province / City"
          districtLabel="District"
          wardLabel="Ward / Commune"
        />

        <BaseInputField
          id="delivery-street"
          label="Street address"
          placeholder="e.g. 45 Xa Dan"
          appearance="filled"
          autoComplete="street-address"
          maxLength={255}
          error={errors.addressLine1?.message}
          required
          {...register('addressLine1')}
        />

        <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            className="border-rewear-border size-4 rounded"
            {...register('isDefault')}
          />
          Set as default
        </label>
      </fieldset>

      {!!divisionError && (
        <div role="alert" className="text-sm">
          <p>{getApiErrorMessage(divisionError)}</p>
          <button
            type="button"
            className="min-h-11 underline"
            onClick={refetchDivisions}
          >
            Retry loading locations
          </button>
        </div>
      )}

      {!!createError && (
        <p role="alert" className="text-destructive text-sm">
          {getApiErrorMessage(createError)}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onCancel}
            className="min-h-11"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          loading={isPending}
          disabled={
            isPending ||
            provinces.isPending ||
            !!provinces.error ||
            !!(provinceId && districts.isPending) ||
            !!(districtId && wards.isPending)
          }
          className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 min-h-11 w-full sm:w-auto"
        >
          {isPending ? 'Saving…' : 'Save address'}
        </Button>
      </div>
    </form>
  );
}
