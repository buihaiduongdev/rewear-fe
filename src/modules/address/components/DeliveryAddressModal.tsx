'use client';

import { useState } from 'react';

import type {
  UserAddressControllerCreate201Data,
  UserAddressControllerFindAll200DataItem,
} from '@/shared/api/models';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from 'cn';

import { AddAddressDialog } from './AddAddressDialog';

export type DeliveryAddressModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: UserAddressControllerFindAll200DataItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddressCreated?: (address: UserAddressControllerCreate201Data) => void;
  disabled?: boolean;
};

export function DeliveryAddressModal({
  open,
  onOpenChange,
  addresses,
  selectedId,
  onSelect,
  onAddressCreated,
  disabled = false,
}: DeliveryAddressModalProps) {
  const [tempSelectedId, setTempSelectedId] = useState(selectedId);

  // Synchronize temporary selection when modal opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTempSelectedId(selectedId || addresses[0]?.id || '');
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    if (tempSelectedId) {
      onSelect(tempSelectedId);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] space-y-6 overflow-y-auto p-6 sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Delivery address
          </DialogTitle>
          <DialogDescription className="sr-only">
            Select a saved delivery address for your order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {addresses.map((address) => {
            const isSelected = address.id === tempSelectedId;
            return (
              <div
                key={address.id}
                role="button"
                tabIndex={0}
                onClick={() => setTempSelectedId(address.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setTempSelectedId(address.id);
                  }
                }}
                className={cn(
                  'cursor-pointer border p-4 text-left transition-all',
                  isSelected
                    ? 'border-rewear-text bg-rewear-soft/50 ring-rewear-text ring-1'
                    : 'border-rewear-border/40 hover:border-rewear-border bg-rewear-surface',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-rewear-text text-base font-semibold">
                      {address.recipientName}
                    </span>
                    <span className="text-rewear-muted text-sm">
                      {address.phone}
                    </span>
                  </div>
                  {address.isDefault && (
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-[11px]"
                    >
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-rewear-muted mt-1 text-sm leading-relaxed">
                  {address.addressLine1}, {address.wardName},{' '}
                  {address.provinceName}
                </p>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={disabled || !tempSelectedId}
            onClick={handleConfirm}
            className="bg-rewear-accent text-rewear-text flex h-12 w-full cursor-pointer items-center justify-center text-sm font-semibold transition-opacity disabled:opacity-50"
          >
            Use this address
          </button>

          {onAddressCreated && (
            <div className="text-center">
              <AddAddressDialog
                disabled={disabled}
                onCreated={(newAddress) => {
                  onAddressCreated(newAddress);
                  setTempSelectedId(newAddress.id);
                  onSelect(newAddress.id);
                }}
                trigger="+ Add new address"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
