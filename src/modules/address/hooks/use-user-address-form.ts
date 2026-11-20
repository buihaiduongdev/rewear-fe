'use client';

import type { UserAddressControllerCreate201Data } from '@/shared/api/models';
import { useUserAddressControllerCreate } from '@/shared/api/query-generated/user-addresses/user-addresses';
import { UserAddressControllerCreateBody } from '@/shared/api/zod-generated/user-addresses/user-addresses';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import type * as zod from 'zod';

import { useAdministrativeDivisions } from './use-administrative-divisions';

export type UserAddressFormValues = zod.infer<
  typeof UserAddressControllerCreateBody
>;

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
    formState: { errors },
  } = useForm<UserAddressFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(UserAddressControllerCreateBody as any),
    defaultValues: {
      recipientName: initialValues?.recipientName ?? '',
      phone: initialValues?.phone ?? '',
      addressLine1: initialValues?.addressLine1 ?? '',
      provinceCode: initialValues?.provinceCode ?? '',
      wardCode: initialValues?.wardCode ?? '',
      countryCode: 'VN',
      isDefault: initialValues?.isDefault ?? false,
    },
    mode: 'onTouched',
  });

  const provinceCode = useWatch({ control, name: 'provinceCode' }) ?? '';
  const wardCode = useWatch({ control, name: 'wardCode' }) ?? '';

  const {
    provinces,
    wards,
    error: divisionError,
    refetch: refetchDivisions,
  } = useAdministrativeDivisions({
    initialProvinceCode: provinceCode,
    initialWardCode: wardCode,
  });

  const create = useUserAddressControllerCreate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const handleProvinceChange = (code: string) => {
    setValue('provinceCode', code, { shouldValidate: true });
    setValue('wardCode', '', { shouldValidate: true });
  };

  const handleWardChange = (code: string) => {
    setValue('wardCode', code, { shouldValidate: true });
  };

  const onSubmit = handleSubmit((data) => {
    create.mutate(
      { data },
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
    provinceCode,
    wardCode,
    handleProvinceChange,
    handleWardChange,
    provinces,
    wards,
  };
}
