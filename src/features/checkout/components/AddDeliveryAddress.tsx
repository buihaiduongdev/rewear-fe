'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type { UserAddressControllerCreate201Data } from '@/shared/api/models';
import {
  useAdministrativeDivisionControllerFindAllProvinces,
  useAdministrativeDivisionControllerFindWardsByProvinceCode,
} from '@/shared/api/query-generated/administrative-divisions/administrative-divisions';
import { useUserAddressControllerCreate } from '@/shared/api/query-generated/user-addresses/user-addresses';
import { UserAddressControllerCreateBody } from '@/shared/api/zod-generated/user-addresses/user-addresses';
import { BaseInputField } from '@/shared/components/ui/input/BaseInputField';
import { Dialog } from '@base-ui/react/dialog';

export function AddDeliveryAddress({
  disabled,
  onCreated,
}: {
  disabled: boolean;
  onCreated: (address: UserAddressControllerCreate201Data) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!saving) setOpen(next);
      }}
    >
      <Dialog.Trigger
        disabled={disabled}
        className="min-h-11 text-left text-sm font-semibold underline underline-offset-4"
      >
        Add address
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Popup className="bg-rewear-surface text-rewear-text fixed bottom-0 left-0 z-50 max-h-[95dvh] w-full overflow-y-auto p-4 outline-none md:top-1/2 md:bottom-auto md:left-1/2 md:w-[520px] md:-translate-x-1/2 md:-translate-y-1/2 md:p-8">
          <Dialog.Close
            disabled={saving}
            className="mb-6 min-h-11 text-left text-sm font-semibold"
          >
            Close ×
          </Dialog.Close>
          <Dialog.Title className="mb-6 text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Add address
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Save a delivery address in Vietnam for this checkout.
          </Dialog.Description>
          {open && (
            <AddressForm
              onSaving={setSaving}
              onCreated={(address) => {
                onCreated(address);
                setOpen(false);
              }}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AddressForm({
  onSaving,
  onCreated,
}: {
  onSaving: (value: boolean) => void;
  onCreated: (address: UserAddressControllerCreate201Data) => void;
}) {
  const provinces = useAdministrativeDivisionControllerFindAllProvinces();
  const [provinceCode, setProvinceCode] = useState('');
  const [wardCode, setWardCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const wards = useAdministrativeDivisionControllerFindWardsByProvinceCode(
    provinceCode,
    { query: { enabled: !!provinceCode } },
  );
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
  const queryError = provinces.error || (provinceCode && wards.error);
  const selectClass =
    'block min-h-6 w-full min-w-0 bg-transparent text-base outline-offset-4';
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
        <div>
          <label className="bg-rewear-soft block space-y-2 px-4 py-3">
            <span className="block text-sm font-semibold">Province / City</span>
            <select
              aria-label="Province / City"
              name="provinceCode"
              value={provinceCode}
              onChange={(e) => {
                setProvinceCode(e.target.value);
                setWardCode('');
                setErrors((previous) => ({
                  ...previous,
                  provinceCode: '',
                  wardCode: '',
                }));
              }}
              className={selectClass}
              disabled={provinces.isPending || provinces.isError}
              aria-invalid={!!errors.provinceCode}
              aria-describedby={
                errors.provinceCode ? 'province-error' : undefined
              }
              required
            >
              <option value="">
                {provinces.isPending
                  ? 'Loading provinces…'
                  : 'Choose a province or city'}
              </option>
              {provinces.data?.data.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          {errors.provinceCode && (
            <p id="province-error" className="mt-2 text-sm" role="alert">
              {errors.provinceCode}
            </p>
          )}
        </div>
        <div>
          <label className="bg-rewear-soft block space-y-2 px-4 py-3">
            <span className="block text-sm font-semibold">Ward</span>
            <select
              aria-label="Ward"
              name="wardCode"
              value={wardCode}
              onChange={(e) => setWardCode(e.target.value)}
              className={selectClass}
              disabled={!provinceCode || wards.isPending || wards.isError}
              aria-invalid={!!errors.wardCode}
              aria-describedby={errors.wardCode ? 'ward-error' : undefined}
              required
            >
              <option value="">
                {provinceCode && wards.isPending
                  ? 'Loading wards…'
                  : 'Choose a ward'}
              </option>
              {wards.data?.data.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
          {errors.wardCode && (
            <p id="ward-error" className="mt-2 text-sm" role="alert">
              {errors.wardCode}
            </p>
          )}
        </div>
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
            onClick={() => {
              if (provinces.isError) void provinces.refetch();
              if (provinceCode && wards.isError) void wards.refetch();
            }}
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
