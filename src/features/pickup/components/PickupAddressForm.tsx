'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type { PickupLocationControllerSavePersonal200 } from '@/shared/api/models';
import {
  useAdministrativeDivisionControllerFindAllProvinces,
  useAdministrativeDivisionControllerFindWardsByProvinceCode,
} from '@/shared/api/query-generated/administrative-divisions/administrative-divisions';
import {
  usePickupLocationControllerSavePersonal,
  usePickupLocationControllerSaveShop,
} from '@/shared/api/query-generated/pickup-locations/pickup-locations';
import { PickupLocationControllerSavePersonalBody } from '@/shared/api/zod-generated/pickup-locations/pickup-locations';
import { Button } from '@/shared/components/ui/button';
import { BaseInputField } from '@/shared/components/ui/input/BaseInputField';

type Props = {
  initial: PickupLocationControllerSavePersonal200['data']['location'];
  shopId: string;
  onBeforeSave: () => Promise<void>;
  onSaving: (saving: boolean) => void;
  onSaved: (response: PickupLocationControllerSavePersonal200) => void;
};

export function PickupAddressForm({
  initial,
  shopId,
  onBeforeSave,
  onSaving,
  onSaved,
}: Props) {
  const [provinceCode, setProvinceCode] = useState(initial?.provinceCode ?? '');
  const [wardCode, setWardCode] = useState(initial?.wardCode ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const provinces = useAdministrativeDivisionControllerFindAllProvinces();
  const wards = useAdministrativeDivisionControllerFindWardsByProvinceCode(
    provinceCode,
    { query: { enabled: !!provinceCode } },
  );
  const config = {
    mutation: {
      onMutate: onBeforeSave,
      meta: { skipErrorToast: true, skipSuccessToast: true },
    },
  };
  const personalSave = usePickupLocationControllerSavePersonal(config);
  const shopSave = usePickupLocationControllerSaveShop(config);
  const saving = personalSave.isPending || shopSave.isPending;
  const apiError =
    provinces.error ||
    (provinceCode ? wards.error : null) ||
    personalSave.error ||
    shopSave.error;
  const clear = () => {
    setErrors({});
    setMessage('');
    personalSave.reset();
    shopSave.reset();
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const fields = new FormData(event.currentTarget);
    const result = PickupLocationControllerSavePersonalBody.safeParse({
      contactName: String(fields.get('contactName') ?? '').trim(),
      phone: String(fields.get('phone') ?? '').trim(),
      addressLine1: String(fields.get('addressLine1') ?? '').trim(),
      provinceCode,
      wardCode,
    });
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        next[key] ??=
          key === 'phone'
            ? 'Enter a phone number with 8–15 digits.'
            : key === 'provinceCode'
              ? 'Choose a province or city.'
              : key === 'wardCode'
                ? 'Choose a ward.'
                : 'This field is required or too long.';
      }
      setErrors(next);
      const first = event.currentTarget.elements.namedItem(
        Object.keys(next)[0],
      );
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    setErrors({});
    setMessage('');
    onSaving(true);
    const callbacks = {
      onSuccess: (response: PickupLocationControllerSavePersonal200) => {
        onSaved(response);
        setMessage(
          'Pickup address saved. Shipping availability has not been checked yet.',
        );
      },
      onSettled: () => onSaving(false),
    };
    if (shopId) shopSave.mutate({ shopId, data: result.data }, callbacks);
    else personalSave.mutate({ data: result.data }, callbacks);
  };
  return (
    <form
      noValidate
      onSubmit={submit}
      className="w-full max-w-[720px] space-y-6"
      onChange={() => {
        if (message) setMessage('');
      }}
    >
      <fieldset disabled={saving} className="min-w-0 space-y-6">
        <BaseInputField
          id="pickup-contact"
          name="contactName"
          label="Contact name"
          appearance="filled"
          autoComplete="name"
          defaultValue={initial?.contactName ?? ''}
          maxLength={100}
          error={errors.contactName}
          required
        />
        <BaseInputField
          id="pickup-phone"
          name="phone"
          label="Pickup phone"
          appearance="filled"
          autoComplete="tel"
          type="tel"
          defaultValue={initial?.phone ?? ''}
          maxLength={16}
          error={errors.phone}
          required
        />
        <div>
          <label className="bg-rewear-soft block space-y-2 rounded-lg px-4 py-3">
            <span className="block text-sm leading-5 font-semibold">
              Province / City
            </span>
            <select
              name="provinceCode"
              aria-label="Province / City"
              className="h-6 w-full min-w-0 bg-transparent text-base leading-6"
              value={provinceCode}
              disabled={provinces.isPending || !!provinces.error}
              aria-invalid={!!errors.provinceCode}
              aria-describedby={
                errors.provinceCode ? 'pickup-province-error' : undefined
              }
              onChange={(e) => {
                setProvinceCode(e.target.value);
                setWardCode('');
                clear();
              }}
            >
              <option value="">Choose a province or city</option>
              {provinces.data?.data.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </label>
          {errors.provinceCode && (
            <p
              id="pickup-province-error"
              className="text-destructive mt-2 text-sm"
            >
              {errors.provinceCode}
            </p>
          )}
        </div>
        <div>
          <label className="bg-rewear-soft block space-y-2 rounded-lg px-4 py-3">
            <span className="block text-sm leading-5 font-semibold">
              Ward / Commune
            </span>
            <select
              name="wardCode"
              aria-label="Ward / Commune"
              className="h-6 w-full min-w-0 bg-transparent text-base leading-6"
              value={wardCode}
              disabled={!provinceCode || wards.isPending || !!wards.error}
              aria-invalid={!!errors.wardCode}
              aria-describedby={
                errors.wardCode ? 'pickup-ward-error' : undefined
              }
              onChange={(e) => {
                setWardCode(e.target.value);
                clear();
              }}
            >
              <option value="">Choose a ward</option>
              {wards.data?.data.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
          </label>
          {errors.wardCode && (
            <p id="pickup-ward-error" className="text-destructive mt-2 text-sm">
              {errors.wardCode}
            </p>
          )}
        </div>
        <BaseInputField
          id="pickup-street"
          name="addressLine1"
          label="Street address"
          appearance="filled"
          autoComplete="street-address"
          defaultValue={initial?.addressLine1 ?? ''}
          maxLength={255}
          error={errors.addressLine1}
          required
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
            onClick={() => {
              void provinces.refetch();
              if (provinceCode) void wards.refetch();
            }}
          >
            Retry address directory
          </button>
        </div>
      )}
    </form>
  );
}
