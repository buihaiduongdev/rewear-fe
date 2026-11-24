'use client';

import { useState } from 'react';

import type { PickupLocationControllerSaveShop200 } from '@/shared/api/models';
import { orvalRequest } from '@/shared/api/orval-request';
import { useMutation } from '@tanstack/react-query';

type Response<T> = { data: T };
type GhnShop = {
  shopId: number;
  name: string;
  phone: string;
  address: string;
  districtId: number;
  wardCode: string;
  active: boolean;
};

export function useGhnConnection(shopId: string) {
  const [enabled, setEnabled] = useState(false);
  const path = `/api/shipping/shops/${encodeURIComponent(shopId)}/pickup-location/ghn`;

  const shopDetails = useMutation({
    mutationFn: () =>
      orvalRequest<Response<GhnShop>>({ url: `${path}/shop`, method: 'GET' }),
    retry: false,
    meta: { skipErrorToast: true, skipSuccessToast: true },
  });

  const disconnect = useMutation({
    mutationFn: () =>
      orvalRequest<PickupLocationControllerSaveShop200>({
        url: `${path}/disconnect`,
        method: 'POST',
      }),
    retry: false,
    meta: { skipErrorToast: true, skipSuccessToast: true },
  });

  const connect = () =>
    orvalRequest<
      PickupLocationControllerSaveShop200 & {
        data: { location: { ghnSyncStatus: string } | null };
      }
    >({
      url: path,
      method: 'POST',
      data: {},
    });

  return {
    enabled,
    setEnabled,
    shopDetails,
    disconnect,
    connect,
  };
}
