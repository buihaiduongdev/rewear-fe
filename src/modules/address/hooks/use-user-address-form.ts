'use client';

import type { UserAddressControllerCreate201Data } from '@/shared/api/models';
import { useUserAddressControllerCreate } from '@/shared/api/query-generated/user-addresses/user-addresses';
import { useForm, useWatch } from 'react-hook-form';

import { useAdministrativeDivisions } from './use-administrative-divisions';

export type UserAddressFormValues = {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  provinceId: number | '';
  districtId: number | '';
  wardCode: string;
  countryCode?: 'VN';
  isDefault?: boolean;
};

export type UseUserAddressFormOptions = {
  initialValues?: Partial<UserAddressFormValues>;
  onSuccess?: (address: UserAddressControllerCreate201Data) => void;
};

export function useUserAddressForm({
  initialValues,
  onSuccess,
}: UseUserAddressFormOptions = {}) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    clearErrors,
    formState: { errors },
  } = useForm<UserAddressFormValues>({
    defaultValues: {
      recipientName: initialValues?.recipientName ?? '',
      phone: initialValues?.phone ?? '',
      addressLine1: initialValues?.addressLine1 ?? '',
      provinceId: initialValues?.provinceId ?? '',
      districtId: initialValues?.districtId ?? '',
      wardCode: initialValues?.wardCode ?? '',
      countryCode: 'VN',
      isDefault: initialValues?.isDefault ?? false,
    },
    mode: 'onTouched',
  });

  const provinceId = useWatch({ control, name: 'provinceId' }) ?? '';
  const districtId = useWatch({ control, name: 'districtId' }) ?? '';
  const wardCode = useWatch({ control, name: 'wardCode' }) ?? '';

  const {
    provinces,
    districts,
    wards,
    error: divisionError,
    refetch: refetchDivisions,
  } = useAdministrativeDivisions({
    provinceId: typeof provinceId === 'number' ? provinceId : undefined,
    districtId: typeof districtId === 'number' ? districtId : undefined,
    wardCode,
  });

  const create = useUserAddressControllerCreate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const handleProvinceChange = (id: string) => {
    const num = Number(id) || '';
    setValue('provinceId', num, { shouldValidate: true });
    setValue('districtId', '', { shouldValidate: false });
    setValue('wardCode', '', { shouldValidate: false });
    clearErrors(['districtId', 'wardCode']);
  };

  const handleDistrictChange = (id: string) => {
    const num = Number(id) || '';
    setValue('districtId', num, { shouldValidate: true });
    setValue('wardCode', '', { shouldValidate: false });
    clearErrors('wardCode');
  };

  const handleWardChange = (code: string) => {
    setValue('wardCode', code, { shouldValidate: true });
  };

  const onSubmit = handleSubmit((data) => {
    create.mutate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { data: data as any },
      {
        onSuccess: (response) => {
          onSuccess?.(response.data);
        },
      },
    );
  });

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isPending: create.isPending,
    createError: create.error,
    divisionError,
    refetchDivisions,
    provinceId,
    districtId,
    wardCode,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    provinces,
    districts,
    wards,
  };
}
