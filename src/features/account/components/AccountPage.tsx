'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { UserAddressFormValues } from '@/modules/address';
import { CartLink } from '@/modules/cart/components/CartLink';
import { shopMembershipsQueryKey } from '@/modules/shop/hooks/use-shop-memberships';
import { getApiErrorMessage } from '@/shared/api/api-error';
import type {
  OrderControllerBuyerListStatus,
  UserAddressControllerFindAll200DataItem,
} from '@/shared/api/models';
import { useOrderControllerBuyerList } from '@/shared/api/query-generated/orders/orders';
import {
  getShopControllerFindMyInvitationsQueryKey,
  useShopControllerAccept,
  useShopControllerFindMyInvitations,
} from '@/shared/api/query-generated/shops/shops';
import {
  getUserAddressControllerFindAllQueryKey,
  useUserAddressControllerFindAll,
  useUserAddressControllerRemove,
  useUserAddressControllerUpdate,
} from '@/shared/api/query-generated/user-addresses/user-addresses';
import { useUserControllerGetMe } from '@/shared/api/query-generated/users/users';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import { Badge } from '@/shared/components/ui/badge';
import { useToastStore } from '@/shared/stores/toast.store';
import { formatPrice } from '@/shared/utils/product';
import { useQueryClient } from '@tanstack/react-query';
import { MapPin, Package, Pencil, Plus, Trash2, UserCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { AddressFormDialog } from './AddressFormDialog';
import { EditProfileDialog } from './EditProfileDialog';

const ORDER_STATUS_LABELS: Record<OrderControllerBuyerListStatus, string> = {
  waiting: 'Awaiting payment',
  pending: 'Awaiting seller confirmation',
  preparing: 'Preparing',
  shipping: 'Shipping',
  delivered: 'Delivered',
  completed: 'Completed',
  dispute: 'In dispute',
  returns: 'Return in progress',
  cancelled: 'Cancelled',
};

type AddressRecord = UserAddressControllerFindAll200DataItem & {
  provinceId?: number;
  districtId?: number;
  districtName?: string;
};

function formatShortDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatFullAddress(address: AddressRecord) {
  return [
    address.addressLine1,
    address.wardName,
    address.districtName,
    address.provinceName,
  ]
    .filter(Boolean)
    .join(', ');
}

export function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const addToast = useToastStore((s) => s.addToast);

  const enabled = status === 'authenticated' && !session?.error;

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressRecord | null>(
    null,
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [addressActionError, setAddressActionError] = useState('');

  const profileQuery = useUserControllerGetMe({
    query: { enabled },
  });

  const addressesQuery = useUserAddressControllerFindAll({
    query: { enabled },
  });

  const recentOrdersQuery = useOrderControllerBuyerList(
    { limit: 3, offset: 0 },
    {
      query: {
        enabled,
        queryKey: ['account-recent-orders', session?.user.id],
      },
    },
  );

  const invitationsQuery = useShopControllerFindMyInvitations({
    query: { enabled, meta: { skipErrorToast: true } },
  });

  const updateAddress = useUserAddressControllerUpdate({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const removeAddress = useUserAddressControllerRemove({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const acceptInvitation = useShopControllerAccept({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const profile = profileQuery.data?.data;
  const addresses = (addressesQuery.data?.data ?? []) as AddressRecord[];
  const recentOrders = recentOrdersQuery.data?.data ?? [];
  const pendingInvitations = (invitationsQuery.data?.data ?? []).filter(
    (inv) => inv.status === 'PENDING',
  );

  const invalidateAddresses = async () => {
    await queryClient.invalidateQueries({
      queryKey: getUserAddressControllerFindAllQueryKey(),
    });
    await queryClient.invalidateQueries({
      queryKey: ['/api/user-addresses', session?.user.id],
    });
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressDialogOpen(true);
  };

  const openEditAddress = (address: AddressRecord) => {
    setEditingAddress(address);
    setAddressDialogOpen(true);
  };

  const handleSetDefault = async (addressId: string) => {
    setAddressActionError('');
    try {
      await updateAddress.mutateAsync({
        id: addressId,
        data: { isDefault: true },
      });
      await invalidateAddresses();
      addToast({
        type: 'success',
        title: 'Default address updated',
        durationMs: 3000,
      });
    } catch (error) {
      setAddressActionError(getApiErrorMessage(error));
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setAddressActionError('');
    try {
      await removeAddress.mutateAsync({ id: addressId });
      setConfirmDeleteId(null);
      await invalidateAddresses();
      addToast({
        type: 'success',
        title: 'Address removed',
        durationMs: 3000,
      });
    } catch (error) {
      setAddressActionError(getApiErrorMessage(error));
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await acceptInvitation.mutateAsync({ invitationId });
      await queryClient.invalidateQueries({
        queryKey: getShopControllerFindMyInvitationsQueryKey(),
      });
      await queryClient.invalidateQueries({
        queryKey: shopMembershipsQueryKey,
      });
      addToast({
        type: 'success',
        title: 'Shop invitation accepted',
        description: 'You can now access the seller workspace.',
        durationMs: 3500,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Could not accept invitation',
        description: getApiErrorMessage(error),
        durationMs: 4000,
      });
    }
  };

  const editingInitialValues: Partial<UserAddressFormValues> | undefined =
    editingAddress
      ? {
          recipientName: editingAddress.recipientName,
          phone: editingAddress.phone,
          addressLine1: editingAddress.addressLine1,
          provinceId: editingAddress.provinceId ?? '',
          districtId: editingAddress.districtId ?? '',
          wardCode: editingAddress.wardCode ?? '',
          isDefault: editingAddress.isDefault,
        }
      : undefined;

  return (
    <div className="bg-rewear-surface text-rewear-text flex min-h-dvh flex-col">
      <MarketplaceHeader
        cartAction={<CartLink />}
        search=""
        onSearch={(value) =>
          router.push(`/products?search=${encodeURIComponent(value)}`)
        }
      />

      <main
        id="main-content"
        className="mx-auto w-full max-w-[1280px] flex-1 space-y-10 px-4 pt-4 pb-12 md:px-12 md:py-12"
      >
        {/* Title & Account Navigation (Figma 48:687) */}
        <div className="border-rewear-border space-y-6 border-b pb-6">
          <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
            Your account
          </h1>
          <nav
            aria-label="Account sections"
            className="flex flex-wrap items-center gap-2"
          >
            <span
              aria-current="page"
              className="bg-rewear-text inline-flex min-h-11 items-center px-5 text-sm font-semibold text-white"
            >
              Profile &amp; addresses
            </span>
            <Link
              href="/orders"
              className="bg-rewear-soft text-rewear-text inline-flex min-h-11 items-center px-5 text-sm font-semibold hover:opacity-80"
            >
              Orders
            </Link>
            <Link
              href="/wishlist"
              className="bg-rewear-soft text-rewear-text inline-flex min-h-11 items-center px-5 text-sm font-semibold hover:opacity-80"
            >
              Wishlist
            </Link>
            <Link
              href="/selling"
              className="bg-rewear-soft text-rewear-text inline-flex min-h-11 items-center px-5 text-sm font-semibold hover:opacity-80"
            >
              Seller workspace
            </Link>
          </nav>
        </div>

        {status === 'loading' ? (
          <p role="status" className="text-rewear-muted py-10">
            Loading your account…
          </p>
        ) : !enabled ? (
          <p role="alert" className="py-10">
            Your session has expired.{' '}
            <Link href="/login" className="underline">
              Sign in again
            </Link>{' '}
            to manage your account.
          </p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Left column: Profile + Address Book (Figma 48:694) */}
            <div className="space-y-10 lg:col-span-8">
              {/* Profile Overview */}
              <section
                aria-labelledby="profile-heading"
                className="border-rewear-border space-y-5 border p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2
                    id="profile-heading"
                    className="text-[22px] leading-7 font-semibold tracking-[-0.02em]"
                  >
                    Profile
                  </h2>
                  {profile && (
                    <button
                      type="button"
                      onClick={() => setEditProfileOpen(true)}
                      className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 cursor-pointer items-center gap-2 border px-4 text-sm font-semibold transition"
                    >
                      <Pencil size={14} aria-hidden="true" />
                      Edit profile
                    </button>
                  )}
                </div>

                {profileQuery.isPending ? (
                  <p role="status" className="text-rewear-muted text-sm">
                    Loading profile…
                  </p>
                ) : profileQuery.isError ? (
                  <div role="alert" className="space-y-2 text-sm">
                    <p>Could not load your profile details.</p>
                    <button
                      type="button"
                      onClick={() => void profileQuery.refetch()}
                      className="min-h-11 cursor-pointer font-semibold underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : profile ? (
                  <dl className="grid gap-4 text-sm sm:grid-cols-2">
                    <div className="bg-rewear-soft/60 space-y-1 p-4">
                      <dt className="text-rewear-muted text-xs font-semibold">
                        Display name
                      </dt>
                      <dd className="text-base font-semibold">
                        {profile.fullName}
                      </dd>
                    </div>
                    <div className="bg-rewear-soft/60 space-y-1 p-4">
                      <dt className="text-rewear-muted text-xs font-semibold">
                        Email
                      </dt>
                      <dd className="text-base break-all">{profile.email}</dd>
                    </div>
                    <div className="bg-rewear-soft/60 space-y-1 p-4">
                      <dt className="text-rewear-muted text-xs font-semibold">
                        Sign-in method
                      </dt>
                      <dd className="capitalize">{profile.provider}</dd>
                    </div>
                    <div className="bg-rewear-soft/60 space-y-1 p-4">
                      <dt className="text-rewear-muted text-xs font-semibold">
                        Shop membership
                      </dt>
                      <dd className="flex flex-wrap items-center gap-2">
                        {profile.shop ? (
                          <>
                            <span className="font-semibold">
                              {profile.shop.name}
                            </span>
                            <Badge variant="secondary">
                              {profile.shop.memberRole}
                            </Badge>
                          </>
                        ) : (
                          <Link
                            href="/selling/open"
                            className="font-semibold underline underline-offset-4"
                          >
                            Open a shop →
                          </Link>
                        )}
                      </dd>
                    </div>
                  </dl>
                ) : null}
              </section>

              {/* Pending Shop Invitations (only shown when user has invites) */}
              {pendingInvitations.length > 0 && (
                <section
                  aria-labelledby="invitations-heading"
                  className="border-rewear-border bg-rewear-soft/40 space-y-4 border p-6"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck size={18} aria-hidden="true" />
                    <h2
                      id="invitations-heading"
                      className="text-lg font-semibold"
                    >
                      Pending shop invitations
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {pendingInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="border-rewear-border bg-rewear-surface flex flex-wrap items-center justify-between gap-4 border p-4"
                      >
                        <div>
                          <p className="font-semibold">
                            {invitation.shop?.name ?? 'Shop team invitation'}
                          </p>
                          <p className="text-rewear-muted text-xs">
                            Expires {formatShortDate(invitation.expiresAt)}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={acceptInvitation.isPending}
                          onClick={() =>
                            void handleAcceptInvitation(invitation.id)
                          }
                          className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 min-h-11 cursor-pointer px-4 text-sm font-semibold transition disabled:opacity-50"
                        >
                          {acceptInvitation.isPending
                            ? 'Accepting…'
                            : 'Accept invitation'}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Saved Addresses Book */}
              <section
                aria-labelledby="addresses-heading"
                className="border-rewear-border space-y-5 border p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2
                      id="addresses-heading"
                      className="text-[22px] leading-7 font-semibold tracking-[-0.02em]"
                    >
                      Saved addresses
                    </h2>
                    <p className="text-rewear-muted mt-1 text-sm">
                      Manage Vietnam delivery addresses for checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openAddAddress}
                    className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 inline-flex min-h-11 cursor-pointer items-center gap-2 px-4 text-sm font-semibold transition"
                  >
                    <Plus size={16} aria-hidden="true" />
                    Add address
                  </button>
                </div>

                {addressActionError && (
                  <p role="alert" className="text-destructive text-sm">
                    {addressActionError}
                  </p>
                )}

                {addressesQuery.isPending ? (
                  <p role="status" className="text-rewear-muted text-sm">
                    Loading addresses…
                  </p>
                ) : addressesQuery.isError ? (
                  <div role="alert" className="space-y-2 text-sm">
                    <p>Could not load your saved addresses.</p>
                    <button
                      type="button"
                      onClick={() => void addressesQuery.refetch()}
                      className="min-h-11 cursor-pointer font-semibold underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="bg-rewear-soft space-y-3 p-6 text-sm">
                    <div className="flex items-center gap-2 font-semibold">
                      <MapPin size={16} aria-hidden="true" />
                      <span>No saved addresses yet</span>
                    </div>
                    <p className="text-rewear-muted">
                      Add your shipping address now so checkout takes a single
                      step.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => {
                      const isDeleting = confirmDeleteId === address.id;
                      const isMutating =
                        updateAddress.isPending || removeAddress.isPending;

                      return (
                        <article
                          key={address.id}
                          className="border-rewear-border flex flex-col justify-between gap-4 border p-4 sm:flex-row sm:items-start"
                        >
                          <div className="min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold">
                                {address.recipientName}
                              </h3>
                              <span className="text-rewear-muted font-mono text-xs">
                                {address.phone}
                              </span>
                              {address.isDefault && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </div>
                            <p className="text-rewear-muted text-sm leading-6">
                              {formatFullAddress(address)}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                            {!address.isDefault && (
                              <button
                                type="button"
                                disabled={isMutating}
                                onClick={() =>
                                  void handleSetDefault(address.id)
                                }
                                className="min-h-11 cursor-pointer underline underline-offset-4 disabled:opacity-50"
                              >
                                Set as default
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() => openEditAddress(address)}
                              className="min-h-11 cursor-pointer underline underline-offset-4 disabled:opacity-50"
                            >
                              Edit
                            </button>
                            {isDeleting ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={removeAddress.isPending}
                                  onClick={() =>
                                    void handleDeleteAddress(address.id)
                                  }
                                  className="text-destructive min-h-11 cursor-pointer underline underline-offset-4"
                                >
                                  Confirm delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-rewear-muted min-h-11 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={isMutating}
                                onClick={() => setConfirmDeleteId(address.id)}
                                className="text-rewear-muted hover:text-destructive inline-flex min-h-11 cursor-pointer items-center gap-1 disabled:opacity-50"
                                aria-label={`Delete address for ${address.recipientName}`}
                              >
                                <Trash2 size={14} aria-hidden="true" />
                                Delete
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right column: Recent Orders Summary Card (Figma 53:1780) */}
            <aside
              aria-labelledby="recent-orders-heading"
              className="space-y-5 lg:col-span-4"
            >
              <div className="border-rewear-border space-y-5 border p-6">
                <div className="flex items-center justify-between gap-2">
                  <h2
                    id="recent-orders-heading"
                    className="text-[22px] leading-7 font-semibold tracking-[-0.02em]"
                  >
                    Recent orders
                  </h2>
                  <Link
                    href="/orders"
                    className="text-sm font-semibold underline underline-offset-4"
                  >
                    View all →
                  </Link>
                </div>

                {recentOrdersQuery.isPending ? (
                  <p role="status" className="text-rewear-muted text-sm">
                    Loading recent orders…
                  </p>
                ) : recentOrdersQuery.isError ? (
                  <p role="alert" className="text-rewear-muted text-sm">
                    Could not load recent orders right now.
                  </p>
                ) : recentOrders.length === 0 ? (
                  <div className="bg-rewear-soft space-y-3 p-5 text-sm">
                    <div className="flex items-center gap-2 font-semibold">
                      <Package size={16} aria-hidden="true" />
                      <span>No orders yet</span>
                    </div>
                    <p className="text-rewear-muted">
                      Pieces you purchase will appear here with tracking and
                      72-hour delivery protection.
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
                    >
                      Explore clothing →
                    </Link>
                  </div>
                ) : (
                  <div className="divide-rewear-border divide-y">
                    {recentOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="hover:bg-rewear-soft/50 block space-y-1.5 py-4 transition first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-semibold">
                            {order.orderCode}
                          </span>
                          <span className="bg-rewear-soft px-2 py-0.5 text-xs font-semibold">
                            {ORDER_STATUS_LABELS[order.status] ?? order.status}
                          </span>
                        </div>
                        <p className="truncate text-sm font-medium">
                          {order.shopName} · {order.items.length}{' '}
                          {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                        <div className="text-rewear-muted flex items-center justify-between text-xs">
                          <span className="underline underline-offset-4">
                            View order →
                          </span>
                          <span className="text-rewear-text font-mono font-semibold">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>

      <MarketplaceFooter showOnMobile />
      <MobileNavigation
        cartAction={
          <CartLink className="bg-rewear-soft flex min-h-11 items-center justify-center px-2 text-center" />
        }
      />

      {profile && (
        <EditProfileDialog
          open={editProfileOpen}
          onOpenChange={setEditProfileOpen}
          currentFullName={profile.fullName}
          email={profile.email}
        />
      )}

      <AddressFormDialog
        open={addressDialogOpen}
        onOpenChange={(open) => {
          setAddressDialogOpen(open);
          if (!open) setEditingAddress(null);
        }}
        addressId={editingAddress?.id}
        initialValues={editingInitialValues}
        onSaved={() => {
          void invalidateAddresses();
          addToast({
            type: 'success',
            title: editingAddress ? 'Address updated' : 'Address added',
            durationMs: 3000,
          });
        }}
      />
    </div>
  );
}
