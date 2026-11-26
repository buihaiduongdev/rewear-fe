'use client';

import type { UserAddressControllerCreate201Data } from '@/shared/api/models';
import {
  useUserAddressControllerCreate,
  useUserAddressControllerUpdate,
} from '@/shared/api/query-generated/user-addresses/user-addresses';
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
  addressId?: string;
  initialValues?: Partial<UserAddressFormValues>;
  onSuccess?: (address: UserAddressControllerCreate201Data) => void;
};

const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

export function useUserAddressForm({
  addressId,
  initialValues,
  onSuccess,
}: UseUserAddressFormOptions = {}) {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
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
  const update = useUserAddressControllerUpdate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const handleProvinceChange = (id: string) => {
    const num = Number(id) || '';
    setValue('provinceId', num, { shouldValidate: true });
    setValue('districtId', '', { shouldValidate: false });
    setValue('wardCode', '', { shouldValidate: false });
    clearErrors(['provinceId', 'districtId', 'wardCode']);
  };

  const handleDistrictChange = (id: string) => {
    const num = Number(id) || '';
    setValue('districtId', num, { shouldValidate: true });
    setValue('wardCode', '', { shouldValidate: false });
    clearErrors(['districtId', 'wardCode']);
  };

  const handleWardChange = (code: string) => {
    setValue('wardCode', code, { shouldValidate: true });
    clearErrors('wardCode');
  };

  const onSubmit = handleSubmit((rawData) => {
    const recipientName = rawData.recipientName.trim();
    const phone = rawData.phone.replace(/\s+/g, '');
    const addressLine1 = rawData.addressLine1.trim();

    let hasError = false;
    if (!recipientName) {
      setError('recipientName', { message: 'Recipient name is required.' });
      hasError = true;
    }
    if (!PHONE_REGEX.test(phone)) {
      setError('phone', {
        message: 'Enter a valid phone number (8–15 digits).',
      });
      hasError = true;
    }
    if (!rawData.provinceId) {
      setError('provinceId', { message: 'Select a province or city.' });
      hasError = true;
    }
    if (!rawData.districtId) {
      setError('districtId', { message: 'Select a district.' });
      hasError = true;
    }
    if (!rawData.wardCode) {
      setError('wardCode', { message: 'Select a ward or commune.' });
      hasError = true;
    }
    if (!addressLine1) {
      setError('addressLine1', { message: 'Street address is required.' });
      hasError = true;
    }
    if (hasError) return;

    const payload = {
      recipientName,
      phone,
      addressLine1,
      provinceId: Number(rawData.provinceId),
      districtId: Number(rawData.districtId),
      wardCode: rawData.wardCode,
      countryCode: 'VN' as const,
      isDefault: Boolean(rawData.isDefault),
    };

    if (addressId) {
      update.mutate(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { id: addressId, data: payload as any },
        {
          onSuccess: (response) => {
            onSuccess?.(response.data);
          },
        },
      );
      return;
    }

    create.mutate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { data: payload as any },
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
    isPending: addressId ? update.isPending : create.isPending,
    createError: addressId ? update.error : create.error,
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
