'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type { UserAddressControllerCreate201Data } from '@/shared/api/models';
import { useUserAddressControllerCreate } from '@/shared/api/query-generated/user-addresses/user-addresses';
import { UserAddressControllerCreateBody } from '@/shared/api/zod-generated/user-addresses/user-addresses';
import { BaseInputField } from '@/shared/components/ui/input/BaseInputField';

import { useAdministrativeDivisions } from '../hooks/use-administrative-divisions';
import { AdministrativeDivisionFields } from './AdministrativeDivisionFields';

export type AddAddressDialogProps = {
  disabled?: boolean;
  onCreated: (address: UserAddressControllerCreate201Data) => void;
  trigger?: React.ReactNode;
};

export function AddAddressDialog({
  disabled = false,
  onCreated,
  trigger,
}: AddAddressDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!saving) setOpen(next);
      }}
    >
      <DialogTrigger
        disabled={disabled}
        className="min-h-11 cursor-pointer text-left text-sm font-semibold underline underline-offset-4"
      >
        {trigger ?? 'Add address'}
      </DialogTrigger>
      <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add address</DialogTitle>
          <DialogDescription className="sr-only">
            Save a delivery address in Vietnam for this checkout.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <AddressForm
            onSaving={setSaving}
            onCreated={(address) => {
              onCreated(address);
              setOpen(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AddressForm({
  onSaving,
  onCreated,
}: {
  onSaving: (value: boolean) => void;
  onCreated: (address: UserAddressControllerCreate201Data) => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {
    provinceCode,
    setProvinceCode,
    wardCode,
    setWardCode,
    provinces,
    wards,
    error: queryError,
    refetch,
  } = useAdministrativeDivisions({
    onProvinceChange: () => {
      setErrors((previous) => ({
        ...previous,
        provinceCode: '',
        wardCode: '',
      }));
    },
  });

  const create = useUserAddressControllerCreate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = UserAddressControllerCreateBody.safeParse({
      recipientName: String(form.get('recipientName') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim(),
      addressLine1: String(form.get('addressLine1') ?? '').trim(),
      provinceCode,
      wardCode,
      countryCode: 'VN',
      isDefault: form.get('isDefault') === 'on',
    });

    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key])
          next[key] =
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
    onSaving(true);
    create.mutate(
      { data: result.data },
      {
        onSuccess: (response) => onCreated(response.data),
        onSettled: () => onSaving(false),
      },
    );
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <fieldset disabled={create.isPending} className="min-w-0 space-y-6">
        <BaseInputField
          id="delivery-recipient"
          name="recipientName"
          label="Recipient"
          appearance="filled"
          autoComplete="name"
          maxLength={100}
          error={errors.recipientName}
          required
        />
        <BaseInputField
          id="delivery-phone"
          name="phone"
          label="Phone"
          appearance="filled"
          type="tel"
          autoComplete="tel"
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
          provinceLabel="Province / City"
          wardLabel="Ward"
        />
        <BaseInputField
          id="delivery-street"
          name="addressLine1"
          label="Street address"
          appearance="filled"
          autoComplete="street-address"
          maxLength={255}
          error={errors.addressLine1}
          required
        />
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" name="isDefault" />
          Set as default
        </label>
      </fieldset>
      {!!queryError && (
        <div role="alert">
          <p>{getApiErrorMessage(queryError)}</p>
          <button
            type="button"
            className="min-h-11 underline"
            onClick={refetch}
          >
            Retry loading locations
          </button>
        </div>
      )}
      {create.isError && <p role="alert">{getApiErrorMessage(create.error)}</p>}
      <button
        type="submit"
        className="bg-rewear-accent text-rewear-text min-h-12 w-full px-5 text-sm disabled:opacity-50"
        disabled={
          create.isPending ||
          provinces.isError ||
          !!(provinceCode && wards.isError)
        }
      >
        {create.isPending ? 'Saving…' : 'Save address'}
      </button>
    </form>
  );
}
