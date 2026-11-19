'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type * as zod from 'zod';

import { useAdministrativeDivisions } from '@/modules/address';
import type { PickupLocationControllerSaveShop200 } from '@/shared/api/models';
import { usePickupLocationControllerSaveShop } from '@/shared/api/query-generated/pickup-locations/pickup-locations';
import { PickupLocationControllerSaveShopBody } from '@/shared/api/zod-generated/pickup-locations/pickup-locations';

export type PickupAddressFormValues = zod.infer<
  typeof PickupLocationControllerSaveShopBody
>;

export type UsePickupAddressFormProps = {
  initial: PickupLocationControllerSaveShop200['data']['location'];
  shopId: string;
  onBeforeSave: () => Promise<void>;
  onSaving: (saving: boolean) => void;
  onSaved: (response: PickupLocationControllerSaveShop200) => void;
};

export function usePickupAddressForm({
  initial,
  shopId,
  onBeforeSave,
  onSaving,
  onSaved,
}: UsePickupAddressFormProps) {
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<PickupAddressFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(PickupLocationControllerSaveShopBody as any),
    defaultValues: {
      contactName: initial?.contactName ?? '',
      phone: initial?.phone ?? '',
      addressLine1: initial?.addressLine1 ?? '',
      provinceCode: initial?.provinceCode ?? '',
      wardCode: initial?.wardCode ?? '',
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
    onProvinceChange: () => setMessage(''),
    onWardChange: () => setMessage(''),
  });

  const config = {
    mutation: {
      onMutate: onBeforeSave,
      meta: { skipErrorToast: true, skipSuccessToast: true },
    },
  };
  const shopSave = usePickupLocationControllerSaveShop(config);
  const saving = shopSave.isPending;
  const apiError = divisionError || shopSave.error;

  const handleProvinceChange = (code: string) => {
    setValue('provinceCode', code, { shouldValidate: true });
    setValue('wardCode', '', { shouldValidate: true });
    setMessage('');
  };

  const handleWardChange = (code: string) => {
    setValue('wardCode', code, { shouldValidate: true });
    setMessage('');
  };

  const onSubmit = handleSubmit((data) => {
    onSaving(true);
    shopSave.mutate(
      { shopId, data },
      {
        onSuccess: (response: PickupLocationControllerSaveShop200) => {
          onSaved(response);
          setMessage(
            'Pickup address saved. Shipping availability has not been checked yet.',
          );
        },
        onSettled: () => onSaving(false),
      },
    );
  });

  return {
    register,
    errors,
    onSubmit,
    saving,
    apiError,
    message,
    setMessage,
    provinceCode,
    wardCode,
    handleProvinceChange,
    handleWardChange,
    provinces,
    wards,
    refetchDivisions,
  };
}
