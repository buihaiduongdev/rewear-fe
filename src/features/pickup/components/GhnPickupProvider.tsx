'use client';

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';

import { useGhnConnection } from '../hooks/use-ghn-connection';

type Props = {
  ghn: ReturnType<typeof useGhnConnection>;
  status?: string | null;
  shopId?: number | null;
  connectionError: string;
  onDisconnect: () => Promise<boolean>;
  onConnect: () => Promise<void>;
  addressNeedsSave: boolean;
  connecting: boolean;
};

export function GhnPickupProvider({
  ghn,
  status,
  shopId,
  connectionError,
  onDisconnect,
  onConnect,
  addressNeedsSave,
  connecting,
}: Props) {
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const syncStatus = status;
  const isConnected = syncStatus === 'CONNECTED';
  const isStale = syncStatus === 'STALE';
  const canConnect =
    !syncStatus || ['NOT_CONNECTED', 'STALE'].includes(syncStatus);

  return (
    <div className="space-y-4">
      {/* Status indicator */}
      <div className="flex items-center justify-between text-sm">
        <p>
          GHN connection:{' '}
          <span
            className={
              isConnected
                ? 'font-semibold text-emerald-700'
                : isStale
                  ? 'font-semibold text-amber-700'
                  : 'text-rewear-muted'
            }
          >
            {isConnected
              ? 'Connected'
              : isStale
                ? 'Update required'
                : 'Not connected'}
          </span>
        </p>
      </div>

      {isStale && (
        <p className="text-rewear-muted text-xs">
          The pickup address changed. Connect GHN to update your warehouse for
          future shipments.
        </p>
      )}

      {/* Connected Details */}
      {isConnected && shopId && (
        <div className="space-y-3 text-sm">
          <p>GHN shop ID: {shopId}</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="font-semibold underline disabled:opacity-50"
              disabled={ghn.shopDetails.isPending}
              onClick={() => ghn.shopDetails.mutate()}
            >
              {ghn.shopDetails.isPending
                ? 'Checking GHN…'
                : 'Refresh GHN details'}
            </button>
            <button
              type="button"
              className="text-destructive font-semibold underline"
              onClick={() => setConfirmDisconnect(true)}
            >
              Disconnect GHN
            </button>
          </div>

          <Dialog open={confirmDisconnect} onOpenChange={setConfirmDisconnect}>
            <DialogContent>
              <DialogTitle className="text-xl font-semibold">
                Disconnect GHN?
              </DialogTitle>
              <DialogDescription className="text-rewear-muted">
                GHN will no longer be available for new shipping quotes.
                Existing shipments keep their original GHN shop.
              </DialogDescription>
              {ghn.disconnect.isError && (
                <p role="alert" className="text-destructive">
                  Could not disconnect GHN. Please try again.
                </p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="border-rewear-border min-h-11 border px-4"
                  disabled={ghn.disconnect.isPending}
                  onClick={() => setConfirmDisconnect(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-destructive min-h-11 px-4 font-semibold text-white disabled:opacity-50"
                  disabled={ghn.disconnect.isPending}
                  onClick={() => {
                    void onDisconnect().then((success) => {
                      if (success) setConfirmDisconnect(false);
                    });
                  }}
                >
                  {ghn.disconnect.isPending ? 'Disconnecting…' : 'Disconnect'}
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {ghn.shopDetails.isError && (
            <p role="alert" className="text-destructive text-xs">
              Could not load GHN details. Please try again.
            </p>
          )}
          {ghn.shopDetails.data && (
            <div
              className="bg-rewear-surface border-rewear-border space-y-1 border p-3 text-xs"
              aria-live="polite"
            >
              <p className="font-semibold">
                {ghn.shopDetails.data.data.name} ·{' '}
                {ghn.shopDetails.data.data.active ? 'Active' : 'Inactive'}
              </p>
              <p>{ghn.shopDetails.data.data.phone}</p>
              <p>{ghn.shopDetails.data.data.address}</p>
              <p className="text-rewear-muted">
                GHN district: {ghn.shopDetails.data.data.districtId} · ward:{' '}
                {ghn.shopDetails.data.data.wardCode}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Connect action when not connected or stale */}
      {canConnect && (
        <div className="space-y-2 pt-2">
          {addressNeedsSave && (
            <p className="text-rewear-muted text-xs">
              Save your pickup address above before connecting GHN.
            </p>
          )}
          <button
            type="button"
            disabled={addressNeedsSave || connecting}
            onClick={() => void onConnect()}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 min-h-10 px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {connecting
              ? 'Connecting…'
              : isStale
                ? 'Update GHN connection'
                : 'Connect GHN'}
          </button>
        </div>
      )}

      {connectionError && (
        <p role="alert" className="text-destructive text-sm">
          {connectionError}
        </p>
      )}
    </div>
  );
}
