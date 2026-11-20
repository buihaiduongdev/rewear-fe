'use client';

import { useState } from 'react';

import {
  useAdministrativeDivisionControllerFindAllProvinces,
  useAdministrativeDivisionControllerFindWardsByProvinceCode,
} from '@/shared/api/query-generated/administrative-divisions/administrative-divisions';

export type UseAdministrativeDivisionsOptions = {
  initialProvinceCode?: string;
  initialWardCode?: string;
  onProvinceChange?: (provinceCode: string) => void;
  onWardChange?: (wardCode: string) => void;
};

export function useAdministrativeDivisions(
  options: UseAdministrativeDivisionsOptions = {},
) {
  const [provinceCode, setProvinceCodeState] = useState(
    options.initialProvinceCode ?? '',
  );
  const [wardCode, setWardCodeState] = useState(options.initialWardCode ?? '');

  const provinces = useAdministrativeDivisionControllerFindAllProvinces();
  const wards = useAdministrativeDivisionControllerFindWardsByProvinceCode(
    provinceCode,
    { query: { enabled: !!provinceCode } },
  );

  const setProvinceCode = (code: string) => {
    setProvinceCodeState(code);
    setWardCodeState('');
    options.onProvinceChange?.(code);
  };

  const setWardCode = (code: string) => {
    setWardCodeState(code);
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
