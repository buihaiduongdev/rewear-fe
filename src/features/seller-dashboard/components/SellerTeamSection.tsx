'use client';

import { useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type { ShopControllerFindMembers200DataItem } from '@/shared/api/models';
import { useShopRoleControllerList } from '@/shared/api/query-generated/shop-roles/shop-roles';
import {
  getShopControllerFindMembersQueryKey,
  getShopControllerListQueryKey,
  useShopControllerFindMembers,
  useShopControllerList,
  useShopControllerRemoveMember,
  useShopControllerRevoke,
} from '@/shared/api/query-generated/shops/shops';
import { Badge } from '@/shared/components/ui/badge';
import { useToastStore } from '@/shared/stores/toast.store';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, UserPlus } from 'lucide-react';

import { SellerRolesSection } from './SellerRolesSection';
import { InviteMemberDialog, MemberRolesDialog } from './SellerTeamModals';

export function SellerTeamSection({
  shopId,
  shopName,
  isOwner,
}: {
  shopId: string;
  shopName: string;
  isOwner: boolean;
}) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [assignMember, setAssignMember] =
    useState<ShopControllerFindMembers200DataItem | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [teamActionError, setTeamActionError] = useState('');

  const membersQuery = useShopControllerFindMembers(shopId, {
    query: {
      enabled: Boolean(shopId && isOwner),
      meta: { skipErrorToast: true },
    },
  });

  const invitationsQuery = useShopControllerList(shopId, {
    query: {
      enabled: Boolean(shopId && isOwner),
      meta: { skipErrorToast: true },
    },
  });

  const rolesQuery = useShopRoleControllerList(shopId, {
    query: {
      enabled: Boolean(shopId && isOwner),
      meta: { skipErrorToast: true },
    },
  });

  const revokeMutation = useShopControllerRevoke({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const removeMemberMutation = useShopControllerRemoveMember({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  if (!isOwner) {
    return (
      <section className="border-rewear-border space-y-2 border bg-white p-6">
        <h3 className="text-lg font-semibold">Team &amp; permissions</h3>
        <p className="text-rewear-muted text-sm">
          Only the shop owner can manage team access.
        </p>
      </section>
    );
  }

  const members = membersQuery.data?.data ?? [];
  const invitations = (invitationsQuery.data?.data ?? []).filter(
    (inv) => inv.status === 'PENDING',
  );
  const roles = rolesQuery.data?.data ?? [];

  const handleRemoveMember = async (memberId: string) => {
    setTeamActionError('');
    try {
      await removeMemberMutation.mutateAsync({ shopId, memberId });
      setConfirmRemoveId(null);
      await queryClient.invalidateQueries({
        queryKey: getShopControllerFindMembersQueryKey(shopId),
      });
      addToast({
        type: 'success',
        title: 'Team member removed',
        durationMs: 3000,
      });
    } catch (error) {
      setTeamActionError(getApiErrorMessage(error));
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    setTeamActionError('');
    try {
      await revokeMutation.mutateAsync({ shopId, invitationId });
      await queryClient.invalidateQueries({
        queryKey: getShopControllerListQueryKey(shopId),
      });
      addToast({
        type: 'success',
        title: 'Invitation revoked',
        durationMs: 3000,
      });
    } catch (error) {
      setTeamActionError(getApiErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="team-members-heading"
        className="border-rewear-border space-y-5 border bg-white p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 id="team-members-heading" className="text-lg font-semibold">
              Team members
            </h3>
            <p className="text-rewear-muted mt-1 text-sm">
              {members.length} active{' '}
              {members.length === 1 ? 'member' : 'members'} · {shopName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 inline-flex min-h-11 cursor-pointer items-center gap-2 px-4 text-sm font-semibold transition"
          >
            <UserPlus size={16} aria-hidden="true" />
            Invite member
          </button>
        </div>

        {teamActionError && (
          <p role="alert" className="text-destructive text-sm">
            {teamActionError}
          </p>
        )}

        {membersQuery.isPending ? (
          <p role="status" className="text-rewear-muted text-sm">
            Loading team members…
          </p>
        ) : membersQuery.isError ? (
          <div role="alert" className="space-y-2 text-sm">
            <p>Could not load team members.</p>
            <button
              type="button"
              onClick={() => void membersQuery.refetch()}
              className="min-h-11 cursor-pointer font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="divide-rewear-border divide-y">
            {members.map((member) => {
              const isOwnerMember = member.memberRole === 'OWNER';
              const isConfirming = confirmRemoveId === member.id;
              return (
                <div
                  key={member.id}
                  className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {member.user.fullName}
                      </span>
                      <Badge variant={isOwnerMember ? 'default' : 'secondary'}>
                        {isOwnerMember ? 'Owner' : 'Staff'}
                      </Badge>
                    </div>
                    <p className="text-rewear-muted text-sm">
                      {member.user.email}
                    </p>
                    {!isOwnerMember && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {member.roles.length > 0 ? (
                          member.roles.map((role) => (
                            <span
                              key={role.id}
                              className="bg-rewear-soft px-2 py-0.5 text-xs font-medium"
                            >
                              {role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-rewear-muted text-xs">
                            No custom roles assigned
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!isOwnerMember && (
                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                      <button
                        type="button"
                        onClick={() => setAssignMember(member)}
                        className="min-h-11 cursor-pointer underline underline-offset-4"
                      >
                        Manage roles
                      </button>
                      {isConfirming ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={removeMemberMutation.isPending}
                            onClick={() => void handleRemoveMember(member.id)}
                            className="text-destructive min-h-11 cursor-pointer underline underline-offset-4"
                          >
                            Confirm remove
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmRemoveId(null)}
                            className="text-rewear-muted min-h-11 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveId(member.id)}
                          className="text-rewear-muted hover:text-destructive inline-flex min-h-11 cursor-pointer items-center gap-1"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {invitations.length > 0 && (
          <div className="border-rewear-border space-y-3 border-t pt-5">
            <h4 className="text-sm font-semibold">Pending invitations</h4>
            <div className="space-y-2">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-rewear-soft flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div>
                    <span className="font-semibold">
                      {inv.user?.email ?? inv.userId}
                    </span>
                    <span className="text-rewear-muted ml-2 text-xs">
                      Pending
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={revokeMutation.isPending}
                    onClick={() => void handleRevokeInvitation(inv.id)}
                    className="text-destructive min-h-11 cursor-pointer text-xs font-semibold underline underline-offset-4 disabled:opacity-50"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-rewear-muted text-xs">
          Only the shop owner can manage team access.
        </p>
      </section>

      <SellerRolesSection
        shopId={shopId}
        roles={roles}
        isPending={rolesQuery.isPending}
        isError={rolesQuery.isError}
      />

      {inviteOpen && (
        <InviteMemberDialog
          shopId={shopId}
          roles={roles}
          onClose={() => setInviteOpen(false)}
        />
      )}

      {assignMember && (
        <MemberRolesDialog
          shopId={shopId}
          member={assignMember}
          roles={roles}
          onClose={() => setAssignMember(null)}
        />
      )}
    </div>
  );
}
