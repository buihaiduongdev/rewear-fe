'use client';

import { useMemo } from 'react';

import type {
  AdministrativeDivisionControllerFindAllProvinces200,
  AdministrativeDivisionControllerFindWardsByProvinceCode200,
} from '@/shared/api/models';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/components/ui/combobox';

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

type DivisionOption = {
  value: string;
  label: string;
};

function normalizeVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}

const filterDivision = (item: DivisionOption, query: string) => {
  if (!query) return true;
  const normItem = normalizeVietnamese(item.label);
  const normQuery = normalizeVietnamese(query);
  return normItem.includes(normQuery);
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
  provinceLabel = 'Tỉnh / Thành phố',
  wardLabel = 'Phường / Xã',
  rounded = false,
  className = '',
  errorClassName = 'text-destructive',
}: AdministrativeDivisionFieldsProps) {
  const provinceOptions: DivisionOption[] = useMemo(
    () =>
      provinces.data?.data.map((p) => ({
        value: p.code,
        label: p.name,
      })) ?? [],
    [provinces.data?.data],
  );

  const selectedProvince = useMemo(
    () => provinceOptions.find((p) => p.value === provinceCode) ?? null,
    [provinceOptions, provinceCode],
  );

  const wardOptions: DivisionOption[] = useMemo(
    () =>
      wards.data?.data.map((w) => ({
        value: w.code,
        label: w.name,
      })) ?? [],
    [wards.data?.data],
  );

  const selectedWard = useMemo(
    () => wardOptions.find((w) => w.value === wardCode) ?? null,
    [wardOptions, wardCode],
  );

  const containerClass = `bg-rewear-soft block space-y-1.5 px-4 py-3 ${
    rounded ? 'rounded-lg' : ''
  }`;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hidden inputs to preserve standard form submission */}
      <input type="hidden" name="provinceCode" value={provinceCode} />
      <input type="hidden" name="wardCode" value={wardCode} />

      {/* Province / City Searchable Combobox */}
      <div>
        <div className={containerClass}>
          <span className="text-rewear-muted block text-xs font-semibold uppercase tracking-wider">
            {provinceLabel}
          </span>
          <Combobox<DivisionOption>
            items={provinceOptions}
            value={selectedProvince}
            onValueChange={(val: DivisionOption | null) => {
              onProvinceChange(val?.value ?? '');
            }}
            filter={filterDivision}
            disabled={disabled || provinces.isPending || !!provinces.error}
          >
            <ComboboxInput
              placeholder={
                provinces.isPending
                  ? 'Đang tải danh sách tỉnh thành…'
                  : 'Gõ để tìm tỉnh hoặc thành phố…'
              }
              showTrigger
              showClear={!!provinceCode}
              className="h-8 w-full border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-within:ring-0"
            />
            <ComboboxContent className="max-h-60 overflow-y-auto">
              <ComboboxEmpty className="text-rewear-muted py-3 text-center text-xs">
                Không tìm thấy tỉnh / thành phố phù hợp
              </ComboboxEmpty>
              <ComboboxList>
                {provinceOptions.map((item) => (
                  <ComboboxItem
                    key={item.value}
                    value={item}
                    className="hover:bg-rewear-soft cursor-pointer px-3 py-2 text-sm"
                  >
                    {item.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
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

      {/* Ward / Commune Searchable Combobox */}
      <div>
        <div className={containerClass}>
          <span className="text-rewear-muted block text-xs font-semibold uppercase tracking-wider">
            {wardLabel}
          </span>
          <Combobox<DivisionOption>
            items={wardOptions}
            value={selectedWard}
            onValueChange={(val: DivisionOption | null) => {
              onWardChange(val?.value ?? '');
            }}
            filter={filterDivision}
            disabled={
              disabled || !provinceCode || wards.isPending || !!wards.error
            }
          >
            <ComboboxInput
              placeholder={
                !provinceCode
                  ? 'Vui lòng chọn tỉnh / thành phố trước'
                  : wards.isPending
                    ? 'Đang tải danh sách phường xã…'
                    : 'Gõ để tìm phường hoặc xã…'
              }
              showTrigger
              showClear={!!wardCode}
              className="h-8 w-full border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-within:ring-0"
            />
            <ComboboxContent className="max-h-60 overflow-y-auto">
              <ComboboxEmpty className="text-rewear-muted py-3 text-center text-xs">
                Không tìm thấy phường / xã phù hợp
              </ComboboxEmpty>
              <ComboboxList>
                {wardOptions.map((item) => (
                  <ComboboxItem
                    key={item.value}
                    value={item}
                    className="hover:bg-rewear-soft cursor-pointer px-3 py-2 text-sm"
                  >
                    {item.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
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
