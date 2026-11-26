'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  type NotificationItem,
  notificationsApi,
} from '@/shared/api/notifications-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';

function resolveNotificationHref(item: NotificationItem): string | null {
  const entityType = item.entityType.toUpperCase();
  if (entityType.includes('ORDER')) return `/orders/${item.entityId}`;
  if (entityType.includes('CHAT') || entityType.includes('CONVERSATION'))
    return '/messages';
  if (entityType.includes('PAYOUT')) return '/selling?tab=funds';
  if (entityType.includes('PRODUCT')) return `/products/${item.entityId}`;
  return null;
}

export function NotificationBell() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread-count', session?.user.id],
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled,
    refetchInterval: 30_000,
  });

  const listQuery = useQuery({
    queryKey: ['notifications', 'list', session?.user.id],
    queryFn: () => notificationsApi.list(1, 10),
    enabled: enabled && open,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (!enabled) return null;

  const unreadCount = unreadQuery.data?.data.count ?? 0;
  const items = listQuery.data?.data.data ?? [];

  const handleSelectItem = (item: NotificationItem) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id);
    }
    const href = resolveNotificationHref(item);
    setOpen(false);
    if (href) router.push(href);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} unread)`
            : 'Notifications'
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center hover:opacity-80"
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="bg-rewear-accent text-rewear-text absolute top-1.5 right-1 flex min-w-[18px] items-center justify-center px-1 font-mono text-[10px] leading-[16px] font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="bg-rewear-surface border-rewear-border absolute top-full right-0 z-30 mt-1 w-80 border shadow-lg sm:w-96"
        >
          <div className="border-rewear-border flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={markAllMutation.isPending}
                onClick={() => markAllMutation.mutate()}
                className="text-rewear-muted hover:text-rewear-text inline-flex items-center gap-1 text-xs font-semibold disabled:opacity-50"
              >
                <CheckCheck size={14} aria-hidden="true" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {listQuery.isPending ? (
              <p className="text-rewear-muted px-4 py-6 text-xs">
                Loading notifications…
              </p>
            ) : listQuery.isError ? (
              <div className="px-4 py-6 text-xs">
                <p>Could not load notifications.</p>
                <button
                  type="button"
                  className="mt-2 font-semibold underline"
                  onClick={() => void listQuery.refetch()}
                >
                  Retry
                </button>
              </div>
            ) : items.length === 0 ? (
              <p className="text-rewear-muted px-4 py-6 text-xs">
                No notifications yet.
              </p>
            ) : (
              <ul className="divide-rewear-border divide-y">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className={`hover:bg-rewear-soft/70 flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                        item.isRead ? '' : 'bg-rewear-soft/40'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${
                          item.isRead ? 'bg-transparent' : 'bg-rewear-text'
                        }`}
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs leading-4 font-semibold">
                          {item.title}
                        </p>
                        <p className="text-rewear-muted line-clamp-2 text-xs leading-4 font-normal">
                          {item.body}
                        </p>
                        <time className="text-rewear-muted block text-[11px] font-normal">
                          {new Date(item.createdAt).toLocaleString()}
                        </time>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
