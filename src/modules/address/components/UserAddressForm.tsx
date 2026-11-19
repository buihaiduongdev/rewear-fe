'use client';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type { UserAddressControllerCreate201Data } from '@/shared/api/models';
import { Button } from '@/shared/components/ui/button';
import { BaseInputField } from '@/shared/components/ui/input/BaseInputField';

import { useUserAddressForm } from '../hooks/use-user-address-form';
import { AdministrativeDivisionFields } from './AdministrativeDivisionFields';

export type UserAddressFormProps = {
  onSuccess: (address: UserAddressControllerCreate201Data) => void;
  onCancel?: () => void;
  className?: string;
};

export function UserAddressForm({
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
    provinceCode,
    wardCode,
    handleProvinceChange,
    handleWardChange,
    provinces,
    wards,
  } = useUserAddressForm({
    onSuccess,
  });

  return (
    <form onSubmit={onSubmit} noValidate className={`space-y-6 ${className}`}>
      <fieldset disabled={isPending} className="min-w-0 space-y-6">
        <BaseInputField
          id="delivery-recipient"
          label="Recipient"
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
          appearance="filled"
          type="tel"
          autoComplete="tel"
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
          provinceLabel="Province / City"
          wardLabel="Ward"
        />

        <BaseInputField
          id="delivery-street"
          label="Street address"
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
            className="size-4 rounded border-rewear-border"
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
            Hủy
          </Button>
        )}
        <Button
          type="submit"
          loading={isPending}
          disabled={
            isPending ||
            provinces.isPending ||
            !!provinces.error ||
            !!(provinceCode && wards.error)
          }
          className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 min-h-11 w-full sm:w-auto"
        >
          {isPending ? 'Saving…' : 'Save address'}
        </Button>
      </div>
    </form>
  );
}
