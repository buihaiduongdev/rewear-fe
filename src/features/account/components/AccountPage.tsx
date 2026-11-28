'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { shopMembershipsQueryKey } from '@/modules/shop/hooks/use-shop-memberships';
import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  getShopControllerFindMyInvitationsQueryKey,
  useShopControllerAccept,
  useShopControllerFindMyInvitations,
} from '@/shared/api/query-generated/shops/shops';
import { useUserControllerGetMe } from '@/shared/api/query-generated/users/users';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import { Badge } from '@/shared/components/ui/badge';
import { useToastStore } from '@/shared/stores/toast.store';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, UserCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { AccountAddressesSection } from './AccountAddressesSection';
import { AccountRecentOrdersCard } from './AccountRecentOrdersCard';
import { EditProfileDialog } from './EditProfileDialog';

function formatShortDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const addToast = useToastStore((s) => s.addToast);

  const enabled = status === 'authenticated' && !session?.error;
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const profileQuery = useUserControllerGetMe({
    query: { enabled },
  });

  const invitationsQuery = useShopControllerFindMyInvitations({
    query: { enabled, meta: { skipErrorToast: true } },
  });

  const acceptInvitation = useShopControllerAccept({
    mutation: { meta: { skipSuccessToast: true, skipErrorToast: true } },
  });

  const profile = profileQuery.data?.data;
  const pendingInvitations = (invitationsQuery.data?.data ?? []).filter(
    (inv) => inv.status === 'PENDING',
  );

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
            <div className="space-y-10 lg:col-span-8">
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

              <AccountAddressesSection
                enabled={enabled}
                userId={session?.user.id}
              />
            </div>

            <AccountRecentOrdersCard
              enabled={enabled}
              userId={session?.user.id}
            />
          </div>
        )}
      </main>

      <MarketplaceFooter showOnMobile />
      <MobileNavigation
        cartAction={
          <CartLink className="bg-rewear-soft flex min-h-11 items-center justify-center px-2 text-center" />
        }
      />

      {profile && editProfileOpen && (
        <EditProfileDialog
          open
          onOpenChange={setEditProfileOpen}
          currentFullName={profile.fullName}
          email={profile.email}
        />
      )}
    </div>
  );
}
