'use client';

import { useState } from 'react';

import {
  useAdministrativeDivisionControllerFindAllProvinces,
  useAdministrativeDivisionControllerFindWardsByProvinceCode,
} from '@/shared/api/query-generated/administrative-divisions/administrative-divisions';

export type UseAdministrativeDivisionsOptions = {
  provinceCode?: string;
  wardCode?: string;
  initialProvinceCode?: string;
  initialWardCode?: string;
  onProvinceChange?: (provinceCode: string) => void;
  onWardChange?: (wardCode: string) => void;
};

export function useAdministrativeDivisions(
  options: UseAdministrativeDivisionsOptions = {},
) {
  const [internalProvinceCode, setInternalProvinceCode] = useState(
    options.provinceCode ?? options.initialProvinceCode ?? '',
  );
  const [internalWardCode, setInternalWardCode] = useState(
    options.wardCode ?? options.initialWardCode ?? '',
  );

  // Controlled provinceCode takes priority, or initialProvinceCode if provided/updated
  const provinceCode =
    options.provinceCode ??
    (options.initialProvinceCode !== undefined
      ? options.initialProvinceCode
      : internalProvinceCode);

  const wardCode =
    options.wardCode ??
    (options.initialWardCode !== undefined
      ? options.initialWardCode
      : internalWardCode);

  const provinces = useAdministrativeDivisionControllerFindAllProvinces({
    query: {
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60 * 24,
    },
  });
  const wards = useAdministrativeDivisionControllerFindWardsByProvinceCode(
    provinceCode,
    {
      query: {
        enabled: !!provinceCode,
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60 * 24,
      },
    },
  );

  const setProvinceCode = (code: string) => {
    setInternalProvinceCode(code);
    setInternalWardCode('');
    options.onProvinceChange?.(code);
  };

  const setWardCode = (code: string) => {
    setInternalWardCode(code);
    options.onWardChange?.(code);
  };

  const refetch = () => {
    if (provinces.isError) void provinces.refetch();
    if (provinceCode && wards.isError) void wards.refetch();
  };

  return {
    provinceCode,
    setProvinceCode,
    wardCode,
    setWardCode,
    provinces,
    wards,
    isLoading: provinces.isPending || (!!provinceCode && wards.isPending),
    error: provinces.error || (provinceCode ? wards.error : null),
    refetch,
  };
}
