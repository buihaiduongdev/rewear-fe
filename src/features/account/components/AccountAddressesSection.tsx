'use client';

import { useState } from 'react';

import type { UserAddressFormValues } from '@/modules/address';
import { getApiErrorMessage } from '@/shared/api/api-error';
import type { UserAddressControllerFindAll200DataItem } from '@/shared/api/models';
import {
  getUserAddressControllerFindAllQueryKey,
  useUserAddressControllerFindAll,
  useUserAddressControllerRemove,
  useUserAddressControllerUpdate,
} from '@/shared/api/query-generated/user-addresses/user-addresses';
import { Badge } from '@/shared/components/ui/badge';
import { useToastStore } from '@/shared/stores/toast.store';
import { useQueryClient } from '@tanstack/react-query';
import { MapPin, Plus, Trash2 } from 'lucide-react';

import { AddressFormDialog } from './AddressFormDialog';

type AddressRecord = UserAddressControllerFindAll200DataItem & {
  provinceId?: number;
  districtId?: number;
  districtName?: string;
};

function formatFullAddress(address: AddressRecord) {
  return [
    address.addressLine1,
    address.wardName,
    address.districtName,
    address.provinceName,
  ]
    .filter(Boolean)
    .join(', ');
}

export function AccountAddressesSection({
  enabled,
  userId,
}: {
  enabled: boolean;
  userId?: string;
}) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressRecord | null>(
    null,
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const addressesQuery = useUserAddressControllerFindAll({
    query: { enabled },
  });

  const updateAddress = useUserAddressControllerUpdate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const removeAddress = useUserAddressControllerRemove({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const addresses = (addressesQuery.data?.data ?? []) as AddressRecord[];

  const invalidateAddresses = async () => {
    await queryClient.invalidateQueries({
      queryKey: getUserAddressControllerFindAllQueryKey(),
    });
    await queryClient.invalidateQueries({
      queryKey: ['/api/user-addresses', userId],
    });
  };

  const handleSetDefault = async (addressId: string) => {
    setActionError('');
    try {
      await updateAddress.mutateAsync({
        id: addressId,
        data: { isDefault: true },
      });
      await invalidateAddresses();
      addToast({
        type: 'success',
        title: 'Default address updated',
        durationMs: 3000,
      });
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const handleDelete = async (addressId: string) => {
    setActionError('');
    try {
      await removeAddress.mutateAsync({ id: addressId });
      setConfirmDeleteId(null);
      await invalidateAddresses();
      addToast({
        type: 'success',
        title: 'Address removed',
        durationMs: 3000,
      });
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const editingInitialValues: Partial<UserAddressFormValues> | undefined =
    editingAddress
      ? {
          recipientName: editingAddress.recipientName,
          phone: editingAddress.phone,
          addressLine1: editingAddress.addressLine1,
          provinceId: editingAddress.provinceId ?? '',
          districtId: editingAddress.districtId ?? '',
          wardCode: editingAddress.wardCode ?? '',
          isDefault: editingAddress.isDefault,
        }
      : undefined;

  return (
    <section
      aria-labelledby="addresses-heading"
      className="border-rewear-border space-y-5 border p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2
            id="addresses-heading"
            className="text-[22px] leading-7 font-semibold tracking-[-0.02em]"
          >
            Saved addresses
          </h2>
          <p className="text-rewear-muted mt-1 text-sm">
            Manage Vietnam delivery addresses for checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingAddress(null);
            setAddressDialogOpen(true);
          }}
          className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 inline-flex min-h-11 cursor-pointer items-center gap-2 px-4 text-sm font-semibold transition"
        >
          <Plus size={16} aria-hidden="true" />
          Add address
        </button>
      </div>

      {actionError && (
        <p role="alert" className="text-destructive text-sm">
          {actionError}
        </p>
      )}

      {addressesQuery.isPending ? (
        <p role="status" className="text-rewear-muted text-sm">
          Loading addresses…
        </p>
      ) : addressesQuery.isError ? (
        <div role="alert" className="space-y-2 text-sm">
          <p>Could not load your saved addresses.</p>
          <button
            type="button"
            onClick={() => void addressesQuery.refetch()}
            className="min-h-11 cursor-pointer font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-rewear-soft space-y-3 p-6 text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <MapPin size={16} aria-hidden="true" />
            <span>No saved addresses yet</span>
          </div>
          <p className="text-rewear-muted">
            Add your shipping address now so checkout takes a single step.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => {
            const isDeleting = confirmDeleteId === address.id;
            const isMutating =
              updateAddress.isPending || removeAddress.isPending;

            return (
              <article
                key={address.id}
                className="border-rewear-border flex flex-col justify-between gap-4 border p-4 sm:flex-row sm:items-start"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">
                      {address.recipientName}
                    </h3>
                    <span className="text-rewear-muted font-mono text-xs">
                      {address.phone}
                    </span>
                    {address.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                  <p className="text-rewear-muted text-sm leading-6">
                    {formatFullAddress(address)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                  {!address.isDefault && (
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => void handleSetDefault(address.id)}
                      className="min-h-11 cursor-pointer underline underline-offset-4 disabled:opacity-50"
                    >
                      Set as default
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isMutating}
                    onClick={() => {
                      setEditingAddress(address);
                      setAddressDialogOpen(true);
                    }}
                    className="min-h-11 cursor-pointer underline underline-offset-4 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={removeAddress.isPending}
                        onClick={() => void handleDelete(address.id)}
                        className="text-destructive min-h-11 cursor-pointer underline underline-offset-4"
                      >
                        Confirm delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-rewear-muted min-h-11 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => setConfirmDeleteId(address.id)}
                      className="text-rewear-muted hover:text-destructive inline-flex min-h-11 cursor-pointer items-center gap-1 disabled:opacity-50"
                      aria-label={`Delete address for ${address.recipientName}`}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AddressFormDialog
        open={addressDialogOpen}
        onOpenChange={(open) => {
          setAddressDialogOpen(open);
          if (!open) setEditingAddress(null);
        }}
        addressId={editingAddress?.id}
        initialValues={editingInitialValues}
        onSaved={() => {
          void invalidateAddresses();
          addToast({
            type: 'success',
            title: editingAddress ? 'Address updated' : 'Address added',
            durationMs: 3000,
          });
        }}
      />
    </section>
  );
}
