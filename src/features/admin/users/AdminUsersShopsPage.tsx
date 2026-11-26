'use client';

import { useState } from 'react';

import { AdminWorkspaceLayout } from '@/features/admin/AdminWorkspaceLayout';
import { formatIctDateTime, shortId } from '@/modules/disputes/api';
import {
  KYC_STATE_LABELS,
  listAdminApplications,
  type ShopApplicationState,
} from '@/modules/kyc/api';
import type {
  ShopControllerFindAll200DataItem,
  UserControllerFindAll200DataDataItem,
} from '@/shared/api/models';
import { useShopControllerFindAll } from '@/shared/api/query-generated/shops/shops';
import { useUserControllerFindAll } from '@/shared/api/query-generated/users/users';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';

import { KycReviewModal, UserAccountModal } from './AdminUsersModals';

type DirectoryTab = 'users' | 'shops' | 'kyc';

export function AdminUsersShopsPage() {
  const [tab, setTab] = useState<DirectoryTab>('users');
  const [search, setSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [kycStateFilter, setKycStateFilter] = useState<
    ShopApplicationState | ''
  >('SUBMITTED');

  const [selectedUser, setSelectedUser] =
    useState<UserControllerFindAll200DataDataItem | null>(null);
  const [selectedShop, setSelectedShop] =
    useState<ShopControllerFindAll200DataItem | null>(null);
  const [selectedKycId, setSelectedKycId] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const usersQuery = useUserControllerFindAll(
    {
      page: userPage,
      limit: 20,
      ...(search.trim() ? { search: search.trim() } : {}),
    },
    { query: { enabled: tab === 'users', retry: false } },
  );

  const shopsQuery = useShopControllerFindAll({
    query: { enabled: tab === 'shops', retry: false },
  });

  const kycQuery = useQuery({
    queryKey: ['admin-kyc-applications', kycStateFilter],
    queryFn: () =>
      listAdminApplications({
        limit: 50,
        offset: 0,
        ...(kycStateFilter ? { state: kycStateFilter } : {}),
      }),
    enabled: tab === 'kyc',
    retry: false,
  });

  const users = usersQuery.data?.data.data ?? [];
  const totalUsers = usersQuery.data?.data.meta.totalItems ?? 0;
  const hasNextUsers = Boolean(usersQuery.data?.data.links.next);

  const shops = (shopsQuery.data?.data ?? []).filter((shop) =>
    search.trim()
      ? shop.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        (shop.description ?? '')
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      : true,
  );

  const kycItems = kycQuery.data?.data.items ?? [];

  return (
    <AdminWorkspaceLayout activeNav="users" title="Users & Shops">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.02em]">
              Users, shops &amp; KYC
            </h1>
            <p className="text-rewear-muted mt-1 text-sm">
              Manage marketplace accounts, active shops, and owner identity
              verification applications.
            </p>
          </div>
          <div className="flex gap-2" role="tablist">
            {(
              [
                ['users', 'Users'],
                ['shops', 'Shops'],
                ['kyc', 'Owner KYC'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => {
                  setTab(key);
                  setFeedbackSuccess('');
                }}
                className={`min-h-11 rounded-lg px-4 text-sm font-semibold transition-colors ${
                  tab === key
                    ? 'bg-rewear-text text-white'
                    : 'bg-rewear-soft text-rewear-text hover:bg-rewear-border/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {feedbackSuccess && (
          <p
            role="status"
            className="bg-rewear-accent/40 text-rewear-text rounded-lg p-3.5 text-sm font-medium"
          >
            {feedbackSuccess}
          </p>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {tab !== 'kyc' ? (
            <div className="border-rewear-border flex min-h-11 flex-1 items-center gap-2 rounded-lg border bg-white px-3 sm:max-w-sm">
              <Search size={16} className="text-rewear-muted shrink-0" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setUserPage(1);
                }}
                placeholder={
                  tab === 'users'
                    ? 'Search name or email…'
                    : 'Search shop name…'
                }
                aria-label="Search accounts"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          ) : (
            <label className="flex items-center gap-2 text-sm font-semibold">
              Status
              <select
                aria-label="Filter KYC by status"
                value={kycStateFilter}
                onChange={(e) =>
                  setKycStateFilter(e.target.value as ShopApplicationState | '')
                }
                className="border-rewear-border min-h-11 rounded-lg border bg-white px-3 font-normal"
              >
                <option value="">All statuses</option>
                <option value="SUBMITTED">In review</option>
                <option value="NEEDS_INFO">Action required</option>
                <option value="APPROVED">Verified</option>
                <option value="REJECTED">Rejected</option>
                <option value="DRAFT">Draft</option>
              </select>
            </label>
          )}
        </div>

        {/* Users Table */}
        {tab === 'users' && (
          <section className="border-rewear-border overflow-hidden rounded-lg border bg-white">
            {usersQuery.isPending ? (
              <p role="status" className="text-rewear-muted p-6 text-sm">
                Loading users…
              </p>
            ) : usersQuery.isError ? (
              <div role="alert" className="p-6 text-sm">
                <p>Could not load user accounts.</p>
                <button
                  type="button"
                  onClick={() => void usersQuery.refetch()}
                  className="mt-2 min-h-11 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            ) : users.length === 0 ? (
              <p className="text-rewear-muted p-6 text-sm">
                No matching user accounts found.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-rewear-border bg-rewear-soft text-rewear-muted border-b text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-3">Account</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Joined</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-rewear-border divide-y">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-rewear-soft/40">
                          <td className="px-4 py-3.5">
                            <p className="font-semibold">{user.fullName}</p>
                            <p className="text-rewear-muted text-xs">
                              {user.email}
                            </p>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs">
                            {user.role}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                                user.status === 'ACTIVE'
                                  ? 'bg-rewear-accent text-rewear-text'
                                  : 'bg-[#BA1A1A]/10 text-[#BA1A1A]'
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="text-rewear-muted px-4 py-3.5 font-mono text-xs">
                            {formatIctDateTime(user.createdAt)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedUser(user)}
                              className="min-h-11 text-xs font-semibold underline"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-rewear-border flex items-center justify-between border-t px-4 py-3 text-xs">
                  <span className="text-rewear-muted">
                    Showing page {userPage} · {totalUsers} total accounts
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      className="border-rewear-border min-h-11 rounded-lg border px-3 font-semibold disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={!hasNextUsers}
                      onClick={() => setUserPage((p) => p + 1)}
                      className="border-rewear-border min-h-11 rounded-lg border px-3 font-semibold disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {/* Shops Table */}
        {tab === 'shops' && (
          <section className="border-rewear-border overflow-hidden rounded-lg border bg-white">
            {shopsQuery.isPending ? (
              <p role="status" className="text-rewear-muted p-6 text-sm">
                Loading shops…
              </p>
            ) : shopsQuery.isError ? (
              <div role="alert" className="p-6 text-sm">
                <p>Could not load shops.</p>
                <button
                  type="button"
                  onClick={() => void shopsQuery.refetch()}
                  className="mt-2 min-h-11 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            ) : shops.length === 0 ? (
              <p className="text-rewear-muted p-6 text-sm">
                No matching shops found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-rewear-border bg-rewear-soft text-rewear-muted border-b text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3">Shop</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-rewear-border divide-y">
                    {shops.map((shop) => (
                      <tr key={shop.id} className="hover:bg-rewear-soft/40">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold">{shop.name}</p>
                          <p className="text-rewear-muted line-clamp-1 text-xs">
                            {shop.description ?? 'No shop bio'}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                              shop.status === 'ACTIVE'
                                ? 'bg-rewear-accent text-rewear-text'
                                : 'bg-rewear-soft text-rewear-muted'
                            }`}
                          >
                            {shop.status}
                          </span>
                        </td>
                        <td className="text-rewear-muted px-4 py-3.5 font-mono text-xs">
                          {formatIctDateTime(shop.createdAt)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedShop(shop)}
                            className="min-h-11 text-xs font-semibold underline"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Owner KYC Queue */}
        {tab === 'kyc' && (
          <section className="border-rewear-border overflow-hidden rounded-lg border bg-white">
            {kycQuery.isPending ? (
              <p role="status" className="text-rewear-muted p-6 text-sm">
                Loading KYC applications…
              </p>
            ) : kycQuery.isError ? (
              <div role="alert" className="p-6 text-sm">
                <p>Could not load KYC applications.</p>
                <button
                  type="button"
                  onClick={() => void kycQuery.refetch()}
                  className="mt-2 min-h-11 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            ) : kycItems.length === 0 ? (
              <p className="text-rewear-muted p-6 text-sm">
                No KYC applications match this status.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-rewear-border bg-rewear-soft text-rewear-muted border-b text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3">Application</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-rewear-border divide-y">
                    {kycItems.map((app) => (
                      <tr key={app.id} className="hover:bg-rewear-soft/40">
                        <td className="px-4 py-3.5">
                          <p className="font-mono text-xs font-bold">
                            APP #{shortId(app.id)}
                          </p>
                          <p className="text-rewear-muted font-mono text-xs">
                            Shop #{shortId(app.shopId)}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-semibold">
                          {app.kind === 'RENEWAL'
                            ? 'ID Renewal'
                            : 'Initial KYC'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                              app.state === 'APPROVED'
                                ? 'bg-rewear-accent text-rewear-text'
                                : app.state === 'REJECTED' ||
                                    app.state === 'NEEDS_INFO'
                                  ? 'bg-[#BA1A1A]/10 text-[#BA1A1A]'
                                  : 'bg-rewear-soft text-rewear-text'
                            }`}
                          >
                            {KYC_STATE_LABELS[app.state]}
                          </span>
                        </td>
                        <td className="text-rewear-muted px-4 py-3.5 font-mono text-xs">
                          {formatIctDateTime(app.submittedAt ?? app.updatedAt)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedKycId(app.id)}
                            className="min-h-11 text-xs font-semibold underline"
                          >
                            Review KYC
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      {/* User Account Details Modal (Figma 48:1856) */}
      {selectedUser && (
        <UserAccountModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSaved={async () => {
            setSelectedUser(null);
            setFeedbackSuccess('Account status updated.');
            await usersQuery.refetch();
          }}
        />
      )}

      {/* Shop Detail Modal (Figma 48:1869) */}
      <Dialog
        open={Boolean(selectedShop)}
        onOpenChange={(open) => !open && setSelectedShop(null)}
      >
        <DialogContent className="border-rewear-border max-w-[480px] rounded-lg border p-8">
          <DialogTitle>{selectedShop?.name ?? 'Shop details'}</DialogTitle>
          <DialogDescription>
            Shop directory snapshot and verification cross-reference.
          </DialogDescription>
          {selectedShop && (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b pb-2">
                <dt className="text-rewear-muted">Shop ID</dt>
                <dd className="font-mono text-xs">{selectedShop.id}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b pb-2">
                <dt className="text-rewear-muted">Status</dt>
                <dd className="font-semibold">{selectedShop.status}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b pb-2">
                <dt className="text-rewear-muted">Created</dt>
                <dd className="font-mono text-xs">
                  {formatIctDateTime(selectedShop.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-rewear-muted text-xs">Description</dt>
                <dd className="mt-1">
                  {selectedShop.description || 'No description provided.'}
                </dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin KYC Review Modal */}
      {selectedKycId && (
        <KycReviewModal
          applicationId={selectedKycId}
          onClose={() => setSelectedKycId(null)}
          onDecided={async () => {
            setSelectedKycId(null);
            setFeedbackSuccess('KYC review decision saved.');
            await kycQuery.refetch();
          }}
        />
      )}
    </AdminWorkspaceLayout>
  );
}
