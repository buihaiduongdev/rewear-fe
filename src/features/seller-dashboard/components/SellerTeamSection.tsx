'use client';

import { type FormEvent, useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type {
  ShopControllerFindMembers200DataItem,
  ShopRoleControllerCreateBodyPermissionsItem,
  ShopRoleControllerList200DataItem,
} from '@/shared/api/models';
import {
  getShopRoleControllerListQueryKey,
  useShopRoleControllerAssign,
  useShopRoleControllerCreate,
  useShopRoleControllerList,
  useShopRoleControllerPermissions,
  useShopRoleControllerUpdate,
} from '@/shared/api/query-generated/shop-roles/shop-roles';
import {
  getShopControllerFindMembersQueryKey,
  getShopControllerListQueryKey,
  useShopControllerFindMembers,
  useShopControllerInvite,
  useShopControllerList,
  useShopControllerRemoveMember,
  useShopControllerRevoke,
} from '@/shared/api/query-generated/shops/shops';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useToastStore } from '@/shared/stores/toast.store';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Shield, Trash2, UserPlus } from 'lucide-react';

const PERMISSION_LABELS: Record<string, string> = {
  'shop.update': 'Edit shop profile',
  'product.view': 'View listings',
  'product.create': 'Create listings',
  'product.update': 'Edit & manage listings',
  'order.view': 'View orders',
  'order.update': 'Confirm & process orders',
  'pickup.view': 'View pickup address',
  'pickup.update': 'Edit pickup address',
  'chat.manage': 'Manage buyer messages',
};

