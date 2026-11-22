'use client';

import { useMemo } from 'react';

import type {
  AdministrativeDivisionControllerFindAllProvinces200,
  AdministrativeDivisionControllerFindWardsByProvinceCode200,
} from '@/shared/api/models';
import {
  Combobox,
  ComboboxCollection,
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
  const trimmed = query.trim();
  if (!trimmed) return true;
  if (!item?.label) return false;
  const normItem = normalizeVietnamese(item.label);
  const normQuery = normalizeVietnamese(trimmed);
  return normItem.includes(normQuery);
};

function formatDivisionError(
  err?: string,
  fallback = 'Please make a valid selection',
): string | undefined {
  if (!err) return undefined;
  if (/pattern|regex|\/\\d/i.test(err)) {
    return fallback;
  }
  return err;
}

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
  wardLabel = 'Ward / Commune',
  rounded = false,
  className = '',
  errorClassName = 'text-destructive',
}: AdministrativeDivisionFieldsProps) {
  const formattedProvinceError = formatDivisionError(
    errors?.provinceCode,
    'Please select a valid province or city',
  );
  const formattedWardError = formatDivisionError(
    errors?.wardCode,
    'Please select a valid ward or commune',
  );

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
          <span className="text-rewear-muted block text-xs font-semibold tracking-wider uppercase">
            {provinceLabel}
          </span>
          <Combobox<DivisionOption>
            items={provinceOptions}
            value={selectedProvince}
            onValueChange={(val: DivisionOption | null) => {
              onProvinceChange(val?.value ?? '');
            }}
            filter={filterDivision}
            itemToStringLabel={(item: DivisionOption) => item?.label ?? ''}
            itemToStringValue={(item: DivisionOption) => item?.value ?? ''}
            isItemEqualToValue={(a: DivisionOption, b: DivisionOption) =>
              a?.value === b?.value
            }
            disabled={disabled || provinces.isPending || !!provinces.error}
          >
            <ComboboxInput
              placeholder={
                provinces.isPending
                  ? 'Loading provinces…'
                  : 'Type to search province or city…'
              }
              showTrigger
              showClear={!!provinceCode}
              className="h-8 w-full border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-within:ring-0"
            />
            <ComboboxContent className="max-h-60 overflow-y-auto">
              <ComboboxEmpty className="text-rewear-muted py-3 text-center text-xs">
                No province or city found
              </ComboboxEmpty>
              <ComboboxList>
                <ComboboxCollection>
                  {(item: DivisionOption) => (
                    <ComboboxItem
                      key={item.value}
                      value={item}
                      className="hover:bg-rewear-soft cursor-pointer px-3 py-2 text-sm"
                    >
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        {formattedProvinceError && (
          <p
            id="division-province-error"
            className={`mt-2 text-sm ${errorClassName}`}
            role="alert"
          >
            {formattedProvinceError}
          </p>
        )}
      </div>

      {/* Ward / Commune Searchable Combobox */}
      <div>
        <div className={containerClass}>
          <span className="text-rewear-muted block text-xs font-semibold tracking-wider uppercase">
            {wardLabel}
          </span>
          <Combobox<DivisionOption>
            items={wardOptions}
            value={selectedWard}
            onValueChange={(val: DivisionOption | null) => {
              onWardChange(val?.value ?? '');
            }}
            filter={filterDivision}
            itemToStringLabel={(item: DivisionOption) => item?.label ?? ''}
            itemToStringValue={(item: DivisionOption) => item?.value ?? ''}
            isItemEqualToValue={(a: DivisionOption, b: DivisionOption) =>
              a?.value === b?.value
            }
            disabled={
              disabled || !provinceCode || wards.isPending || !!wards.error
            }
          >
            <ComboboxInput
              placeholder={
                !provinceCode
                  ? 'Please select a province or city first'
                  : wards.isPending
                    ? 'Loading wards…'
                    : 'Type to search ward or commune…'
              }
              showTrigger
              showClear={!!wardCode}
              className="h-8 w-full border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-within:ring-0"
            />
            <ComboboxContent className="max-h-60 overflow-y-auto">
              <ComboboxEmpty className="text-rewear-muted py-3 text-center text-xs">
                No ward or commune found
              </ComboboxEmpty>
              <ComboboxList>
                <ComboboxCollection>
                  {(item: DivisionOption) => (
                    <ComboboxItem
                      key={item.value}
                      value={item}
                      className="hover:bg-rewear-soft cursor-pointer px-3 py-2 text-sm"
                    >
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        {formattedWardError && (
          <p
            id="division-ward-error"
            className={`mt-2 text-sm ${errorClassName}`}
            role="alert"
          >
            {formattedWardError}
          </p>
        )}
      </div>
    </div>
  );
}
