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
  const [packageValues, setPackageValues] = useState({
    weightGrams: product.shippingPackage?.weightGrams ?? '',
    lengthCm: product.shippingPackage?.lengthCm ?? '',
    widthCm: product.shippingPackage?.widthCm ?? '',
    heightCm: product.shippingPackage?.heightCm ?? '',
  });

  const save = useShippingControllerUpdatePackage({
    mutation: {
      onMutate: onBeforeSave,
      meta: { skipSuccessToast: true, skipErrorToast: true },
    },
  });

  const editable = !['HELD', 'SOLD', 'SUSPENDED'].includes(product.status);
  const fields = [
    {
      name: 'weightGrams',
      label: 'Packed weight (g)',
      placeholder: 'e.g. 350',
    },
    { name: 'lengthCm', label: 'Length (cm)', placeholder: 'e.g. 25' },
    { name: 'widthCm', label: 'Width (cm)', placeholder: 'e.g. 20' },
    { name: 'heightCm', label: 'Height (cm)', placeholder: 'e.g. 5' },
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

  const currentWeight = Number(packageValues.weightGrams) || 350;
  const currentL = Number(packageValues.lengthCm) || 25;
  const currentW = Number(packageValues.widthCm) || 20;
  const currentH = Number(packageValues.heightCm) || 5;
  const volumetricWeightGrams = Math.round(
    (currentL * currentW * currentH) / 5,
  );

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12"
      onChange={(e) => {
        onDirty();
        setError('');
        const form = e.currentTarget;
        const formData = new FormData(form);
        setPackageValues({
          weightGrams: (formData.get('weightGrams') as string) ?? '',
          lengthCm: (formData.get('lengthCm') as string) ?? '',
          widthCm: (formData.get('widthCm') as string) ?? '',
          heightCm: (formData.get('heightCm') as string) ?? '',
        });
      }}
    >
      {/* Left Column: Form Fields (7 cols) */}
      <fieldset
        disabled={!editable || disabled || save.isPending}
        className="min-w-0 space-y-6 lg:col-span-7 xl:col-span-7"
      >
        {!editable && (
          <p
            role="status"
            className="border-rewear-border bg-rewear-soft text-rewear-muted border p-4 text-sm"
          >
            This listing cannot be edited while reserved, sold or suspended.
          </p>
        )}

        {fields.map(({ name, label, placeholder }) => (
          <BaseInputField
            key={name}
            id={`package-${name}`}
            name={name}
            label={label}
            placeholder={placeholder}
            appearance="filled"
            type="number"
            min={1}
            step={1}
            defaultValue={product.shippingPackage?.[name] ?? ''}
            required
          />
        ))}

        <div className="bg-rewear-soft space-y-1.5 p-4">
          <span className="text-rewear-muted block text-xs font-semibold tracking-wider uppercase">
            Shipping carrier ›
          </span>
          <p className="text-rewear-text text-sm font-medium">
            GHN · Standard delivery
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/10 text-destructive border p-4 text-sm"
          >
            {error}
          </p>
        )}
        {save.isError && (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/10 text-destructive border p-4 text-sm"
          >
            {getApiErrorMessage(save.error)}
          </p>
        )}
      </fieldset>

      {/* Right Column: Live Package Preview Card (5 cols) */}
      <aside className="space-y-4 lg:col-span-5 xl:col-span-5">
        <h2 className="text-[24px] leading-[30px] font-semibold tracking-[-0.02em]">
          Package preview
        </h2>

        <div className="bg-rewear-soft border-rewear-border space-y-6 border p-6">
          <div className="border-rewear-border border-b pb-4">
            <p className="text-rewear-text font-semibold">{product.title}</p>
            <p className="text-rewear-muted text-xs">
              ID: {product.id.slice(0, 8)}… · Status: {product.status}
            </p>
          </div>

          <div className="text-rewear-muted space-y-3 text-sm leading-6">
            <div className="flex items-center justify-between">
              <span>Actual weight:</span>
              <span className="text-rewear-text font-semibold">
                {packageValues.weightGrams
                  ? `${packageValues.weightGrams} g`
                  : `${currentWeight} g (est.)`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Dimensions (L × W × H):</span>
              <span className="text-rewear-text font-semibold">
                {currentL} × {currentW} × {currentH} cm
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Volumetric weight:</span>
              <span className="text-rewear-text font-semibold">
                ~{volumetricWeightGrams} g
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Carrier service:</span>
              <span className="text-rewear-text font-semibold">
                GHN Standard
              </span>
            </div>
          </div>

          <div className="border-rewear-border border-t pt-4">
            <button
              type="submit"
              disabled={!editable || disabled || save.isPending}
              className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 disabled:bg-rewear-border disabled:text-rewear-muted flex min-h-12 w-full items-center justify-center text-sm font-semibold transition disabled:cursor-not-allowed"
            >
              {save.isPending
                ? 'Saving package details…'
                : 'Save package details'}
            </button>
          </div>
        </div>
      </aside>
    </form>
  );
}
