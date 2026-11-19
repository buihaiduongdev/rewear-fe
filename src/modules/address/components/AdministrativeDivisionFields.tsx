'use client';

import type {
  AdministrativeDivisionControllerFindAllProvinces200,
  AdministrativeDivisionControllerFindWardsByProvinceCode200,
} from '@/shared/api/models';

export type AdministrativeDivisionFieldsProps = {
  provinceCode: string;
  wardCode: string;
  onProvinceChange: (code: string) => void;
  onWardChange: (code: string) => void;
  provinces: {
    isPending: boolean;
    error: unknown;
    data?: AdministrativeDivisionControllerFindAllProvinces200;
  };
  wards: {
    isPending: boolean;
    error: unknown;
    data?: AdministrativeDivisionControllerFindWardsByProvinceCode200;
  };
  errors?: {
    provinceCode?: string;
    wardCode?: string;
  };
  disabled?: boolean;
  provinceLabel?: string;
  wardLabel?: string;
  rounded?: boolean;
  className?: string;
  errorClassName?: string;
};

export function AdministrativeDivisionFields({
  provinceCode,
  wardCode,
  onProvinceChange,
  onWardChange,
  provinces,
  wards,
  errors,
  disabled = false,
  provinceLabel = 'Province / City',
  wardLabel = 'Ward',
  rounded = false,
  className = '',
  errorClassName = 'text-destructive',
}: AdministrativeDivisionFieldsProps) {
  const selectClass =
    'block min-h-6 w-full min-w-0 bg-transparent text-base outline-offset-4';
  const labelClass = `bg-rewear-soft block space-y-2 px-4 py-3 ${
    rounded ? 'rounded-lg' : ''
  }`;

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <label className={labelClass}>
          <span className="block text-sm font-semibold">{provinceLabel}</span>
          <select
            aria-label={provinceLabel}
            name="provinceCode"
            value={provinceCode}
            onChange={(e) => onProvinceChange(e.target.value)}
            className={selectClass}
            disabled={disabled || provinces.isPending || !!provinces.error}
            aria-invalid={!!errors?.provinceCode}
            aria-describedby={
              errors?.provinceCode ? 'division-province-error' : undefined
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
        {errors?.provinceCode && (
          <p
            id="division-province-error"
            className={`mt-2 text-sm ${errorClassName}`}
            role="alert"
          >
            {errors.provinceCode}
          </p>
        )}
      </div>

      <div>
        <label className={labelClass}>
          <span className="block text-sm font-semibold">{wardLabel}</span>
          <select
            aria-label={wardLabel}
            name="wardCode"
            value={wardCode}
            onChange={(e) => onWardChange(e.target.value)}
            className={selectClass}
            disabled={
              disabled || !provinceCode || wards.isPending || !!wards.error
            }
            aria-invalid={!!errors?.wardCode}
            aria-describedby={
              errors?.wardCode ? 'division-ward-error' : undefined
            }
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
        {errors?.wardCode && (
          <p
            id="division-ward-error"
            className={`mt-2 text-sm ${errorClassName}`}
            role="alert"
          >
            {errors.wardCode}
          </p>
        )}
      </div>
    </div>
  );
}