const FALLBACK_PERMISSIONS: ShopRoleControllerCreateBodyPermissionsItem[] = [
  'shop.update',
  'product.view',
  'product.create',
  'product.update',
  'order.view',
  'order.update',
  'pickup.view',
  'pickup.update',
  'chat.manage',
];

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

  // Invite modal state (Figma 48:250)
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleIds, setInviteRoleIds] = useState<string[]>([]);
  const [inviteValidationError, setInviteValidationError] = useState('');

  // Assign member roles modal state (Figma 71:2265)
  const [assignMember, setAssignMember] =
    useState<ShopControllerFindMembers200DataItem | null>(null);
  const [selectedMemberRoleIds, setSelectedMemberRoleIds] = useState<string[]>(
    [],
  );

  // Create / edit custom role modal state
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] =
    useState<ShopRoleControllerList200DataItem | null>(null);
  const [roleName, setRoleName] = useState('');
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [roleValidationError, setRoleValidationError] = useState('');

  // Inline remove member confirm
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

  const permissionsQuery = useShopRoleControllerPermissions(shopId, {
    query: {
      enabled: Boolean(shopId && isOwner),
      meta: { skipErrorToast: true },
    },
  });

  const inviteMutation = useShopControllerInvite({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const revokeMutation = useShopControllerRevoke({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const removeMemberMutation = useShopControllerRemoveMember({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const assignRoleMutation = useShopRoleControllerAssign({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const createRoleMutation = useShopRoleControllerCreate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const updateRoleMutation = useShopRoleControllerUpdate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const members = membersQuery.data?.data ?? [];
  const invitations = (invitationsQuery.data?.data ?? []).filter(
    (inv) => inv.status === 'PENDING',
  );
  const roles = rolesQuery.data?.data ?? [];
  const availablePermissions =
    permissionsQuery.data?.data && permissionsQuery.data.data.length > 0
      ? permissionsQuery.data.data
      : FALLBACK_PERMISSIONS;

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

  const toggleItem = (list: string[], id: string) =>
    list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

  const openInviteModal = () => {
    setInviteEmail('');
    setInviteRoleIds(roles[0] ? [roles[0].id] : []);
    setInviteValidationError('');
    inviteMutation.reset();
    setInviteOpen(true);
  };

  const handleInviteSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setInviteValidationError('Enter a valid team member email address.');
      return;
    }
    setInviteValidationError('');
    try {
      await inviteMutation.mutateAsync({
        shopId,
        data: { email, roleIds: inviteRoleIds },
      });
      await queryClient.invalidateQueries({
        queryKey: getShopControllerListQueryKey(shopId),
      });
      addToast({
        type: 'success',
        title: 'Invitation sent',
        description: `Sent a team invite to ${email}.`,
        durationMs: 3000,
      });
      setInviteOpen(false);
    } catch {
      // Displayed inline
    }
  };

  const openAssignModal = (member: ShopControllerFindMembers200DataItem) => {
    setAssignMember(member);
    setSelectedMemberRoleIds(member.roles.map((r) => r.id));
    assignRoleMutation.reset();
  };

  const handleAssignSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!assignMember) return;
    try {
      await assignRoleMutation.mutateAsync({
        shopId,
        memberId: assignMember.id,
        data: { roleIds: selectedMemberRoleIds },
      });
      await queryClient.invalidateQueries({
        queryKey: getShopControllerFindMembersQueryKey(shopId),
      });
      addToast({
        type: 'success',
        title: 'Member roles updated',
        durationMs: 3000,
      });
      setAssignMember(null);
    } catch {
      // Displayed inline
    }
  };

  const openCreateRoleModal = () => {
    setEditingRole(null);
    setRoleName('');
    setRolePermissions(['product.view', 'order.view']);
    setRoleValidationError('');
    createRoleMutation.reset();
    updateRoleMutation.reset();
    setRoleModalOpen(true);
  };

  const openEditRoleModal = (role: ShopRoleControllerList200DataItem) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRolePermissions([...role.permissions]);
    setRoleValidationError('');
    createRoleMutation.reset();
    updateRoleMutation.reset();
    setRoleModalOpen(true);
  };

  const handleRoleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = roleName.trim();
    if (!trimmed) {
      setRoleValidationError('Role name is required.');
      return;
    }
    setRoleValidationError('');

    const permissions =
      rolePermissions as ShopRoleControllerCreateBodyPermissionsItem[];

    try {
      if (editingRole) {
        await updateRoleMutation.mutateAsync({
          shopId,
          roleId: editingRole.id,
          data: { name: trimmed, permissions },
        });
      } else {
        await createRoleMutation.mutateAsync({
          shopId,
          data: { name: trimmed, permissions },
        });
      }
      await queryClient.invalidateQueries({
        queryKey: getShopRoleControllerListQueryKey(shopId),
      });
      await queryClient.invalidateQueries({
        queryKey: getShopControllerFindMembersQueryKey(shopId),
      });
      addToast({
        type: 'success',
        title: editingRole ? 'Role updated' : 'Role created',
        durationMs: 3000,
      });
      setRoleModalOpen(false);
    } catch {
      // Displayed inline
    }
  };

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
      {/* Team Members Card (Figma 71:1675) */}
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
            onClick={openInviteModal}
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
                        onClick={() => openAssignModal(member)}
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

        {/* Pending Invitations */}
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

      {/* Custom Roles & Permissions Card */}
      <section
        aria-labelledby="shop-roles-heading"
        className="border-rewear-border space-y-5 border bg-white p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 id="shop-roles-heading" className="text-lg font-semibold">
              Roles &amp; permissions
            </h3>
            <p className="text-rewear-muted mt-1 text-sm">
              Define what staff roles can view or update inside your seller
              workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateRoleModal}
            className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 cursor-pointer items-center gap-2 border px-4 text-sm font-semibold transition"
          >
            <Plus size={16} aria-hidden="true" />
            New role
          </button>
        </div>

        {rolesQuery.isPending ? (
          <p role="status" className="text-rewear-muted text-sm">
            Loading roles…
          </p>
        ) : rolesQuery.isError ? (
          <p role="alert" className="text-rewear-muted text-sm">
            Could not load shop roles.
          </p>
        ) : roles.length === 0 ? (
          <p className="text-rewear-muted text-sm">
            No custom roles defined yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="border-rewear-border flex flex-col justify-between gap-4 border p-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Shield size={15} aria-hidden="true" />
                      <h4 className="font-semibold">{role.name}</h4>
                    </div>
                    {role.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.length > 0 ? (
                      role.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="bg-rewear-soft px-2 py-0.5 text-xs"
                        >
                          {PERMISSION_LABELS[perm] ?? perm}
                        </span>
                      ))
                    ) : (
                      <span className="text-rewear-muted text-xs">
                        No permissions assigned
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => openEditRoleModal(role)}
                    className="min-h-11 cursor-pointer text-sm font-semibold underline underline-offset-4"
                  >
                    Edit permissions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Invite Team Member Modal (Figma 48:250) */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent
          showCloseButton={false}
          className="border-rewear-border bg-rewear-surface max-w-[520px] rounded-none border p-6 sm:max-w-[520px] sm:p-8"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
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

          <form
            onSubmit={handleInviteSubmit}
            noValidate
            className="mt-2 space-y-5"
          >
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
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    if (inviteValidationError) setInviteValidationError('');
                  }}
                  placeholder="staff@example.com"
                  className="h-6 w-full bg-transparent text-base focus:outline-none"
                />
              </div>
              {inviteValidationError && (
                <p role="alert" className="text-destructive text-xs">
                  {inviteValidationError}
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
                        checked={inviteRoleIds.includes(role.id)}
                        onChange={() =>
                          setInviteRoleIds((prev) => toggleItem(prev, role.id))
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

      {/* Member Role Assignment Modal (Figma 71:2265) */}
      <Dialog
        open={Boolean(assignMember)}
        onOpenChange={(open) => {
          if (!open) setAssignMember(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="border-rewear-border bg-rewear-surface max-w-[520px] rounded-none border p-6 sm:max-w-[520px] sm:p-8"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAssignMember(null)}
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
              {assignMember?.user.fullName} ({assignMember?.user.email})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAssignSubmit} className="mt-2 space-y-5">
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
                        checked={selectedMemberRoleIds.includes(role.id)}
                        onChange={() =>
                          setSelectedMemberRoleIds((prev) =>
                            toggleItem(prev, role.id),
                          )
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

      {/* Create / Edit Role Modal */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="border-rewear-border bg-rewear-surface max-h-[90dvh] max-w-[520px] overflow-y-auto rounded-none border p-6 sm:max-w-[520px] sm:p-8"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setRoleModalOpen(false)}
              className="text-rewear-muted hover:text-rewear-text min-h-11 cursor-pointer text-sm font-semibold"
            >
              Close ×
            </button>
          </div>
          <DialogHeader className="gap-2">
            <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
              {editingRole ? 'Edit role' : 'Create role'}
            </DialogTitle>
            <DialogDescription className="text-rewear-muted text-sm">
              Choose which permissions members with this role receive.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleRoleSubmit}
            noValidate
            className="mt-2 space-y-5"
          >
            <div className="space-y-1">
              <div className="bg-rewear-soft space-y-1.5 rounded-lg px-4 py-3">
                <label
                  htmlFor="shop-role-name"
                  className="block text-sm font-semibold"
                >
                  Role name
                </label>
                <input
                  id="shop-role-name"
                  type="text"
                  maxLength={80}
                  value={roleName}
                  onChange={(e) => {
                    setRoleName(e.target.value);
                    if (roleValidationError) setRoleValidationError('');
                  }}
                  placeholder="e.g. Catalog manager"
                  className="h-6 w-full bg-transparent text-base focus:outline-none"
                />
              </div>
              {roleValidationError && (
                <p role="alert" className="text-destructive text-xs">
                  {roleValidationError}
                </p>
              )}
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">Permissions</legend>
              <div className="grid gap-1 sm:grid-cols-2">
                {availablePermissions.map((permission) => (
                  <label
                    key={permission}
                    className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={rolePermissions.includes(permission)}
                      onChange={() =>
                        setRolePermissions((prev) =>
                          toggleItem(prev, permission),
                        )
                      }
                      className="border-rewear-border size-4"
                    />
                    <span>{PERMISSION_LABELS[permission] ?? permission}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {!!(createRoleMutation.error || updateRoleMutation.error) && (
              <p role="alert" className="text-destructive text-sm">
                {getApiErrorMessage(
                  createRoleMutation.error || updateRoleMutation.error,
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={
                createRoleMutation.isPending || updateRoleMutation.isPending
              }
              className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex min-h-12 w-full cursor-pointer items-center justify-center text-sm font-semibold transition disabled:opacity-50"
            >
              {createRoleMutation.isPending || updateRoleMutation.isPending
                ? 'Saving…'
                : editingRole
                  ? 'Save role'
                  : 'Create role'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
