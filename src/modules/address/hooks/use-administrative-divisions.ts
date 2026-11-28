'use client';

import { useState } from 'react';

import { orvalRequest } from '@/shared/api/orval-request';
import { useQuery } from '@tanstack/react-query';

export type DivisionProvince = { id: number; name: string };
export type DivisionDistrict = { id: number; name: string; provinceId: number };
export type DivisionWard = { code: string; name: string; districtId: number };

export function useProvinces(options?: { skipErrorToast?: boolean }) {
  return useQuery({
    queryKey: ['/api/administrative-divisions/provinces'],
    queryFn: ({ signal }) =>
      orvalRequest<{ data: DivisionProvince[] }>({
        url: '/api/administrative-divisions/provinces',
        method: 'GET',
        signal,
      }),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    ...(options?.skipErrorToast ? { meta: { skipErrorToast: true } } : {}),
  });
}

export type UseAdministrativeDivisionsOptions = {
  provinceId?: number | '';
  districtId?: number | '';
  wardCode?: string;
  initialProvinceId?: number | '';
  initialDistrictId?: number | '';
  initialWardCode?: string;
  onProvinceChange?: (provinceId: number | '') => void;
  onDistrictChange?: (districtId: number | '') => void;
  onWardChange?: (wardCode: string) => void;
};

export function useAdministrativeDivisions(
  options: UseAdministrativeDivisionsOptions = {},
) {
  const [internalProvinceId, setInternalProvinceId] = useState<number | ''>(
    options.provinceId ?? options.initialProvinceId ?? '',
  );
  const [internalDistrictId, setInternalDistrictId] = useState<number | ''>(
    options.districtId ?? options.initialDistrictId ?? '',
  );
  const [internalWardCode, setInternalWardCode] = useState<string>(
    options.wardCode ?? options.initialWardCode ?? '',
  );

  const provinceId =
    options.provinceId ??
    (options.initialProvinceId !== undefined
      ? options.initialProvinceId
      : internalProvinceId);

  const districtId =
    options.districtId ??
    (options.initialDistrictId !== undefined
      ? options.initialDistrictId
      : internalDistrictId);

  const wardCode =
    options.wardCode ??
    (options.initialWardCode !== undefined
      ? options.initialWardCode
      : internalWardCode);

  const provinces = useProvinces();

  const districts = useQuery({
    queryKey: ['/api/administrative-divisions/districts', provinceId],
    queryFn: ({ signal }) =>
      orvalRequest<{ data: DivisionDistrict[] }>({
        url: `/api/administrative-divisions/provinces/${provinceId}/districts`,
        method: 'GET',
        signal,
      }),
    enabled: !!provinceId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const wards = useQuery({
    queryKey: ['/api/administrative-divisions/wards', districtId],
    queryFn: ({ signal }) =>
      orvalRequest<{ data: DivisionWard[] }>({
        url: `/api/administrative-divisions/districts/${districtId}/wards`,
        method: 'GET',
        signal,
      }),
    enabled: !!districtId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const setProvinceId = (id: number | '') => {
    setInternalProvinceId(id);
    setInternalDistrictId('');
    setInternalWardCode('');
    options.onProvinceChange?.(id);
    options.onDistrictChange?.('');
    options.onWardChange?.('');
  };

  const setDistrictId = (id: number | '') => {
    setInternalDistrictId(id);
    setInternalWardCode('');
    options.onDistrictChange?.(id);
    options.onWardChange?.('');
  };

  const setWardCode = (code: string) => {
    setInternalWardCode(code);
    options.onWardChange?.(code);
  };

  const refetch = () => {
    if (provinces.isError) void provinces.refetch();
    if (provinceId && districts.isError) void districts.refetch();
    if (districtId && wards.isError) void wards.refetch();
  };

  return {
    provinceId,
    setProvinceId,
    districtId,
    setDistrictId,
    wardCode,
    setWardCode,
    provinces,
    districts,
    wards,
    isLoading:
      provinces.isPending ||
      (!!provinceId && districts.isPending) ||
      (!!districtId && wards.isPending),
    error:
      provinces.error ||
      (provinceId ? districts.error : null) ||
      (districtId ? wards.error : null),
    refetch,
  };
}
