'use client';

import { useEffect, useState } from 'react';

import { useAdministrativeDivisions } from '@/modules/address';
import type {
  PickupLocationControllerSaveShop200,
  PickupLocationControllerSaveShopBody,
} from '@/shared/api/models';
import { usePickupLocationControllerSaveShop } from '@/shared/api/query-generated/pickup-locations/pickup-locations';
import { useForm, useWatch } from 'react-hook-form';

import { useGhnConnection } from './use-ghn-connection';

export type PickupAddressFormValues = {
  contactName: string;
  phone: string;
  addressLine1: string;
  provinceId: number | '';
  districtId: number | '';
  wardCode: string;
};

export type UsePickupAddressFormProps = {
  initial?: PickupLocationControllerSaveShop200['data']['location'] | null;
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
  const [connecting, setConnecting] = useState(false);
  const [ghnStatus, setGhnStatus] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState('');
  const ghn = useGhnConnection(shopId);

  const initialLoc = initial as
    (typeof initial & { provinceId?: number; districtId?: number }) | null;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<PickupAddressFormValues>({
    defaultValues: {
      contactName: initialLoc?.contactName ?? '',
      phone: initialLoc?.phone ?? '',
      addressLine1: initialLoc?.addressLine1 ?? '',
      provinceId: initialLoc?.provinceId ?? '',
      districtId: initialLoc?.districtId ?? '',
      wardCode: initialLoc?.wardCode ?? '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialLoc) {
      reset({
        contactName: initialLoc.contactName ?? '',
        phone: initialLoc.phone ?? '',
        addressLine1: initialLoc.addressLine1 ?? '',
        provinceId: initialLoc.provinceId ?? '',
        districtId: initialLoc.districtId ?? '',
        wardCode: initialLoc.wardCode ?? '',
      });
    }
  }, [initialLoc, reset]);

  const provinceId = useWatch({ control, name: 'provinceId' }) ?? '';
  const districtId = useWatch({ control, name: 'districtId' }) ?? '';
  const wardCode = useWatch({ control, name: 'wardCode' }) ?? '';
  const contactName = useWatch({ control, name: 'contactName' }) ?? '';
  const phone = useWatch({ control, name: 'phone' }) ?? '';
  const addressLine1 = useWatch({ control, name: 'addressLine1' }) ?? '';

  const addressNeedsSave =
    !initialLoc ||
    contactName !== initialLoc.contactName ||
    phone !== initialLoc.phone ||
    addressLine1 !== initialLoc.addressLine1 ||
    provinceId !== initialLoc.provinceId ||
    districtId !== initialLoc.districtId ||
    wardCode !== initialLoc.wardCode;

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
    onProvinceChange: () => setMessage(''),
    onDistrictChange: () => setMessage(''),
    onWardChange: () => setMessage(''),
  });

  const provinceName =
    provinces.data?.data.find((p) => p.id === provinceId)?.name ?? '';
  const districtName =
    districts.data?.data.find((d) => d.id === districtId)?.name ?? '';
  const wardName =
    wards.data?.data.find((w) => w.code === wardCode)?.name ?? '';

  const config = {
    mutation: {
      onMutate: onBeforeSave,
      meta: { skipErrorToast: true, skipSuccessToast: true },
    },
    request: {
      headers: shopId ? { 'x-shop-id': shopId } : undefined,
    },
  };
  const shopSave = usePickupLocationControllerSaveShop(config);
  const saving = shopSave.isPending || connecting;
  const apiError = divisionError || shopSave.error;

  const disconnectGhn = async () => {
    try {
      const response = await ghn.disconnect.mutateAsync();
      ghn.shopDetails.reset();
      setGhnStatus(null);
      setConnectionError('');
      onSaved(response);
      return true;
    } catch {
      return false;
    }
  };

  const handleProvinceChange = (id: string) => {
    const num = Number(id) || '';
    setValue('provinceId', num, { shouldValidate: true });
    setValue('districtId', '', { shouldValidate: false });
    setValue('wardCode', '', { shouldValidate: false });
    clearErrors(['districtId', 'wardCode']);
    setMessage('');
  };

  const handleDistrictChange = (id: string) => {
    const num = Number(id) || '';
    setValue('districtId', num, { shouldValidate: true });
    setValue('wardCode', '', { shouldValidate: false });
    clearErrors('wardCode');
    setMessage('');
  };

  const handleWardChange = (code: string) => {
    setValue('wardCode', code, { shouldValidate: true });
    setMessage('');
  };

  const onSubmit = handleSubmit(async (data) => {
    onSaving(true);
    try {
      const response = await shopSave.mutateAsync({
        shopId,
        data: data as unknown as PickupLocationControllerSaveShopBody,
      });
      onSaved(response);
      setMessage('Pickup address saved.');
    } catch {
      // Address errors are exposed by the mutation.
    } finally {
      onSaving(false);
    }
  });

  const connectGhn = async () => {
    if (addressNeedsSave || connecting) return;
    setConnecting(true);
    onSaving(true);
    setConnectionError('');
    try {
      const connected = await ghn.connect();
      setGhnStatus(connected.data.location?.ghnSyncStatus ?? 'UNKNOWN');
      if (connected.data.location?.ghnSyncStatus !== 'CONNECTED') {
        setConnectionError(
          'GHN could not confirm the result; contact support before trying again.',
        );
        return;
      }
      onSaved(connected);
      setGhnStatus(null);
    } catch {
      setGhnStatus('UNKNOWN');
      setConnectionError(
        'GHN could not be connected. Check the connection status before trying again.',
      );
    } finally {
      setConnecting(false);
      onSaving(false);
    }
  };

  return {
    ghnStatus,
    ghn,
    disconnectGhn,
    connectGhn,
    addressNeedsSave,
    connectionError,
    register,
    errors,
    onSubmit,
    saving,
    apiError,
    message,
    setMessage,
    provinceId,
    districtId,
    wardCode,
    contactName,
    phone,
    addressLine1,
    provinceName,
    districtName,
    wardName,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    provinces,
    districts,
    wards,
    refetchDivisions,
  };
}
