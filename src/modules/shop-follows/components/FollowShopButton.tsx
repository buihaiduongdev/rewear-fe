'use client';

import Link from 'next/link';

import { shopFollowApi } from '@/modules/shop-follows/shop-follow-api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { useToastStore } from '@/shared/stores/toast.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserCheck, UserPlus } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function FollowShopButton({
  shopId,
  shopName,
}: {
  shopId: string;
  shopName: string;
}) {
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const stateQuery = useQuery({
    queryKey: ['shop-follow', session?.user.id, shopId],
    queryFn: () => shopFollowApi.getState(shopId),
    enabled: Boolean(enabled && shopId),
  });

  const following = stateQuery.data?.data.following ?? false;

  const toggleMutation = useMutation({
    mutationFn: () =>
      following ? shopFollowApi.unfollow(shopId) : shopFollowApi.follow(shopId),
    onSuccess: (res) => {
      queryClient.setQueryData(['shop-follow', session?.user.id, shopId], res);
      addToast({
        type: 'info',
        title: res.data.following
          ? `Following ${shopName}`
          : `Unfollowed ${shopName}`,
        durationMs: 3000,
      });
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Could not update follow status',
        description: getApiErrorMessage(err),
        durationMs: 4000,
      });
    },
  });

  if (!enabled) {
    return (
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(`/products?shopId=${shopId}`)}`}
        className="border-rewear-border bg-rewear-surface hover:bg-rewear-soft inline-flex min-h-10 items-center gap-1.5 border px-3.5 text-xs font-semibold transition"
      >
        <UserPlus size={14} aria-hidden="true" />
        Follow shop
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={stateQuery.isPending || toggleMutation.isPending}
      aria-pressed={following}
      onClick={() => toggleMutation.mutate()}
      className={`inline-flex min-h-10 items-center gap-1.5 border px-3.5 text-xs font-semibold transition disabled:opacity-50 ${
        following
          ? 'border-rewear-text bg-rewear-text text-white'
          : 'border-rewear-border bg-rewear-surface text-rewear-text hover:bg-rewear-soft'
      }`}
    >
      {following ? (
        <>
          <UserCheck size={14} aria-hidden="true" />
          Following
        </>
      ) : (
        <>
          <UserPlus size={14} aria-hidden="true" />
          Follow shop
        </>
      )}
    </button>
  );
}
