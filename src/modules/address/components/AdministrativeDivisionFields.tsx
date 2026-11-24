'use client';

import { useMemo } from 'react';

import type {
  DivisionDistrict,
  DivisionProvince,
  DivisionWard,
} from '../hooks/use-administrative-divisions';
import { AddressDivisionSelect } from './AddressDivisionSelect';

export type AdministrativeDivisionFieldsProps = {
  provinceId: number | '';
  districtId: number | '';
  wardCode: string;
  onProvinceChange: (id: string) => void;
  onDistrictChange: (id: string) => void;
  onWardChange: (code: string) => void;
  provinces: {
    isPending: boolean;
    error: unknown;
    data?: { data: DivisionProvince[] };
  };
  districts: {
    isPending: boolean;
    error: unknown;
    data?: { data: DivisionDistrict[] };
  };
  wards: {
    isPending: boolean;
    error: unknown;
    data?: { data: DivisionWard[] };
  };
  errors?: {
    provinceId?: string;
    districtId?: string;
    wardCode?: string;
  };
  disabled?: boolean;
  provinceLabel?: string;
  districtLabel?: string;
  wardLabel?: string;
  rounded?: boolean;
  className?: string;
  errorClassName?: string;
};

export function AdministrativeDivisionFields({
  provinceId,
  districtId,
  wardCode,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  provinces,
  districts,
  wards,
  errors,
  disabled = false,
  provinceLabel = 'Province / City',
  districtLabel = 'District',
  wardLabel = 'Ward / Commune',
  rounded = false,
  className = '',
  errorClassName = 'text-destructive',
}: AdministrativeDivisionFieldsProps) {
  const provinceOptions = useMemo(
    () =>
      provinces.data?.data.map((p) => ({
        value: String(p.id),
        label: p.name,
      })) ?? [],
    [provinces.data?.data],
  );

  const districtOptions = useMemo(
    () =>
      districts.data?.data.map((d) => ({
        value: String(d.id),
        label: d.name,
      })) ?? [],
    [districts.data?.data],
  );

  const wardOptions = useMemo(
    () =>
      wards.data?.data.map((w) => ({
        value: w.code,
        label: w.name,
      })) ?? [],
    [wards.data?.data],
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <input type="hidden" name="provinceId" value={provinceId} />
      <input type="hidden" name="districtId" value={districtId} />
      <input type="hidden" name="wardCode" value={wardCode} />

      <AddressDivisionSelect
        label={provinceLabel}
        value={provinceId ? String(provinceId) : ''}
        onChange={onProvinceChange}
        options={provinceOptions}
        placeholder={
          provinces.isPending
            ? 'Loading provinces…'
            : 'Type to search province or city…'
        }
        emptyText="No province or city found"
        disabled={disabled || provinces.isPending || !!provinces.error}
        rounded={rounded}
        error={errors?.provinceId}
        errorClassName={errorClassName}
      />

      <AddressDivisionSelect
        label={districtLabel}
        value={districtId ? String(districtId) : ''}
        onChange={onDistrictChange}
        options={districtOptions}
        placeholder={
          !provinceId
            ? 'Please select a province or city first'
            : districts.isPending
              ? 'Loading districts…'
              : 'Type to search district…'
        }
        emptyText="No district found"
        disabled={
          disabled || !provinceId || districts.isPending || !!districts.error
        }
        rounded={rounded}
        error={errors?.districtId}
        errorClassName={errorClassName}
      />

      <AddressDivisionSelect
        label={wardLabel}
        value={wardCode}
        onChange={onWardChange}
        options={wardOptions}
        placeholder={
          !districtId
            ? 'Please select a district first'
            : wards.isPending
              ? 'Loading wards…'
              : 'Type to search ward or commune…'
        }
        emptyText="No ward or commune found"
        disabled={disabled || !districtId || wards.isPending || !!wards.error}
        rounded={rounded}
        error={errors?.wardCode}
        errorClassName={errorClassName}
      />
    </div>
  );
}
