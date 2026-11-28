'use client';

import { UserAddressForm, type UserAddressFormValues } from '@/modules/address';
import type { UserAddressControllerCreate201Data } from '@/shared/api/models';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

export type AddressFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addressId?: string;
  initialValues?: Partial<UserAddressFormValues>;
  onSaved: (address: UserAddressControllerCreate201Data) => void;
};

export function AddressFormDialog({
  open,
  onOpenChange,
  addressId,
  initialValues,
  onSaved,
}: AddressFormDialogProps) {
  const isEditing = Boolean(addressId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="border-rewear-border bg-rewear-surface max-h-[92dvh] max-w-[540px] overflow-y-auto rounded-none border p-6 sm:max-w-[540px] sm:p-8"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-rewear-muted hover:text-rewear-text min-h-11 cursor-pointer text-sm font-semibold"
          >
            Close ×
          </button>
        </div>

        <DialogHeader className="gap-2">
          <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            {isEditing ? 'Edit address' : 'Add address'}
          </DialogTitle>
          <DialogDescription className="text-rewear-muted text-sm leading-5">
            Save a Vietnam delivery address with province, district, and ward
            details for faster checkout.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <UserAddressForm
            key={addressId ?? 'new-address'}
            addressId={addressId}
            initialValues={initialValues}
            onSuccess={(saved) => {
              onSaved(saved);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
