'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import {
  AdministrativeDivisionFields,
  useAdministrativeDivisions,
} from '@/modules/address';
import { getApiErrorMessage } from '@/shared/api/api-error';
import type { PickupLocationControllerSaveShop200 } from '@/shared/api/models';
import { usePickupLocationControllerSaveShop } from '@/shared/api/query-generated/pickup-locations/pickup-locations';
import { PickupLocationControllerSaveShopBody } from '@/shared/api/zod-generated/pickup-locations/pickup-locations';
import { Button } from '@/shared/components/ui/button';
import { BaseInputField } from '@/shared/components/ui/input/BaseInputField';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const clear = () => {
    setErrors({});
    setMessage('');
    shopSave.reset();
  };

  const {
    provinceCode,
    setProvinceCode,
    wardCode,
    setWardCode,
    provinces,
    wards,
    error: divisionError,
    refetch: refetchDivisions,
  } = useAdministrativeDivisions({
    initialProvinceCode: initial?.provinceCode ?? '',
    initialWardCode: initial?.wardCode ?? '',
    onProvinceChange: () => clear(),
    onWardChange: () => clear(),
  });

  const config = {
    mutation: {
      onMutate: onBeforeSave,
      meta: { skipErrorToast: true, skipSuccessToast: true },
    },
  };
  const shopSave = usePickupLocationControllerSaveShop(config);
  const saving = shopSave.isPending;
  const apiError = divisionError || shopSave.error;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const fields = new FormData(event.currentTarget);
    const result = PickupLocationControllerSaveShopBody.safeParse({
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
      onSuccess: (response: PickupLocationControllerSaveShop200) => {
        onSaved(response);
        setMessage(
          'Pickup address saved. Shipping availability has not been checked yet.',
        );
      },
      onSettled: () => onSaving(false),
    };
    shopSave.mutate({ shopId, data: result.data }, callbacks);
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
        <AdministrativeDivisionFields
          provinceCode={provinceCode}
          wardCode={wardCode}
          onProvinceChange={setProvinceCode}
          onWardChange={setWardCode}
          provinces={provinces}
          wards={wards}
          errors={errors}
          rounded
          provinceLabel="Province / City"
          wardLabel="Ward / Commune"
        />
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
            onClick={refetchDivisions}
          >
            Retry address directory
          </button>
        </div>
      )}
    </form>
  );
}
