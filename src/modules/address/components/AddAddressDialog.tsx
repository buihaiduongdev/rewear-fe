'use client';

import { useState } from 'react';

import type { UserAddressControllerCreate201Data } from '@/shared/api/models';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';

import { UserAddressForm } from './UserAddressForm';

export type AddAddressDialogProps = {
  disabled?: boolean;
  onCreated: (address: UserAddressControllerCreate201Data) => void;
  trigger?: React.ReactNode;
};

export function AddAddressDialog({
  disabled = false,
  onCreated,
  trigger,
}: AddAddressDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        disabled={disabled}
        className="min-h-11 cursor-pointer text-left text-sm font-semibold underline underline-offset-4"
      >
        {trigger ?? 'Add address'}
      </DialogTrigger>
      <DialogContent className="max-h-[95dvh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add address</DialogTitle>
          <DialogDescription className="sr-only">
            Save a delivery address in Vietnam for this checkout.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <UserAddressForm
            onSuccess={(address) => {
              onCreated(address);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
