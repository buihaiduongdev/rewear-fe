'use client';

import { type FormEvent, useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  getUserControllerGetMeQueryKey,
  useUserControllerUpdateMe,
} from '@/shared/api/query-generated/users/users';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useToastStore } from '@/shared/stores/toast.store';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export type EditProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFullName: string;
  email: string;
};

export function EditProfileDialog({
  open,
  onOpenChange,
  currentFullName,
  email,
}: EditProfileDialogProps) {
  const [fullName, setFullName] = useState(currentFullName);
  const [validationError, setValidationError] = useState('');
  const queryClient = useQueryClient();
  const { update: updateSession } = useSession();
  const addToast = useToastStore((s) => s.addToast);

  const updateProfile = useUserControllerUpdateMe({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed) {
      setValidationError('Display name is required.');
      return;
    }
    setValidationError('');

    try {
      await updateProfile.mutateAsync({ data: { fullName: trimmed } });
      await queryClient.invalidateQueries({
        queryKey: getUserControllerGetMeQueryKey(),
      });
      await updateSession({ fullName: trimmed });
      addToast({
        type: 'success',
        title: 'Profile updated',
        description: 'Your display name has been saved.',
        durationMs: 3000,
      });
      onOpenChange(false);
    } catch {
      // Error displayed inline via updateProfile.error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="border-rewear-border bg-rewear-surface max-w-[520px] rounded-none border p-6 sm:max-w-[520px] sm:p-8"
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
            Edit profile
          </DialogTitle>
          <DialogDescription className="text-rewear-muted text-sm leading-5">
            Update how your name appears across orders and marketplace activity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="mt-2 space-y-5">
          <div className="bg-rewear-soft space-y-2 rounded-lg px-4 py-3">
            <label
              htmlFor="account-display-name"
              className="block text-sm leading-5 font-semibold"
            >
              Display name
            </label>
            <input
              id="account-display-name"
              type="text"
              required
              maxLength={255}
              value={fullName}
              disabled={updateProfile.isPending}
              onChange={(event) => {
                setFullName(event.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="e.g. Nguyen Minh Anh"
              className="text-rewear-text placeholder:text-rewear-muted h-6 w-full bg-transparent text-base leading-6 focus:outline-none"
            />
          </div>
          {validationError && (
            <p role="alert" className="text-destructive -mt-3 text-xs">
              {validationError}
            </p>
          )}

          <div className="bg-rewear-soft/60 space-y-1 rounded-lg px-4 py-3">
            <span className="text-rewear-muted block text-xs font-semibold">
              Email address
            </span>
            <p className="text-rewear-text text-sm">{email}</p>
          </div>

          {!!updateProfile.error && (
            <p role="alert" className="text-destructive text-sm">
              {getApiErrorMessage(updateProfile.error)}
            </p>
          )}

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex min-h-12 w-full cursor-pointer items-center justify-center text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
