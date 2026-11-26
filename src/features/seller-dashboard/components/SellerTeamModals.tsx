'use client';

import { type FormEvent, useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type {
  ShopControllerFindMembers200DataItem,
  ShopRoleControllerList200DataItem,
} from '@/shared/api/models';
import { useShopRoleControllerAssign } from '@/shared/api/query-generated/shop-roles/shop-roles';
import {
  getShopControllerFindMembersQueryKey,
  getShopControllerListQueryKey,
  useShopControllerInvite,
} from '@/shared/api/query-generated/shops/shops';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useToastStore } from '@/shared/stores/toast.store';
import { useQueryClient } from '@tanstack/react-query';

function toggleId(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function InviteMemberDialog({
  shopId,
  roles,
  onClose,
}: {
  shopId: string;
  roles: ShopRoleControllerList200DataItem[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [email, setEmail] = useState('');
  const [roleIds, setRoleIds] = useState<string[]>(
    roles[0] ? [roles[0].id] : [],
  );
  const [validationError, setValidationError] = useState('');

  const inviteMutation = useShopControllerInvite({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes('@')) {
      setValidationError('Enter a valid team member email address.');
      return;
    }
    setValidationError('');

    try {
      await inviteMutation.mutateAsync({
        shopId,
        data: { email: normalized, roleIds },
      });
      await queryClient.invalidateQueries({
        queryKey: getShopControllerListQueryKey(shopId),
      });
      addToast({
        type: 'success',
        title: 'Invitation sent',
        description: `Sent a team invite to ${normalized}.`,
        durationMs: 3000,
      });
      onClose();
    } catch {
      // Displayed inline
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="border-rewear-border bg-rewear-surface max-w-[520px] rounded-none border p-6 sm:max-w-[520px] sm:p-8"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-rewear-muted hover:text-rewear-text min-h-11 cursor-pointer text-sm font-semibold"
          >
            Close ×
          </button>
        </div>
        <DialogHeader className="gap-2">
          <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Team access
          </DialogTitle>
          <DialogDescription className="text-rewear-muted text-sm leading-5">
            Owner: shop settings, funds and team. Staff: assigned roles only.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="mt-2 space-y-5">
          <div className="space-y-1">
            <div className="bg-rewear-soft space-y-1.5 rounded-lg px-4 py-3">
              <label
                htmlFor="invite-member-email"
                className="block text-sm font-semibold"
              >
                Member email
              </label>
              <input
                id="invite-member-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="staff@example.com"
                className="h-6 w-full bg-transparent text-base focus:outline-none"
              />
            </div>
            {validationError && (
              <p role="alert" className="text-destructive text-xs">
                {validationError}
              </p>
            )}
          </div>

          {roles.length > 0 && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">Assign roles</legend>
              <div className="space-y-1">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={roleIds.includes(role.id)}
                      onChange={() =>
                        setRoleIds((prev) => toggleId(prev, role.id))
                      }
                      className="border-rewear-border size-4"
                    />
                    <span>{role.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {!!inviteMutation.error && (
            <p role="alert" className="text-destructive text-sm">
              {getApiErrorMessage(inviteMutation.error)}
            </p>
          )}

          <button
            type="submit"
            disabled={inviteMutation.isPending}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex min-h-12 w-full cursor-pointer items-center justify-center text-sm font-semibold transition disabled:opacity-50"
          >
            {inviteMutation.isPending ? 'Sending…' : 'Send invitation'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MemberRolesDialog({
  shopId,
  member,
  roles,
  onClose,
}: {
  shopId: string;
  member: ShopControllerFindMembers200DataItem;
  roles: ShopRoleControllerList200DataItem[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    member.roles.map((r) => r.id),
  );

  const assignRoleMutation = useShopRoleControllerAssign({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await assignRoleMutation.mutateAsync({
        shopId,
        memberId: member.id,
        data: { roleIds: selectedRoleIds },
      });
      await queryClient.invalidateQueries({
        queryKey: getShopControllerFindMembersQueryKey(shopId),
      });
      addToast({
        type: 'success',
        title: 'Member roles updated',
        durationMs: 3000,
      });
      onClose();
    } catch {
      // Displayed inline
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="border-rewear-border bg-rewear-surface max-w-[520px] rounded-none border p-6 sm:max-w-[520px] sm:p-8"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-rewear-muted hover:text-rewear-text min-h-11 cursor-pointer text-sm font-semibold"
          >
            Close ×
          </button>
        </div>
        <DialogHeader className="gap-2">
          <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Member access
          </DialogTitle>
          <DialogDescription className="text-rewear-muted text-sm">
            {member.user.fullName} ({member.user.email})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-5">
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">
              Assigned shop roles
            </legend>
            {roles.length === 0 ? (
              <p className="text-rewear-muted text-sm">
                Create a role first to assign permissions.
              </p>
            ) : (
              <div className="space-y-1">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() =>
                        setSelectedRoleIds((prev) => toggleId(prev, role.id))
                      }
                      className="border-rewear-border size-4"
                    />
                    <span>{role.name}</span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          {!!assignRoleMutation.error && (
            <p role="alert" className="text-destructive text-sm">
              {getApiErrorMessage(assignRoleMutation.error)}
            </p>
          )}

          <button
            type="submit"
            disabled={assignRoleMutation.isPending}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex min-h-12 w-full cursor-pointer items-center justify-center text-sm font-semibold transition disabled:opacity-50"
          >
            {assignRoleMutation.isPending ? 'Saving…' : 'Done'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
