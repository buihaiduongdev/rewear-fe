'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type {
  ProductControllerFindManaged200Data,
  ShippingControllerUpdatePackage200,
} from '@/shared/api/models';
import { useShippingControllerUpdatePackage } from '@/shared/api/query-generated/shipping/shipping';
import { ShippingControllerUpdatePackageBody } from '@/shared/api/zod-generated/shipping/shipping';
import { BaseInputField } from '@/shared/components/ui/input/BaseInputField';

type Props = {
  product: ProductControllerFindManaged200Data;
  disabled: boolean;
  onBeforeSave: () => Promise<void>;
  onDirty: () => void;
  onSaving: (saving: boolean) => void;
  onSaved: (response: ShippingControllerUpdatePackage200) => void;
  onRefresh: () => void;
};
export function PackageForm({
  product,
  disabled,
  onBeforeSave,
  onDirty,
  onSaving,
  onSaved,
  onRefresh,
}: Props) {
  const [error, setError] = useState('');
  const save = useShippingControllerUpdatePackage({
    mutation: {
      onMutate: onBeforeSave,
      meta: { skipSuccessToast: true, skipErrorToast: true },
    },
  });
  const editable = !['HELD', 'SOLD', 'SUSPENDED'].includes(product.status);
  const fields = [
    { name: 'weightGrams', label: 'Packed weight (g)' },
    { name: 'lengthCm', label: 'Length (cm)' },
    { name: 'widthCm', label: 'Width (cm)' },
    { name: 'heightCm', label: 'Height (cm)' },
  ] as const;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editable || disabled || save.isPending) return;
    const form = new FormData(event.currentTarget);
    const result = ShippingControllerUpdatePackageBody.safeParse(
      Object.fromEntries(
        fields.map(({ name }) => [name, Number(form.get(name))]),
      ),
    );
    if (!result.success) {
      setError('Enter a valid positive weight and package dimensions.');
      return;
    }
    setError('');
    onSaving(true);
    save.mutate(
      { productId: product.id, data: result.data },
      {
        onSuccess: onSaved,
        onError: onRefresh,
        onSettled: () => onSaving(false),
      },
    );
  };
  return (
    <form
      onSubmit={submit}
      noValidate
      className="max-w-2xl space-y-6"
      onChange={() => {
        onDirty();
        setError('');
      }}
    >
      {!editable && (
        <p role="status">
          This listing cannot be edited while reserved, sold or suspended.
        </p>
      )}
      <fieldset
        disabled={!editable || disabled || save.isPending}
        className="space-y-6"
      >
        {fields.map(({ name, label }) => (
          <BaseInputField
            key={name}
            id={`package-${name}`}
            name={name}
            label={label}
            appearance="filled"
            type="number"
            min={1}
            step={1}
            defaultValue={product.shippingPackage?.[name] ?? ''}
            required
          />
        ))}
        <button
          type="submit"
          className="bg-rewear-accent text-rewear-text min-h-12 w-full px-5 text-sm"
        >
          {save.isPending ? 'Saving…' : 'Save package details'}
        </button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
      {save.isError && <p role="alert">{getApiErrorMessage(save.error)}</p>}
    </form>
  );
}
