'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type {
  ProductControllerFindManaged200Data,
  ShippingControllerPackageOptions200Data,
  ShippingControllerUpdatePackage200,
} from '@/shared/api/models';
import { useShippingControllerUpdatePackage } from '@/shared/api/query-generated/shipping/shipping';
import { ShippingControllerUpdatePackageBody } from '@/shared/api/zod-generated/shipping/shipping';
import { BaseInputField } from '@/shared/components/ui/input/BaseInputField';

type Props = {
  product: ProductControllerFindManaged200Data;
  options: ShippingControllerPackageOptions200Data;
  disabled: boolean;
  onBeforeSave: () => Promise<void>;
  onDirty: () => void;
  onSaving: (saving: boolean) => void;
  onSaved: (response: ShippingControllerUpdatePackage200) => void;
  onRefresh: () => void;
};
export function PackageForm({
  product,
  options,
  disabled,
  onBeforeSave,
  onDirty,
  onSaving,
  onSaved,
  onRefresh,
}: Props) {
  const current = product.shippingPackage;
  const [weightChoice, setWeightChoice] = useState(
    current?.weight.mode === 'CUSTOM'
      ? 'CUSTOM'
      : (current?.weight.preset ?? ''),
  );
  const [grams, setGrams] = useState(
    current?.weight.mode === 'CUSTOM' ? String(current.weight.grams) : '',
  );
  const [sizeChoice, setSizeChoice] = useState(
    current?.size.mode === 'CUSTOM' ? 'CUSTOM' : (current?.size.preset ?? ''),
  );
  const [length, setLength] = useState(
    current?.size.mode === 'CUSTOM' ? String(current.size.lengthCm) : '',
  );
  const [width, setWidth] = useState(
    current?.size.mode === 'CUSTOM' ? String(current.size.widthCm) : '',
  );
  const [height, setHeight] = useState(
    current?.size.mode === 'CUSTOM' ? String(current.size.heightCm) : '',
  );
  const [error, setError] = useState('');
  const save = useShippingControllerUpdatePackage({
    mutation: {
      onMutate: onBeforeSave,
      meta: { skipSuccessToast: true, skipErrorToast: true },
    },
  });
  const editable = !['HELD', 'SOLD', 'SUSPENDED'].includes(product.status);
  const dirty = () => {
    onDirty();
    setError('');
  };
  const parsed = ShippingControllerUpdatePackageBody.safeParse({
    weight:
      weightChoice === 'CUSTOM'
        ? { mode: 'CUSTOM', grams: Number(grams) }
        : { mode: 'RANGE', preset: weightChoice },
    size:
      sizeChoice === 'CUSTOM'
        ? {
            mode: 'CUSTOM',
            lengthCm: Number(length),
            widthCm: Number(width),
            heightCm: Number(height),
          }
        : { mode: 'RANGE', preset: sizeChoice },
  });
  let preview = '';
  if (parsed.success) {
    const data = parsed.data;
    const weightValue = data.weight;
    const sizeValue = data.size;
    const weight =
      weightValue.mode === 'CUSTOM'
        ? weightValue.grams
        : options.weightPresets.find((p) => p.id === weightValue.preset)
            ?.upperGrams;
    const size =
      sizeValue.mode === 'CUSTOM'
        ? sizeValue
        : options.sizePresets.find((p) => p.id === sizeValue.preset);
    if (weight && size)
      preview = `${weight} g · ${Math.ceil(size.lengthCm)} × ${Math.ceil(size.widthCm)} × ${Math.ceil(size.heightCm)} cm`;
  }
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!editable || disabled || save.isPending) return;
    if (!parsed.success) {
      setError(
        'Choose a valid weight and package size. Custom values must be positive and within the displayed limits.',
      );
      return;
    }
    setError('');
    onSaving(true);
    save.mutate(
      { id: product.id, data: parsed.data },
      {
        onSuccess: onSaved,
        onError: onRefresh,
        onSettled: () => onSaving(false),
      },
    );
  };
  return (
    <form onSubmit={submit} noValidate className="max-w-2xl space-y-6">
      {!editable && (
        <p role="status">
          This listing cannot be edited while reserved, sold or suspended.
        </p>
      )}
      {editable && product.status !== 'DRAFT' && (
        <p>
          Saving new package details returns this listing to draft for review.
        </p>
      )}
      <p>
        Ranges use their upper bounds for fee estimates. Custom dimensions are
        rounded up to whole centimetres. Live shipping quotes are not available
        yet.
      </p>
      <fieldset
        disabled={!editable || disabled || save.isPending}
        className="space-y-6"
      >
        <label className="bg-rewear-soft block space-y-2 rounded-lg px-4 py-3">
          <span className="block text-sm font-semibold">Packed weight</span>
          <select
            aria-label="Packed weight"
            className="h-6 w-full min-w-0 bg-transparent text-base leading-6"
            value={weightChoice}
            onChange={(e) => {
              setWeightChoice(e.target.value);
              dirty();
            }}
          >
            <option value="">Choose a weight range</option>
            {options.weightPresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
            <option value="CUSTOM">Enter exact weight</option>
          </select>
        </label>
        {weightChoice === 'CUSTOM' && (
          <BaseInputField
            id="package-grams"
            label="Packed weight (g)"
            appearance="filled"
            type="number"
            min={1}
            max={options.customLimits.maxWeightGrams}
            step={1}
            value={grams}
            onChange={(e) => {
              setGrams(e.target.value);
              dirty();
            }}
          />
        )}
        <label className="bg-rewear-soft block space-y-2 rounded-lg px-4 py-3">
          <span className="block text-sm font-semibold">
            Outer package size
          </span>
          <select
            aria-label="Outer package size"
            className="h-6 w-full min-w-0 bg-transparent text-base leading-6"
            value={sizeChoice}
            onChange={(e) => {
              setSizeChoice(e.target.value);
              dirty();
            }}
          >
            <option value="">Choose a size range</option>
            {options.sizePresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
            <option value="CUSTOM">Enter exact dimensions</option>
          </select>
        </label>
        {sizeChoice === 'CUSTOM' && (
          <div className="grid gap-4 sm:grid-cols-3">
            <BaseInputField
              id="package-length"
              label="Length (cm)"
              appearance="filled"
              type="number"
              min={0}
              max={options.customLimits.maxDimensionCm}
              step="any"
              value={length}
              onChange={(e) => {
                setLength(e.target.value);
                dirty();
              }}
            />
            <BaseInputField
              id="package-width"
              label="Width (cm)"
              appearance="filled"
              type="number"
              min={0}
              max={options.customLimits.maxDimensionCm}
              step="any"
              value={width}
              onChange={(e) => {
                setWidth(e.target.value);
                dirty();
              }}
            />
            <BaseInputField
              id="package-height"
              label="Height (cm)"
              appearance="filled"
              type="number"
              min={0}
              max={options.customLimits.maxDimensionCm}
              step="any"
              value={height}
              onChange={(e) => {
                setHeight(e.target.value);
                dirty();
              }}
            />
          </div>
        )}
        <p className="text-rewear-muted text-sm">
          Custom limits: {options.customLimits.maxWeightGrams} g and{' '}
          {options.customLimits.maxDimensionCm} cm per dimension. Carriers may
          apply stricter limits.
        </p>
        {preview && (
          <output className="block" aria-label="Package estimate">
            Values used for estimates: {preview}
          </output>
        )}
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
