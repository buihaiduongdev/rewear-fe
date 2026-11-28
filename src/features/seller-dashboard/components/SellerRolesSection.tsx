'use client';

import { type FormEvent, useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type {
  ShopRoleControllerCreateBodyPermissionsItem,
  ShopRoleControllerList200DataItem,
} from '@/shared/api/models';
import {
  getShopRoleControllerListQueryKey,
  useShopRoleControllerCreate,
  useShopRoleControllerPermissions,
  useShopRoleControllerUpdate,
} from '@/shared/api/query-generated/shop-roles/shop-roles';
import { getShopControllerFindMembersQueryKey } from '@/shared/api/query-generated/shops/shops';
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
import { Plus, Shield } from 'lucide-react';

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

function ShopRoleDialog({
  shopId,
  editingRole,
  availablePermissions,
  onClose,
}: {
  shopId: string;
  editingRole: ShopRoleControllerList200DataItem | null;
  availablePermissions: string[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [roleName, setRoleName] = useState(editingRole?.name ?? '');
  const [rolePermissions, setRolePermissions] = useState<string[]>(
    editingRole ? [...editingRole.permissions] : ['product.view', 'order.view'],
  );
  const [validationError, setValidationError] = useState('');

  const createRoleMutation = useShopRoleControllerCreate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });
  const updateRoleMutation = useShopRoleControllerUpdate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const isPending =
    createRoleMutation.isPending || updateRoleMutation.isPending;
  const mutationError = createRoleMutation.error || updateRoleMutation.error;

  const togglePermission = (permission: string) => {
    setRolePermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((item) => item !== permission)
        : [...prev, permission],
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = roleName.trim();
    if (!trimmed) {
      setValidationError('Role name is required.');
      return;
    }
    setValidationError('');

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
        className="border-rewear-border bg-rewear-surface max-h-[90dvh] max-w-[520px] overflow-y-auto rounded-none border p-6 sm:max-w-[520px] sm:p-8"
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
            {editingRole ? 'Edit role' : 'Create role'}
          </DialogTitle>
          <DialogDescription className="text-rewear-muted text-sm">
            Choose which permissions members with this role receive.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="mt-2 space-y-5">
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
                  if (validationError) setValidationError('');
                }}
                placeholder="e.g. Catalog manager"
                className="h-6 w-full bg-transparent text-base focus:outline-none"
              />
            </div>
            {validationError && (
              <p role="alert" className="text-destructive text-xs">
                {validationError}
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
                    onChange={() => togglePermission(permission)}
                    className="border-rewear-border size-4"
                  />
                  <span>{PERMISSION_LABELS[permission] ?? permission}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {!!mutationError && (
            <p role="alert" className="text-destructive text-sm">
              {getApiErrorMessage(mutationError)}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex min-h-12 w-full cursor-pointer items-center justify-center text-sm font-semibold transition disabled:opacity-50"
          >
            {isPending ? 'Saving…' : editingRole ? 'Save role' : 'Create role'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SellerRolesSection({
  shopId,
  roles,
  isPending,
  isError,
}: {
  shopId: string;
  roles: ShopRoleControllerList200DataItem[];
  isPending: boolean;
  isError: boolean;
}) {
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] =
    useState<ShopRoleControllerList200DataItem | null>(null);

  const permissionsQuery = useShopRoleControllerPermissions(shopId, {
    query: { enabled: Boolean(shopId), meta: { skipErrorToast: true } },
  });

  const availablePermissions =
    permissionsQuery.data?.data && permissionsQuery.data.data.length > 0
      ? permissionsQuery.data.data
      : FALLBACK_PERMISSIONS;

  return (
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
          onClick={() => {
            setEditingRole(null);
            setRoleModalOpen(true);
          }}
          className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 cursor-pointer items-center gap-2 border px-4 text-sm font-semibold transition"
        >
          <Plus size={16} aria-hidden="true" />
          New role
        </button>
      </div>

      {isPending ? (
        <p role="status" className="text-rewear-muted text-sm">
          Loading roles…
        </p>
      ) : isError ? (
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
                  {role.isDefault && <Badge variant="secondary">Default</Badge>}
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
                  onClick={() => {
                    setEditingRole(role);
                    setRoleModalOpen(true);
                  }}
                  className="min-h-11 cursor-pointer text-sm font-semibold underline underline-offset-4"
                >
                  Edit permissions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {roleModalOpen && (
        <ShopRoleDialog
          shopId={shopId}
          editingRole={editingRole}
          availablePermissions={availablePermissions}
          onClose={() => {
            setRoleModalOpen(false);
            setEditingRole(null);
          }}
        />
      )}
    </section>
  );
}
